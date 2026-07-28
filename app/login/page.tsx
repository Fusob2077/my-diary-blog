'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

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
      sessionStorage.removeItem('userMode')
      router.push('/')
      router.refresh()
    }
  }

  if (isLoggedIn) {
    return null
  }

  const bg = '#141210'
  const text = '#f5f3f0'
  const muted = '#a8a29e'
  const accent = '#c4a574'
  const border = '#2c2825'

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg, color: text }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-serif mb-2" style={{ color: text }}>管理员登录</h1>
          <p className="text-sm" style={{ color: muted }}>登录以访问管理功能</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: 'rgba(44,40,37,0.6)',
                border: `1px solid ${border}`,
                color: text,
              }}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: 'rgba(44,40,37,0.6)',
                border: `1px solid ${border}`,
                color: text,
              }}
            />
          </div>

          {error && (
            <div className="px-4 py-2 rounded-lg text-sm text-center" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: accent, color: bg }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs transition-colors hover:opacity-80"
            style={{ color: muted }}
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
