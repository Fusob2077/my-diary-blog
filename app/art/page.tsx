'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { addArtWorkAction, deleteArtWorkAction } from '@/app/lib/actions';

type ArtCategory = 'painting' | 'article' | 'video' | 'other';

interface ArtWork {
  id: string;
  category: ArtCategory;
  title: string;
  description: string;
  link: string;
  thumbnail: string;
  created_at: string;
}

const categoryLabels: Record<ArtCategory | 'ALL', string> = {
  ALL: '全部',
  painting: '绘画',
  article: '文章',
  video: '视频',
  other: '其他'
};

export default function ArtPage() {
  const [works, setWorks] = useState<ArtWork[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<ArtCategory | 'ALL'>('ALL');
  const [showAdd, setShowAdd] = useState(false);
  /** 点击图片时展示的放大图，不跳转页面 */
  const [lightboxWork, setLightboxWork] = useState<ArtWork | null>(null);
  const [newWork, setNewWork] = useState<{
    category: ArtCategory;
    title: string;
    description: string;
    link: string;
    thumbnail: string;
  }>({ category: 'painting', title: '', description: '', link: '', thumbnail: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchData = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('art_works').select('*').order('created_at', { ascending: false });
    if (data) setWorks(data);
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

  const handleSupabaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    const supabase = createClient();
    const path = `art/${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const { data, error } = await supabase.storage.from('ART').upload(path, file, { cacheControl: '3600', upsert: false });
    setUploading(false);
    e.target.value = '';
    if (error) {
      setUploadError(error.message || '上传失败，请确保 Supabase 已创建 ART 桶');
      return;
    }
    const { data: urlData } = supabase.storage.from('ART').getPublicUrl(data.path);
    setNewWork(prev => ({ ...prev, thumbnail: urlData.publicUrl }));
  };

  const filteredWorks = filter === 'ALL' ? works : works.filter(work => work.category === filter);

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#ff6b9d] p-6 md:p-12 overflow-x-hidden relative" style={{ fontFamily: '"Georgia", "Hiragino Mincho ProN", "Times New Roman", serif' }}>
      {/* 二次元背景：樱花花瓣图案 + 粉青光晕 */}
      <div className="fixed inset-0 pointer-events-none opacity-100" style={{
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q35 15 30 25 Q25 15 30 5' fill='%23ff6b9d' fill-opacity='0.06'/%3E%3Cpath d='M5 30 Q15 35 25 30 Q15 25 5 30' fill='%23ff6b9d' fill-opacity='0.05'/%3E%3C/svg%3E"),
          radial-gradient(ellipse 80% 60% at 85% 85%, rgba(255, 107, 157, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 10% 15%, rgba(57, 197, 187, 0.12) 0%, transparent 50%),
          linear-gradient(180deg, #0a0805 0%, #0d0a07 50%, #120c08 100%)
        `
      }} />

      {/* 飘落的樱花/星星/颜文字 - 二次元装饰 */}
      <div className="fixed top-16 right-20 pointer-events-none z-5 text-[#ff6b9d] text-3xl opacity-60 animate-pulse">✦</div>
      <div className="fixed top-40 right-12 pointer-events-none z-5 text-[#39C5BB] text-2xl opacity-50">☆</div>
      <div className="fixed top-24 left-16 pointer-events-none z-5 text-[#ff6b9d] text-2xl opacity-50">♡</div>
      <div className="fixed bottom-28 left-24 pointer-events-none z-5 text-[#ff6b9d] text-4xl opacity-55">✦</div>
      <div className="fixed bottom-16 right-24 pointer-events-none z-5 text-[#39C5BB] text-xl opacity-45">☆</div>
      <div className="fixed top-1/2 left-8 pointer-events-none z-5 text-[#ff6b9d]/40 text-lg">♡</div>
      {/* 颜文字 */}
      <div className="fixed top-36 left-12 pointer-events-none z-5 text-[#ff6b9d]/50 text-sm font-mono">(●'◡'●)</div>
      <div className="fixed top-1/3 right-16 pointer-events-none z-5 text-[#39C5BB]/45 text-xs font-mono">(´▽`)</div>
      <div className="fixed bottom-36 right-12 pointer-events-none z-5 text-[#ff6b9d]/40 text-xs font-mono">/(ㄒoㄒ)/~~</div>
      <div className="fixed bottom-1/3 left-20 pointer-events-none z-5 text-[#39C5BB]/40 text-sm font-mono">(๑•̀ㅂ•́)و✧</div>
      <div className="fixed top-1/2 right-24 pointer-events-none z-5 text-[#ff6b9d]/45 text-xs font-mono">⁽⁽٩(๑˃̶͈̀ ᗨ ˂̶͈́)۶⁾⁾</div>
      <div className="fixed bottom-1/2 left-16 pointer-events-none z-5 text-[#39C5BB]/40 text-xs font-mono">Σ(°Д°;</div>
      <div className="fixed top-44 left-24 pointer-events-none z-5 text-[#ff6b9d]/40 text-[10px] font-mono">(=´ω`=)</div>
      <div className="fixed bottom-44 right-20 pointer-events-none z-5 text-[#39C5BB]/40 text-[10px] font-mono">(≧∀≦)ゞ</div>
      <div className="fixed top-20 left-1/3 pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">(`┌_┐´)</div>
      <div className="fixed bottom-24 right-1/3 pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">(›´ω`‹ )ε≡(ノ´＿ゝ｀）ノ</div>
      {/* 更多颜文字 */}
      <div className="fixed top-[18%] left-[22%] pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">ξ( ✿＞◡❛)</div>
      <div className="fixed top-[25%] right-[18%] pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">(*´д`)</div>
      <div className="fixed top-[35%] left-[15%] pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">ヾ(*´∀ ˋ*)ﾉ</div>
      <div className="fixed top-[45%] right-[22%] pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">(*'ｰ'*)</div>
      <div className="fixed top-[55%] left-[20%] pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">(*´∀`)~♥</div>
      <div className="fixed top-[65%] right-[15%] pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">ヽ(✿ﾟ▽ﾟ)ノ</div>
      <div className="fixed top-[75%] left-[18%] pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">(๑´ڡ`๑)</div>
      <div className="fixed top-[22%] right-[28%] pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">(❛◡❛✿)</div>
      <div className="fixed top-[52%] left-[28%] pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">(๑´ㅁ`)</div>
      <div className="fixed top-[68%] right-[25%] pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">(❀╹◡╹)</div>
      <div className="fixed top-[38%] right-[32%] pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">（๑ • ‿ • ๑ ）</div>
      <div className="fixed top-[58%] left-[12%] pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">(๑•̀ω•́)ノ</div>
      <div className="fixed top-[32%] left-[35%] pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">(〃∀〃)</div>
      <div className="fixed top-[72%] left-[25%] pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">(๑╹◡╹๑)</div>
      <div className="fixed top-[42%] right-[35%] pointer-events-none z-5 text-[#ff6b9d]/35 text-[10px] font-mono">⸜(* ॑꒳ ॑* )⸝</div>
      <div className="fixed top-[62%] right-[30%] pointer-events-none z-5 text-[#39C5BB]/35 text-[10px] font-mono">(๑•́ ₃ •̀๑)</div>
      <div className="fixed top-[48%] left-[8%] pointer-events-none z-5 text-[#ff6b9d]/30 text-[10px] font-mono">✧*｡٩(ˊᗜˋ*)و✧*｡</div>
      <div className="fixed top-[78%] right-[18%] pointer-events-none z-5 text-[#39C5BB]/30 text-[10px] font-mono">*ଘ(੭*ˊᵕˋ)੭* ੈ✩‧₊˚</div>
      {/* 速度线 - 动漫感 */}
      <div className="fixed top-0 right-0 w-32 h-full pointer-events-none opacity-30" style={{
        background: 'repeating-linear-gradient(105deg, transparent, transparent 4px, rgba(255,107,157,0.08) 4px, rgba(255,107,157,0.08) 6px)',
      }} />
      <div className="fixed bottom-0 left-0 w-24 h-1/2 pointer-events-none opacity-25" style={{
        background: 'repeating-linear-gradient(-75deg, transparent, transparent 3px, rgba(57,197,187,0.1) 3px, rgba(57,197,187,0.1) 5px)',
      }} />

      {/* 二次元角标 - 更醒目 */}
      <div className="fixed top-16 right-8 pointer-events-none z-5">
        <div className="px-3 py-1 bg-[#ff6b9d]/30 border border-[#ff6b9d]/50 rounded-lg text-[#ff6b9d] text-xs font-bold transform -rotate-6 shadow-lg">
          二次元 · 創作
        </div>
      </div>
      <div className="fixed bottom-16 left-8 pointer-events-none z-5">
        <div className="px-3 py-1 bg-[#39C5BB]/25 border border-[#39C5BB]/50 rounded-lg text-[#39C5BB] text-xs font-bold transform rotate-6 shadow-lg">
          作品集
        </div>
      </div>

      {/* 页头 - 动漫风格：星形装饰 + 双色渐变标题 */}
      <header className="max-w-7xl mx-auto mb-14 relative z-10 overflow-visible">
        <div className="pb-6 border-b-2 border-[#ff6b9d]/40 mb-8 relative overflow-visible">
          {/* 动漫式横幅装饰 */}
          <div className="absolute -top-2 left-0 flex gap-2 text-[#ff6b9d]/60 text-sm">
            <span>★</span><span>★</span><span>★</span><span className="font-mono text-[10px]">ヽ(✿ﾟ▽ﾟ)ノ</span>
          </div>
          <div className="absolute -top-2 right-0 flex gap-2 text-[#39C5BB]/50 text-sm items-center">
            <span className="font-mono text-[10px]">(❛◡❛✿)</span><span>☆</span><span>☆</span><span>☆</span>
          </div>
          <div className="flex items-baseline gap-4 mb-4 flex-wrap pr-4">
            <h1 className="text-6xl md:text-8xl font-black italic inline-block pr-2" style={{
              fontFamily: '"Georgia", serif',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 50%, #39C5BB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.02em',
              filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.4))'
            }}>
              产出
            </h1>
            <span className="px-2 py-0.5 bg-[#ff6b9d]/20 border border-[#ff6b9d]/50 rounded text-[#ff6b9d] text-sm font-bold transform -rotate-3">
              にじげん
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-base text-[#ff6b9d]/80 italic font-serif leading-relaxed max-w-2xl">
              "把想法做出来，比想清楚更重要。"
            </p>
            <p className="text-sm text-[#ff6b9d]/60 font-serif italic flex items-center gap-2 flex-wrap">
              <span className="text-[#ff6b9d]">♡</span> 绘画、文章、视频……用爱发电 <span className="text-[#ff6b9d]/50 font-mono text-xs">⁽⁽٩(๑˃̶͈̀ ᗨ ˂̶͈́)۶⁾⁾</span>
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#ff6b9d]/50 font-serif flex-wrap">
            <span>共 <span className="text-[#ff6b9d] font-bold">{filteredWorks.length}</span> 件</span>
            <span className="text-[#39C5BB]">✦</span>
            <span className="italic">按分类筛选</span>
            <span className="font-mono text-[#39C5BB]/40">Σ(°Д°;</span>
          </div>
        </div>
      </header>

      {/* 分类筛选 - 动漫标签风格 */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-wrap gap-4 items-center relative z-10">
        <span className="text-xs text-[#ff6b9d]/40 font-mono mr-2">✦ 筛选</span>
        {(['ALL', 'painting', 'article', 'video', 'other'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-serif italic transition-all duration-300 ${
              filter === cat
                ? 'bg-[#ff6b9d]/20 text-[#ff6b9d] border border-[#ff6b9d]/50 shadow-[0_0_12px_rgba(255,107,157,0.2)]'
                : 'bg-transparent text-[#ff6b9d]/60 border border-[#ff6b9d]/20 hover:text-[#ff6b9d] hover:border-[#ff6b9d]/40'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
        {isAdmin && (
          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto px-5 py-2 rounded-full border-2 border-dashed border-[#39C5BB]/40 text-[#39C5BB]/80 hover:text-[#39C5BB] hover:border-[#39C5BB] transition-all font-serif italic text-sm"
          >
            + 添加作品
          </button>
        )}
      </div>

      {/* 作品网格 - 二次元卡片风格（圆角、光晕、丝带标签）；点击图片为放大查看，不再整卡跳转 */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {filteredWorks.map((work, index) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
            className="group relative bg-[#1a0f0a] border-2 border-[#ff6b9d]/30 p-0 overflow-hidden rounded-xl hover:border-[#ff6b9d]/70 hover:shadow-[0_0_24px_rgba(255,107,157,0.15)] transition-all duration-500"
            style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,107,157,0.08)',
              transform: index % 3 === 0 ? 'rotate(0.3deg)' : index % 3 === 1 ? 'rotate(-0.4deg)' : 'rotate(0.2deg)'
            }}
          >
            {/* 二次元丝带式分类标签（右上角） */}
            <div className="absolute top-3 -right-8 px-10 py-1.5 bg-[#ff6b9d] text-[#0a0805] text-[10px] font-bold transform rotate-45 z-10 shadow-lg border-b border-[#ff6b9d]/50" style={{ fontFamily: 'sans-serif' }}>
              {categoryLabels[work.category]}
            </div>

            {/* 悬停时的小星星 */}
            <div className="absolute top-4 right-4 text-[#39C5BB]/0 group-hover:text-[#39C5BB]/60 text-lg transition-all duration-300 z-10">☆</div>

            {/* 有外链时显示“打开外链”，不再整卡是链接 */}
            {work.link ? (
              <a
                href={work.link}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 text-[#ff6b9d]/60 hover:text-[#ff6b9d] text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 font-serif italic"
              >
                打开外链 →
              </a>
            ) : (
              <div className="absolute bottom-4 right-4 text-[#ff6b9d]/20 text-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">→</div>
            )}

            {isAdmin && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm(`删除「${work.title}」？`)) {
                    const result = await deleteArtWorkAction(work.id);
                    if (result.success) fetchData();
                  }
                }}
                className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-serif z-10"
              >
                删除
              </button>
            )}

            {/* 图片区域 - 点击打开放大图，不跳转、不刷新 */}
            <div
              className="aspect-[4/3] overflow-hidden border-b border-[#ff6b9d]/20 rounded-t-[10px] cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (work.thumbnail) setLightboxWork(work);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && work.thumbnail) { e.preventDefault(); setLightboxWork(work); } }}
              aria-label={`查看大图：${work.title}`}
            >
              {work.thumbnail ? (
                // 禁止图片默认行为，避免被当成链接或触发刷新
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#ff6b9d]/30 text-sm italic gap-2">
                  <span className="text-2xl opacity-50">✦</span>
                  {categoryLabels[work.category]}
                </div>
              )}
            </div>

            {/* 内容区域 */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#ff6b9d] mb-2 italic font-serif group-hover:text-[#ff8fab] transition-colors" style={{
                textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                transform: 'rotate(-0.5deg)'
              }}>
                {work.title}
              </h3>
              <p className="text-xs text-[#39C5BB]/70 font-serif italic mb-2">{categoryLabels[work.category]}</p>
              {work.description && (
                <p className="text-sm text-[#ff6b9d]/70 leading-relaxed font-serif italic line-clamp-2">
                  {work.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {filteredWorks.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <div className="text-5xl mb-4 opacity-60">✦ ♡ ☆</div>
            <p className="text-[#ff6b9d]/70 text-lg font-serif italic mb-2">暂无作品 <span className="font-mono text-[#ff6b9d]/50">/(ㄒoㄒ)/~~</span></p>
            <p className="text-sm text-[#ff6b9d]/50 font-serif italic mb-2">切换分类或添加新作品～ <span className="font-mono">(๑╹◡╹๑)</span></p>
            <p className="font-mono text-[#ff6b9d]/30 text-xs mt-4">✧*｡٩(ˊᗜˋ*)و✧*｡  (๑•̀ω•́)ノ  (❀╹◡╹)</p>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pb-12 pt-6 relative z-10">
        <div className="flex flex-col items-center gap-1 text-[10px] text-[#ff6b9d]/40 font-serif italic">
          <p>"做出来，才算数" ♡ <span className="font-mono text-[#ff6b9d]/35">(=´ω`=)</span></p>
          <p className="text-[#39C5BB]/30">产出 · 用爱发电 · 非商业 <span className="font-mono">(≧∀≦)ゞ</span></p>
        </div>
      </footer>

      {/* 放大图 lightbox：点击图片后在此查看大图，不跳转页面 */}
      {lightboxWork && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={() => setLightboxWork(null)}
          role="dialog"
          aria-modal="true"
          aria-label="查看大图"
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxWork.thumbnail}
              alt={lightboxWork.title}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl border-2 border-[#ff6b9d]/30"
            />
            <div className="mt-4 flex items-center gap-4 flex-wrap justify-center">
              <p className="text-[#ff6b9d] font-serif italic text-lg">{lightboxWork.title}</p>
              {lightboxWork.link ? (
                <a
                  href={lightboxWork.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#ff6b9d]/20 text-[#ff6b9d] border border-[#ff6b9d]/50 text-sm font-serif hover:bg-[#ff6b9d]/30 transition-colors"
                >
                  打开外链
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setLightboxWork(null)}
                className="px-4 py-2 rounded-full border border-[#ff6b9d]/40 text-[#ff6b9d]/80 hover:text-[#ff6b9d] hover:border-[#ff6b9d]/60 text-sm font-serif transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加弹窗 - 二次元风格 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setShowAdd(false)}>
          <div className="bg-[#1a0f0a] border-2 border-[#ff6b9d] w-full max-w-md p-8 rounded-xl" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 4px 24px rgba(255, 107, 157, 0.25), 0 0 0 1px rgba(57, 197, 187, 0.1)' }}>
            <div className="flex items-center gap-2 text-sm text-[#ff6b9d]/80 font-serif italic mb-4">
              <span className="text-[#39C5BB]/60">✦</span> 添加作品
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await addArtWorkAction(newWork);
                if (result.success) {
                  setNewWork({ category: 'painting', title: '', description: '', link: '', thumbnail: '' });
                  setShowAdd(false);
                  fetchData();
                } else alert('添加失败');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">分类</label>
                <select value={newWork.category} onChange={e => setNewWork({ ...newWork, category: e.target.value as ArtCategory })} className="w-full bg-[#0a0805] border-b-2 border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none focus:border-[#ff6b9d] transition-colors font-serif">
                  <option value="painting">绘画</option>
                  <option value="article">文章</option>
                  <option value="video">视频</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">标题</label>
                <input placeholder="作品标题" value={newWork.title} onChange={e => setNewWork({ ...newWork, title: e.target.value })} className="w-full bg-[#0a0805] border-b-2 border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none focus:border-[#ff6b9d] transition-colors font-serif placeholder:text-[#ff6b9d]/40" required />
              </div>
              <div>
                <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">描述</label>
                <textarea placeholder="可选..." value={newWork.description} onChange={e => setNewWork({ ...newWork, description: e.target.value })} className="w-full bg-[#0a0805] border border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none resize-none h-20 font-serif italic placeholder:text-[#ff6b9d]/40 focus:border-[#ff6b9d] transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">外链</label>
                <input placeholder="https://..." value={newWork.link} onChange={e => setNewWork({ ...newWork, link: e.target.value })} className="w-full bg-[#0a0805] border-b-2 border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none font-mono text-sm placeholder:text-[#ff6b9d]/40 focus:border-[#ff6b9d] transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-[#ff6b9d]/50 font-serif italic mb-1">缩略图</label>
                <div className="flex gap-2">
                  <input placeholder="图片 URL" value={newWork.thumbnail} onChange={e => { setNewWork({ ...newWork, thumbnail: e.target.value }); setUploadError(''); }} className="flex-1 bg-[#0a0805] border-b-2 border-[#ff6b9d]/40 text-[#ff6b9d] p-2 outline-none font-mono text-sm placeholder:text-[#ff6b9d]/40 focus:border-[#ff6b9d] transition-colors" />
                  <label className={`shrink-0 px-3 py-2 border border-[#ff6b9d]/40 text-[#ff6b9d] text-sm cursor-pointer hover:bg-[#ff6b9d]/10 transition-colors font-serif ${uploading ? 'opacity-50' : ''}`}>
                    {uploading ? '上传中' : '上传'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleSupabaseUpload} />
                  </label>
                </div>
                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-[#ff6b9d] text-black px-6 py-2 text-sm font-bold rounded-full hover:bg-[#ff8fab] hover:shadow-[0_0_16px_rgba(255,107,157,0.4)] transition-all font-serif">
                  创建 <span className="font-mono">(*´∀`)~♥</span>
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="text-[#ff6b9d]/50 hover:text-[#ff6b9d] px-6 py-2 text-sm font-serif rounded-full border border-[#ff6b9d]/30 hover:border-[#ff6b9d]/50 transition-colors">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

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
