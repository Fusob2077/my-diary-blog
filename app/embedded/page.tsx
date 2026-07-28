'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { addEmbeddedCategoryAction, deleteEmbeddedCategoryAction, addEmbeddedSkillAction, deleteEmbeddedSkillAction } from '@/app/lib/actions';

interface EmbeddedSkill {
  id: string;
  embedded_tree_id: string;
  skill: string;
}

interface EmbeddedCategory {
  id: string;
  category: string;
  icon: string;
  skills: EmbeddedSkill[];
}

export default function EmbeddedTechPage() {
  const [embeddedTree, setEmbeddedTree] = useState<EmbeddedCategory[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ category: '', icon: '◆' });
  const [addingSkillTo, setAddingSkillTo] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const fetchData = async () => {
    const supabase = createClient();
    const { data: categories } = await supabase.from('embedded_tree').select('*').order('sort_order');
    const { data: skills } = await supabase.from('embedded_skills').select('*').order('sort_order');
    
    const treeWithSkills = categories?.map(cat => ({
      ...cat,
      skills: skills?.filter(s => s.embedded_tree_id === cat.id) || []
    })) || [];
    
    setEmbeddedTree(treeWithSkills);
  };

  useEffect(() => {
    fetchData();
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(!!user);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#ffaa00] font-mono p-6 md:p-12 overflow-x-hidden relative" style={{ fontFamily: '"Courier New\", monospace' }}>
      {/* 电路板风格背景 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05]" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255, 170, 0, 0.2) 40px, rgba(255, 170, 0, 0.2) 41px),
          repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255, 170, 0, 0.1) 40px, rgba(255, 170, 0, 0.1) 41px)
        `,
      }} />
      
      {/* 电路轨迹装饰 */}
      <div className="fixed top-20 left-0 right-0 h-px bg-[#ffaa00]/20 pointer-events-none"></div>
      <div className="fixed bottom-20 left-0 right-0 h-px bg-[#ffaa00]/20 pointer-events-none"></div>

      {/* 页头 - 工业风格 */}
      <header className="max-w-7xl mx-auto mb-16 border-b-4 border-[#ffaa00] pb-6 relative">
        <div className="absolute -top-1 left-0 w-12 h-1 bg-[#ffaa00]"></div>
        <div className="absolute -top-1 right-0 w-12 h-1 bg-[#ffaa00]"></div>
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-black text-[#ffaa00] mb-2 uppercase tracking-wider" style={{
            textShadow: '0 0 20px rgba(255, 170, 0, 0.5), 0 0 40px rgba(255, 170, 0, 0.3)',
            fontFamily: '"Courier New\", monospace',
            letterSpacing: '0.1em'
          }}>
            EMBEDDED<span className="text-[#ffaa00]/60">.SYS</span>
          </h1>
          <p className="text-sm text-[#ffaa00]/60 font-mono">
            // 嵌入式系统开发全栈路线 | 软硬结合
          </p>
          <div className="flex items-center gap-4 text-xs text-[#ffaa00]/40 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ffaa00] rounded-full animate-pulse"></span>
              <span>KERNEL: STABLE</span>
            </span>
            <span>|</span>
            <span>UPTIME: 100%</span>
            <span>|</span>
            <span>LAYERS: {embeddedTree.length}</span>
          </div>
        </div>
      </header>

      {/* 技术树网格 - 电路板风格 */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {embeddedTree.map((sector, index) => (
          <section 
            key={index}
            className="bg-[#14120f] border-4 border-[#ffaa00] p-8 group hover:border-[#ffaa00]/80 hover:bg-[#1a1815] transition-all duration-300 relative"
            style={{ 
              boxShadow: '0 0 20px rgba(255, 170, 0, 0.2), inset 0 0 20px rgba(255, 170, 0, 0.05)'
            }}
          >
            {/* 电路板焊点装饰 */}
            <div className="absolute top-2 right-2 w-3 h-3 border-2 border-[#ffaa00]/50 rounded-full bg-[#0a0805]"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-2 border-[#ffaa00]/50 rounded-full bg-[#0a0805]"></div>
            
            {/* 头部 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-[#ffaa00] mb-1 font-mono uppercase tracking-wider group-hover:text-[#ffaa00]/80 transition-colors">
                  {sector.icon} {sector.category}
                </h2>
                <div className="text-xs text-[#ffaa00]/40 font-mono mt-1">
                  LAYER_{String(index + 1).padStart(2, '0')}
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {sector.skills.map((skill, skillIdx) => (
                <li key={skill.id} className="flex items-center gap-3 group/item cursor-default">
                  {/* 电路节点 */}
                  <div className="w-2 h-2 border-2 border-[#ffaa00]/50 rotate-45 bg-[#0a0805] group-hover/item:bg-[#ffaa00] group-hover/item:border-[#ffaa00] transition-all"></div>
                  <span className="flex-1 text-base font-mono text-[#ffaa00]/70 group-hover/item:text-[#ffaa00] group-hover/item:translate-x-2 transition-all duration-300 uppercase tracking-wide">
                    {skill.skill}
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={async () => {
                        const result = await deleteEmbeddedSkillAction(skill.id);
                        if (result.success) fetchData();
                      }}
                      className="text-xs text-red-500/50 hover:text-red-500 opacity-0 group-hover/item:opacity-100 font-mono"
                    >
                      [DEL]
                    </button>
                  )}
                </li>
              ))}
              
              {isAdmin && (
                addingSkillTo === sector.id ? (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (newSkill.trim()) {
                        const result = await addEmbeddedSkillAction({ embedded_tree_id: sector.id, skill: newSkill });
                        if (result.success) {
                          setNewSkill('');
                          setAddingSkillTo(null);
                          fetchData();
                        }
                      }
                    }}
                    className="flex gap-2 mt-4"
                  >
                    <div className="w-2 h-2 border-2 border-[#ffaa00]/50 rotate-45 bg-[#0a0805]"></div>
                    <input 
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      placeholder="新技能..."
                      className="flex-1 bg-[#0a0805] border-b-2 border-[#ffaa00]/30 text-sm text-[#ffaa00] p-1 outline-none focus:border-[#ffaa00] transition-colors font-mono uppercase"
                      autoFocus
                    />
                    <button type="submit" className="text-xs text-[#ffaa00] hover:text-[#ffaa00]/80 font-mono font-bold">[ADD]</button>
                    <button type="button" onClick={() => setAddingSkillTo(null)} className="text-xs text-[#ffaa00]/30 hover:text-[#ffaa00] font-mono">[X]</button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setAddingSkillTo(sector.id)}
                    className="text-xs text-[#ffaa00]/30 hover:text-[#ffaa00] mt-4 font-mono font-bold"
                  >
                    + 添加技能
                  </button>
                )
              )}
            </ul>

            {/* 电路轨迹装饰线 */}
            <div className="mt-6 h-[2px] w-8 bg-[#ffaa00]/30 group-hover:w-full transition-all duration-1000 origin-left"></div>
            
            {isAdmin && (
              <button 
                onClick={async () => {
                  if (confirm(`删除分类 "${sector.category}" 及其所有技能？`)) {
                    const result = await deleteEmbeddedCategoryAction(sector.id);
                    if (result.success) fetchData();
                  }
                }}
                className="absolute top-4 right-4 text-xs text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 font-mono font-bold"
              >
                [DELETE]
              </button>
            )}
          </section>
        ))}
        
        {isAdmin && (
          showAddCategory ? (
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await addEmbeddedCategoryAction(newCategory);
                if (result.success) {
                  setNewCategory({ category: '', icon: '⚡' });
                  setShowAddCategory(false);
                  fetchData();
                }
              }}
              className="bg-[#14120f] border-4 border-[#ffaa00] p-8 space-y-4"
              style={{ boxShadow: '0 0 20px rgba(255, 170, 0, 0.2)' }}
            >
              <div className="text-xs text-[#ffaa00]/40 font-mono mb-2">// 添加新分类</div>
              <input 
                placeholder="分类名称" 
                value={newCategory.category}
                onChange={e => setNewCategory({...newCategory, category: e.target.value})}
                className="w-full bg-[#0a0805] border-b-2 border-[#ffaa00]/30 text-sm text-[#ffaa00] p-2 outline-none focus:border-[#ffaa00] transition-colors font-mono uppercase"
                required
              />
              <input 
                placeholder="图标 (如 ⚡)" 
                value={newCategory.icon}
                onChange={e => setNewCategory({...newCategory, icon: e.target.value})}
                className="w-full bg-[#0a0805] border-b-2 border-[#ffaa00]/30 text-sm text-[#ffaa00] p-2 outline-none focus:border-[#ffaa00] transition-colors font-mono"
              />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-[#ffaa00] text-black px-4 py-2 text-xs font-black hover:bg-[#ffaa00]/80 transition-colors font-mono uppercase">[EXECUTE]</button>
                <button type="button" onClick={() => setShowAddCategory(false)} className="text-xs text-[#ffaa00]/50 hover:text-[#ffaa00] font-mono">[CANCEL]</button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setShowAddCategory(true)}
              className="bg-[#14120f] border-4 border-dashed border-[#ffaa00]/30 p-8 flex items-center justify-center text-xs text-[#ffaa00]/30 hover:text-[#ffaa00] hover:border-[#ffaa00] transition-colors font-mono font-bold uppercase"
              style={{ boxShadow: '0 0 20px rgba(255, 170, 0, 0.1)' }}
            >
              + 添加新分类
            </button>
          )
        )}
      </main>

      {/* 底部信息栏 */}
      <footer className="max-w-7xl mx-auto mt-24 border-t-4 border-[#ffaa00] pt-8 flex justify-between items-center">
        <div className="text-xs font-mono text-[#ffaa00]/40 uppercase">BARE_METAL_PROGRAMMING</div>
        <div className="text-xs font-mono text-[#ffaa00]/40 italic">// 致敬所有在 0 与 1 之间构建世界的工程师</div>
      </footer>
      
      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(10, 8, 5, 0.95) !important; border-bottom-color: rgba(255, 170, 0, 0.5) !important; }
        aside.fixed { background: rgba(10, 8, 5, 0.95) !important; border-right-color: rgba(255, 170, 0, 0.5) !important; }
        aside.fixed .group\\/item:hover { background: rgba(255, 170, 0, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(255, 170, 0) !important; }
      `}} />
    </div>
  );
}