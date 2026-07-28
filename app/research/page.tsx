'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'
import { addReadingNoteAction, deleteReadingNoteAction, addMyArticleAction, deleteMyArticleAction, addResearchResourceAction, deleteResearchResourceAction } from '@/app/lib/actions'

interface ReadingNote {
  id: string
  title: string
  date: string
  desc?: string
}

interface MyArticle {
  id: string
  title: string
  type: string
  date: string
}

interface ResearchResource {
  id: string
  title: string
  size?: string
  type?: string
}

const fetcher = async (key: string) => {
  const supabase = createClient()
  const { data } = await supabase.from(key).select('*').order('created_at', { ascending: false })
  return data || []
}

export default function HumanitiesPage() {
  const { data: readingNotes = [], mutate: mutateNotes } = useSWR<ReadingNote[]>('reading_notes', fetcher)
  const { data: myArticles = [], mutate: mutateArticles } = useSWR<MyArticle[]>('my_articles', fetcher)
  const { data: resources = [], mutate: mutateResources } = useSWR<ResearchResource[]>('research_resources', fetcher)
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [showAddArticle, setShowAddArticle] = useState(false)
  const [showAddResource, setShowAddResource] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', date: '', desc: '' })
  const [newArticle, setNewArticle] = useState({ title: '', type: '文章', date: '' })
  const [newResource, setNewResource] = useState({ title: '', size: '', type: '' })
  
  // 打字机效果状态
  const [typewriterText, setTypewriterText] = useState('')
  const fullText = 'RESEARCH & ACADEMIC CONTENT'
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAdmin(!!user)
    }
    checkAuth()
  }, [])

  // 打字机动画效果
  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypewriterText(fullText.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)
    return () => clearInterval(typingInterval)
  }, [])

  // 光标闪烁效果
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0c08] text-amber-50/90 font-serif relative overflow-hidden">
      {/* SVG噪声纹理背景 */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px'
      }} />

      {/* 固定双边框装饰 */}
      <div className="fixed inset-4 pointer-events-none z-0">
        <div className="absolute inset-0 border-2 border-amber-900/30"></div>
        <div className="absolute inset-2 border border-amber-800/20"></div>
        {/* 角落装饰 */}
        <div className="absolute top-2 left-2 text-amber-900/40 text-xl">❧</div>
        <div className="absolute top-2 right-2 text-amber-900/40 text-xl rotate-90">❧</div>
        <div className="absolute bottom-2 left-2 text-amber-900/40 text-xl rotate-180">❧</div>
        <div className="absolute bottom-2 right-2 text-amber-900/40 text-xl -rotate-90">❧</div>
      </div>

      {/* 反主义装饰条文 */}
      <div className="fixed top-20 left-12 right-12 pointer-events-none z-5 opacity-30">
        <div className="flex justify-between items-center text-xs font-mono text-amber-900/50">
          <span>反权威 | ANTI-AUTHORITY</span>
          <span>反传统 | ANTI-TRADITION</span>
          <span>反主流 | ANTI-MAINSTREAM</span>
          <span>反体制 | ANTI-ESTABLISHMENT</span>
        </div>
      </div>
      <div className="fixed bottom-20 left-12 right-12 pointer-events-none z-5 opacity-30">
        <div className="flex justify-between items-center text-xs font-mono text-amber-900/50">
          <span>独立思考 | INDEPENDENT THOUGHT</span>
          <span>批判精神 | CRITICAL SPIRIT</span>
          <span>自由探索 | FREE EXPLORATION</span>
        </div>
      </div>

      {/* Header - 报纸风格 */}
      <header className="relative z-10 pt-12 pb-8 px-12 border-b-2 border-amber-900/30">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-amber-900/40 text-sm font-mono">═══════</span>
            <h1 className="text-5xl md:text-7xl font-serif text-amber-50" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-red-600">研</span>究<span className="text-red-600">室</span>
            </h1>
            <span className="text-amber-900/40 text-sm font-mono">═══════</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-amber-900/50 font-mono">
            <span>─────────</span>
            <span className="font-mono">
              {typewriterText}
              <span className={`inline-block w-2 h-4 bg-amber-900/60 ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}></span>
            </span>
            <span>─────────</span>
          </div>
          {/* ARCHIVE 印章 */}
          <div className="absolute top-8 right-12 text-red-600 font-black text-2xl rotate-12 opacity-80" style={{ fontFamily: 'Georgia, serif' }}>
            ARCHIVE
          </div>
        </div>
      </header>

      {/* 主内容 - 不规则网格布局 3-5-4 */}
      <main className="relative z-10 px-12 py-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-12 gap-8">
          
          {/* 第一列：读书笔记 (3列) */}
          <section className="col-span-12 md:col-span-3 space-y-6">
            <div className="border-2 border-dotted border-amber-900/30 p-6 bg-amber-950/20 relative">
              {/* 编号装饰 */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-red-600/50 bg-amber-950/80 flex items-center justify-center text-xs font-bold text-red-600">
                №01
              </div>
              
              {/* 反主义装饰 */}
              <div className="absolute top-4 right-4 text-xs font-mono text-red-600/40 rotate-12 opacity-60">
                反权威
              </div>
              
              <div className="flex items-center gap-2 mb-6 mt-4">
                <span className="text-red-600 text-xl">§</span>
                <h2 className="text-lg font-bold text-amber-50 uppercase tracking-wider">Reading Notes</h2>
                <span className="text-amber-900/40 text-xs">读书笔记</span>
              </div>
              
              {isAdmin && (
                showAddNote ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    const result = await addReadingNoteAction(newNote)
                    if (result.success) { setNewNote({ title: '', date: '', desc: '' }); setShowAddNote(false); mutateNotes() }
                  }} className="space-y-3 mb-6 border border-amber-900/30 p-4 bg-amber-950/30">
                    <input placeholder="标题" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="w-full bg-transparent border-b border-amber-900/40 text-sm text-amber-50 p-1 outline-none placeholder:text-amber-900/40" required />
                    <input placeholder="日期" value={newNote.date} onChange={e => setNewNote({...newNote, date: e.target.value})} className="w-full bg-transparent border-b border-amber-900/40 text-sm text-amber-50 p-1 outline-none placeholder:text-amber-900/40" required />
                    <input placeholder="描述" value={newNote.desc} onChange={e => setNewNote({...newNote, desc: e.target.value})} className="w-full bg-transparent border-b border-amber-900/40 text-sm text-amber-50 p-1 outline-none placeholder:text-amber-900/40" />
                    <div className="flex gap-2">
                      <button type="submit" className="text-xs bg-amber-900/40 text-amber-50 px-3 py-1 border border-amber-800/30">添加</button>
                      <button type="button" onClick={() => setShowAddNote(false)} className="text-xs text-amber-900/50">取消</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowAddNote(true)} className="text-xs text-amber-900/60 hover:text-amber-50 mb-6 border border-amber-900/30 px-3 py-1">+ 添加笔记</button>
                )
              )}
              
              <div className="space-y-6">
                {readingNotes.map((note, idx) => (
                  <div key={note.id} className="group relative border-l-2 border-amber-900/30 pl-4 pb-4">
                    <Link href={`/detail/note/${note.id}`} className="block cursor-pointer">
                      <span className="text-xs font-mono text-amber-900/50">{note.date}</span>
                      <h3 className="text-base text-amber-50 group-hover:text-red-500 transition-colors mt-1 font-serif">{note.title}</h3>
                      {note.desc && <p className="text-xs text-amber-900/60 mt-2 leading-relaxed italic">{note.desc}</p>}
                    </Link>
                    {isAdmin && (
                      <button onClick={async (e) => { e.stopPropagation(); if (confirm('删除？')) { await deleteReadingNoteAction(note.id); mutateNotes() }}} className="absolute top-0 right-0 text-xs text-red-600/50 hover:text-red-600 opacity-0 group-hover:opacity-100">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 第二列：个人创作 (5列，核心位置) */}
          <section className="col-span-12 md:col-span-5 space-y-6">
            <div className="border-2 border-amber-900/40 p-8 bg-amber-950/30 relative">
              {/* 编号装饰 */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-red-600/50 bg-amber-950/80 flex items-center justify-center text-xs font-bold text-red-600">
                №02
              </div>
              
              <div className="absolute top-4 right-4 text-red-600 text-2xl opacity-50">◆</div>
              
              {/* 反主义装饰 */}
              <div className="absolute top-16 right-4 text-xs font-mono text-red-600/40 rotate-12 opacity-60">
                反传统
              </div>
              <div className="absolute bottom-16 left-4 text-xs font-mono text-red-600/40 -rotate-12 opacity-60">
                反主流
              </div>
              
              <div className="flex items-center gap-2 mb-8 mt-4">
                <span className="text-red-600 text-2xl">◆</span>
                <h2 className="text-2xl font-bold text-amber-50 uppercase tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
                  Personal Essays
                </h2>
                <span className="text-amber-900/40 text-xs ml-auto">文章与视频</span>
              </div>
              
              {isAdmin && (
                showAddArticle ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    const result = await addMyArticleAction(newArticle)
                    if (result.success) { setNewArticle({ title: '', type: '文章', date: '' }); setShowAddArticle(false); mutateArticles() }
                  }} className="space-y-3 mb-6 border border-amber-900/30 p-4 bg-amber-950/40">
                    <input placeholder="标题" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} className="w-full bg-transparent border-b border-amber-900/40 text-sm text-amber-50 p-1 outline-none placeholder:text-amber-900/40" required />
                    <select value={newArticle.type} onChange={e => setNewArticle({...newArticle, type: e.target.value})} className="w-full bg-amber-950/50 border border-amber-900/40 text-sm text-amber-50 p-1 outline-none">
                      <option value="文章">文章</option>
                      <option value="视频">视频</option>
                    </select>
                    <input placeholder="日期" value={newArticle.date} onChange={e => setNewArticle({...newArticle, date: e.target.value})} className="w-full bg-transparent border-b border-amber-900/40 text-sm text-amber-50 p-1 outline-none placeholder:text-amber-900/40" required />
                    <div className="flex gap-2">
                      <button type="submit" className="text-xs bg-amber-900/40 text-amber-50 px-3 py-1 border border-amber-800/30">添加</button>
                      <button type="button" onClick={() => setShowAddArticle(false)} className="text-xs text-amber-900/50">取消</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowAddArticle(true)} className="text-xs text-amber-900/60 hover:text-amber-50 mb-6 border border-amber-900/30 px-3 py-1">+ 添加文章</button>
                )
              )}
              
              <div className="space-y-6">
                {myArticles.map((art, idx) => (
                  <div key={art.id} className="group p-6 border-2 border-transparent hover:border-amber-900/40 transition-all relative bg-amber-950/20">
                    <Link href={`/detail/article/${art.id}`} className="block">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs bg-amber-900/40 px-2 py-1 text-amber-50 uppercase border border-amber-800/30">{art.type}</span>
                        <span className="text-xs font-mono text-amber-900/50">{art.date}</span>
                      </div>
                      <h3 className="text-xl text-amber-50 group-hover:translate-x-2 transition-transform font-serif">
                        <span className="text-red-600/80">═══════════</span> {art.title} <span className="text-red-600/80">──────</span> →
                      </h3>
                    </Link>
                    {isAdmin && (
                      <button onClick={async (e) => { e.stopPropagation(); if (confirm('删除？')) { await deleteMyArticleAction(art.id); mutateArticles() }}} className="absolute top-2 right-2 text-xs text-red-600/50 hover:text-red-600 opacity-0 group-hover:opacity-100">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 第三列：资源文献 (4列) */}
          <section className="col-span-12 md:col-span-4 space-y-6">
            <div className="border-2 border-dotted border-amber-900/30 p-6 bg-amber-950/20 relative">
              {/* 编号装饰 */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-red-600/50 bg-amber-950/80 flex items-center justify-center text-xs font-bold text-red-600">
                №03
              </div>
              
              {/* 反主义装饰 */}
              <div className="absolute top-4 right-4 text-xs font-mono text-red-600/40 rotate-12 opacity-60">
                反体制
              </div>
              
              <div className="flex items-center gap-2 mb-6 mt-4">
                <span className="text-red-600 text-xl">§</span>
                <h2 className="text-lg font-bold text-amber-50 uppercase tracking-wider">Resources</h2>
                <span className="text-amber-900/40 text-xs">资源文献</span>
              </div>
              
              {isAdmin && (
                showAddResource ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    const result = await addResearchResourceAction(newResource)
                    if (result.success) { setNewResource({ title: '', size: '', type: '' }); setShowAddResource(false); mutateResources() }
                  }} className="space-y-3 mb-6 border border-amber-900/30 p-4 bg-amber-950/30">
                    <input placeholder="资源名称" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} className="w-full bg-transparent border-b border-amber-900/40 text-sm text-amber-50 p-1 outline-none placeholder:text-amber-900/40" required />
                    <input placeholder="大小" value={newResource.size} onChange={e => setNewResource({...newResource, size: e.target.value})} className="w-full bg-transparent border-b border-amber-900/40 text-sm text-amber-50 p-1 outline-none placeholder:text-amber-900/40" />
                    <input placeholder="类型" value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value})} className="w-full bg-transparent border-b border-amber-900/40 text-sm text-amber-50 p-1 outline-none placeholder:text-amber-900/40" />
                    <div className="flex gap-2">
                      <button type="submit" className="text-xs bg-amber-900/40 text-amber-50 px-3 py-1 border border-amber-800/30">添加</button>
                      <button type="button" onClick={() => setShowAddResource(false)} className="text-xs text-amber-900/50">取消</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowAddResource(true)} className="text-xs text-amber-900/60 hover:text-amber-50 mb-6 border border-amber-900/30 px-3 py-1">+ 添加资源</button>
                )
              )}
              
              <div className="space-y-4">
                {resources.map((res, idx) => (
                  <div key={res.id} className="flex items-center justify-between group cursor-pointer border-b border-dotted border-amber-900/20 pb-3 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-red-600/60">№{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-amber-50 group-hover:text-red-500 transition-colors font-serif">{res.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-900/50 group-hover:text-red-600">{res.size || res.type || 'FETCH_>'}</span>
                      {isAdmin && (
                        <button onClick={async () => { if (confirm('删除？')) { await deleteResearchResourceAction(res.id); mutateResources() }}} className="text-xs text-red-600/50 hover:text-red-600 opacity-0 group-hover:opacity-100">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 底部印章装饰 */}
              <div className="mt-8 pt-6 border-t border-amber-900/20 flex justify-center">
                <div className="w-20 h-20 border-2 border-red-600/50 rounded-full flex items-center justify-center text-xs font-bold text-red-600/60" style={{ fontFamily: 'Georgia, serif' }}>
                  ARCHIVE
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(15, 12, 8, 0.85) !important; border-bottom-color: rgba(180, 83, 9, 0.3) !important; }
        aside.fixed { background: rgba(15, 12, 8, 0.85) !important; border-right-color: rgba(180, 83, 9, 0.3) !important; }
        aside.fixed .group\\/item:hover { background: rgba(180, 83, 9, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(180, 83, 9) !important; }
      `}} />
    </div>
  )
}
