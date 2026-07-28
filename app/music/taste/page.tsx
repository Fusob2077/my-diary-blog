'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { addMusicAction } from '@/app/lib/actions'
import { motion, AnimatePresence } from 'framer-motion'

const supabase = createClient()

interface MusicItem {
  id?: number
  created_at?: string
  title: string
  artist: string
  link: string
  tag: string
}

// 标签颜色映射 - 地下音乐场景风格
const TAG_COLORS: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
  'Post-Rock': { bg: 'bg-[#8b5cf6]/20', border: 'border-[#a78bfa]/50', text: 'text-[#c4b5fd]', hoverBg: 'group-hover:bg-[#8b5cf6]' },
  'Classical': { bg: 'bg-[#ec4899]/20', border: 'border-[#f472b6]/50', text: 'text-[#f9a8d4]', hoverBg: 'group-hover:bg-[#ec4899]' },
  'Electronic': { bg: 'bg-[#06b6d4]/20', border: 'border-[#22d3ee]/50', text: 'text-[#67e8f9]', hoverBg: 'group-hover:bg-[#06b6d4]' },
  '粤语经典': { bg: 'bg-[#f59e0b]/20', border: 'border-[#fbbf24]/50', text: 'text-[#fcd34d]', hoverBg: 'group-hover:bg-[#f59e0b]' },
  'default': { bg: 'bg-[#6366f1]/20', border: 'border-[#818cf8]/50', text: 'text-[#a5b4fc]', hoverBg: 'group-hover:bg-[#6366f1]' }
}

// 黑胶唱片旋转动画
function VinylRecord({ isPlaying = false }: { isPlaying?: boolean }) {
  return (
    <div className="relative w-16 h-16">
      <motion.div
        className="w-full h-full rounded-full border-4 border-[#6366f1]/30"
        animate={isPlaying ? { rotate: 360 } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          background: 'radial-gradient(circle, #1e1b4b 0%, #312e81 30%, #1e1b4b 100%)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-[#6366f1]/50"></div>
        </div>
        {/* 唱片纹理 */}
        <div className="absolute inset-0 rounded-full" style={{
          backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg, rgba(99, 102, 241, 0.1) 2deg, transparent 4deg)`
        }}></div>
      </motion.div>
    </div>
  )
}

export default function MusicTastePage() {
  const [musicDatabase, setMusicDatabase] = useState<MusicItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  
  const [newTrack, setNewTrack] = useState<MusicItem>({
    title: '', artist: '', link: '', tag: ''
  })

  const fetchMusic = async () => {
    const { data, error } = await supabase
      .from('music_taste')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMusicDatabase(data)
    setIsLoading(false)
  }

  useEffect(() => { fetchMusic() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addMusicAction(newTrack)
    if (result.success) {
      setNewTrack({ title: '', artist: '', link: '', tag: '' })
      setIsAdding(false)
      fetchMusic()
    } else {
      if (result.error?.includes('Unauthorized')) {
        alert('游客模式：无法添加数据，请登录后操作')
      } else {
        alert('UPLOAD_FAILED')
      }
    }
  }

  // 获取所有标签
  const allTags = Array.from(new Set(musicDatabase.map(item => item.tag || 'MISC')))
  const filteredMusic = selectedTag 
    ? musicDatabase.filter(item => (item.tag || 'MISC') === selectedTag)
    : musicDatabase

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono space-y-6">
      <VinylRecord isPlaying={true} />
      <div className="text-[#6366f1]/50 text-[10px] tracking-[0.5em] animate-pulse uppercase">LOADING_PLAYLIST...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] p-6 md:p-12 font-sans antialiased relative overflow-hidden">
      {/* 地下音乐场景背景 - 涂鸦/海报风格 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.08]" style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E"),
          radial-gradient(circle at 15% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 85% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
          linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)
        `
      }} />

      {/* 涂鸦装饰文字 */}
      <div className="fixed top-24 right-12 pointer-events-none z-5 opacity-10">
        <div className="text-[#6366f1] text-xs font-black transform rotate-12" style={{ fontFamily: '"Impact\", sans-serif' }}>
          UNDERGROUND
        </div>
      </div>
      <div className="fixed bottom-24 left-12 pointer-events-none z-5 opacity-10">
        <div className="text-[#8b5cf6] text-xs font-black transform -rotate-12" style={{ fontFamily: '"Impact\", sans-serif' }}>
          INDIE SCENE
        </div>
      </div>
      
      <header className="max-w-[1400px] mx-auto mb-20 border-b-2 border-[#6366f1]/30 pb-8 flex justify-between items-end relative z-10 pt-8">
        <div className="space-y-4">
          <div className="flex items-baseline gap-4">
            <h1 className="text-6xl md:text-8xl font-black text-[#6366f1] italic" style={{ 
              fontFamily: '"Impact\", \"Arial Black\", sans-serif',
              textShadow: '3px 3px 0px rgba(139, 92, 246, 0.3)',
              letterSpacing: '-0.02em',
              transform: 'rotate(-1deg)'
            }}>
              TASTE
            </h1>
            <span className="text-sm text-[#8b5cf6]/60 font-mono uppercase tracking-widest transform rotate-12">
              [ARCHIVE]
            </span>
          </div>
          <p className="text-lg text-[#a5b4fc]/70 italic font-serif leading-relaxed max-w-2xl">
            "音乐是时间的容器，品味是时间的证明"
          </p>
          <div className="flex items-center gap-6 text-xs font-mono text-[#6366f1]/60 mt-4">
            <span className="flex items-center gap-2">
              <VinylRecord isPlaying={true} />
              <span>Collection: <span className="text-[#a5b4fc] font-bold">{musicDatabase.length}</span></span>
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-[10px] px-6 py-3 border-2 bg-[#1a1a1a] border-[#6366f1]/40 text-[#a5b4fc] hover:bg-[#6366f1]/20 hover:border-[#8b5cf6] transition-all duration-300 uppercase tracking-widest font-bold rounded"
        >
          {isAdding ? '[ CLOSE ]' : '[ + ADD ]'}
        </button>
      </header>

      {/* 标签过滤 - 地下音乐场景风格 */}
      {allTags.length > 0 && (
        <div className="max-w-[1400px] mx-auto mb-12 flex flex-wrap gap-3 relative z-10">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-[9px] px-5 py-2 border-2 uppercase tracking-widest transition-all font-bold rounded ${
              selectedTag === null
                ? 'bg-[#6366f1]/20 border-[#8b5cf6] text-[#c4b5fd]'
                : 'bg-[#1a1a1a] border-[#6366f1]/30 text-[#818cf8]/60 hover:border-[#8b5cf6] hover:text-[#a5b4fc]'
            }`}
          >
            ALL
          </button>
          {allTags.map(tag => {
            const colors = TAG_COLORS[tag] || TAG_COLORS['default']
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[9px] px-5 py-2 border-2 uppercase tracking-widest transition-all font-bold rounded ${
                  selectedTag === tag
                    ? `${colors.bg} ${colors.border} ${colors.text}`
                    : `bg-[#1a1a1a] ${colors.border.replace('/50', '/30')} ${colors.text.replace('text-', 'text-').replace('300', '400/60')} hover:${colors.border}`
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-[1400px] mx-auto mb-20 relative z-10"
          >
            <div className="p-10 border-2 border-[#6366f1]/30 bg-[#1a1a1a] rounded-lg" style={{ boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1)' }}>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="text-[10px] font-mono text-[#818cf8]/60 uppercase tracking-[0.3em] mb-4">NEW_ENTRY_FORM</div>
                <div className="grid grid-cols-2 gap-8">
                  <input 
                    placeholder="TRACK_TITLE" 
                    className="bg-[#0a0a0a] border-b-2 border-[#6366f1]/20 p-3 text-sm text-[#e0e0e0] focus:border-[#8b5cf6] outline-none transition-all placeholder:text-[#6366f1]/40 rounded-t"
                    value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})}
                    required
                  />
                  <input 
                    placeholder="ARTIST" 
                    className="bg-[#0a0a0a] border-b-2 border-[#6366f1]/20 p-3 text-sm text-[#e0e0e0] focus:border-[#8b5cf6] outline-none transition-all placeholder:text-[#6366f1]/40 rounded-t"
                    value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})}
                    required
                  />
                </div>
                <input 
                  placeholder="STREAM_LINK_URL" 
                  className="w-full bg-[#0a0a0a] border-b-2 border-[#6366f1]/20 p-3 text-sm text-[#e0e0e0] focus:border-[#8b5cf6] outline-none transition-all placeholder:text-[#6366f1]/40 rounded-t"
                  value={newTrack.link} onChange={e => setNewTrack({...newTrack, link: e.target.value})}
                  required
                />
                <div className="flex gap-8 items-center pt-4 border-t border-[#6366f1]/20">
                  <input 
                    placeholder="CATEGORY_TAG (e.g. Post-Rock)" 
                    className="flex-1 bg-[#0a0a0a] border-b-2 border-[#6366f1]/20 p-3 text-sm text-[#e0e0e0] focus:border-[#8b5cf6] outline-none transition-all placeholder:text-[#6366f1]/40 rounded-t"
                    value={newTrack.tag} onChange={e => setNewTrack({...newTrack, tag: e.target.value})}
                  />
                  <button type="submit" className="bg-[#6366f1]/20 border-2 border-[#8b5cf6] text-[#c4b5fd] text-[10px] px-8 py-3 font-bold hover:bg-[#6366f1] hover:text-white transition-all uppercase tracking-widest rounded">
                    COMMIT
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <main className="max-w-[1400px] mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTag || 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16"
          >
            {filteredMusic.map((item, index) => {
              const colors = TAG_COLORS[item.tag] || TAG_COLORS['default']
              return (
                <motion.a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block relative border-t-2 border-[#6366f1]/20 pt-8 hover:border-[#8b5cf6]/50 transition-all duration-500 bg-[#1a1a1a] rounded-lg p-6 hover:bg-[#1f1f1f]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredItem(item.id ?? null)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ boxShadow: '0 4px 20px rgba(99, 102, 241, 0.05)' }}
                >
                  {/* 手写编号 */}
                  <div className="absolute -top-2 left-4 text-3xl font-black text-[#6366f1]/20 italic" style={{ fontFamily: '"Georgia\", serif' }}>
                    №{String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="flex flex-col space-y-6 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className={`text-[11px] font-black border-2 ${colors.border} ${colors.bg} ${colors.text} px-4 py-2 tracking-[0.2em] ${colors.hoverBg} group-hover:text-black transition-all duration-300 rounded`}>
                        {item.tag || 'MISC'}
                      </span>
                      <span className="text-[9px] text-[#6366f1]/40 font-bold tracking-tighter uppercase italic">
                        {new Date(item.created_at || '').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-[16px] font-bold text-[#e0e0e0] leading-tight group-hover:text-[#c4b5fd] transition-colors italic" style={{ fontFamily: '"Georgia\", serif' }}>
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-[#818cf8]/70 uppercase tracking-[0.2em] font-light">
                        {item.artist}
                      </p>
                    </div>

                    {/* 黑胶唱片装饰 */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#6366f1]/20">
                      <VinylRecord isPlaying={hoveredItem === item.id} />
                      <span className="text-[9px] text-[#6366f1]/40 group-hover:text-[#8b5cf6] transition-colors uppercase tracking-widest">
                        Play →
                      </span>
                    </div>
                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {filteredMusic.length === 0 && (
          <div className="text-center py-40 border-2 border-dashed border-[#6366f1]/20 rounded-lg relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="text-[100px] font-black text-[#6366f1]/20">♪</div>
            </div>
            <p className="text-[10px] tracking-[0.8em] uppercase text-[#6366f1]/50 relative z-10">No_Tracks_Found</p>
          </div>
        )}
      </main>

      <footer className="max-w-[1400px] mx-auto mt-40 pt-10 border-t-2 border-[#6366f1]/20 flex justify-between items-center text-[9px] text-[#6366f1]/50 uppercase tracking-[0.3em] relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-[#6366f1]/30 animate-pulse" />
          <span>System_Active</span>
        </div>
        <div>Indexed: {musicDatabase.length} tracks</div>
      </footer>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(10, 10, 10, 0.95) !important; border-bottom-color: rgba(99, 102, 241, 0.3) !important; }
        aside.fixed { background: rgba(10, 10, 10, 0.95) !important; border-right-color: rgba(99, 102, 241, 0.3) !important; }
        aside.fixed .group\\/item:hover { background: rgba(99, 102, 241, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(99, 102, 241) !important; }
      `}} />
    </div>
  )
}
