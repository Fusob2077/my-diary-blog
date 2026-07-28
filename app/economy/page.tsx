'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'

interface EconomyArticle {
  id: string
  title: string
  content: string
  category?: string
  created_at: string
  updated_at?: string
}

const fetcher = async () => {
  const supabase = createClient()
  const { data } = await supabase.from('economy_articles').select('*').order('created_at', { ascending: false })
  return data || []
}

export default function EconomyPage() {
  const { data: articles = [], mutate } = useSWR<EconomyArticle[]>('economy_articles', fetcher)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: '' })
  const [cursorBlink, setCursorBlink] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const interval = setInterval(() => setCursorBlink(prev => !prev), 530)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAdmin(!!user)
    }
    checkAuth()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('economy_articles').insert([newArticle])
    if (error) {
      alert('添加失败: ' + error.message)
    } else {
      setNewArticle({ title: '', content: '', category: '' })
      setShowAdd(false)
      mutate()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('删除这篇文章？')) return
    const supabase = createClient()
    const { error } = await supabase.from('economy_articles').delete().eq('id', id)
    if (error) {
      alert('删除失败: ' + error.message)
    } else {
      mutate()
    }
  }

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(search.toLowerCase()) ||
    art.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#00ff00] p-6 md:p-12 overflow-hidden relative" style={{ fontFamily: 'Courier New, monospace' }}>
      {/* CRT扫描线效果 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)`,
      }} />
      
      {/* 终端边框 */}
      <div className="fixed inset-2 border border-[#00ff00]/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 终端头部 */}
        <header className="mb-8 border-b border-[#00ff00]/20 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#00ff00] font-bold">&gt;</span>
            <span className="text-[#00ff00]/80">ECONOMIC_NOTES v1.0</span>
            <span className={`inline-block w-2 h-4 bg-[#00ff00] ml-2 ${cursorBlink ? 'opacity-100' : 'opacity-0'}`} />
          </div>
          <div className="text-[10px] text-[#00ff00]/50 font-mono">
            <span>STATUS: ACTIVE</span>
            <span className="mx-2">|</span>
            <span>ARTICLES: {articles.length}</span>
            <span className="mx-2">|</span>
            <span>MODE: NOTE_EDITING</span>
          </div>
        </header>

        {/* 搜索框 */}
        <div className="mb-6 border border-[#00ff00]/20 bg-black/50 p-4">
          <div className="flex items-center gap-2">
            <span className="text-[#00ff00]/60 text-xs">&gt; SEARCH:</span>
            <input 
              type="text"
              placeholder="搜索文章..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-b border-[#00ff00]/30 text-[#00ff00] p-1 outline-none font-mono text-sm"
            />
          </div>
        </div>

        {/* 管理员添加文章 */}
        {isAdmin && (
          <div className="mb-6 border border-[#00ff00]/20 bg-black/50 p-4">
            {showAdd ? (
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <span className="text-[#00ff00]/60 text-xs">&gt; TITLE:</span>
                  <input 
                    placeholder="文章标题"
                    value={newArticle.title}
                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                    className="w-full bg-transparent border-b border-[#00ff00]/30 text-[#00ff00] p-2 outline-none font-mono mt-1"
                    required
                  />
                </div>
                <div>
                  <span className="text-[#00ff00]/60 text-xs">&gt; CATEGORY (optional):</span>
                  <input 
                    placeholder="分类标签"
                    value={newArticle.category}
                    onChange={e => setNewArticle({...newArticle, category: e.target.value})}
                    className="w-full bg-transparent border-b border-[#00ff00]/30 text-[#00ff00]/80 p-2 outline-none font-mono mt-1"
                  />
                </div>
                <div>
                  <span className="text-[#00ff00]/60 text-xs">&gt; CONTENT:</span>
                  <textarea 
                    placeholder="文章内容..."
                    value={newArticle.content}
                    onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                    className="w-full bg-transparent border border-[#00ff00]/30 text-[#00ff00] p-3 outline-none resize-none h-32 font-mono mt-1"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-[#00ff00] text-black px-6 py-2 font-bold text-xs hover:bg-[#00cc00] transition-colors">EXECUTE</button>
                  <button type="button" onClick={() => { setShowAdd(false); setNewArticle({ title: '', content: '', category: '' }) }} className="text-[#00ff00]/50 text-xs hover:text-[#00ff00]">CANCEL</button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setShowAdd(true)}
                className="text-[#00ff00]/60 hover:text-[#00ff00] text-xs font-mono border border-[#00ff00]/20 px-4 py-2 hover:border-[#00ff00]/40 transition-colors"
              >
                &gt; ADD_NEW_ARTICLE
              </button>
            )}
          </div>
        )}

        {/* 文章列表 */}
        <main className="space-y-4">
          {filteredArticles.map((article, idx) => (
            <article 
              key={article.id}
              className="border border-[#00ff00]/20 bg-black/30 p-6 hover:border-[#00ff00]/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[8px] font-mono text-[#00ff00]/40">ID: {String(idx + 1).padStart(3, '0')}</span>
                    {article.category && (
                      <span className="text-[8px] font-mono text-[#00ff00]/60 border border-[#00ff00]/30 px-2 py-0.5">
                        [{article.category}]
                      </span>
                    )}
                    <span className="text-[8px] font-mono text-[#00ff00]/40">
                      {new Date(article.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-lg font-mono font-bold text-[#00ff00] mb-3 group-hover:text-[#00cc00] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-[#00ff00]/70 font-mono leading-relaxed line-clamp-3 mb-4">
                    {article.content}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 ml-4">
                    <Link 
                      href={`/detail/economy/${article.id}`}
                      className="text-[#00ff00]/50 hover:text-[#00ff00] text-xs font-mono border border-[#00ff00]/20 px-2 py-1 hover:border-[#00ff00]/40 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      EDIT
                    </Link>
                    <button 
                      onClick={() => handleDelete(article.id)}
                      className="text-[#ff0000]/50 hover:text-[#ff0000] text-xs font-mono border border-[#ff0000]/20 px-2 py-1 hover:border-[#ff0000]/40 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      DEL
                    </button>
                  </div>
                )}
              </div>
              <Link href={`/detail/economy/${article.id}`} className="text-[10px] font-mono text-[#00ff00]/40 hover:text-[#00ff00] transition-colors">
                &gt; READ_FULL_ARTICLE
              </Link>
            </article>
          ))}
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-20 text-[#00ff00]/30 text-xs font-mono border border-[#00ff00]/20 bg-black/30 p-8">
              &gt; NO_ARTICLES_FOUND
            </div>
          )}
        </main>
      </div>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(10, 10, 10, 0.95) !important; border-bottom-color: rgba(0, 255, 0, 0.3) !important; }
        aside.fixed { background: rgba(10, 10, 10, 0.95) !important; border-right-color: rgba(0, 255, 0, 0.3) !important; }
        aside.fixed .group\\/item:hover { background: rgba(0, 255, 0, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(0, 255, 0) !important; }
      `}} />
    </div>
  )
}
