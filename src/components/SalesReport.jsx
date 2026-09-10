import React, { useState, useContext, useEffect } from 'react'
import { getDatabase, ref, get, remove } from 'firebase/database'
import { AppContext } from '../App'
import './SalesReport.css'

function SalesReport() {
  const { db } = useContext(AppContext)
  const [sales, setSales] = useState([])
  const [filteredSales, setFilteredSales] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [staffFilter, setStaffFilter] = useState('')
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  useEffect(() => {
    filterSales()
  }, [sales, dateFilter, staffFilter])

  const fetchSales = async () => {
    try {
      const salesRef = ref(db, 'sales')
      const snapshot = await get(salesRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        const salesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }))
        setSales(salesList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
      }
      setLoading(false)
    } catch (error) {
      console.error('売上取得エラー:', error)
      setLoading(false)
    }
  }

  const filterSales = () => {
    let filtered = sales

    if (dateFilter) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.timestamp).toISOString().split('T')[0]
        return saleDate === dateFilter
      })
    }

    if (staffFilter) {
      filtered = filtered.filter(sale => sale.staffEmail === staffFilter)
    }

    setFilteredSales(filtered)
    const sum = filtered.reduce((acc, sale) => acc + sale.total, 0)
    setTotalSales(sum)
  }

  const handleDelete = async (id) => {
    if (window.confirm('この売上を削除してもよろしいですか？')) {
      try {
        const saleRef = ref(db, 'sales/' + id)
        await remove(saleRef)
        fetchSales()
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除に失敗しました')
      }
    }
  }

  const staffEmails = [...new Set(sales.map(s => s.staffEmail))]

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="sales-report">
      <h2>売上管理</h2>

      <div className="filters">
        <div className="filter-group">
          <label>日付:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <button
            className="btn-clear"
            onClick={() => setDateFilter('')}
          >
            クリア
          </button>
        </div>

        <div className="filter-group">
          <label>店員:</label>
          <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
            <option value="">全員</option>
            {staffEmails.map(email => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="summary">
        <div className="summary-card">
          <h3>売上件数</h3>
          <p className="summary-value">{filteredSales.length}</p>
        </div>
        <div className="summary-card">
          <h3>売上合計</h3>
          <p className="summary-value">¥{totalSales.toLocaleString()}</p>
        </div>
      </div>

      <div className="sales-table">
        <table>
          <thead>
            <tr>
              <th>日時</th>
              <th>店員</th>
              <th>商品数</th>
              <th>金額</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.id}>
                <td>{new Date(sale.timestamp).toLocaleString('ja-JP')}</td>
                <td>{sale.staffEmail}</td>
                <td>{sale.items.length}個</td>
                <td>¥{sale.total.toLocaleString()}</td>
                <td>
                  <button
                    className="btn-delete-small"
                    onClick={() => handleDelete(sale.id)}
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

export default SalesReport
