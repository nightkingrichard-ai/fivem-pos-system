import React, { useState, useContext, useEffect } from 'react'
import { getDatabase, ref, get, push, set } from 'firebase/database'
import { AppContext } from '../App'
import './POSScreen.css'

function POSScreen({ user }) {
  const { db } = useContext(AppContext)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    calculateTotal()
  }, [cart])

  const fetchProducts = async () => {
    try {
      const productsRef = ref(db, 'products')
      const snapshot = await get(productsRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        const productsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))
        setProducts(productsList)
      }
      setLoading(false)
    } catch (error) {
      console.error('商品取得エラー:', error)
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      updateCartItem(product.id, existingItem.quantity + 1)
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateCartItem = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const calculateTotal = () => {
    const sum = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    setTotal(sum)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('カートが空です')
      return
    }

    try {
      const saleRef = ref(db, 'sales')
      await push(saleRef, {
        staffId: user.uid,
        staffEmail: user.email,
        items: cart,
        total: total,
        timestamp: new Date().toISOString(),
        status: 'completed'
      })

      // Discord Webhook 通知
      const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `💰 売上確定: ¥${total}`,
            embeds: [{
              title: '売上情報',
              fields: [
                { name: '金額', value: `¥${total}`, inline: true },
                { name: '売上数', value: `${cart.length}個`, inline: true },
                { name: '店員', value: user.email, inline: true },
                { name: '時刻', value: new Date().toLocaleString('ja-JP'), inline: false }
              ],
              color: 16711680
            }]
          })
        })
      }

      alert('売上確定しました！')
      setCart([])
    } catch (error) {
      console.error('売上保存エラー:', error)
      alert('売上確定に失敗しました')
    }
  }

  if (loading) {
    return <div className="pos-loading">読み込み中...</div>
  }

  return (
    <div className="pos-container">
      <div className="pos-products">
        <h2>商品一覧</h2>
        <div className="products-grid">
          {products.map(product => (
            <button
              key={product.id}
              className="product-card"
              onClick={() => addToCart(product)}
            >
              {product.image && (
                <img src={product.image} alt={product.name} />
              )}
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">¥{product.price.toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pos-cart">
        <h2>カート</h2>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">カートが空です</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>¥{item.price.toLocaleString()} × {item.quantity}</p>
                </div>
                <div className="item-controls">
                  <button onClick={() => updateCartItem(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartItem(item.id, item.quantity + 1)}>+</button>
                  <button
                    className="btn-remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    削除
                  </button>
                </div>
                <p className="item-total">¥{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="summary-row">
            <span>合計金額:</span>
            <span className="total-amount">¥{total.toLocaleString()}</span>
          </div>
          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            売上確定
          </button>
        </div>
      </div>
    </div>
  )
}

export default POSScreen
