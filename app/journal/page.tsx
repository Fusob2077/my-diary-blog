'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { addJournalEntryAction, deleteJournalEntryAction } from '@/app/lib/actions';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  tag: string;
  created_at: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', date: '', time: '', tag: 'THOUGHT' });

  const fetchData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(!!user);
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('TERMINATE_DATA_PERMANENTLY?')) return;
    try {
      await deleteJournalEntryAction(id); 
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getDatesWithEntries = () => {
    const dates = new Set<string>();
    entries.forEach(entry => {
      const dateStr = entry.date || new Date(entry.created_at).toISOString().split('T')[0];
      dates.add(dateStr);
    });
    return dates;
  };

  const datesWithEntries = getDatesWithEntries();

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const hasEntryOnDate = (date: Date): boolean => {
    return datesWithEntries.has(formatDate(date));
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const filteredEntries = entries.filter(e => {
    const matchesFilter = filter === 'ALL' || e.tag === filter;
    const matchesSearch = (e.title + e.content).toLowerCase().includes(search.toLowerCase());
    
    let matchesDate = true;
    if (selectedDate) {
      const raw = e.date || new Date(e.created_at).toISOString().split('T')[0];
      const entryDate = raw.slice(0, 10);
      const selectedDateStr = formatDate(selectedDate);
      matchesDate = entryDate === selectedDateStr;
    }
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  // 生成随机旋转角度
  const getRandomRotation = (index: number) => {
    const rotations = [-2, -1, 0, 1, 2, -1.5, 1.5];
    return rotations[index % rotations.length];
  };

  // 生成随机颜色
  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'THOUGHT': '#ff6b9d',
      'WORK': '#4ecdc4',
      'LIFE': '#ffe66d',
      'default': '#a8e6cf'
    };
    return colors[tag] || colors['default'];
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center animate-pulse">
        <div className="text-6xl mb-4 animate-spin" style={{ transform: 'rotate(45deg)' }}>◊</div>
        <p className="text-[10px] font-mono tracking-[0.5em] text-[#888888] uppercase">LOADING_CHAOS...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans antialiased px-4 md:px-8 overflow-x-hidden relative">
      {/* 动态背景 - 流动的线条 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.1]">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          background: `
            repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255, 107, 157, 0.1) 100px, rgba(255, 107, 157, 0.1) 101px),
            repeating-linear-gradient(-45deg, transparent, transparent 100px, rgba(78, 205, 196, 0.1) 100px, rgba(78, 205, 196, 0.1) 101px)
          `
        }}></div>
      </div>

      {/* 随机漂浮的装饰元素 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05]">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#ff6b9d] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out ${Math.random() * 5}s infinite`
            }}
          ></div>
        ))}
      </div>

      {/* 顶部控制面板（含日历）— 图层在日志列表上方 */}
      <div className={`max-w-[1600px] mx-auto mb-16 relative pt-8 ${showCalendar ? 'z-[105]' : 'z-20'}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          {/* 标题区域 - 倾斜设计 */}
          <div className="space-y-4" style={{ transform: 'rotate(-1deg)' }}>
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b9d] via-[#4ecdc4] to-[#ffe66d] italic" style={{
              letterSpacing: '-0.05em',
              textShadow: '0 0 30px rgba(255, 107, 157, 0.3)',
              WebkitTextStroke: '2px rgba(255, 107, 157, 0.3)',
              WebkitTextFillColor: 'transparent'
            }}>
              JOURNAL
            </h1>
            <div className="flex items-center gap-4 text-[9px] font-mono text-[#666666] uppercase tracking-wider">
              <span className="px-3 py-1 bg-[#ff6b9d]/20 border border-[#ff6b9d]/30 rounded-full">
                {entries.length} ENTRIES
              </span>
              <span className="px-3 py-1 bg-[#4ecdc4]/20 border border-[#4ecdc4]/30 rounded-full">
                {filteredEntries.length} FILTERED
              </span>
            </div>
          </div>
          
          {/* 控制按钮 - 不规则排列 */}
          <div className="flex flex-wrap gap-4 items-end" style={{ transform: 'rotate(0.5deg)' }}>
            {/* 标签过滤器 - 彩色按钮 */}
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'THOUGHT', 'WORK', 'LIFE'].map((t, idx) => (
                <button 
                  key={t} 
                  onClick={() => setFilter(t)} 
                  className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all rounded-full border-2 ${
                    filter === t 
                      ? `bg-[${getTagColor(t)}] text-black border-[${getTagColor(t)}] shadow-lg` 
                      : `bg-transparent text-[${getTagColor(t)}] border-[${getTagColor(t)}]/30 hover:border-[${getTagColor(t)}] hover:bg-[${getTagColor(t)}]/10`
                  }`}
                  style={{
                    backgroundColor: filter === t ? getTagColor(t) : 'transparent',
                    color: filter === t ? '#000' : getTagColor(t),
                    borderColor: filter === t ? getTagColor(t) : `${getTagColor(t)}30`,
                    transform: `rotate(${idx % 2 === 0 ? -2 : 2}deg)`,
                    boxShadow: filter === t ? `0 0 20px ${getTagColor(t)}50` : 'none'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* 日历：点日期筛选当天日志，选中有反馈 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest bg-[#ffe66d]/20 border-2 border-[#ffe66d]/50 text-[#ffe66d] rounded-full hover:bg-[#ffe66d]/30 transition-all"
                style={{ transform: 'rotate(-1deg)' }}
              >
                📅 CALENDAR {selectedDate ? `· ${formatDate(selectedDate)}` : ''}
              </button>
              {selectedDate && (
                <span className="ml-2 text-[9px] text-[#4ecdc4] font-mono">{filteredEntries.length} 条当天</span>
              )}
              
              {showCalendar && (
                <div 
                  className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border-2 border-[#4ecdc4]/50 rounded-lg p-4 shadow-2xl" 
                  style={{ minWidth: '320px', transform: 'rotate(0.5deg)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[9px] text-[#4ecdc4]/80 mb-3 font-mono">点击日期 → 只显示当天日志</p>
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="text-[#4ecdc4] hover:text-[#4ecdc4] text-lg font-bold"
                    >
                      ‹
                    </button>
                    <div className="text-[11px] font-bold text-[#4ecdc4] uppercase tracking-wider">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="text-[#4ecdc4] hover:text-[#4ecdc4] text-lg font-bold"
                    >
                      ›
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                      <div key={`day-${idx}`} className="text-[9px] font-bold text-[#666666] text-center py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((date, idx) => {
                      if (!date) {
                        return <div key={idx} className="h-8"></div>;
                      }
                      
                      const dateStr = formatDate(date);
                      const isToday = dateStr === formatDate(new Date());
                      const hasEntry = hasEntryOnDate(date);
                      const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
                      
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleDateClick(date)}
                          className={`h-8 text-[10px] font-bold transition-all rounded ${
                            isSelected
                              ? 'bg-[#4ecdc4] text-black'
                              : hasEntry
                                ? 'bg-[#4ecdc4]/30 text-[#4ecdc4] hover:bg-[#4ecdc4]/50'
                                : 'text-[#666666] hover:bg-[#2a2a2a]'
                          } ${isToday ? 'ring-2 ring-[#ffe66d]' : ''}`}
                        >
                          {date.getDate()}
                          {hasEntry && !isSelected && (
                            <span className="block w-1 h-1 bg-[#4ecdc4] rounded-full mx-auto mt-0.5"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedDate && (
                    <button
                      onClick={clearDateFilter}
                      className="mt-4 w-full text-[9px] font-bold text-[#666666] hover:text-[#4ecdc4] uppercase tracking-widest py-2 border border-[#4ecdc4]/30 hover:border-[#4ecdc4] rounded transition-all"
                    >
                      CLEAR FILTER
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* 搜索框 */}
            <div className="relative" style={{ transform: 'rotate(1deg)' }}>
              <input 
                type="text" 
                placeholder="SEARCH..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="bg-[#1a1a1a] border-2 border-[#ff6b9d]/30 w-full md:w-48 py-2 px-4 text-[10px] font-bold text-[#e0e0e0] outline-none focus:border-[#ff6b9d] transition-all placeholder:text-[#666666] rounded-full"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-2 text-[#ff6b9d] hover:text-[#ff6b9d] text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 管理员添加表单 */}
      {isAdmin && (
        <div className="max-w-[1600px] mx-auto mb-12 relative z-10">
          {showAdd ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const now = new Date();
                const dateStr = newEntry.date || now.toISOString().split('T')[0];
                const timeStr = newEntry.time || now.toTimeString().slice(0, 5);
                
                const result = await addJournalEntryAction({
                  ...newEntry,
                  date: dateStr,
                  time: timeStr
                });
                
                if (result.success) {
                  setNewEntry({ title: '', content: '', date: '', time: '', tag: 'THOUGHT' });
                  setShowAdd(false);
                  fetchData();
                } else {
                  alert('添加失败: ' + (result.error || '未知错误'));
                }
              }}
              className="bg-[#1a1a1a] border-4 border-[#ff6b9d]/40 rounded-xl p-6 space-y-4"
              style={{ boxShadow: '0 0 30px rgba(255, 107, 157, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#ff6b9d] uppercase tracking-wider">NEW ENTRY</h3>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="text-[#666] hover:text-[#ff6b9d] text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="标题"
                  value={newEntry.title}
                  onChange={e => setNewEntry({...newEntry, title: e.target.value})}
                  className="bg-[#0a0a0a] border-2 border-[#ff6b9d]/30 rounded-lg px-4 py-2 text-[#e0e0e0] outline-none focus:border-[#ff6b9d] transition-all"
                  required
                />
                <select
                  value={newEntry.tag}
                  onChange={e => setNewEntry({...newEntry, tag: e.target.value})}
                  className="bg-[#0a0a0a] border-2 border-[#ff6b9d]/30 rounded-lg px-4 py-2 text-[#e0e0e0] outline-none focus:border-[#ff6b9d] transition-all"
                >
                  <option value="THOUGHT">THOUGHT</option>
                  <option value="WORK">WORK</option>
                  <option value="LIFE">LIFE</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={e => setNewEntry({...newEntry, date: e.target.value})}
                  className="bg-[#0a0a0a] border-2 border-[#ff6b9d]/30 rounded-lg px-4 py-2 text-[#e0e0e0] outline-none focus:border-[#ff6b9d] transition-all"
                />
                <input
                  type="time"
                  value={newEntry.time}
                  onChange={e => setNewEntry({...newEntry, time: e.target.value})}
                  className="bg-[#0a0a0a] border-2 border-[#ff6b9d]/30 rounded-lg px-4 py-2 text-[#e0e0e0] outline-none focus:border-[#ff6b9d] transition-all"
                />
              </div>
              
              <textarea
                placeholder="内容"
                value={newEntry.content}
                onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                className="w-full bg-[#0a0a0a] border-2 border-[#ff6b9d]/30 rounded-lg px-4 py-2 text-[#e0e0e0] outline-none focus:border-[#ff6b9d] transition-all resize-none h-32"
                required
              />
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#ff6b9d] text-black font-bold uppercase tracking-wider hover:bg-[#4ecdc4] transition-colors rounded-lg"
                >
                  ADD
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-6 py-2 border-2 border-[#ff6b9d]/30 text-[#666] hover:text-[#ff6b9d] hover:border-[#ff6b9d] transition-colors rounded-lg font-bold"
                >
                  CANCEL
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full border-4 border-dashed border-[#ff6b9d]/40 rounded-xl py-6 text-[#ff6b9d]/60 hover:text-[#ff6b9d] hover:border-[#ff6b9d]/60 transition-all duration-300 flex items-center justify-center gap-2 font-bold uppercase tracking-wider"
            >
              <span className="text-xl">+</span>
              <span>NEW ENTRY</span>
            </button>
          )}
        </div>
      )}

      {/* 主内容区 - 日志列表（图层在日历下方） */}
      <main className="max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEntries.map((entry, index) => {
            const rotation = getRandomRotation(index);
            const tagColor = getTagColor(entry.tag);
            const isHovered = hoveredCard === entry.id;
            
            return (
              <article 
                key={entry.id}
                onMouseEnter={() => setHoveredCard(entry.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative transition-all duration-500"
                style={{
                  transform: `rotate(${rotation}deg) ${isHovered ? 'scale(1.05) rotate(0deg)' : ''}`,
                  animation: `cardFlyIn 0.8s ease-out ${index * 100}ms forwards`,
                  opacity: 0
                }}
              >
                {/* 卡片主体 - 不规则形状 */}
                <div 
                  className="relative p-6 border-4 rounded-lg transition-all duration-500"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: `${tagColor}40`,
                    boxShadow: isHovered 
                      ? `0 20px 60px ${tagColor}30, inset 0 0 20px ${tagColor}10` 
                      : `0 4px 20px rgba(0,0,0,0.3)`,
                    clipPath: isHovered ? 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)' : 'polygon(2% 0%, 98% 0%, 100% 98%, 0% 100%)'
                  }}
                >
                  {/* 彩色边框光效 */}
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(45deg, ${tagColor}20, transparent, ${tagColor}20)`,
                      filter: 'blur(10px)'
                    }}
                  ></div>

                  {/* 元数据头部 */}
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: tagColor }}>
                        {entry.date}
                      </p>
                      <p className="text-[8px] text-[#666666] font-mono">{entry.time}</p>
                    </div>
                    <span 
                      className="px-3 py-1 text-[8px] font-bold uppercase tracking-wider rounded-full border-2"
                      style={{
                        backgroundColor: `${tagColor}20`,
                        borderColor: tagColor,
                        color: tagColor
                      }}
                    >
                      {entry.tag}
                    </span>
                  </div>

                  {/* 标题 - 渐变文字 */}
                  <h2 
                    className="text-xl font-black mb-4 leading-tight transition-all duration-300 group-hover:scale-105 relative z-10"
                    style={{
                      background: `linear-gradient(135deg, ${tagColor}, #e0e0e0)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: `0 0 20px ${tagColor}30`
                    }}
                  >
                    {entry.title}
                  </h2>
                  
                  {/* 内容 */}
                  <p className="text-sm leading-relaxed text-[#888888] font-light line-clamp-4 group-hover:text-[#999999] transition-colors duration-300 relative z-10 mb-6">
                    {entry.content}
                  </p>

                  {/* 交互底部 */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#404040] relative z-10">
                    <Link 
                      href={`/detail/journal/${entry.id}`}
                      className="text-[9px] font-bold uppercase tracking-wider transition-all group-hover:tracking-[0.4em] relative"
                      style={{ color: tagColor }}
                    >
                      <span className="relative z-10">READ →</span>
                      <span 
                        className="absolute bottom-0 left-0 w-0 h-[2px] group-hover:w-full transition-all duration-300"
                        style={{ backgroundColor: tagColor }}
                      ></span>
                    </Link>
                    
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="text-[8px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest px-2 py-1 border border-transparent hover:border-red-400 rounded-full"
                      >
                        DEL
                      </button>
                    )}
                  </div>

                  {/* 装饰性元素 */}
                  <div 
                    className="absolute top-2 right-2 w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{
                      background: `radial-gradient(circle, ${tagColor}, transparent)`,
                      borderRadius: '50%',
                      filter: 'blur(4px)'
                    }}
                  ></div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-40 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="text-[120px] font-black" style={{ 
                background: 'linear-gradient(135deg, #ff6b9d, #4ecdc4, #ffe66d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transform: 'rotate(-5deg)'
              }}>∅</div>
            </div>
            <p className="text-[10px] font-bold text-[#666666] tracking-[1em] uppercase relative z-10">NO_ENTRIES_FOUND</p>
            <p className="text-[9px] text-[#555555] mt-4 tracking-widest">Try adjusting your filters</p>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="max-w-[1600px] mx-auto mt-32 pb-16 pt-12 flex justify-between items-center text-[8px] font-bold text-[#666666] uppercase tracking-wider relative z-10">
        <div className="flex items-center gap-4">
          <span>END_OF_ARCHIVE</span>
          <span className="text-[#404040]">|</span>
          <span>{filteredEntries.length} DISPLAYED</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="w-2 h-2 rounded-full bg-[#4ecdc4] animate-pulse"></span>
          <span>SYSTEM_ONLINE</span>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes cardFlyIn {
          from { 
            opacity: 0; 
            transform: translateY(50px) rotate(10deg) scale(0.8); 
            filter: blur(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) rotate(var(--rotation, 0deg)) scale(1); 
            filter: blur(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(5px); }
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(10, 10, 10, 0.95) !important; border-bottom-color: rgba(255, 107, 157, 0.3) !important; }
        aside.fixed { background: rgba(10, 10, 10, 0.95) !important; border-right-color: rgba(78, 205, 196, 0.3) !important; }
        aside.fixed .group\\/item:hover { background: rgba(255, 107, 157, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(255, 107, 157) !important; }
      `}} />
      
      {/* 点击外部关闭日历：遮罩在日志列表之上、在控制面板(含日历)之下 */}
      {showCalendar && (
        <div 
          className="fixed inset-0 z-[100]" 
          onClick={() => setShowCalendar(false)}
          aria-hidden
        />
      )}
    </div>
  );
}
