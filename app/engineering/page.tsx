'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { addTechCategoryAction, deleteTechCategoryAction, addTechSkillAction, deleteTechSkillAction } from '@/app/lib/actions';

interface TechSkill {
  id: string;
  tech_tree_id: string;
  skill: string;
}

interface TechCategory {
  id: string;
  category: string;
  icon: string;
  skills: TechSkill[];
}

export default function EngineeringPage() {
  const [techTree, setTechTree] = useState<TechCategory[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ category: '', icon: '◇' });
  const [addingSkillTo, setAddingSkillTo] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const fetchData = async () => {
    const supabase = createClient();
    const { data: categories } = await supabase.from('tech_tree').select('*').order('sort_order');
    const { data: skills } = await supabase.from('tech_skills').select('*').order('sort_order');
    
    const treeWithSkills = categories?.map(cat => ({
      ...cat,
      skills: skills?.filter(s => s.tech_tree_id === cat.id) || []
    })) || [];
    
    setTechTree(treeWithSkills);
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
    <div className="min-h-screen bg-[#0a0e14] text-[#00d9ff] font-mono p-6 md:p-12 overflow-x-hidden relative" style={{ fontFamily: '"SF Mono\", \"Monaco\", \"Consolas\", monospace' }}>
      {/* 代码风格背景 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 217, 255, 0.1) 20px, rgba(0, 217, 255, 0.1) 21px),
          repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0, 217, 255, 0.05) 20px, rgba(0, 217, 255, 0.05) 21px)
        `,
      }} />
      
      {/* 代码行号装饰 */}
      <div className="fixed left-8 top-0 bottom-0 w-px bg-[#00d9ff]/10 pointer-events-none"></div>

      {/* 页头 - 代码风格 */}
      <header className="max-w-7xl mx-auto mb-16 border-l-4 border-[#00d9ff] pl-6 relative">
        <div className="absolute -left-8 top-0 text-[#00d9ff]/30 text-xs font-mono">01</div>
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold text-[#00d9ff] mb-2" style={{
            textShadow: '0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.3)',
            fontFamily: '"SF Mono\", monospace'
          }}>
            <span className="text-[#00d9ff]/60">class</span> <span className="text-[#ff6b9d]">SoftwareEngineering</span> <span className="text-[#00d9ff]/60">{'{'}</span>
          </h1>
          <p className="text-sm text-[#00d9ff]/60 font-mono">
            // 软件工程技能树 | 持续迭代中
          </p>
          <div className="flex items-center gap-4 text-xs text-[#00d9ff]/40 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-pulse"></span>
              <span>STATUS: ACTIVE</span>
            </span>
            <span>|</span>
            <span>CATEGORIES: {techTree.length}</span>
          </div>
        </div>
      </header>

      {/* 技术树网格 - 代码块风格 */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {techTree.map((sector, index) => (
          <section 
            key={index}
            className="bg-[#0f1419] border-l-4 border-[#00d9ff] p-8 group hover:border-[#ff6b9d] hover:bg-[#141920] transition-all duration-300 relative"
            style={{ boxShadow: '0 0 20px rgba(0, 217, 255, 0.1)' }}
          >
            {/* 代码注释装饰 */}
            <div className="absolute -left-6 top-0 text-[#00d9ff]/20 text-xs font-mono">{String(index + 1).padStart(2, '0')}</div>
            
            {/* 头部 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#00d9ff] mb-1 font-mono group-hover:text-[#ff6b9d] transition-colors">
                  <span className="text-[#00d9ff]/60">const</span> <span className="text-[#ff6b9d]">{sector.category}</span> <span className="text-[#00d9ff]/60">=</span> <span className="text-[#00d9ff]">'{sector.icon}'</span>
                </h2>
                <div className="text-xs text-[#00d9ff]/40 font-mono mt-1">
                  // ZONE_{String(index + 1).padStart(2, '0')}
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {sector.skills.map((skill, skillIdx) => (
                <li key={skill.id} className="flex items-center gap-3 group/item cursor-default">
                  <div className="text-[#00d9ff]/30 text-xs font-mono w-6">{skillIdx + 1}.</div>
                  <div className="w-1 h-1 bg-[#00d9ff] group-hover/item:bg-[#ff6b9d] transition-colors rounded-full"></div>
                  <span className="flex-1 text-base font-mono text-[#00d9ff]/80 group-hover/item:text-[#00d9ff] group-hover/item:translate-x-2 transition-all duration-300">
                    {skill.skill}
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={async () => {
                        const result = await deleteTechSkillAction(skill.id);
                        if (result.success) fetchData();
                      }}
                      className="text-xs text-red-500/50 hover:text-red-500 opacity-0 group-hover/item:opacity-100 font-mono"
                    >
                      [DEL]
                    </button>
                  )}
                </li>
              ))}
              
              {/* 管理员添加技能 */}
              {isAdmin && (
                addingSkillTo === sector.id ? (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (newSkill.trim()) {
                        const result = await addTechSkillAction({ tech_tree_id: sector.id, skill: newSkill });
                        if (result.success) {
                          setNewSkill('');
                          setAddingSkillTo(null);
                          fetchData();
                        }
                      }
                    }}
                    className="flex gap-2 mt-4 pl-9"
                  >
                    <span className="text-[#00d9ff]/30 text-xs font-mono">+</span>
                    <input 
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      placeholder="新技能..."
                      className="flex-1 bg-[#0a0e14] border-b border-[#00d9ff]/30 text-sm text-[#00d9ff] p-1 outline-none focus:border-[#ff6b9d] transition-colors font-mono"
                      autoFocus
                    />
                    <button type="submit" className="text-xs text-[#00d9ff] hover:text-[#ff6b9d] font-mono">[ADD]</button>
                    <button type="button" onClick={() => setAddingSkillTo(null)} className="text-xs text-[#00d9ff]/30 hover:text-[#00d9ff] font-mono">[X]</button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setAddingSkillTo(sector.id)}
                    className="text-xs text-[#00d9ff]/30 hover:text-[#00d9ff] mt-4 pl-9 font-mono"
                  >
                    + 添加技能
                  </button>
                )
              )}
            </ul>

            {/* 管理员删除分类 */}
            {isAdmin && (
              <button 
                onClick={async () => {
                  if (confirm(`删除分类 "${sector.category}" 及其所有技能？`)) {
                    const result = await deleteTechCategoryAction(sector.id);
                    if (result.success) fetchData();
                  }
                }}
                className="absolute top-4 right-4 text-xs text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 font-mono"
              >
                [DELETE]
              </button>
            )}

            {/* 代码块结束装饰 */}
            <div className="mt-6 text-xs text-[#00d9ff]/20 font-mono">{'}'}</div>
          </section>
        ))}
        
        {/* 管理员添加分类 */}
        {isAdmin && (
          showAddCategory ? (
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await addTechCategoryAction(newCategory);
                if (result.success) {
                  setNewCategory({ category: '', icon: '◇' });
                  setShowAddCategory(false);
                  fetchData();
                }
              }}
              className="bg-[#0f1419] border-l-4 border-[#00d9ff] p-8 space-y-4"
              style={{ boxShadow: '0 0 20px rgba(0, 217, 255, 0.1)' }}
            >
              <div className="text-xs text-[#00d9ff]/30 font-mono mb-2">// 添加新分类</div>
              <input 
                placeholder="分类名称 (如 前端架构)" 
                value={newCategory.category}
                onChange={e => setNewCategory({...newCategory, category: e.target.value})}
                className="w-full bg-[#0a0e14] border-b border-[#00d9ff]/30 text-sm text-[#00d9ff] p-2 outline-none focus:border-[#ff6b9d] transition-colors font-mono"
                required
              />
              <input 
                placeholder="图标 (如 ◇)" 
                value={newCategory.icon}
                onChange={e => setNewCategory({...newCategory, icon: e.target.value})}
                className="w-full bg-[#0a0e14] border-b border-[#00d9ff]/30 text-sm text-[#00d9ff] p-2 outline-none focus:border-[#ff6b9d] transition-colors font-mono"
              />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-[#00d9ff] text-black px-4 py-2 text-xs font-bold hover:bg-[#ff6b9d] transition-colors font-mono">[EXECUTE]</button>
                <button type="button" onClick={() => setShowAddCategory(false)} className="text-xs text-[#00d9ff]/50 hover:text-[#00d9ff] font-mono">[CANCEL]</button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setShowAddCategory(true)}
              className="bg-[#0f1419] border-l-4 border-dashed border-[#00d9ff]/30 p-8 flex items-center justify-center text-xs text-[#00d9ff]/30 hover:text-[#00d9ff] hover:border-[#00d9ff] transition-colors font-mono"
              style={{ boxShadow: '0 0 20px rgba(0, 217, 255, 0.05)' }}
            >
              + 添加新分类
            </button>
          )
        )}
      </main>

      {/* 页脚 */}
      <footer className="max-w-7xl mx-auto mt-24 border-t border-[#00d9ff]/20 pt-8 flex justify-between items-center">
        <div className="text-xs font-mono text-[#00d9ff]/40">// 稳定运行中</div>
        <div className="text-xs font-mono text-[#00d9ff]/40 italic">// 代码是现代世界的魔法</div>
      </footer>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(10, 14, 20, 0.95) !important; border-bottom-color: rgba(0, 217, 255, 0.3) !important; }
        aside.fixed { background: rgba(10, 14, 20, 0.95) !important; border-right-color: rgba(0, 217, 255, 0.3) !important; }
        aside.fixed .group\\/item:hover { background: rgba(0, 217, 255, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(0, 217, 255) !important; }
      `}} />
    </div>
  );
}