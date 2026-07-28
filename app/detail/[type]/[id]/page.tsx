'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { updateDetailContentAction } from '@/app/lib/actions';

interface DetailData {
  id: string;
  title: string;
  date?: string;
  content?: string;
  desc?: string;
  type?: string;
}

const typeConfig: Record<string, { table: string; backUrl: string; backLabel: string; title: string }> = {
  note: {
    table: 'reading_notes',
    backUrl: '/research',
    backLabel: '返回',
    title: '读书笔记'
  },
  article: {
    table: 'my_articles',
    backUrl: '/research',
    backLabel: '返回',
    title: '文章'
  },
  dream: {
    table: 'dream_logs',
    backUrl: '/dreams',
    backLabel: '返回',
    title: '梦境记录'
  },
  diary: {
    table: 'diary_entries',
    backUrl: '/diary',
    backLabel: '返回',
    title: '日记'
  },
  journal: {
    table: 'journal_entries',
    backUrl: '/journal',
    backLabel: '返回',
    title: '日志'
  },
  economy: {
    table: 'economy_articles',
    backUrl: '/economy',
    backLabel: '返回',
    title: '经济学笔记'
  },
  philosophy: {
    table: 'philosophy_entries',
    backUrl: '/philosophy',
    backLabel: '返回',
    title: '哲学条目'
  },
  main: {
    table: 'articles',
    backUrl: '/',
    backLabel: '返回首页',
    title: '文章'
  }
};

export default function UnifiedDetailPage() {
  const params = useParams();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  
  const type = params.type as string;
  const id = params.id as string;
  const config = typeConfig[type];

  useEffect(() => {
    const fetchData = async () => {
      if (!config) {
        setLoading(false);
        return;
      }
      
      const supabase = createClient();
      const { data: result } = await supabase
        .from(config.table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (result) {
        setData(result);
        // articles 表使用 description 字段，其他表使用 content 字段
        setEditContent(result.content || result.description || '');
      }
      setLoading(false);
    };
    
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(!!user);
    };
    
    fetchData();
    checkAuth();
  }, [id, config]);

  const handleSave = async () => {
    if (!config || !data) return;
    setSaving(true);
    const result = await updateDetailContentAction(config.table, data.id, editContent);
    if (result.success) {
      setData({ ...data, content: editContent });
      setIsEditing(false);
    } else {
      alert('保存失败');
    }
    setSaving(false);
  };

  // 暖色深色主题：底 #141210，文 #f5f3f0，辅 #a8a29e，强调 #c4a574
  const bg = '#141210';
  const text = '#f5f3f0';
  const muted = '#a8a29e';
  const accent = '#c4a574';
  const border = '#2c2825';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg, color: text }}>
        <span className="text-sm opacity-60">...</span>
      </div>
    );
  }

  if (!config || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg, color: text }}>
        <Link href={config?.backUrl || '/'} className="text-sm hover:opacity-80 transition-opacity" style={{ color: accent }}>← 返回</Link>
      </div>
    );
  }

  const gold = accent;
  const goldMuted = 'rgba(196,165,116,0.4)';

  const backgroundStyle: React.CSSProperties = {
    background: `radial-gradient(ellipse 120% 80% at 50% -20%, rgba(196,165,116,0.06) 0%, transparent 50%), radial-gradient(ellipse 100% 60% at 80% 100%, rgba(28,26,24,0.8) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 20% 90%, rgba(20,18,16,0.9) 0%, transparent 40%), #141210`,
    color: text
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={backgroundStyle}>
      {/* 正文左侧边栏：静态装饰 */}
      <div className="fixed inset-y-0 left-0 w-32 lg:w-44 xl:w-52 pointer-events-none z-0 hidden md:block" aria-hidden>
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: `linear-gradient(to right, rgba(196,165,116,0.15), transparent)` }} />
        <div className="absolute top-0 bottom-0 right-0 w-[2px] opacity-70" style={{ background: `linear-gradient(to bottom, transparent 0%, ${goldMuted} 20%, ${goldMuted} 80%, transparent 100%)` }} />
        <div className="absolute top-0 bottom-0 right-3 w-px opacity-50" style={{ background: gold }} />
        <div className="absolute top-0 bottom-0 right-6 w-px opacity-40" style={{ background: gold }} />
        <div className="absolute top-0 bottom-0 right-9 w-px opacity-25" style={{ background: gold }} />
        <div className="absolute top-0 bottom-0 right-12 w-px opacity-15" style={{ background: gold }} />
        <div className="absolute top-16 left-2 right-0 h-[2px] opacity-55" style={{ background: `linear-gradient(to right, transparent, ${gold})` }} />
        <div className="absolute top-28 left-4 right-0 h-px opacity-45" style={{ background: gold }} />
        <div className="absolute top-40 left-1 right-2 h-px opacity-40" style={{ background: gold }} />
        <div className="absolute top-56 left-3 right-0 h-[2px] opacity-40" style={{ background: `linear-gradient(to right, ${goldMuted}, transparent)` }} />
        <div className="absolute top-1/3 left-2 right-0 h-px opacity-48" style={{ background: gold }} />
        <div className="absolute top-1/2 left-4 right-0 h-[2px] opacity-42" style={{ background: `linear-gradient(to right, transparent, ${gold})` }} />
        <div className="absolute bottom-1/3 left-1 right-2 h-px opacity-45" style={{ background: gold }} />
        <div className="absolute bottom-28 left-3 right-0 h-[2px] opacity-40" style={{ background: `linear-gradient(to right, transparent, ${goldMuted})` }} />
        <div className="absolute bottom-14 left-2 right-0 h-px opacity-38" style={{ background: gold }} />
        <span className="absolute top-12 left-1/2 -translate-x-1/2 text-base font-serif opacity-55" style={{ color: gold }}>♪</span>
        <span className="absolute top-24 left-4 text-[11px] opacity-45" style={{ color: goldMuted }}>§</span>
        <span className="absolute top-36 left-8 text-[10px] opacity-50" style={{ color: gold }}>♫</span>
        <span className="absolute top-48 left-3 text-[10px] opacity-44" style={{ color: goldMuted }}>•</span>
        <span className="absolute top-2/4 left-1/2 -translate-x-1/2 text-sm font-serif opacity-52" style={{ color: gold }}>♬</span>
        <span className="absolute bottom-1/3 left-6 text-[11px] opacity-48" style={{ color: gold }}>¶</span>
        <span className="absolute bottom-24 left-3 text-[10px] opacity-45" style={{ color: goldMuted }}>◦</span>
        <span className="absolute bottom-12 left-1/2 -translate-x-1/2 text-base font-serif opacity-55" style={{ color: gold }}>♪</span>
        <div className="absolute top-20 right-2 w-2.5 h-2.5 rotate-45 opacity-40" style={{ border: `2px solid ${gold}` }} />
        <div className="absolute top-36 right-5 w-1.5 h-1.5 rotate-45 opacity-32" style={{ background: gold }} />
        <div className="absolute bottom-36 right-3 w-2 h-2 rotate-45 opacity-36" style={{ border: `2px solid ${gold}` }} />
        <div className="absolute bottom-20 right-6 w-1 h-1 rotate-45 opacity-28" style={{ background: gold }} />
      </div>
      {/* 正文右侧边栏：静态装饰 */}
      <div className="fixed inset-y-0 right-0 w-32 lg:w-44 xl:w-52 pointer-events-none z-0 hidden md:block" aria-hidden>
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: `linear-gradient(to left, rgba(196,165,116,0.15), transparent)` }} />
        <div className="absolute top-0 bottom-0 left-0 w-[2px] opacity-70" style={{ background: `linear-gradient(to bottom, transparent 0%, ${goldMuted} 20%, ${goldMuted} 80%, transparent 100%)` }} />
        <div className="absolute top-0 bottom-0 left-3 w-px opacity-50" style={{ background: gold }} />
        <div className="absolute top-0 bottom-0 left-6 w-px opacity-40" style={{ background: gold }} />
        <div className="absolute top-0 bottom-0 left-9 w-px opacity-25" style={{ background: gold }} />
        <div className="absolute top-0 bottom-0 left-12 w-px opacity-15" style={{ background: gold }} />
        <div className="absolute top-16 left-0 right-2 h-[2px] opacity-55" style={{ background: `linear-gradient(to left, transparent, ${gold})` }} />
        <div className="absolute top-28 left-0 right-4 h-px opacity-45" style={{ background: gold }} />
        <div className="absolute top-40 left-2 right-1 h-px opacity-40" style={{ background: gold }} />
        <div className="absolute top-56 left-0 right-3 h-[2px] opacity-40" style={{ background: `linear-gradient(to left, ${goldMuted}, transparent)` }} />
        <div className="absolute top-1/3 left-0 right-2 h-px opacity-48" style={{ background: gold }} />
        <div className="absolute top-1/2 left-0 right-4 h-[2px] opacity-42" style={{ background: `linear-gradient(to left, transparent, ${gold})` }} />
        <div className="absolute bottom-1/3 left-2 right-1 h-px opacity-45" style={{ background: gold }} />
        <div className="absolute bottom-28 left-0 right-3 h-[2px] opacity-40" style={{ background: `linear-gradient(to left, transparent, ${goldMuted})` }} />
        <div className="absolute bottom-14 left-0 right-2 h-px opacity-38" style={{ background: gold }} />
        <span className="absolute top-12 left-1/2 -translate-x-1/2 text-base font-serif opacity-55" style={{ color: gold }}>♪</span>
        <span className="absolute top-24 right-4 text-[11px] opacity-45" style={{ color: goldMuted }}>§</span>
        <span className="absolute top-36 right-8 text-[10px] opacity-50" style={{ color: gold }}>♫</span>
        <span className="absolute top-48 right-3 text-[10px] opacity-44" style={{ color: goldMuted }}>•</span>
        <span className="absolute top-2/4 left-1/2 -translate-x-1/2 text-sm font-serif opacity-52" style={{ color: gold }}>♬</span>
        <span className="absolute bottom-1/3 right-6 text-[11px] opacity-48" style={{ color: gold }}>¶</span>
        <span className="absolute bottom-24 right-3 text-[10px] opacity-45" style={{ color: goldMuted }}>◦</span>
        <span className="absolute bottom-12 left-1/2 -translate-x-1/2 text-base font-serif opacity-55" style={{ color: gold }}>♪</span>
        <div className="absolute top-20 left-2 w-2.5 h-2.5 rotate-45 opacity-40" style={{ border: `2px solid ${gold}` }} />
        <div className="absolute top-36 left-5 w-1.5 h-1.5 rotate-45 opacity-32" style={{ background: gold }} />
        <div className="absolute bottom-36 left-3 w-2 h-2 rotate-45 opacity-36" style={{ border: `2px solid ${gold}` }} />
        <div className="absolute bottom-20 left-6 w-1 h-1 rotate-45 opacity-28" style={{ background: gold }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-12 sm:py-16 md:py-20 w-full box-border">
        {/* 返回：金线 + 文字 */}
        <div className="mb-10 sm:mb-16 flex items-center gap-4">
          <span className="w-8 h-px shrink-0 opacity-60" style={{ background: gold }} aria-hidden />
          <Link
            href={config.backUrl}
            className="text-sm tracking-wide transition-colors hover:opacity-90"
            style={{ color: gold }}
          >
            ← {config.backLabel}
          </Link>
        </div>

        <header className="mb-10 sm:mb-16">
          {/* 元数据：金边标签 */}
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
            {data.date && (
              <span className="px-3 py-1 text-xs tracking-widest rounded-sm border" style={{ color: muted, borderColor: goldMuted }}>
                {data.date}
              </span>
            )}
            {data.type && (
              <span className="px-3 py-1 text-xs tracking-widest rounded-sm border" style={{ color: muted, borderColor: goldMuted }}>
                {data.type}
              </span>
            )}
            {(data as any).num && (
              <span className="px-3 py-1 text-xs tracking-widest rounded-sm border" style={{ color: muted, borderColor: goldMuted }}>
                {(data as any).num}
              </span>
            )}
            {(data as any).tag && (
              <span className="px-3 py-1 text-xs tracking-widest rounded-sm border" style={{ color: gold, borderColor: goldMuted }}>
                {(data as any).tag}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-5 leading-tight font-serif font-normal break-words" style={{ color: text }}>
            {(data as any).en_title || (data as any).zh_title || data.title}
          </h1>

          {(data as any).en_title && (data as any).zh_title && (
            <p className="text-lg mb-4 leading-relaxed" style={{ color: muted }}>
              {(data as any).zh_title}
            </p>
          )}

          {/* 描述做引言区：左侧金线 + 背景 */}
          {data.desc && (
            <div
              className="pl-5 py-4 my-6 rounded-r-sm"
              style={{
                borderLeft: `3px solid ${gold}`,
                background: 'rgba(196,165,116,0.04)',
                color: muted
              }}
            >
              <p className="text-sm leading-relaxed">{data.desc}</p>
            </div>
          )}
        </header>

        {/* 标题与正文之间的金线分隔 */}
        <div className="flex items-center gap-4 mb-10" aria-hidden>
          <span className="flex-1 h-px opacity-40" style={{ background: `linear-gradient(to right, transparent, ${goldMuted})` }} />
          <span className="text-[10px] tracking-[0.3em] uppercase opacity-50" style={{ color: gold }}>正文</span>
          <span className="flex-1 h-px opacity-40" style={{ background: `linear-gradient(to left, transparent, ${goldMuted})` }} />
        </div>

        <article>
          {isEditing ? (
            <div className="space-y-6">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 px-4 py-3 text-sm leading-relaxed outline-none resize-none transition-colors rounded-lg"
                style={{
                  background: 'rgba(44,40,37,0.6)',
                  border: `1px solid ${border}`,
                  color: text
                }}
                placeholder="输入内容..."
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ background: gold, color: bg }}
                >
                  {saving ? '保存中' : '保存'}
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditContent(data.content || (data as any).description || ''); }}
                  className="px-6 py-2.5 rounded-lg text-sm border transition-colors"
                  style={{ borderColor: border, color: muted }}
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              {(data.content || (data as any).description) ? (
                <div
                  className="leading-relaxed whitespace-pre-wrap font-serif pl-4 rounded-r-sm"
                  style={{ fontSize: '20px', lineHeight: '1.9', color: text, borderLeft: `1px solid ${goldMuted}` }}
                >
                  {data.content || (data as any).description}
                </div>
              ) : (
                <p className="text-sm" style={{ color: muted }}>
                  暂无内容
                </p>
              )}

              {isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-12 text-xs transition-colors hover:opacity-80"
                  style={{ color: gold }}
                >
                  编辑
                </button>
              )}
            </>
          )}
        </article>

        {/* 页脚：金线 + 返回 */}
        <footer className="mt-24 pt-12 border-t" style={{ borderColor: goldMuted }}>
          <div className="flex items-center justify-between">
            <span className="w-16 h-px opacity-50" style={{ background: gold }} aria-hidden />
            <Link
              href={config.backUrl}
              className="text-xs tracking-widest uppercase transition-colors hover:opacity-90"
              style={{ color: gold }}
            >
              ← {config.backLabel}
            </Link>
            <span className="w-16 h-px opacity-50" style={{ background: gold }} aria-hidden />
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(20,18,16,0.97) !important; border-bottom-color: ${border} !important; }
        aside.fixed { background: rgba(20,18,16,0.97) !important; border-right-color: ${border} !important; }
        aside.fixed .group\\/item:hover { background: rgba(196,165,116,0.08) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: ${accent} !important; }
      `}} />
    </div>
  );
}
