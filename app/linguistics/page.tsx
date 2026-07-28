'use client'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function LinguisticsPage() {
  const [init, setInit] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const tabs = [
    { name: 'Overview', label: 'INDEX' },
    { name: 'Sanskrit', label: 'संस्कृतम्' },
    { name: 'French', label: 'FRANÇAIS' },
    { name: 'Russian', label: 'РУССКИЙ' },
    { name: 'Japanese', label: '日本語' },
    { name: 'German', label: 'DEUTSCH' },
  ];

  return (
    <div className="relative min-h-screen bg-[#020408] text-slate-300 overflow-y-auto overflow-x-hidden selection:bg-slate-800">
      
      {/* 1. 背景点阵：替代碍眼的实线网格，透明度极低，保留质感 */}
      <div className="fixed inset-0 z-[0] pointer-events-none opacity-[0.08]" 
           style={{ 
             backgroundImage: `radial-gradient(#475569 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }} />

      {/* 2. 背景粒子：磁力感应模式 */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-[1] pointer-events-none"
          options={{
            fullScreen: { enable: false },
            particles: {
              color: { value: "#1e293b" },
              links: { color: "#1e293b", distance: 150, enable: true, opacity: 0.1 },
              move: { enable: true, speed: 0.3 },
              number: { value: 40 },
              size: { value: 1.5 },
            },
            interactivity: {
              events: { onHover: { enable: true, mode: "grab" } },
              modes: { grab: { distance: 200, links: { opacity: 0.2 } } },
            },
          } as any}
        />
      )}

      {/* --- 主内容层 --- */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-10 py-24 flex flex-col gap-12">
        
        {/* Header */}
        <header className="flex justify-between items-end border-b border-slate-900 pb-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tight text-white italic">
              LINGUA<span className="text-slate-800 font-light not-italic ml-2">.archive</span>
            </h1>
            <p className="font-mono text-[10px] text-slate-500 tracking-[0.5em] uppercase">
              Semantic_Classification_System
            </p>
          </div>
          <div className="hidden md:block text-right font-mono text-[9px] text-slate-700 uppercase leading-loose tracking-tighter">
            [ ENCRYPTED_LINK: ACTIVE ]<br />
            [ STABILITY: 0.9998 ]
          </div>
        </header>

     {/* 导航栏：仅保留文字位移，删除冗余动效 */}
<nav className="flex flex-wrap gap-4 border-b border-slate-900 pb-4">
  {tabs.map((tab) => {
    const isActive = activeTab === tab.name;
    return (
      <motion.button
        key={tab.name}
        onClick={() => setActiveTab(tab.name)}
        // 纯粹的位移：向上 4px，向左 2px
        whileHover={{ y: -4, x: -2 }}
        transition={{ type: "tween", duration: 0.2 }} // 使用平滑的线性过渡，拒绝乱抖
        className={`px-6 py-2 font-black text-[15px] tracking-[0.2em] relative z-20 ${
          isActive ? 'text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        {/* 文字内容：没有任何额外的 span 或滤镜 */}
        {tab.label}

        {/* 只有选中时才存在的静态横线 */}
        {isActive && (
          <motion.div 
            layoutId="activeTabGlow" 
            className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-slate-400" 
          />
        )}
      </motion.button>
    );
  })}
</nav>
        {/* 动态内容切换 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            {activeTab === 'Overview' ? <OverviewContent /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getDataByTab(activeTab).map((item: any, i: number) => (
                  <LangCard key={i} {...item} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(2, 4, 8, 0.85) !important; border-bottom-color: rgba(71, 85, 105, 0.2) !important; }
        aside.fixed { background: rgba(2, 4, 8, 0.85) !important; border-right-color: rgba(71, 85, 105, 0.2) !important; }
        aside.fixed .group\\/item:hover { background: rgba(71, 85, 105, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(71, 85, 105) !important; }
      `}} />
    </div>
  );
}

// --- INDEX / OVERVIEW 模块 (提亮字体) ---

function OverviewContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 border border-slate-800 bg-slate-900/10 p-10 relative h-[450px] flex items-center justify-center">
        <h3 className="absolute top-8 left-8 font-mono text-xs text-slate-400 tracking-widest uppercase italic border-l-2 border-slate-600 pl-4">
          SEMANTIC_DISTANCE_MAPPING
        </h3>
        
        {/* 静态坐标系 */}
        <div className="absolute inset-20 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-slate-800" />
          <div className="h-full w-[1px] bg-slate-800 absolute" />
          
          {[
            {x: '25%', y: '30%', label: 'Indo-European'},
            {x: '70%', y: '20%', label: 'Sino-Tibetan'},
            {x: '45%', y: '75%', label: 'Afro-Asiatic'},
            {x: '80%', y: '60%', label: 'Austronesian'},
          ].map((dot, i) => (
            <div key={i} className="absolute flex flex-col items-center" style={{ left: dot.x, top: dot.y }}>
              <div className="w-2 h-2 bg-slate-400 rounded-full" />
              <span className="mt-3 font-mono text-[10px] text-slate-300 uppercase tracking-tighter bg-black/40 px-1">
                {dot.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <StatSmall label="Kernel_Nodes" value="4.01" unit="THz" />
        <StatSmall label="Sync_Stability" value="0.998" unit="RATIO" />
        <div className="p-8 border border-slate-800 bg-slate-900/20 font-mono">
           <p className="text-xs text-slate-400 mb-6 uppercase italic font-bold">System_Logs</p>
           <div className="space-y-4 text-[10px] text-slate-400">
              <p className="flex gap-2"><span className="text-slate-700">›</span> <span className="text-slate-200">LOADED_DATA_SUCCESS</span></p>
              <p className="flex gap-2"><span className="text-slate-700">›</span> ANALYZED_3959_RULES</p>
              <p className="flex gap-2 animate-pulse"><span className="text-slate-700">›</span> LISTENING_FOR_INPUT</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatSmall({ label, value, unit }: any) {
  return (
    <div className="p-8 border border-slate-800 bg-slate-900/30">
       <p className="font-mono text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-bold">{label}</p>
       <p className="text-5xl font-black text-slate-100 font-mono tracking-tighter italic">
         {value}<span className="text-xs ml-3 text-slate-600 not-italic">{unit}</span>
       </p>
    </div>
  );
}

// --- 物理感卡片模块 (带有倾斜反馈) ---

function LangCard({ title, sub, glyph, desc }: any) {
  const rotateX = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    rotateX.set((event.clientY - (rect.top + rect.height / 2)) / -25);
    rotateY.set((event.clientX - (rect.left + rect.width / 2)) / 25);
  }

  return (
    <motion.div 
      onMouseMove={handleMouse}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="p-10 border border-slate-900 bg-[#05070a]/60 relative group min-h-[460px] flex flex-col justify-between overflow-hidden transition-colors duration-500 hover:border-slate-800"
    >
      {/* 背景大字：提高不透明度、浅色，与背景区分明显 */}
      <div className="absolute -top-12 -right-12 text-[16rem] font-serif text-slate-500/[0.32] select-none pointer-events-none group-hover:text-slate-400/[0.45] transition-all duration-1000 mix-blend-lighten" 
           style={{ transform: "translateZ(-40px)" }}>
        {glyph}
      </div>
      
      <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
        <h3 className="font-mono text-[9px] text-slate-700 mb-10 tracking-[0.4em]">DECODING_0{Math.floor(Math.random()*9)}</h3>
        <p className="text-5xl font-black text-white mb-2 tracking-tighter italic drop-shadow-lg">{title}</p>
        <p className="text-[10px] font-mono text-slate-500 tracking-[0.3em] uppercase italic font-bold">{sub}</p>
      </div>

      <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
        <p className="text-sm text-slate-500 leading-relaxed font-light italic group-hover:text-slate-300 transition-colors duration-500">
          {desc}
        </p>
        <div className="mt-8 h-[1px] w-8 bg-slate-800 group-hover:w-full transition-all duration-1000" />
      </div>
    </motion.div>
  );
}

// --- 数据中心 ---

function getDataByTab(tab: string) {
  const data: any = {
    'Sanskrit': [
      { title: "संस्कृतम्", sub: "Morphology", glyph: "अ", desc: "语法的完美对称性。波你尼的法则是人类文明史上第一个逻辑完备的元语言系统。" },
      { title: "ऋग्वेद", sub: "Phonetics", glyph: "ॐ", desc: "声震即存在。每一个音节的频率都对应着宇宙逻辑的一种特定采样。" },
      { title: "सिद्धम्", sub: "Graphemics", glyph: "𑖀", desc: "悉昙文字的几何构造。字符不仅仅是音素，更是具有高度对称性的符号学图像。" }
    ],
    'French': [
      { title: "FRANÇAIS", sub: "Semiotics", glyph: "É", desc: "能指与所指的裂变。法语修辞学揭示了符号之间微妙的张力与美学。" },
      { title: "LOGIQUE", sub: "Analysis", glyph: "¶", desc: "思辨的厚度。法语不仅仅是交流工具，更是对思维深度进行精密测量的标尺。" },
      { title: "DÉSIR", sub: "Lacan", glyph: "L", desc: "在能指的序列中，人类通过语言不断缝合潜意识的褶皱与缺失。" }
    ],
    'Russian': [
      { title: "РУССКИЙ", sub: "Dialectic", glyph: "Я", desc: "西里尔字母下的沉重美学。词法的无限自由与情感深度的剧烈共振。" },
      { title: "ПАДЕЖ", sub: "Inflexion", glyph: "∑", desc: "变格的力量。六个格位的排列组合，定义了斯拉夫式宏大叙事的逻辑骨架。" },
      { title: "СЛОВО", sub: "Bakhtin", glyph: "Ж", desc: "众声喧哗的对话性。语言的真相始终存在于两个主体之间的永恒交流。" }
    ],
    'Japanese': [
      { title: "日本語", sub: "Aesthetics", glyph: "の", desc: "物哀与余白。日文的精髓不在于‘说出了什么’，而在于‘省略了什么’。" },
      { title: "敬語", sub: "Keigo", glyph: "礼", desc: "社会坐标系。语言根据交互主体的相对位面，实时调整其语法的形态高度。" },
      { title: "間", sub: "The Interval", glyph: "空", desc: "‘Ma’空间美学。在符号的断裂处，感知那些无法被编码、无法被言说的波动。" }
    ],
    'German': [
      { title: "DEUTSCH", sub: "Philosophy", glyph: "Ö", desc: "维特根斯坦式的界限。德语语法结构确保了理性的绝对稳定与深邃。" },
      { title: "SYNTAX", sub: "Structure", glyph: "ß", desc: "复合词之美。通过逻辑拼接，捕捉人类意识中最庞大且精微的哲学抽象。" },
      { title: "GEIST", sub: "Ontology", glyph: "H", desc: "黑格尔式的螺旋。德语是承载形而上学思辨最坚固、最精密的物理容器。" }
    ]
  };
  return data[tab] || [];
}