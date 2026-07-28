'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { addChangelogAction, deleteChangelogAction, addArticleAction, deleteArticleAction } from '@/app/lib/actions'

interface ChangelogEntry {
  id: string
  date: string
  content: string
  zh: string
}

interface Article {
  id: string
  num: string
  tag: string
  en_title: string
  zh_title: string
  description: string
  sort_order: number
}

export default function Page() {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAddArticle, setShowAddArticle] = useState(false)
  const [newArticle, setNewArticle] = useState({ num: '', tag: '', en_title: '', zh_title: '', description: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 6
  const [showAddChangelog, setShowAddChangelog] = useState(false)
  const [newChangelog, setNewChangelog] = useState({ date: '', content: '', zh: '' })

  useEffect(() => {
    const supabase = createClient()
    
    // 获取数据
    const fetchData = async () => {
      const [changelogRes, articlesRes] = await Promise.all([
        supabase.from('changelog').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('sort_order', { ascending: true })
      ])
      if (changelogRes.data) setChangelog(changelogRes.data)
      if (articlesRes.data) setArticles(articlesRes.data)
    }
    
    // 检查登录状态
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAdmin(!!user)
    }
    
    fetchData()
    checkAuth()
  }, [])

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addArticleAction({
      ...newArticle,
      sort_order: articles.length + 1
    })
    if (result.success) {
      setNewArticle({ num: '', tag: '', en_title: '', zh_title: '', description: '' })
      setShowAddArticle(false)
      // 刷新数据
      const supabase = createClient()
      const [changelogRes, articlesRes] = await Promise.all([
        supabase.from('changelog').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('sort_order', { ascending: true })
      ])
      if (changelogRes.data) setChangelog(changelogRes.data)
      if (articlesRes.data) setArticles(articlesRes.data)
    } else {
      alert(result.error?.includes('Unauthorized') ? '游客模式：无法添加数据' : '添加失败')
    }
  }

  return (
    <div className="flex flex-col gap-12 sm:gap-16 md:gap-20 max-w-[1400px] mx-auto overflow-x-hidden px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20 relative w-full box-border">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16 md:py-20 px-6 sm:px-10 md:px-20 text-slate-100 shadow-2xl border border-slate-700/50 z-10">
        <div className="absolute right-[-3%] top-[-8%] select-none text-[10rem] sm:text-[14rem] md:text-[18rem] font-black opacity-[0.03] italic tracking-tighter leading-none pointer-events-none uppercase">
          KOIS
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-700/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E')] pointer-events-none" aria-hidden />
        
        {/* 右下角系统信息 */}
        <div className="absolute bottom-8 right-8 text-right hidden md:block select-none pointer-events-none">
          <div className="text-[9px] font-mono text-slate-600/60 tracking-[0.2em] leading-loose space-y-1">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-pulse"></span>
              SYSTEM_STATUS: ONLINE
            </p>
            <p>TERMINAL: KOIS_STUDIO_V1.0</p>
            <p className="text-slate-700/50">© 2026 HUMANITIES & LOGIC</p>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-slate-600/50"></span>
            <span className="text-[10px] font-mono tracking-[0.4em] text-slate-500 uppercase">Archive No. 001</span>
            <span className="h-px flex-1 bg-slate-600/30"></span>
          </div>
          
          <h1 className="mb-6 sm:mb-8 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85]">
            <span className="block">KOIS</span>
            <span className="text-slate-600/50 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light italic mt-2 block">
              Suture des Signes
            </span>
          </h1>
          
          <div className="max-w-2xl space-y-4">
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-serif italic">
              "Die Grenzen meiner Sprache bedeuten die Grenzen meiner Welt."
            </p>
            <div className="flex items-start gap-3">
              <span className="text-slate-600 text-xl mt-1">—</span>
              <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed border-l-2 border-slate-700/50 pl-4">
                语言的边界即是世界的边界。<br />
                在此缝合符号与逻辑的裂隙，探索艺术、网安与哲学的交叉地带。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Layout - 深色主面板 */}
      <div className="relative z-10 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/98 via-slate-800 to-slate-900/98 border border-slate-700/50 shadow-2xl ring-1 ring-black/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-white/[0.02] to-transparent pointer-events-none" aria-hidden />
        <div className="relative flex flex-col lg:flex-row gap-0">
        
        {/* 【左侧栏】：头像 + Intro + Changelog */}
        <aside className="lg:w-[22%] xl:w-[20%] min-w-0 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="lg:sticky lg:top-28 p-6 sm:p-8 lg:pr-6">
            {/* 头像 */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-8 group">
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <img src="o.jpg" className="relative w-full h-full object-cover rounded-full border-2 border-white/25 ring-2 ring-white/10 shadow-xl transition-transform duration-300 group-hover:scale-[1.02]" alt="Avatar"/>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 border-2 border-slate-800 rounded-full shadow-lg ring-2 ring-emerald-400/30" />
            </div>
            
            {/* Intro */}
            <div className="mb-10 pb-8 border-b border-white/15">
              <h4 className="text-[11px] font-mono uppercase tracking-[0.35em] text-white/60 mb-5">Intro</h4>
              <p className="text-lg sm:text-xl text-white leading-relaxed font-light">
                Interdisciplinary researcher.
              </p>
              <p className="mt-2.5 text-base text-white/90 leading-relaxed">
                探索艺术、网安与哲学的交叉地带。
              </p>
            </div>
            
            {/* Changelog - 时间线样式 + 表单深色主题 */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-5">
                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Changelog</h4>
                <span className="h-px flex-1 bg-white/25" />
                {isAdmin && (
                  <button
                    onClick={() => setShowAddChangelog(!showAddChangelog)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-800 bg-white/90 hover:bg-white rounded-lg transition-colors border border-white/50 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
                    title="添加日志"
                  >
                    {showAddChangelog ? '−' : '+'}
                  </button>
                )}
              </div>
              
              {isAdmin && showAddChangelog && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const result = await addChangelogAction(newChangelog);
                    if (result.success) {
                      setNewChangelog({ date: '', content: '', zh: '' });
                      setShowAddChangelog(false);
                      const supabase = createClient();
                      const { data } = await supabase.from('changelog').select('*').order('created_at', { ascending: false });
                      if (data) setChangelog(data);
                    } else {
                      alert(result.error?.includes('Unauthorized') ? '游客模式：无法添加数据' : '添加失败');
                    }
                  }}
                  className="mb-5 p-4 rounded-xl bg-white/5 border border-white/15 space-y-3"
                >
                  <input
                    type="text"
                    placeholder="日期 (如 2026.01.24)"
                    value={newChangelog.date}
                    onChange={e => setNewChangelog({...newChangelog, date: e.target.value})}
                    className="w-full text-sm bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors"
                    required
                  />
                  <input
                    type="text"
                    placeholder="英文内容"
                    value={newChangelog.content}
                    onChange={e => setNewChangelog({...newChangelog, content: e.target.value})}
                    className="w-full text-sm bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors"
                    required
                  />
                  <input
                    type="text"
                    placeholder="中文内容"
                    value={newChangelog.zh}
                    onChange={e => setNewChangelog({...newChangelog, zh: e.target.value})}
                    className="w-full text-sm bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors"
                    required
                  />
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="flex-1 text-sm font-medium bg-white text-slate-900 py-2.5 rounded-lg hover:bg-white/95 transition-colors">添加</button>
                    <button type="button" onClick={() => { setShowAddChangelog(false); setNewChangelog({ date: '', content: '', zh: '' }); }} className="text-sm text-white/60 hover:text-white px-3 py-2.5">取消</button>
                  </div>
                </form>
              )}
              
              {/* 时间线：竖线 + 节点 */}
              <ul className="relative pl-0 ml-1 space-y-6 max-h-[520px] overflow-y-auto pr-2 scrollbar-dark">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/35 via-white/15 to-transparent" aria-hidden />
                {changelog.length > 0 ? (
                  changelog.map((entry, i) => (
                    <ChangelogItem
                      key={entry.id}
                      date={entry.date}
                      content={entry.content}
                      zh={entry.zh}
                      isAdmin={isAdmin}
                      isFirst={i === 0}
                      onDelete={async () => {
                        if (confirm('确定删除这条 Changelog？')) {
                          const result = await deleteChangelogAction(entry.id);
                          if (result.success) {
                            const supabase = createClient();
                            const { data } = await supabase.from('changelog').select('*').order('created_at', { ascending: false });
                            if (data) setChangelog(data);
                          } else alert(result.error?.includes('Unauthorized') ? '游客模式：无法删除' : '删除失败');
                        }
                      }}
                    />
                  ))
                ) : (
                  <li className="text-sm text-white/50 italic py-4">加载中...</li>
                )}
              </ul>
            </div>
          </div>
        </aside>

        {/* 【中间主栏】：文章卡片流 */}
        <div className="lg:w-[68%] xl:w-[70%] min-w-0 flex-1 p-6 sm:p-8 lg:p-10">
          {/* 文章网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-7 mb-8">
            {articles.length > 0 ? (
              articles
                .slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage)
                .map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    id={article.id}
                    num={article.num} 
                    tag={article.tag} 
                    enTitle={article.en_title} 
                    zhTitle={article.zh_title} 
                    desc={article.description}
                    isAdmin={isAdmin}
                    onDelete={async () => {
                      if (confirm(`确定删除文章 "${article.zh_title}" 吗？`)) {
                        const result = await deleteArticleAction(article.id, article.zh_title)
                        if (result.success) {
                          setArticles(prev => prev.filter(a => a.id !== article.id))
                          // 刷新 changelog
                          const supabase = createClient()
                          const { data } = await supabase.from('changelog').select('*').order('created_at', { ascending: false })
                          if (data) setChangelog(data)
                          // 如果当前页没有文章了，回到上一页
                          const remainingArticles = articles.filter(a => a.id !== article.id)
                          const maxPage = Math.ceil(remainingArticles.length / articlesPerPage)
                          if (currentPage > maxPage && maxPage > 0) {
                            setCurrentPage(maxPage)
                          }
                        } else {
                          alert(result.error?.includes('Unauthorized') ? '游客模式：无法删除' : '删除失败')
                        }
                      }
                    }}
                  />
                ))
            ) : (
              <p className="col-span-full text-white/60 italic text-sm text-center py-12">加载中...</p>
            )}
          </div>

          {/* 翻页控件 */}
          {articles.length > articlesPerPage && (
            <nav className="flex items-center justify-center gap-4 sm:gap-6 mt-10 mb-6" aria-label="分页">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 text-sm font-medium text-white border border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                上一页
              </button>
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-sm font-medium tabular-nums">
                  第 {currentPage} / {Math.ceil(articles.length / articlesPerPage)} 页
                </span>
                <span className="text-xs text-white/60">(共 {articles.length} 篇)</span>
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(articles.length / articlesPerPage), prev + 1))}
                disabled={currentPage >= Math.ceil(articles.length / articlesPerPage)}
                className="px-5 py-2.5 text-sm font-medium text-white border border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                下一页
              </button>
            </nav>
          )}
          
          {/* 管理员添加文章 */}
          {isAdmin && (
            <div className="mt-10">
              {!showAddArticle ? (
                <button 
                  onClick={() => setShowAddArticle(true)}
                  className="group inline-flex items-center gap-3 text-sm font-medium text-white border-2 border-dashed border-white/35 rounded-xl px-6 py-4 hover:border-white/60 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none transition-all duration-200"
                >
                  <span className="text-lg font-light transition-transform duration-300 group-hover:rotate-90">+</span>
                  <span>添加新文章</span>
                </button>
              ) : (
                <form onSubmit={handleAddArticle} className="rounded-xl p-8 space-y-5 bg-white/5 border border-white/15">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="编号 (如 07)" 
                      value={newArticle.num} 
                      onChange={e => setNewArticle({...newArticle, num: e.target.value})}
                      className="text-sm bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors"
                      required
                    />
                    <input 
                      placeholder="标签 (如 Philosophy)" 
                      value={newArticle.tag} 
                      onChange={e => setNewArticle({...newArticle, tag: e.target.value})}
                      className="text-sm bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors"
                      required
                    />
                  </div>
                  <input 
                    placeholder="英文标题" 
                    value={newArticle.en_title} 
                    onChange={e => setNewArticle({...newArticle, en_title: e.target.value})}
                    className="w-full text-sm bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors"
                    required
                  />
                  <input 
                    placeholder="中文标题" 
                    value={newArticle.zh_title} 
                    onChange={e => setNewArticle({...newArticle, zh_title: e.target.value})}
                    className="w-full text-sm bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors"
                    required
                  />
                  <textarea 
                    placeholder="描述" 
                    value={newArticle.description} 
                    onChange={e => setNewArticle({...newArticle, description: e.target.value})}
                    className="w-full text-sm bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 resize-none h-24 transition-colors"
                    required
                  />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="text-sm font-medium bg-white text-slate-900 px-6 py-2.5 rounded-lg hover:bg-white/95 transition-colors">
                      添加 (自动更新 Changelog)
                    </button>
                    <button type="button" onClick={() => setShowAddArticle(false)} className="text-sm text-white/60 hover:text-white px-4 py-2.5">
                      取消
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* 【右侧装饰栏】 */}
        <aside className="hidden xl:flex w-[10%] flex-col items-center border-l border-white/10 min-h-[400px] py-8">
          <div className="sticky top-24 flex flex-col items-center gap-10">
            <span className="text-[10px] font-mono text-white/40 uppercase [writing-mode:vertical-lr] tracking-[0.4em] rotate-180">
              Scroll to explore
            </span>
            <div className="w-px h-24 bg-gradient-to-b from-white/30 to-transparent" />
            <div className="flex flex-col gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
          </div>
        </aside>

        </div>
      </div>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(15, 23, 42, 0.85) !important; border-bottom-color: rgba(148, 163, 184, 0.2) !important; }
        aside.fixed { background: rgba(15, 23, 42, 0.85) !important; border-right-color: rgba(148, 163, 184, 0.2) !important; }
        aside.fixed .group\\/item:hover { background: rgba(148, 163, 184, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(148, 163, 184) !important; }
      `}} />
    </div>
  );
}

{/* 辅助组件：更新日志条目（时间线节点 + 管理员可删） */}
function ChangelogItem({ date, content, zh, isAdmin, onDelete, isFirst }: { date: string; content: string; zh: string; isAdmin?: boolean; onDelete?: () => void; isFirst?: boolean }) {
  return (
    <li className="relative pl-5 group">
      <div className={`absolute left-0 top-2.5 -translate-x-1/2 rounded-full bg-white/80 group-hover:bg-white group-hover:scale-125 transition-all ${isFirst ? 'w-2.5 h-2.5' : 'w-2 h-2'}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {date && <div className="text-xs font-mono text-white/80 mb-1.5 tracking-tight">{date}</div>}
          <p className="text-sm text-white font-medium leading-relaxed mb-1">{content}</p>
          <p className="text-[13px] text-white/90 font-light leading-relaxed">{zh}</p>
        </div>
        {isAdmin && onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="shrink-0 p-1.5 rounded text-white/60 hover:text-red-300 hover:bg-white/10 transition-colors"
            title="删除此条"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
    </li>
  );
}

{/* 辅助组件：文章卡片 - 深色面板内统一风格、悬停高亮 */}
function ArticleCard({ id, num, tag, enTitle, zhTitle, desc, isAdmin, onDelete }: { 
  id?: string, num: string, tag: string, enTitle: string, zhTitle: string, desc: string, isAdmin?: boolean, onDelete?: () => void 
}) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onDelete) onDelete()
  }
  
  return (
    <Link href={id ? `/detail/main/${id}` : '#'} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 rounded-xl">
      <article className="group cursor-pointer relative p-5 sm:p-6 rounded-xl border border-white/15 bg-white/[0.02] hover:border-white/35 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/10 transition-all duration-300 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/0 group-hover:bg-emerald-400/60 transition-all duration-300 rounded-l-xl" aria-hidden />
        {isAdmin && onDelete && (
          <button 
            onClick={handleDeleteClick}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-red-300 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            title="删除文章"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono text-white/70 uppercase tracking-[0.2em]">{num} / {tag}</span>
          <div className="h-px flex-1 bg-white/20 group-hover:bg-white/40 transition-colors duration-300" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
          {enTitle}
        </h3>
        <p className="text-base font-medium text-white/95 mb-2 leading-relaxed">{zhTitle}</p>
        <p className="text-white/80 text-sm leading-relaxed line-clamp-2 font-light">{desc}</p>
      </article>
    </Link>
  );
}