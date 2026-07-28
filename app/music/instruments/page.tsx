'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// 数据库预留结构
const myInstruments = [
  { id: 1, name: "电吉他", icon: "🎸", status: "Learning", progress: 65, lastPractice: "2026-01-07", totalHours: 120, color: "blue" },
  { id: 2, name: "二胡", icon: "🎻", status: "Intermediate", progress: 40, lastPractice: "2026-01-05", totalHours: 350, color: "red" },
  { id: 3, name: "爱尔兰哨笛", icon: "🎵", status: "Learning", progress: 85, lastPractice: "2026-01-08", totalHours: 45, color: "emerald" },
  { id: 4, name: "古筝", icon: "🪕", status: "Basic", progress: 20, lastPractice: "2025-12-20", totalHours: 15, color: "amber" }
]

// 复古磁带风格的声波可视化
function TapeWave({ color = "purple" }: { color?: string }) {
  const colors = {
    blue: "#a78bfa",
    red: "#f87171",
    emerald: "#34d399",
    amber: "#fbbf24",
    purple: "#c084fc"
  }
  
  return (
    <div className="flex items-end gap-[2px] h-16 opacity-40">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: colors[color as keyof typeof colors] || colors.purple }}
          animate={{
            height: [`${15 + Math.random() * 25}%`, `${45 + Math.random() * 35}%`, `${15 + Math.random() * 25}%`]
          }}
          transition={{
            duration: 0.9 + Math.random() * 0.5,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export default function InstrumentsPage() {
  const totalHours = myInstruments.reduce((sum, ins) => sum + ins.totalHours, 0)
  const avgProgress = Math.round(myInstruments.reduce((sum, ins) => sum + ins.progress, 0) / myInstruments.length)

  return (
    <div className="min-h-screen bg-[#1a0f1a] text-[#e0b0ff] p-6 md:p-12 overflow-hidden relative" style={{ fontFamily: '"Georgia\", \"Times New Roman\", serif' }}>
      {/* 复古磁带纹理背景 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.15]" style={{
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(224, 176, 255, 0.05) 20px, rgba(224, 176, 255, 0.05) 21px),
          repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(192, 132, 252, 0.05) 20px, rgba(192, 132, 252, 0.05) 21px),
          radial-gradient(circle at 20% 30%, rgba(167, 139, 250, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(192, 132, 252, 0.1) 0%, transparent 50%)
        `
      }} />

      {/* 磁带孔装饰 */}
      <div className="fixed top-20 left-8 w-12 h-8 border-2 border-[#e0b0ff]/20 rounded-full pointer-events-none opacity-30"></div>
      <div className="fixed top-20 right-8 w-12 h-8 border-2 border-[#e0b0ff]/20 rounded-full pointer-events-none opacity-30"></div>
      <div className="fixed bottom-20 left-8 w-12 h-8 border-2 border-[#e0b0ff]/20 rounded-full pointer-events-none opacity-30"></div>
      <div className="fixed bottom-20 right-8 w-12 h-8 border-2 border-[#e0b0ff]/20 rounded-full pointer-events-none opacity-30"></div>

      <header className="max-w-6xl mx-auto mb-20 relative z-10 pt-8">
        <div className="border-l-4 border-[#c084fc] pl-8 mb-6">
          <div className="flex items-baseline gap-4 mb-3">
            <h1 className="text-6xl md:text-8xl font-black text-[#e0b0ff] italic" style={{ 
              textShadow: '4px 4px 0px rgba(192, 132, 252, 0.3), -2px -2px 0px rgba(167, 139, 250, 0.2)',
              letterSpacing: '-0.02em',
              transform: 'rotate(-1deg)'
            }}>
              INSTRUMENTS
            </h1>
            <span className="text-sm text-[#c084fc]/60 font-mono uppercase tracking-widest transform rotate-12">
              [RECORDING]
            </span>
          </div>
          <p className="text-lg text-[#e0b0ff]/70 italic font-serif leading-relaxed max-w-2xl mb-4">
            "音乐是时间的艺术，乐器是时间的容器"
          </p>
          <div className="flex items-center gap-6 text-xs font-mono text-[#c084fc]/60 mt-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e0b0ff] rounded-full animate-pulse"></span>
              <span>Total_Hours: <span className="text-[#e0b0ff] font-bold">{totalHours}h</span></span>
            </span>
            <span>|</span>
            <span>Avg_Progress: <span className="text-[#e0b0ff] font-bold">{avgProgress}%</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        {myInstruments.map((ins, index) => (
          <motion.article
            key={ins.id}
            className="group relative bg-[#251a25] border-2 border-[#c084fc]/30 p-8 hover:border-[#e0b0ff]/50 transition-all duration-500 rounded-lg"
            style={{
              boxShadow: '0 8px 32px rgba(192, 132, 252, 0.1), inset 0 1px 0 rgba(224, 176, 255, 0.1)',
              transform: index % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {/* 手写编号装饰 */}
            <div className="absolute -top-2 -left-2 text-4xl font-black text-[#c084fc]/20 italic" style={{ fontFamily: '"Georgia\", serif' }}>
              №{index + 1}
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{ins.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-[#e0b0ff] mb-1 italic" style={{ fontFamily: '"Georgia\", serif' }}>
                    {ins.name}
                  </h3>
                  <p className="text-[10px] font-mono opacity-60 uppercase tracking-wider border border-[#c084fc]/20 px-2 py-0.5 inline-block rounded">
                    Last_Session: {ins.lastPractice}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono border-2 border-[#c084fc]/30 bg-[#1a0f1a] px-3 py-2 rounded">
                <div className="text-[9px] opacity-50 uppercase mb-1">Total_Time</div>
                <div className="text-2xl text-[#e0b0ff] font-black">{ins.totalHours}h</div>
              </div>
            </div>

            {/* 磁带风格声波可视化 */}
            <div className="mb-6 bg-[#1a0f1a] p-4 rounded border border-[#c084fc]/20">
              <TapeWave color={ins.color} />
            </div>

            {/* 复古进度条系统 */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-[#c084fc]/70">
                <span>Mastery_Progress</span>
                <span className="text-[#e0b0ff] font-bold">{ins.progress}%</span>
              </div>
              <div className="h-3 w-full bg-[#1a0f1a] border-2 border-[#c084fc]/30 rounded-full overflow-hidden relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#c084fc] via-[#e0b0ff] to-[#c084fc] relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${ins.progress}%` }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                </motion.div>
                {/* 进度条上的小标记 */}
                {[25, 50, 75].map(mark => (
                  <div 
                    key={mark}
                    className="absolute top-0 bottom-0 w-[1px] bg-[#c084fc]/20"
                    style={{ left: `${mark}%` }}
                  ></div>
                ))}
              </div>
            </div>

            <button className="mt-8 text-[9px] font-mono text-[#c084fc]/60 hover:text-[#e0b0ff] border-2 border-[#c084fc]/20 hover:border-[#e0b0ff]/40 px-5 py-2 transition-all uppercase tracking-widest rounded bg-[#1a0f1a] hover:bg-[#251a25]">
              Add_Practice_Log +
            </button>

            {/* 悬停时的光晕效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c084fc]/0 via-[#e0b0ff]/0 to-[#c084fc]/0 group-hover:from-[#c084fc]/5 group-hover:via-[#e0b0ff]/5 group-hover:to-[#c084fc]/5 transition-all duration-500 rounded-lg pointer-events-none"></div>
          </motion.article>
        ))}
      </main>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(26, 15, 26, 0.95) !important; border-bottom-color: rgba(192, 132, 252, 0.3) !important; }
        aside.fixed { background: rgba(26, 15, 26, 0.95) !important; border-right-color: rgba(192, 132, 252, 0.3) !important; }
        aside.fixed .group\\/item:hover { background: rgba(192, 132, 252, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(224, 176, 255) !important; }
      `}} />
    </div>
  )
}
