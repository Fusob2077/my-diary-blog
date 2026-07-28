'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setIsLoggedIn(true)
      setShowLoginModal(false)
      // 清除游客模式
      sessionStorage.removeItem('userMode')
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    sessionStorage.removeItem('userMode')
    setIsLoggedIn(false)
    window.location.reload()
  }

  return (
    <>
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="text-[10px] font-mono text-white/50 hover:text-white transition-colors px-3 py-1 border border-white/10 rounded hover:border-white/30"
        >
          登出
        </button>
      ) : (
        <button
          onClick={() => setShowLoginModal(true)}
          className="text-[10px] font-mono text-white/50 hover:text-white transition-colors px-3 py-1 border border-white/10 rounded hover:border-white/30"
        >
          登录
        </button>
      )}

      {/* 登录弹窗 */}
      {showLoginModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              padding: 32,
              borderRadius: 12,
              width: '100%',
              maxWidth: 360,
              margin: '0 16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
              管理员登录
            </h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: 12,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: 12,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              {error && (
                <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: 12,
                  backgroundColor: loading ? 'rgba(255,255,255,0.5)' : 'white',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 8,
                }}
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
