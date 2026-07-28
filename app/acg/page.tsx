'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { addAcgCategoryAction, deleteAcgCategoryAction, addAcgTagAction, deleteAcgTagAction, addAcgEntryAction, deleteAcgEntryAction } from '@/app/lib/actions';
import { ContentWithImages } from '@/components/ContentWithImages';

interface AcgTag {
  id: string;
  acg_category_id: string;
  tag: string;
}

interface AcgCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  tags: AcgTag[];
}

interface AcgEntry {
  id: string;
  acg_category_id: string | null;
  title: string;
  content: string | null;
  type: string;
  image_url: string | null;
  image_urls: string[];
  link: string | null;
  created_at: string;
  acg_categories?: { title: string } | null;
  tag_names?: string[];
}

export default function AcgPage() {
  const [categories, setCategories] = useState<AcgCategory[]>([]);
  const [entries, setEntries] = useState<AcgEntry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newCategory, setNewCategory] = useState({ title: '', description: '', color: '#39C5BB' });
  const [addingTagTo, setAddingTagTo] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newEntry, setNewEntry] = useState({
    acg_category_id: '' as string | null,
    title: '',
    content: '',
    image_urls_text: '',
    link: '',
    tag_ids: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchData = async () => {
    const supabase = createClient();
    const { data: cats } = await supabase.from('acg_categories').select('*').order('sort_order');
    const { data: tags } = await supabase.from('acg_tags').select('*');
    const { data: ents } = await supabase.from('acg_entries').select('*, acg_categories(title)').order('created_at', { ascending: false });
    const { data: entryTags } = await supabase.from('acg_entry_tags').select('acg_entry_id, acg_tag_id');
    
    const catsWithTags = cats?.map(cat => ({
      ...cat,
      tags: tags?.filter(t => t.acg_category_id === cat.id) || []
    })) || [];

    const tagMap = Object.fromEntries((tags || []).map(t => [t.id, t.tag]));
    const entsWithTags = (ents || []).map(e => {
      const myTagIds = (entryTags || []).filter(et => et.acg_entry_id === e.id).map(et => et.acg_tag_id);
      return {
        ...e,
        image_urls: Array.isArray(e.image_urls) ? e.image_urls : (e.image_url ? [e.image_url] : []),
        tag_names: myTagIds.map(id => tagMap[id]).filter(Boolean),
      };
    });
    
    setCategories(catsWithTags);
    setEntries(entsWithTags);
  };

  const handleAcgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    const supabase = createClient();
    const path = `acg/${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const { data, error } = await supabase.storage.from('ACG').upload(path, file, { cacheControl: '3600', upsert: false });
    setUploading(false);
    e.target.value = '';
    if (error) {
      setUploadError(error.message || '上传失败，请确保 Supabase 已创建 ACG 桶');
      return;
    }
    const { data: urlData } = supabase.storage.from('ACG').getPublicUrl(data.path);
    const url = urlData.publicUrl;
    setNewEntry(prev => ({
      ...prev,
      image_urls_text: prev.image_urls_text ? `${prev.image_urls_text}\n${url}` : url,
    }));
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
    <div className="min-h-screen bg-[#0a0805] text-[#ff6b9d] p-6 md:p-12 overflow-x-hidden relative" style={{ 
      fontFamily: '"Georgia\", \"Times New Roman\", serif'
    }}>
      {/* 手稿/涂鸦风格背景 - 体现独立创作精神 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.4]" style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E"),
          radial-gradient(circle at 15% 25%, rgba(255, 107, 157, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 85% 75%, rgba(255, 107, 157, 0.1) 0%, transparent 40%),
          linear-gradient(180deg, #0a0805 0%, #1a0f0a 100%)
        `
      }} />
      
      {/* 手绘线条装饰 */}
      <div className="fixed top-16 left-8 w-32 h-px bg-[#ff6b9d]/20 pointer-events-none transform rotate-[-2deg]"></div>
      <div className="fixed bottom-16 right-8 w-32 h-px bg-[#ff6b9d]/20 pointer-events-none transform rotate-[2deg]"></div>
      
      {/* 涂鸦装饰文字 - 体现反叛精神 */}
      <div className="fixed top-24 right-12 pointer-events-none z-5 opacity-20">
        <div className="text-[#ff6b9d] text-xs font-bold transform rotate-12" style={{ fontFamily: '"Courier New\", monospace' }}>
          ANTI-MAINSTREAM
        </div>
      </div>
      <div className="fixed bottom-24 left-12 pointer-events-none z-5 opacity-20">
        <div className="text-[#ff6b9d] text-xs font-bold transform -rotate-12" style={{ fontFamily: '"Courier New\", monospace' }}>
          INDEPENDENT CULTURE
        </div>
      </div>

      {/* 颜文字装饰 */}
      <div className="fixed top-16 right-20 pointer-events-none z-5 text-[#ff6b9d]/45 text-sm font-mono">(●'◡'●)</div>
      <div className="fixed top-40 right-16 pointer-events-none z-5 text-[#ff6b9d]/40 text-xs font-mono">(´▽`)</div>
      <div className="fixed top-24 left-16 pointer-events-none z-5 text-[#ff6b9d]/40 text-xs font-mono">/(ㄒoㄒ)/~~</div>
      <div className="fixed bottom-28 left-20 pointer-events-none z-5 text-[#ff6b9d]/45 text-sm font-mono">(๑•̀ㅂ•́)و✧</div>
      <div className="fixed bottom-16 right-20 pointer-events-none z-5 text-[#ff6b9d]/40 text-xs font-mono">⁽⁽٩(๑˃̶͈̀ ᗨ ˂̶͈́)۶⁾⁾</div>
      <div className="fixed top-1/2 left-12 pointer-events-none z-5 text-[#ff6b9d]/35 text-xs font-mono">Σ(°Д°;</div>
      <div className="fixed top-36 left-24 pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">(=´ω`=)</div>
      <div className="fixed bottom-36 right-24 pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">(≧∀≦)ゞ</div>
      <div className="fixed top-1/3 right-24 pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">ξ( ✿＞◡❛)</div>
      <div className="fixed bottom-1/3 left-24 pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">ヽ(✿ﾟ▽ﾟ)ノ</div>
      <div className="fixed top-[22%] left-[25%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">(*´∀`)~♥</div>
      <div className="fixed top-[45%] right-[20%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">(❛◡❛✿)</div>
      <div className="fixed top-[68%] left-[22%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">(๑╹◡╹๑)</div>
      <div className="fixed top-[35%] left-[18%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">(〃∀〃)</div>
      <div className="fixed top-[58%] right-[25%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">⸜(* ॑꒳ ॑* )⸝</div>
      <div className="fixed top-[78%] right-[18%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">✧*｡٩(ˊᗜˋ*)و✧*｡</div>
      <div className="fixed top-[52%] left-[15%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">(๑•̀ω•́)ノ</div>
      <div className="fixed top-[18%] right-[30%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">(❀╹◡╹)</div>

      {/* 页头 - 文化宣言风格 */}
      <header className="max-w-7xl mx-auto mb-16 relative z-10">
        <div className="border-l-4 border-[#ff6b9d] pl-8 mb-8">
          <div className="flex items-baseline gap-4 mb-4">
            <h1 className="text-6xl md:text-8xl font-black text-[#ff6b9d] italic" style={{ 
              fontFamily: '"Georgia\", serif',
              textShadow: '3px 3px 0px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em',
              transform: 'rotate(-1deg)'
            }}>
              ACG
            </h1>
            <span className="text-sm text-[#ff6b9d]/40 font-mono uppercase tracking-widest transform rotate-12">
              ARCHIVE
            </span>
          </div>
          
          {/* 文化宣言 */}
          <div className="space-y-3 mb-6">
            <p className="text-lg text-[#ff6b9d]/80 italic font-serif leading-relaxed max-w-3xl">
              "ciallo~" <span className="font-mono text-[#ff6b9d]/50 text-sm">(●'◡'●)</span>
            </p>
            <p className="text-sm text-[#ff6b9d]/60 font-serif italic flex items-center gap-2 flex-wrap">
              — 怀念当年的ACG <span className="font-mono text-xs">⁽⁽٩(๑˃̶͈̀ ᗨ ˂̶͈́)۶⁾⁾</span>
            </p>
          </div>
          
          {/* 统计信息 - 手写风格 */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#ff6b9d]/50 font-serif">
            <span>分类: <span className="text-[#ff6b9d] font-bold">{categories.length}</span></span>
            <span>•</span>
            <span>标签: <span className="text-[#ff6b9d] font-bold">{categories.reduce((sum, cat) => sum + cat.tags.length, 0)}</span></span>
            <span>•</span>
            <span>条目: <span className="text-[#ff6b9d] font-bold">{entries.length}</span></span>
            <span>•</span>
            <span className="italic">独立收藏</span>
            <span className="font-mono text-[#ff6b9d]/40">Σ(°Д°;</span>
            {isAdmin && (
              <button
                onClick={() => setShowAddEntry(true)}
                className="ml-auto border-2 border-[#ff6b9d] px-4 py-2 text-[#ff6b9d] font-serif italic hover:bg-[#ff6b9d]/10 transition-colors"
              >
                + 发一条
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 条目动态流 */}
      {entries.length > 0 && (
        <section className="max-w-7xl mx-auto mb-16 relative z-10">
          <h2 className="text-lg text-[#ff6b9d]/60 font-serif italic mb-6 border-b border-[#ff6b9d]/20 pb-2">动态 <span className="font-mono text-sm">ヽ(✿ﾟ▽ﾟ)ノ</span></h2>
          <div className="space-y-6">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="bg-[#1a0f0a] border border-[#ff6b9d]/30 p-6 hover:border-[#ff6b9d]/50 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#ff6b9d] italic font-serif">{entry.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-[#ff6b9d]/60 font-serif">
                      {entry.acg_categories?.title && (
                        <span className="border border-[#ff6b9d]/30 px-2 py-0.5">{entry.acg_categories.title}</span>
                      )}
                      {entry.tag_names?.map((t) => (
                        <span key={t} className="text-[#ff6b9d]/50">#{t}</span>
                      ))}
                      <span className="text-[#ff6b9d]/40">{new Date(entry.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (confirm('删除这条？')) {
                          const r = await deleteAcgEntryAction(entry.id);
                          if (r.success) fetchData();
                        }
                      }}
                      className="text-red-500/50 hover:text-red-500 text-xs font-serif"
                    >
                      删除
                    </button>
                  )}
                </div>
                {entry.image_urls?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.image_urls.map((url, i) => (
                      <img key={i} src={url} alt="" className="max-h-48 object-cover rounded border border-[#ff6b9d]/20" loading="lazy" />
                    ))}
                  </div>
                )}
                {entry.content && (
                  <div className="text-sm text-[#ff6b9d]/80 font-serif italic leading-relaxed">
                    <ContentWithImages content={entry.content} className="[&_img]:max-h-64 [&_img]:rounded [&_img]:border [&_img]:border-[#ff6b9d]/20" />
                  </div>
                )}
                {entry.link && (
                  <a href={entry.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-[#ff6b9d]/70 hover:text-[#ff6b9d] font-mono truncate max-w-full">
                    → {entry.link}
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {categories.map((item, index) => (
          <article 
            key={item.id}
            className="group relative bg-[#1a0f0a] border-2 border-[#ff6b9d]/30 p-8 hover:border-[#ff6b9d] transition-all duration-500"
            style={{ 
              boxShadow: '0 4px 20px rgba(255, 107, 157, 0.1)',
              transform: index % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
            }}
          >
            {/* 手写编号装饰 */}
            <div className="absolute -top-3 -left-3 w-10 h-10 border-2 border-[#ff6b9d] bg-[#0a0805] flex items-center justify-center text-xs font-bold text-[#ff6b9d] transform rotate-[-15deg]">
              №{index + 1}
            </div>
            
            {/* 涂鸦装饰 */}
            <div className="absolute top-4 right-4 text-[#ff6b9d]/20 text-xl transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity">
              ✦
            </div>
            
            {isAdmin && (
              <button 
                onClick={async () => {
                  if (confirm(`删除 "${item.title}"？`)) {
                    const result = await deleteAcgCategoryAction(item.id);
                    if (result.success) fetchData();
                  }
                }}
                className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-serif"
              >
                删除
              </button>
            )}
            
            {/* 标题 - 手写风格 */}
            <h3 className="text-2xl font-bold text-[#ff6b9d] mb-4 italic font-serif group-hover:text-[#ff6b9d]/80 transition-colors" style={{
              textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
              transform: 'rotate(-0.5deg)'
            }}>
              {item.title}
            </h3>
            
            {/* 描述 - 人文风格 */}
            <p className="text-sm text-[#ff6b9d]/70 mb-6 leading-relaxed font-serif italic">
              {item.description}
            </p>

            {/* 标签 - 手写标签风格 */}
            <div className="flex flex-wrap gap-2 mt-auto">
              {item.tags.map((tag: AcgTag) => (
                <span 
                  key={tag.id} 
                  className="inline-block border border-[#ff6b9d]/40 bg-[#0a0805] text-[#ff6b9d]/80 px-3 py-1 text-xs font-serif italic hover:bg-[#ff6b9d]/10 hover:text-[#ff6b9d] transition-all cursor-default"
                  style={{ transform: 'rotate(-1deg)' }}
                >
                  {tag.tag}
                  {isAdmin && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const result = await deleteAcgTagAction(tag.id);
                        if (result.success) fetchData();
                      }}
                      className="ml-2 text-red-500/50 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              
              {isAdmin && (
                addingTagTo === item.id ? (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (newTag.trim()) {
                        const result = await addAcgTagAction({ acg_category_id: item.id, tag: newTag });
                        if (result.success) {
                          setNewTag('');
                          setAddingTagTo(null);
                          fetchData();
                        }
                      }
                    }}
                    className="inline-flex gap-2"
                  >
                    <input 
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="标签..."
                      className="bg-[#0a0805] border-b border-[#ff6b9d]/40 text-sm text-[#ff6b9d] p-1 outline-none focus:border-[#ff6b9d] transition-colors font-serif italic"
                      autoFocus
                    />
                    <button type="submit" className="text-xs text-[#ff6b9d] hover:text-[#ff6b9d]/80 font-serif">[添加]</button>
                    <button type="button" onClick={() => setAddingTagTo(null)} className="text-xs text-[#ff6b9d]/40 hover:text-[#ff6b9d] font-serif">[取消]</button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setAddingTagTo(item.id)}
                    className="inline-block border border-dashed border-[#ff6b9d]/30 text-[#ff6b9d]/50 px-3 py-1 text-xs font-serif italic hover:border-[#ff6b9d] hover:text-[#ff6b9d] transition-colors"
                    style={{ transform: 'rotate(1deg)' }}
                  >
                    + 添加标签
                  </button>
                )
              )}
            </div>
          </article>
        ))}

        {isAdmin && (
          showAddCategory ? (
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await addAcgCategoryAction(newCategory);
                if (result.success) {
                  setNewCategory({ title: '', description: '', color: '#39C5BB' });
                  setShowAddCategory(false);
                  fetchData();
                }
              }}
              className="bg-[#1a0f0a] border-2 border-[#ff6b9d] p-8 space-y-4"
              style={{ boxShadow: '0 4px 20px rgba(255, 107, 157, 0.2)' }}
            >
              <div className="text-xs text-[#ff6b9d]/50 font-serif italic mb-2">// 添加新分类</div>
              <input 
                placeholder="标题" 
                value={newCategory.title}
                onChange={e => setNewCategory({...newCategory, title: e.target.value})}
                className="w-full bg-[#0a0805] border-b-2 border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none focus:border-[#ff6b9d] transition-colors font-serif"
                required
              />
              <textarea 
                placeholder="描述..." 
                value={newCategory.description}
                onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                className="w-full bg-[#0a0805] border border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none resize-none h-24 font-serif italic focus:border-[#ff6b9d] transition-colors"
              />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-[#ff6b9d] text-black px-6 py-2 text-sm font-bold hover:bg-[#ff6b9d]/80 transition-colors font-serif">
                  创建
                </button>
                <button type="button" onClick={() => setShowAddCategory(false)} className="text-[#ff6b9d]/50 hover:text-[#ff6b9d] px-6 py-2 text-sm font-serif">
                  取消
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setShowAddCategory(true)}
              className="bg-[#1a0f0a] border-2 border-dashed border-[#ff6b9d]/30 p-8 flex items-center justify-center text-[#ff6b9d]/50 hover:text-[#ff6b9d] hover:border-[#ff6b9d] transition-colors font-serif italic"
              style={{ boxShadow: '0 4px 20px rgba(255, 107, 157, 0.1)' }}
            >
              + 添加新分类
            </button>
          )
        )}
      </main>

      {/* 发一条 弹窗 */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setShowAddEntry(false)}>
          <div className="bg-[#1a0f0a] border-2 border-[#ff6b9d] w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 4px 20px rgba(255, 107, 157, 0.2)' }}>
            <div className="p-6 space-y-4">
              <div className="text-sm text-[#ff6b9d]/80 font-serif italic flex items-center gap-2">发一条 <span className="font-mono text-xs">(●'◡'●)</span></div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const image_urls = newEntry.image_urls_text.split('\n').map(s => s.trim()).filter(Boolean);
                  const result = await addAcgEntryAction({
                    acg_category_id: newEntry.acg_category_id || null,
                    title: newEntry.title,
                    content: newEntry.content || undefined,
                    image_urls: image_urls.length ? image_urls : undefined,
                    link: newEntry.link || undefined,
                    tag_ids: newEntry.tag_ids,
                  });
                  if (result.success) {
                    setNewEntry({ acg_category_id: null, title: '', content: '', image_urls_text: '', link: '', tag_ids: [] });
                    setShowAddEntry(false);
                    fetchData();
                  } else alert(result.error || '发布失败');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">标题</label>
                  <input
                    value={newEntry.title}
                    onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="标题"
                    className="w-full bg-[#0a0805] border-b-2 border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none focus:border-[#ff6b9d] font-serif"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">正文（支持 ![](图片链接) 行内插入图片，或单独一行贴图片链接）</label>
                  <textarea
                    value={newEntry.content}
                    onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
                    placeholder="写点什么..."
                    className="w-full bg-[#0a0805] border border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none resize-none h-32 font-serif italic placeholder:text-[#ff6b9d]/40 focus:border-[#ff6b9d]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">图片链接（一行一个，或点上传）</label>
                  <div className="flex gap-2">
                    <textarea
                      value={newEntry.image_urls_text}
                      onChange={e => { setNewEntry({ ...newEntry, image_urls_text: e.target.value }); setUploadError(''); }}
                      placeholder="https://... 或粘贴 Supabase 图片 URL"
                      className="flex-1 bg-[#0a0805] border border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none resize-none h-20 font-mono text-sm placeholder:text-[#ff6b9d]/40 focus:border-[#ff6b9d]"
                    />
                    <label className={`shrink-0 px-3 py-2 border border-[#ff6b9d]/40 text-[#ff6b9d] text-sm cursor-pointer hover:bg-[#ff6b9d]/10 transition-colors font-serif self-start ${uploading ? 'opacity-50' : ''}`}>
                      {uploading ? '上传中' : '上传'}
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleAcgUpload} />
                    </label>
                  </div>
                  {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">外链（可选）</label>
                  <input
                    value={newEntry.link}
                    onChange={e => setNewEntry({ ...newEntry, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#0a0805] border-b-2 border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none font-mono text-sm placeholder:text-[#ff6b9d]/40 focus:border-[#ff6b9d]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">分类</label>
                  <select
                    value={newEntry.acg_category_id || ''}
                    onChange={e => setNewEntry({ ...newEntry, acg_category_id: e.target.value || null })}
                    className="w-full bg-[#0a0805] border-b-2 border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none font-serif focus:border-[#ff6b9d]"
                  >
                    <option value="">不选</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">标签（多选）</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.flatMap(c => c.tags).map(tag => (
                      <label key={tag.id} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newEntry.tag_ids.includes(tag.id)}
                          onChange={e => {
                            const checked = e.target.checked;
                            setNewEntry(prev => ({
                              ...prev,
                              tag_ids: checked ? [...prev.tag_ids, tag.id] : prev.tag_ids.filter(id => id !== tag.id),
                            }));
                          }}
                          className="accent-[#ff6b9d]"
                        />
                        <span className="text-xs text-[#ff6b9d]/80 font-serif">{tag.tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-[#ff6b9d] text-black px-6 py-2 text-sm font-bold hover:bg-[#ff6b9d]/80 transition-colors font-serif">
                    发布 <span className="font-mono">(*´∀`)~♥</span>
                  </button>
                  <button type="button" onClick={() => setShowAddEntry(false)} className="text-[#ff6b9d]/50 hover:text-[#ff6b9d] px-6 py-2 text-sm font-serif">
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto mt-24 pb-12 border-t border-[#ff6b9d]/20 pt-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#ff6b9d]/50 font-serif italic">
          <div>
            <p className="mb-2">"Praise the sun. \\[T]/" — Dark Souls <span className="font-mono">(=´ω`=)</span></p>
            <p className="text-[10px]">— 独立收藏 | 人文精神 | 文化自觉 <span className="font-mono">(≧∀≦)ゞ</span></p>
          </div>
          <div className="text-right">
            <p className="mb-2">ACG ARCHIVE <span className="font-mono">(❛◡❛✿)</span></p>
            <p className="text-[10px]">独立运营 | 非商业 | 纯粹热爱 <span className="font-mono">(๑╹◡╹๑)</span></p>
          </div>
        </div>
      </footer>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(10, 8, 5, 0.95) !important; border-bottom-color: rgba(255, 107, 157, 0.3) !important; }
        aside.fixed { background: rgba(10, 8, 5, 0.95) !important; border-right-color: rgba(255, 107, 157, 0.3) !important; }
        aside.fixed .group\\/item:hover { background: rgba(255, 107, 157, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(255, 107, 157) !important; }
      `}} />
    </div>
  );
}
