import React, { useState, useContext, useEffect } from 'react'
import { getDatabase, ref, get, push, set, remove } from 'firebase/database'
import { AppContext } from '../App'
import './ProductManagement.css'

function ProductManagement() {
  const { db } = useContext(AppContext)
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image: event.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price) {
      alert('商品名と価格は必須です')
      return
    }

    try {
      const productData = {
        name: formData.name,
        price: parseInt(formData.price),
        description: formData.description,
        image: formData.image,
        updatedAt: new Date().toISOString()
      }

      if (editingId) {
        // 更新
        const productRef = ref(db, 'products/' + editingId)
        await set(productRef, productData)
      } else {
        // 新規作成
        const productsRef = ref(db, 'products')
        await push(productsRef, productData)
      }

      setFormData({ name: '', price: '', description: '', image: '' })
      setShowForm(false)
      setEditingId(null)
      fetchProducts()
    } catch (error) {
      console.error('商品保存エラー:', error)
      alert('商品の保存に失敗しました')
    }
  }

  const handleEdit = (product) => {
    setFormData(product)
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('この商品を削除してもよろしいですか？')) {
      try {
        const productRef = ref(db, 'products/' + id)
        await remove(productRef)
        fetchProducts()
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除に失敗しました')
      }
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="product-management">
      <div className="header">
        <h2>商品管理</h2>
        <button
          className="btn-add"
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', price: '', description: '', image: '' })
          }}
        >
          {showForm ? '中止' : '+ 新規商品'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>商品名 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="商品名を入力"
              />
            </div>

            <div className="form-group">
              <label>価格 *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                placeholder="価格を入力"
              />
            </div>

            <div className="form-group">
              <label>説明</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="商品説明を入力（オプション）"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>画像</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {formData.image && (
                <img src={formData.image} alt="プレビュー" className="image-preview" />
              )}
            </div>

            <button type="submit" className="btn-submit">
              {editingId ? '更新' : '作成'}
            </button>
          </form>
        </div>
      )}

      <div className="products-list">
        <table>
          <thead>
            <tr>
              <th>画像</th>
              <th>商品名</th>
              <th>価格</th>
              <th>説明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  {product.image && (
                    <img src={product.image} alt={product.name} className="table-image" />
                  )}
                </td>
                <td>{product.name}</td>
                <td>¥{product.price.toLocaleString()}</td>
                <td>{product.description}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(product)}
                  >
                    編集
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(product.id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductManagement
