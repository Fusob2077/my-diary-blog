'use client'

import Image from 'next/image'
import { FormEvent, useMemo, useState } from 'react'

/** 絮语卡片展示用的「本人」信息（可日后接登录用户资料） */
const WHISPER_AUTHOR = {
  displayName: '夜迹',
  avatarSrc: '/o.jpg',
} as const

type Visibility = 'public' | 'friends' | 'private'
type ViewerRole = 'owner' | 'friend' | 'guest'
type CardStyle = 'excerpt' | 'thought' | 'poem'

interface WhisperEntry {
  id: string
  title: string
  content: string
  createdAt: string
  visibility: Visibility
  tags: string[]
  style: CardStyle
}

const demoEntries: WhisperEntry[] = [
  { id: '1', title: '凌晨三点', content: '睡不着，窗外风像在说话。', createdAt: '2026-04-14T03:12:00', visibility: 'public', tags: ['夜晚', '心情'], style: 'thought' },
  { id: '2', title: '摘一段', content: '“记忆不是存档，是折回的光。”\n——来自某个未署名的夜。', createdAt: '2026-04-12T10:30:00', visibility: 'friends', tags: ['摘录', '句子'], style: 'excerpt' },
  { id: '3', title: '只想安静', content: '把喧嚣放下。\n把自己放回自己的呼吸里。', createdAt: '2026-03-28T21:40:00', visibility: 'private', tags: ['独处'], style: 'poem' },
  { id: '4', title: '临时灵感', content: '如果每条都带一个“可见的理由”，就不会把所有感受都摊开。', createdAt: '2026-03-05T18:20:00', visibility: 'public', tags: ['灵感'], style: 'thought' },
]

const visibilityText: Record<Visibility, string> = {
  public: '所有人可见',
  friends: '好友可见',
  private: '仅自己可见',
}

export default function DreamsPage() {
  const [entries, setEntries] = useState<WhisperEntry[]>(demoEntries)
  const [query, setQuery] = useState('')
  const [viewerRole, setViewerRole] = useState<ViewerRole>('owner')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    visibility: 'public' as Visibility,
    style: 'thought' as CardStyle,
    tags: '',
  })

  const cardStyleOptions: Array<{ value: CardStyle; label: string }> = [
    { value: 'excerpt', label: '文摘' },
    { value: 'thought', label: '思绪' },
    { value: 'poem', label: '小诗' },
  ]

  const visibleByRole = (entry: WhisperEntry) => {
    if (viewerRole === 'owner') return true
    if (viewerRole === 'friend') return entry.visibility !== 'private'
    return entry.visibility === 'public'
  }

  const filteredEntries = useMemo(() => {
    const kw = query.trim().toLowerCase()
    return entries
      .filter(visibleByRole)
      .filter((entry) => {
        const day = entry.createdAt.slice(0, 10)
        const month = entry.createdAt.slice(0, 7)
        if (selectedDate && day !== selectedDate) return false
        if (selectedMonth && month !== selectedMonth) return false
        if (!kw) return true
        return (
          entry.title.toLowerCase().includes(kw) ||
          entry.content.toLowerCase().includes(kw) ||
          entry.tags.join(',').toLowerCase().includes(kw)
        )
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [entries, query, selectedDate, selectedMonth, viewerRole])

  const timelineGroups = useMemo(() => {
    const groups = new Map<string, WhisperEntry[]>()
    filteredEntries.forEach((entry) => {
      const ym = entry.createdAt.slice(0, 7)
      if (!groups.has(ym)) groups.set(ym, [])
      groups.get(ym)!.push(entry)
    })
    return Array.from(groups.entries())
  }, [filteredEntries])

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) return
    const now = new Date().toISOString()
    const newEntry: WhisperEntry = {
      id: crypto.randomUUID(),
      title: form.title.trim() || '无题',
      content: form.content.trim(),
      createdAt: now,
      visibility: form.visibility,
      style: form.style,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }
    setEntries((prev) => [newEntry, ...prev])
    setForm({ title: '', content: '', visibility: 'public', style: 'thought', tags: '' })
    setShowComposer(false)
  }

  const cardClass = (style: CardStyle) => {
    if (style === 'excerpt') return 'bg-white/85 border-[#e9d5ff]/80'
    if (style === 'thought') return 'bg-white/85 border-[#ddd6fe]/90'
    return 'bg-white/85 border-[#bfdbfe]/80'
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#1f2937] p-6 md:p-10 relative overflow-hidden" style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}>
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.10),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(59,130,246,0.08),transparent_40%)]" />
      <div className="fixed inset-4 pointer-events-none z-0">
        <div className="absolute inset-0 border border-[#e9d5ff]" />
        <div className="absolute inset-2 border border-[#f1e8ff]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-8 border-b border-[#e9d5ff] pb-6 relative">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-[#6d28d9] text-sm">· · ·</span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-wide text-[#111827]">
              <span className="text-[#6d28d9]">絮</span>语
            </h1>
            <span className="text-[#6d28d9] text-sm">· · ·</span>
          </div>
          <p className="text-sm text-[#6b7280]">像淡色便笺：给每条心事设定可见范围，用时间拾回记忆。</p>
          <div className="absolute top-1 right-0 text-[#6d28d9]/70 text-sm rotate-6">夜迹</div>
        </header>

        <section className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题/内容/标签"
            className="md:col-span-2 bg-white/80 border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none focus:border-[#a78bfa]"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/80 border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none focus:border-[#a78bfa]"
          />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white/80 border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none focus:border-[#a78bfa]"
          />
        </section>

        <section className="mb-8 flex flex-wrap gap-3">
          <select
            value={viewerRole}
            onChange={(e) => setViewerRole(e.target.value as ViewerRole)}
            className="bg-white/80 border border-[#e5e7eb] px-3 py-2 text-sm"
          >
            <option value="owner">查看身份：自己</option>
            <option value="friend">查看身份：好友</option>
            <option value="guest">查看身份：游客</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSelectedDate('')
              setSelectedMonth('')
              setQuery('')
            }}
            className="border border-[#e5e7eb] px-3 py-2 text-sm hover:border-[#a78bfa] hover:bg-white/80"
          >
            清空筛选
          </button>
          {viewerRole === 'owner' && (
            <button
              type="button"
              onClick={() => setShowComposer((v) => !v)}
              className="border border-[#e9d5ff] px-3 py-2 text-sm hover:bg-[#f7f3ff]"
            >
              {showComposer ? '收起编辑器' : '+ 新建絮语'}
            </button>
          )}
        </section>

        {viewerRole === 'owner' && showComposer && (
          <form onSubmit={handleCreate} className="mb-10 border border-[#e9d5ff] bg-white/70 p-4 space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="标题（可选）"
              className="w-full bg-transparent border-b border-[#e5e7eb] px-3 py-2 text-sm placeholder:text-[#9ca3af]"
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="写点什么..."
              required
              className="w-full h-28 resize-none bg-transparent border border-[#e5e7eb] px-3 py-2 text-sm placeholder:text-[#9ca3af]"
            />
            <div className="grid sm:grid-cols-3 gap-3">
              <select
                value={form.visibility}
                onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value as Visibility }))}
                className="bg-white border border-[#e5e7eb] px-3 py-2 text-sm"
              >
                <option value="public">所有人可见</option>
                <option value="friends">好友可见</option>
                <option value="private">仅自己可见</option>
              </select>
              <select
                value={form.style}
                onChange={(e) => setForm((p) => ({ ...p, style: e.target.value as CardStyle }))}
                className="bg-white border border-[#e5e7eb] px-3 py-2 text-sm"
              >
                {cardStyleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder="标签(逗号分隔)"
                className="bg-white border border-[#e5e7eb] px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="bg-[#6d28d9] border border-[#7c3aed] text-white px-4 py-2 text-sm hover:bg-[#5b21b6]">
              发布
            </button>
          </form>
        )}

        <div className="mb-5 text-xs text-[#6b7280]">时间轴（按年月）</div>
        <main className="space-y-6">
          {timelineGroups.map(([ym, group]) => (
            <section key={ym}>
              <h2 className="text-sm mb-3 text-[#6b7280] flex items-center gap-2">
                <span className="text-[#7c3aed]">◦</span>
                {ym}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {group.map((entry, cardIdx) => (
                  <article
                    key={entry.id}
                    className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${cardClass(entry.style)} hover:shadow-[0_12px_35px_rgba(15,23,42,0.12)]`}
                  >
                    {/* 只保留“文摘”的左侧细线，其他样式尽量减少绝对装饰，避免 AI 组件感 */}
                    {entry.style === 'excerpt' && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] z-[1]" style={{ background: 'rgba(109,40,217,0.22)' }} />
                    )}

                    <div
                      className="pointer-events-none absolute -right-6 -bottom-8 h-36 w-36 rounded-full opacity-[0.06] overflow-hidden z-0"
                      aria-hidden
                    >
                      <Image
                        src={WHISPER_AUTHOR.avatarSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    </div>

                    <div className="relative z-10">
                      <div className="flex gap-3 mb-4">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/90 shadow-[0_2px_10px_rgba(109,40,217,0.18)]">
                          <Image
                            src={WHISPER_AUTHOR.avatarSrc}
                            alt={`${WHISPER_AUTHOR.displayName} 的头像`}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-[#111827] tracking-wide">{WHISPER_AUTHOR.displayName}</p>
                            <span className="text-[11px] text-[#6b7280] whitespace-nowrap shrink-0">
                              {visibilityText[entry.visibility]}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9ca3af] mt-0.5">
                            {new Date(entry.createdAt).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <h3
                        className={`text-lg font-semibold text-[#111827] truncate ${
                          entry.style === 'thought' ? 'italic font-normal' : ''
                        } ${entry.style === 'poem' ? 'text-center' : ''}`}
                        style={
                          entry.style === 'poem'
                            ? { letterSpacing: '0.1em', fontSize: '13px' }
                            : undefined
                        }
                      >
                        {entry.title}
                      </h3>

                      <p
                        className={`mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#374151] ${
                          entry.style === 'excerpt' ? 'pl-4' : ''
                        } ${entry.style === 'poem' ? 'italic text-center leading-[1.95]' : ''}`}
                      >
                        {entry.content}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#e5e7eb] text-[11px] text-[#6b7280] flex flex-wrap items-center gap-2">
                        {entry.tags.map((tag, idx) => (
                          <span key={`${tag}-${idx}`} className="whitespace-nowrap">
                            {idx === 0 ? '' : '·'}#{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
          {timelineGroups.length === 0 && (
            <div className="border border-dashed border-[#e5e7eb] py-12 text-center text-[#9ca3af]">当前筛选下暂无絮语</div>
          )}
        </main>
      </div>
    </div>
  )
}
