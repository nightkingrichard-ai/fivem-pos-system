import React, { useState, useContext } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { getDatabase, ref, set } from 'firebase/database'
import { AppContext } from '../App'
import './Login.css'

function Login() {
  const { auth, db } = useContext(AppContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [role, setRole] = useState('staff')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError('ログインに失敗しました: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      // ユーザー情報を保存
      await set(ref(db, 'users/' + uid), {
        email: email,
        storeName: storeName,
        role: role,
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      setError('アカウント作成に失敗しました: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>FiveM POS System</h1>
        <p className="subtitle">{isSignUp ? 'アカウント作成' : 'ログイン'}</p>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
          {isSignUp && (
            <div className="form-group">
              <label>店舗名</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                placeholder="例: ABC店"
              />
            </div>
          )}

          <div className="form-group">
            <label>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>

          <div className="form-group">
            <label>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="8文字以上"
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label>役職</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="staff">店員</option>
                <option value="manager">店長</option>
              </select>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '処理中...' : (isSignUp ? 'アカウント作成' : 'ログイン')}
          </button>
        </form>

        <div className="toggle-auth">
          {isSignUp ? (
            <>
              アカウントをお持ちですか？{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="link-button"
              >
                ログイン
              </button>
            </>
          ) : (
            <>
              アカウントをお持ちでないですか？{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="link-button"
              >
                アカウント作成
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
