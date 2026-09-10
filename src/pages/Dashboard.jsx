import React, { useState, useContext, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { getDatabase, ref, get } from 'firebase/database'
import { AppContext } from '../App'
import POSScreen from '../components/POSScreen'
import ProductManagement from '../components/ProductManagement'
import SalesReport from '../components/SalesReport'
import './Dashboard.css'

function Dashboard({ user }) {
  const { auth, db } = useContext(AppContext)
  const [currentPage, setCurrentPage] = useState('pos')
  const [userRole, setUserRole] = useState('staff')
  const [storeName, setStoreName] = useState('')

  useEffect(() => {
    // ユーザー情報取得
    const fetchUserData = async () => {
      const userRef = ref(db, 'users/' + user.uid)
      const snapshot = await get(userRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        setUserRole(data.role)
        setStoreName(data.storeName)
      }
    }
    fetchUserData()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <div className="dashboard">
      <div className="navbar">
        <div className="navbar-left">
          <h1>FiveM POS System</h1>
          <p className="store-name">{storeName}</p>
        </div>
        <div className="navbar-right">
          <span>{user.email}</span>
          <span className="role-badge">{userRole === 'manager' ? '店長' : '店員'}</span>
          <button onClick={handleLogout} className="btn-logout">ログアウト</button>
        </div>
      </div>

      <div className="container">
        <div className="sidebar">
          <nav className="menu">
            <button
              className={`menu-item ${currentPage === 'pos' ? 'active' : ''}`}
              onClick={() => setCurrentPage('pos')}
            >
              🛒 レジ
            </button>
            {userRole === 'manager' && (
              <>
                <button
                  className={`menu-item ${currentPage === 'products' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('products')}
                >
                  📦 商品管理
                </button>
                <button
                  className={`menu-item ${currentPage === 'sales' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('sales')}
                >
                  📊 売上管理
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="content">
          {currentPage === 'pos' && <POSScreen user={user} />}
          {currentPage === 'products' && userRole === 'manager' && <ProductManagement />}
          {currentPage === 'sales' && userRole === 'manager' && <SalesReport />}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
