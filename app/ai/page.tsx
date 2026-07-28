'use client'
import { useState } from 'react';

const aiRoadmap = [
  {
    field: "AI for Science (脑科学)",
    icon: "🧠",
    projects: ["脑电信号 (EEG) 分类算法", "神经元形态自动分割", "脑功能连接组分析"],
    tech: ["PyTorch", "MNE-Python", "GNNs"]
  },
  {
    field: "深度学习核心 (Core DL)",
    icon: "👁️",
    projects: ["Transformer 架构研究", "扩散模型 (Diffusion)", "强化学习基础"],
    tech: ["TensorFlow", "CUDA", "HuggingFace"]
  },
  {
    field: "数学与理论 (Foundation)",
    icon: "Σ",
    projects: ["线性代数与流形学习", "概率图模型", "信息论基础"],
    tech: ["NumPy", "LaTeX", "SymPy"]
  }
];

export default function AiPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-6 md:p-12 overflow-hidden relative" style={{ fontFamily: '"SF Mono", "Monaco", "Consolas", monospace' }}>
      {/* 实验室风格的网格背景 */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(#58a6ff 1px, transparent 1px),
          linear-gradient(90deg, #58a6ff 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* 装饰性的科学图表线条 */}
      <div className="fixed top-20 right-20 w-64 h-64 opacity-[0.02] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M20,100 Q60,40 100,100 T180,100" stroke="#58a6ff" strokeWidth="2" fill="none" />
          <circle cx="100" cy="100" r="3" fill="#58a6ff" />
        </svg>
      </div>

      <header className="max-w-6xl mx-auto mb-16 relative z-10">
        <div className="border-l-4 border-[#58a6ff] pl-6">
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-[#58a6ff] mb-2">
            AI_LAB
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#8b949e] font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#238636] rounded-full animate-pulse"></span>
              SYSTEM_ACTIVE
            </span>
            <span>|</span>
            <span>RESEARCH_MODE: ON</span>
            <span>|</span>
            <span>v2.1.3</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* 左侧：研究方向导航 - 实验室标签风格 */}
        <nav className="lg:col-span-4 space-y-3">
          {aiRoadmap.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`w-full text-left p-4 border-l-4 transition-all duration-300 font-mono ${
                activeTab === idx 
                ? 'border-[#58a6ff] bg-[#1c2128] text-[#58a6ff]' 
                : 'border-[#30363d] hover:border-[#58a6ff]/50 hover:bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              <div className="text-xs mb-2 opacity-60">[{String(idx + 1).padStart(2, '0')}]</div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <span>{item.icon}</span>
                {item.field}
              </div>
            </button>
          ))}
        </nav>

        {/* 右侧：详细内容 - 实验室报告风格 */}
        <div className="lg:col-span-8 bg-[#161b22] border border-[#30363d] p-8 relative" style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {/* 报告头部 */}
          <div className="border-b border-[#30363d] pb-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8b949e] font-mono uppercase tracking-wider">
                RESEARCH_PROJECT
              </span>
              <span className="text-xs text-[#8b949e] font-mono">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl font-mono font-bold text-[#58a6ff]">
              {aiRoadmap[activeTab].field}
            </h2>
          </div>

          <div className="space-y-8">
            {/* 研究项目列表 */}
            <div>
              <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-[#58a6ff]">▶</span>
                PROJECTS
              </h3>
              <ul className="space-y-3">
                {aiRoadmap[activeTab].projects.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#c9d1d9] font-mono">
                    <span className="text-[#58a6ff] mt-1">•</span>
                    <span className="flex-1 leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 技术栈 - 标签风格 */}
            <div>
              <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-[#58a6ff]">▶</span>
                TECH_STACK
              </h3>
              <div className="flex flex-wrap gap-2">
                {aiRoadmap[activeTab].tech.map((t, i) => (
                  <span 
                    key={i} 
                    className="inline-block px-3 py-1 bg-[#21262d] border border-[#30363d] text-[#58a6ff] text-xs font-mono rounded hover:border-[#58a6ff]/50 transition-colors"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 右下角装饰：实验室编号 */}
          <div className="absolute bottom-4 right-4 text-[8px] font-mono text-[#30363d] text-right">
            LAB_ID: {String(activeTab + 1).padStart(3, '0')}<br />
            STATUS: ACTIVE
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-24 border-t border-[#30363d] pt-8 relative z-10">
        <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono">
          <span>RESEARCH_LOG v2.1.3</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#238636] rounded-full"></span>
            SYSTEM_ONLINE
          </span>
        </div>
      </footer>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(13, 17, 23, 0.95) !important; border-bottom-color: rgba(88, 166, 255, 0.2) !important; }
        aside.fixed { background: rgba(13, 17, 23, 0.95) !important; border-right-color: rgba(88, 166, 255, 0.2) !important; }
        aside.fixed .group\\/item:hover { background: rgba(88, 166, 255, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(88, 166, 255) !important; }
      `}} />
    </div>
  );
}
