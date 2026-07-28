'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/utils/supabase/client'

type UserMode = 'guest' | 'authenticated' | null

export default function WelcomeScreen() {
  const [showScreen, setShowScreen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 已登录用户直接进入
        setShowScreen(false)
      } else {
        const savedMode = sessionStorage.getItem('userMode')
        if (savedMode === 'guest') {
          // 已选择游客模式
          setShowScreen(false)
        } else {
          // 需要显示欢迎页
          setShowScreen(true)
        }
      }
      setIsLoading(false)
    }
    checkSession()
  }, [])

  const handleGuestAccess = () => {
    sessionStorage.setItem('userMode', 'guest')
    setShowScreen(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoginLoading(false)
    } else {
      setShowScreen(false)
    }
  }

  // 等待客户端挂载
  if (!mounted) return null

  // 不需要显示欢迎页时返回 null
  if (!showScreen && !isLoading) return null

  const screenContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Loading 状态 */}
      {isLoading ? (
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            padding: '0 24px',
          }}
        >
          {/* Logo 和标题 */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: 'white',
                margin: 0,
                letterSpacing: '-2px',
                fontStyle: 'italic',
              }}
            >
              KOIS.
            </h1>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
                marginTop: 12,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}
            >
              Digital Archive Terminal
            </p>
          </div>

          {!showLoginForm ? (
            /* 欢迎选择界面 */
            <div>
              <p
                style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                  marginBottom: 32,
                  lineHeight: 1.6,
                }}
              >
                欢迎来到我的数字档案馆
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowLoginForm(true)}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    backgroundColor: 'white',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  管理员登录
                </button>
                <button
                  type="button"
                  onClick={handleGuestAccess}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  以游客身份浏览
                </button>
              </div>

              <p
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.3)',
                  marginTop: 32,
                }}
              >
                游客可以浏览所有内容，但无法修改数据
              </p>
            </div>
          ) : (
            /* 登录表单 */
            <div>
              <button
                type="button"
                onClick={() => setShowLoginForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  cursor: 'pointer',
                  marginBottom: 24,
                  padding: 0,
                }}
              >
                ← 返回
              </button>

              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'white',
                  margin: '0 0 32px 0',
                  textAlign: 'center',
                }}
              >
                管理员登录
              </h2>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="email"
                  placeholder="邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 16,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 16,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {error && (
                  <p style={{ textAlign: 'center', fontSize: 14, color: '#f87171', margin: 0 }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    backgroundColor: loginLoading ? 'rgba(255,255,255,0.5)' : 'white',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: loginLoading ? 'not-allowed' : 'pointer',
                    marginTop: 8,
                  }}
                >
                  {loginLoading ? '登录中...' : '登录'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )

  return createPortal(screenContent, document.body)
}
