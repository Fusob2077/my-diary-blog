'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

// 乐谱五线谱装饰组件
function StaffLines() {
  return (
    <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className="absolute left-0 right-0 h-px bg-current"
          style={{ top: `${20 + i * 12}%` }}
        />
      ))}
    </div>
  )
}

// 音符装饰
function NoteDecoration({ x, y }: { x: number, y: number }) {
  return (
    <motion.div
      className="absolute text-2xl opacity-20"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ 
        y: [0, -10, 0],
        opacity: [0.2, 0.3, 0.2]
      }}
      transition={{ 
        duration: 2 + Math.random(),
        repeat: Infinity,
        delay: Math.random() * 2
      }}
    >
      ♪
    </motion.div>
  )
}

export default function MusicMainPage() {
  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#1a1625] text-[#e8d5b7] overflow-hidden relative" style={{ fontFamily: '"Times New Roman", serif' }}>
      {/* 乐谱背景 */}
      <StaffLines />
      
      {/* 装饰音符 */}
      <NoteDecoration x={15} y={30} />
      <NoteDecoration x={85} y={50} />
      <NoteDecoration x={25} y={70} />
      <NoteDecoration x={75} y={25} />

      {/* 左半部分：乐器修炼 */}
      <Link 
        href="/music/instruments" 
        className="flex-1 group relative flex items-center justify-center border-r border-[#e8d5b7]/10 overflow-hidden transition-all duration-700 hover:flex-[1.3]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b6f47]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <motion.div 
          className="relative z-10 text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-[12px] font-serif italic text-[#e8d5b7]/60 tracking-widest uppercase mb-4">
            Practice
          </div>
          <h2 className="text-5xl md:text-7xl font-serif italic text-[#e8d5b7] group-hover:text-[#d4c4a8] transition-colors" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            乐器
          </h2>
          <div className="text-[10px] font-serif text-[#e8d5b7]/50 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            二胡 / 电吉他 / 古筝 / 哨笛
          </div>
        </motion.div>

        {/* 装饰性的谱号 */}
        <div className="absolute bottom-8 left-8 text-6xl text-[#e8d5b7]/5 group-hover:text-[#e8d5b7]/10 transition-colors">
          𝄞
        </div>
      </Link>

      {/* 右半部分：音乐分享 */}
      <Link 
        href="/music/taste" 
        className="flex-1 group relative flex items-center justify-center overflow-hidden transition-all duration-700 hover:flex-[1.3]"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-[#6b5b7d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <motion.div 
          className="relative z-10 text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-[12px] font-serif italic text-[#e8d5b7]/60 tracking-widest uppercase mb-4">
            Archive
          </div>
          <h2 className="text-5xl md:text-7xl font-serif italic text-[#e8d5b7] group-hover:text-[#d4c4a8] transition-colors" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            音乐
          </h2>
          <div className="text-[10px] font-serif text-[#e8d5b7]/50 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            Post-Rock / Classical / Electronic
          </div>
        </motion.div>

        {/* 装饰性的谱号 */}
        <div className="absolute bottom-8 right-8 text-6xl text-[#e8d5b7]/5 group-hover:text-[#e8d5b7]/10 transition-colors">
          𝄢
        </div>
      </Link>

      {/* 装饰中心线：乐谱小节线 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block">
        <div className="h-24 w-px bg-[#e8d5b7]/20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full border-l-2 border-r-2 border-[#e8d5b7]/30" />
        </div>
      </div>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(26, 22, 37, 0.95) !important; border-bottom-color: rgba(232, 213, 183, 0.2) !important; }
        aside.fixed { background: rgba(26, 22, 37, 0.95) !important; border-right-color: rgba(232, 213, 183, 0.2) !important; }
        aside.fixed .group\\/item:hover { background: rgba(232, 213, 183, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(232, 213, 183) !important; }
      `}} />
    </div>
  )
}
