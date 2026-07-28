'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { addPhilosophyEntryAction, deletePhilosophyEntryAction, addPhilosophyCategoryAction, deletePhilosophyCategoryAction } from '@/app/lib/actions';

interface PhilosophyEntry {
  id: string;
  title: string;
  content: string;
  author?: string;
  category?: string;
  created_at: string;
}

interface PhilosophyCategoryCustom {
  id: string;
  label: string;
  en?: string | null;
  icon?: string | null;
  desc?: string | null;
  sort_order?: number;
  created_at?: string;
}

/** 按哲学图谱划分：核心分支 + 应用与跨领域 */
const PHILOSOPHY_MAP = {
  core: [
    { id: 'metaphysics', label: '形而上学', en: 'Metaphysics', icon: '▲', desc: '存在与本体' },
    { id: 'epistemology', label: '认识论', en: 'Epistemology', icon: '●', desc: '知识与信念' },
    { id: 'ethics', label: '伦理学', en: 'Ethics', icon: '◆', desc: '道德与价值' },
    { id: 'logic', label: '逻辑学', en: 'Logic', icon: '■', desc: '推理与论证' },
    { id: 'aesthetics', label: '美学', en: 'Aesthetics', icon: '◇', desc: '美与艺术' },
  ],
  applied: [
    { id: 'political', label: '政治哲学', en: 'Political Philosophy', icon: '▣', desc: '权力与正义' },
    { id: 'mind', label: '心灵哲学', en: 'Philosophy of Mind', icon: '◐', desc: '心灵与意识' },
    { id: 'language', label: '语言哲学', en: 'Philosophy of Language', icon: '◈', desc: '意义与指称' },
    { id: 'science', label: '科学哲学', en: 'Philosophy of Science', icon: '⬡', desc: '科学与方法' },
    { id: 'religion', label: '宗教哲学', en: 'Philosophy of Religion', icon: '☽', desc: '信仰与理性' },
    { id: 'law', label: '法律哲学', en: 'Philosophy of Law', icon: '§', desc: '法与正当性' },
  ],
} as const;

const builtInCategories = [...PHILOSOPHY_MAP.core, ...PHILOSOPHY_MAP.applied];

export default function PhilosophyPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<PhilosophyEntry[]>([]);
  const [customCategories, setCustomCategories] = useState<PhilosophyCategoryCustom[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', author: '', category: 'metaphysics' });
  const [newCategory, setNewCategory] = useState({ label: '', en: '', icon: '◦', desc: '' });

  const fetchData = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('philosophy_entries').select('*').order('created_at', { ascending: false });
    if (data) setEntries(data);
  };

  const fetchCustomCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('philosophy_categories').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (data) setCustomCategories(data as PhilosophyCategoryCustom[]);
  };

  useEffect(() => {
    fetchData();
    fetchCustomCategories();
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(!!user);
    };
    checkAuth();
  }, []);

  const allCategoriesCount = builtInCategories.length + customCategories.length;
  const isValidCategoryId = (id: string) => builtInCategories.some(c => c.id === id) || customCategories.some(c => c.id === id);
  const entryCategory = (e: PhilosophyEntry) => e.category || 'metaphysics';

  const filteredEntries = selectedCategory 
    ? entries.filter(e => entryCategory(e) === selectedCategory)
    : entries;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#d4d4d4] p-6 md:p-12 overflow-x-hidden relative" style={{ fontFamily: '"Georgia\", \"Times New Roman\", serif' }}>
      {/* 深色纹理 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
      }} />
      
      {/* 装饰性边框 */}
      <div className="fixed inset-8 border-2 border-[#404040]/30 pointer-events-none" />
      <div className="fixed inset-10 border border-[#404040]/20 pointer-events-none" />

      <header className="max-w-7xl mx-auto mb-12 relative z-10">
        <div className="border-l-4 border-[#666666] pl-8 mb-8">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#e0e0e0] mb-3 italic" style={{ 
            fontFamily: '"Georgia\", serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            Φιλοσοφία
          </h1>
          <p className="text-lg text-[#888888] mb-2 font-serif italic">Philosophy</p>
          <div className="flex items-center gap-4 text-xs text-[#666666] font-serif">
            <span>哲学图谱 · 分类: {allCategoriesCount}</span>
            <span>•</span>
            <span>条目: {entries.length}</span>
          </div>
        </div>

        {/* 分类导航 - 按哲学图谱：全部 + 核心分支 + 应用与跨领域 */}
        <nav className="space-y-5 mb-10" aria-label="哲学图谱分类">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 border-2 font-serif text-sm transition-all ${
                selectedCategory === null
                  ? 'border-[#666666] bg-[#252525] text-[#e0e0e0]'
                  : 'border-[#404040] text-[#888888] hover:border-[#555555] hover:text-[#d4d4d4] bg-[#1a1a1a]'
              }`}
            >
              全部
            </button>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-serif text-[#555555] uppercase tracking-widest">核心分支</p>
            <div className="flex flex-wrap gap-2">
              {PHILOSOPHY_MAP.core.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 border-2 font-serif text-sm transition-all ${
                    selectedCategory === cat.id
                      ? 'border-[#666666] bg-[#252525] text-[#e0e0e0]'
                      : 'border-[#404040] text-[#888888] hover:border-[#555555] hover:text-[#d4d4d4] bg-[#1a1a1a]'
                  }`}
                  title={cat.desc}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-serif text-[#555555] uppercase tracking-widest">应用与跨领域</p>
            <div className="flex flex-wrap gap-2">
              {PHILOSOPHY_MAP.applied.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 border-2 font-serif text-sm transition-all ${
                    selectedCategory === cat.id
                      ? 'border-[#666666] bg-[#252525] text-[#e0e0e0]'
                      : 'border-[#404040] text-[#888888] hover:border-[#555555] hover:text-[#d4d4d4] bg-[#1a1a1a]'
                  }`}
                  title={cat.desc}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
          {customCategories.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-serif text-[#555555] uppercase tracking-widest">自定义</p>
              <div className="flex flex-wrap gap-2">
                {customCategories.map(cat => (
                  <span key={cat.id} className="inline-flex items-center gap-1">
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 border-2 font-serif text-sm transition-all ${
                        selectedCategory === cat.id
                          ? 'border-[#666666] bg-[#252525] text-[#e0e0e0]'
                          : 'border-[#404040] text-[#888888] hover:border-[#555555] hover:text-[#d4d4d4] bg-[#1a1a1a]'
                      }`}
                      title={cat.desc || undefined}
                    >
                      {(cat.icon || '◦')} {cat.label}
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm(`删除分类「${cat.label}」？该分类下的条目将保留，但不再归属此分类。`)) {
                            const result = await deletePhilosophyCategoryAction(cat.id);
                            if (result.success) fetchCustomCategories();
                            else alert(result.error || '删除失败');
                          }
                        }}
                        className="p-1.5 text-[#666666] hover:text-red-500 text-xs font-serif border border-transparent hover:border-[#404040]"
                        title="删除此分类"
                      >
                        删除
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* 管理员：添加分类 */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto mb-8 relative z-10 border-2 border-[#404040] bg-[#252525] p-6">
          {showAddCategory ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await addPhilosophyCategoryAction(newCategory);
                if (result.success) {
                  setNewCategory({ label: '', en: '', icon: '◦', desc: '' });
                  setShowAddCategory(false);
                  fetchCustomCategories();
                } else {
                  alert('添加分类失败: ' + (result.error || '未知错误'));
                }
              }}
              className="space-y-4"
            >
              <h3 className="text-sm font-serif text-[#888888] mb-3">添加自定义分类</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#666666] text-xs font-serif mb-1 block">分类名称 *</label>
                  <input
                    placeholder="如：现象学"
                    value={newCategory.label}
                    onChange={e => setNewCategory({ ...newCategory, label: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-2 border-[#404040] text-[#d4d4d4] p-2 outline-none font-serif focus:border-[#555555] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#666666] text-xs font-serif mb-1 block">英文名（可选）</label>
                  <input
                    placeholder="如：Phenomenology"
                    value={newCategory.en}
                    onChange={e => setNewCategory({ ...newCategory, en: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-2 border-[#404040] text-[#d4d4d4] p-2 outline-none font-serif focus:border-[#555555] text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#666666] text-xs font-serif mb-1 block">图标（可选，单字符）</label>
                  <input
                    placeholder="◦ ◉ ◆ 等"
                    value={newCategory.icon}
                    onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-2 border-[#404040] text-[#d4d4d4] p-2 outline-none font-serif focus:border-[#555555] text-sm max-w-[80px]"
                  />
                </div>
                <div>
                  <label className="text-[#666666] text-xs font-serif mb-1 block">描述（可选）</label>
                  <input
                    placeholder="如：意向性与生活世界"
                    value={newCategory.desc}
                    onChange={e => setNewCategory({ ...newCategory, desc: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-2 border-[#404040] text-[#d4d4d4] p-2 outline-none font-serif focus:border-[#555555] text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-[#666666] text-white px-4 py-2 font-serif text-sm hover:bg-[#555555] transition-colors">
                  添加分类
                </button>
                <button type="button" onClick={() => { setShowAddCategory(false); setNewCategory({ label: '', en: '', icon: '◦', desc: '' }); }} className="text-[#888888] text-sm hover:text-[#d4d4d4] font-serif">
                  取消
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              className="text-[#888888] hover:text-[#d4d4d4] text-sm font-serif border-2 border-dashed border-[#404040] px-4 py-2 hover:border-[#555555] transition-colors bg-[#1a1a1a]"
            >
              + 添加自定义分类
            </button>
          )}
        </div>
      )}

      {/* 管理员添加条目 */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto mb-12 relative z-10 border-2 border-[#404040] bg-[#252525] p-8">
          {showAdd ? (
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await addPhilosophyEntryAction(newEntry);
                if (result.success) {
                  setNewEntry({ title: '', content: '', author: '', category: 'metaphysics' });
                  setShowAdd(false);
                  fetchData();
                } else {
                  alert('添加失败: ' + (result.error || '未知错误'));
                }
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[#888888] text-sm font-serif mb-2 block">标题</label>
                  <input 
                    placeholder="输入标题..."
                    value={newEntry.title}
                    onChange={e => setNewEntry({...newEntry, title: e.target.value})}
                    className="w-full bg-[#1a1a1a] border-b-2 border-[#404040] text-[#d4d4d4] p-2 outline-none font-serif focus:border-[#555555] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#888888] text-sm font-serif mb-2 block">分类</label>
                  <select 
                    value={isValidCategoryId(newEntry.category) ? newEntry.category : 'metaphysics'}
                    onChange={e => setNewEntry({...newEntry, category: e.target.value})}
                    className="w-full bg-[#1a1a1a] border-2 border-[#404040] text-[#d4d4d4] p-2 outline-none font-serif focus:border-[#555555] transition-colors"
                  >
                    <optgroup label="核心分支" className="bg-[#1a1a1a]">
                      {PHILOSOPHY_MAP.core.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">{cat.icon} {cat.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="应用与跨领域" className="bg-[#1a1a1a]">
                      {PHILOSOPHY_MAP.applied.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">{cat.icon} {cat.label}</option>
                      ))}
                    </optgroup>
                    {customCategories.length > 0 && (
                      <optgroup label="自定义" className="bg-[#1a1a1a]">
                        {customCategories.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">{(cat.icon || '◦')} {cat.label}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[#888888] text-sm font-serif mb-2 block">内容</label>
                <textarea 
                  placeholder="输入内容..."
                  value={newEntry.content}
                  onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                  className="w-full bg-[#1a1a1a] border-2 border-[#404040] text-[#d4d4d4] p-3 outline-none resize-none h-32 font-serif focus:border-[#555555] transition-colors leading-relaxed"
                  required
                />
              </div>
              <div>
                <label className="text-[#888888] text-sm font-serif mb-2 block">作者 (可选)</label>
                <input 
                  placeholder="输入作者..."
                  value={newEntry.author}
                  onChange={e => setNewEntry({...newEntry, author: e.target.value})}
                  className="w-full bg-[#1a1a1a] border-b-2 border-[#404040] text-[#d4d4d4]/80 p-2 outline-none font-serif focus:border-[#555555] transition-colors"
                />
              </div>
              <div className="flex gap-4 pt-3">
                <button type="submit" className="bg-[#666666] text-white px-6 py-2 font-serif text-sm hover:bg-[#555555] transition-colors">
                  添加
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="text-[#888888] text-sm hover:text-[#d4d4d4] font-serif">
                  取消
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setShowAdd(true)}
              className="text-[#888888] hover:text-[#d4d4d4] text-sm font-serif border-2 border-dashed border-[#404040] px-6 py-3 hover:border-[#555555] transition-colors bg-[#1a1a1a]"
            >
              + 添加新条目
            </button>
          )}
        </div>
      )}

      {/* 条目列表 - 按哲学图谱分组展示 */}
      <main className="max-w-7xl mx-auto relative z-10">
        {[
          { key: 'core', title: '核心分支', categories: PHILOSOPHY_MAP.core },
          { key: 'applied', title: '应用与跨领域', categories: PHILOSOPHY_MAP.applied },
          { key: 'custom', title: '自定义', categories: customCategories.map(c => ({ id: c.id, label: c.label, en: c.en ?? '', icon: c.icon ?? '◦', desc: c.desc ?? '' })) },
        ].map(({ key: groupKey, title: groupTitle, categories }) => {
          if (categories.length === 0) return null;
          const showGroup = !selectedCategory || categories.some(c => c.id === selectedCategory);
          if (!showGroup) return null;
          return (
          <div key={groupKey} className="mb-14">
            <h2 className="text-xs font-serif text-[#555555] uppercase tracking-widest mb-6 border-b border-[#404040] pb-2">
              {groupTitle}
            </h2>
            {categories.map(category => {
              const categoryEntries = filteredEntries.filter(e => entryCategory(e) === category.id);
              if (selectedCategory && selectedCategory !== category.id) return null;

              return (
                <section key={category.id} className="mb-12 border-2 border-[#404040] bg-[#252525] p-8 relative">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-[#404040]">
                    <span className="text-3xl text-[#666666]">{category.icon}</span>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-[#e0e0e0] italic">
                        {category.label}
                      </h3>
                      <p className="text-xs text-[#666666] font-serif mt-0.5">
                        {[category.en, category.desc].filter(Boolean).join(' · ') || '自定义分类'}
                      </p>
                    </div>
                    <span className="text-xs text-[#888888] font-serif ml-auto bg-[#1a1a1a] px-3 py-1 border border-[#404040]">
                      {categoryEntries.length} 条目
                    </span>
                  </div>

                  {categoryEntries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryEntries.map((entry, idx) => (
                        <article 
                          key={entry.id}
                          className="group border-2 border-[#404040] bg-[#1a1a1a] p-6 hover:border-[#555555] transition-all relative cursor-pointer"
                          onClick={() => router.push(`/detail/philosophy/${entry.id}`)}
                        >
                          {isAdmin && (
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(`删除 "${entry.title}"？`)) {
                                  const result = await deletePhilosophyEntryAction(entry.id);
                                  if (result.success) fetchData();
                                }
                              }}
                              className="absolute top-2 right-2 text-red-500/50 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-serif"
                            >
                              删除
                            </button>
                          )}

                          <div className="mb-3">
                            <span className="text-[10px] font-serif text-[#666666] italic">#{idx + 1}</span>
                          </div>
                          
                          <h4 className="text-lg font-serif font-bold text-[#e0e0e0] mb-3 group-hover:text-[#d4d4d4] transition-colors italic">
                            {entry.title}
                          </h4>
                          
                          <p className="text-sm text-[#888888] font-serif leading-relaxed line-clamp-4 mb-4">
                            {entry.content}
                          </p>

                          <div className="flex items-center justify-between text-xs text-[#666666] font-serif border-t border-[#404040] pt-3 italic">
                            {entry.author && (
                              <span>— {entry.author}</span>
                            )}
                            <span>
                              {new Date(entry.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#666666] text-sm font-serif italic">
                      此分类暂无条目
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          );
        })}

        {filteredEntries.length === 0 && selectedCategory && (
          <div className="text-center py-20 text-[#666666] text-sm font-serif border-2 border-[#404040] bg-[#252525] p-8">
            未找到条目
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto mt-16 pb-8 border-t-2 border-[#404040] pt-8 relative z-10">
        <div className="flex items-center justify-between text-xs text-[#666666] font-serif italic">
          <span>哲学档案</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#666666] rounded-full"></span>
            在线
          </span>
        </div>
      </footer>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(26, 26, 26, 0.95) !important; border-bottom-color: rgba(64, 64, 64, 0.5) !important; }
        aside.fixed { background: rgba(26, 26, 26, 0.95) !important; border-right-color: rgba(64, 64, 64, 0.5) !important; }
        aside.fixed .group\\/item:hover { background: rgba(102, 102, 102, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(102, 102, 102) !important; }
      `}} />
    </div>
  );
}
