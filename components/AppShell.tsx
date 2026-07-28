'use client'

import { useState } from 'react'
import Link from 'next/link'
import WelcomeScreen from './WelcomeModal'
import AuthButton from './AuthButton'

const NAV_ITEMS = [
  { label: '主页', fr: 'Accueil', iconText: 'MA', href: '/' },
  { label: '控制台', fr: 'Le Console', iconText: 'KO', href: '/console' },
  { label: '日志', fr: 'Le Journal', iconText: 'JO', href: '/journal' },
  { label: '梦日记', fr: 'Rêve', iconText: 'DR', href: '/dreams' },
  { label: '经济', fr: 'Économie', iconText: 'EC', href: '/economy' },
  { label: '哲学', fr: 'Philosophie', iconText: 'PH', href: '/philosophy' },
  { label: '软工', fr: 'Génie', iconText: 'GE', href: '/engineering' },
  { label: '嵌入式', fr: 'Intégré', iconText: 'IN', href: '/embedded' },
  { label: 'ACG', fr: 'Animé', iconText: 'AN', href: '/acg' },
  { label: '产出', fr: 'Production', iconText: 'AR', href: '/art' },
  { label: '语言', fr: 'Linguistique', iconText: 'LI', href: '/linguistics' },
  { label: '智能', fr: 'Intelligence', iconText: 'IA', href: '/ai' },
  { label: '研究', fr: 'Sciences', iconText: 'SC', href: '/research' },
  { label: '乐器', fr: 'Musique', iconText: 'MU', href: '/music' },
]

function NavItem({
  label,
  fr,
  iconText,
  href,
  onClick,
}: {
  label: string
  fr: string
  iconText: string
  href: string
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center h-12 min-h-[48px] px-4 md:px-5 cursor-pointer relative group/item hover:bg-white/5 active:bg-white/10 transition-all touch-manipulation"
      style={{ WebkitTapHighlightColor: 'rgba(255,255,255,0.1)' }}
    >
      <div className="absolute left-0 w-[2px] bg-white h-0 group-hover/item:h-6 transition-all duration-300" />
      {/* 框内符号：不透明、浅色；桌面端字号更大 */}
      <div className="min-w-[28px] md:min-w-[32px] font-black text-[15px] md:text-[18px] tracking-tighter z-20 shrink-0 text-slate-100 opacity-95" style={{ textShadow: '0 0 1px rgba(255,255,255,0.5)' }}>
        {iconText}
      </div>
      <span className="ml-4 md:ml-8 whitespace-nowrap opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-all duration-500 font-bold text-[14px] md:text-[17px] tracking-[0.2em] text-slate-100 z-20">
        {label}
      </span>
      {/* 大图内法文装饰：桌面端字号更大 */}
      <span className="absolute left-16 md:left-20 whitespace-nowrap opacity-0 blur-sm group-hover/item:opacity-55 group-hover/item:blur-none group-hover/item:translate-x-6 transition-all duration-1000 font-serif italic text-2xl md:text-4xl text-slate-100 pointer-events-none select-none lowercase tracking-tighter hidden md:block">
        {fr}
      </span>
    </Link>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <WelcomeScreen />
      <header className="fixed top-0 left-0 right-0 h-14 md:h-16 backdrop-blur-xl bg-slate-900/60 border-b border-white/10 z-[60] flex items-center px-4 md:px-8 justify-between safe-area-padding">
        <div className="flex items-center gap-2 md:gap-4 text-slate-900">
          <button
            type="button"
            aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            onPointerDown={(e) => {
              e.preventDefault()
              setMobileMenuOpen((prev) => !prev)
            }}
            className="md:hidden p-2 -ml-2 rounded-lg text-white/90 hover:bg-white/10 touch-manipulation active:bg-white/20"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="font-black text-xl md:text-2xl tracking-tighter italic text-white">KOIS.</div>
          <span className="text-[10px] opacity-50 uppercase tracking-[0.4em] hidden md:block pl-4 font-mono text-white">
            ARCHIVE_TERMINAL_2026
          </span>
        </div>
        <AuthButton />
      </header>

      {/* 移动端侧栏遮罩 */}
      <div
        aria-hidden
        className="fixed inset-0 bg-black/50 z-[65] md:hidden transition-opacity duration-300"
        style={{
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
        onClick={() => setMobileMenuOpen(false)}
        onTouchStart={(e) => {
          if (mobileMenuOpen) {
            e.preventDefault()
            setMobileMenuOpen(false)
          }
        }}
      />

      {/* 侧边导航：桌面保持原样，移动端为抽屉；桌面端用 peer 让 main 随悬停扩展 */}
      <aside
        className={`fixed left-0 top-14 md:top-16 h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] flex flex-col bg-slate-900/95 md:bg-slate-900/60 border-r border-white/10 z-[70] md:z-50 w-[min(280px,85vw)] md:w-16 md:hover:w-64 transition-all duration-300 md:duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden md:overflow-hidden peer group backdrop-blur-2xl shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <nav className="flex flex-col py-4 md:py-6 overflow-y-auto min-h-0 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>
      </aside>

      {/* 主内容区：移动端全宽，桌面留出侧栏；桌面端悬停侧栏时 main 扩展 */}
      <main className="pt-14 md:pt-16 pl-0 md:pl-16 md:peer-hover:pl-64 min-h-screen w-full transition-[padding] duration-500 box-border overflow-x-hidden">
        {children}
      </main>
    </>
  )
}
