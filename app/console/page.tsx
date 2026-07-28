'use client'

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { toggleSubTaskAction, addMegaTaskAction, deleteMegaTaskAction, updateMegaTaskAction, addSubTaskAction, deleteSubTaskAction, updateSubTaskAction } from '../lib/actions';

interface SubTask {
  id: string;
  mega_task_id: string;
  label: string;
  completed: boolean;
}

interface MegaTask {
  id: string;
  title: string;
  date: string;
  note: string;
  completed: boolean;
  subtasks: SubTask[];
}

export default function ConsoleBoard() {
  const [tasks, setTasks] = useState<MegaTask[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', date: '', note: '' });

  const fetchData = async () => {
    const supabase = createClient();
    const { data: megaTasks } = await supabase.from('mega_tasks').select('*').order('created_at', { ascending: false });
    const { data: subTasks } = await supabase.from('sub_tasks').select('*');
    
    const tasksWithSubs = megaTasks?.map(mega => ({
      ...mega,
      subtasks: subTasks?.filter(sub => sub.mega_task_id === mega.id) || []
    })) || [];
    
    setTasks(tasksWithSubs);
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

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const allSubs = tasks.flatMap(m => m.subtasks || []);
    const totalSubs = allSubs.length;
    const completedSubs = allSubs.filter(s => s.completed).length;
    return { totalTasks, completedTasks, taskPercent, totalSubs, completedSubs };
  }, [tasks]);

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = !task.completed;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));
  };

  const toggleSubTask = async (megaId: string, subId: string) => {
    const mega = tasks.find(m => m.id === megaId);
    const sub = mega?.subtasks.find(s => s.id === subId);
    if (!sub) return;

    const newStatus = !sub.completed;
    setTasks(prev => prev.map(m => 
      m.id === megaId 
        ? { ...m, subtasks: m.subtasks.map(s => s.id === subId ? { ...s, completed: newStatus } : s) }
        : m
    ));

    const result = await toggleSubTaskAction(subId, newStatus);
    if (!result.success) {
      setTasks(prev => prev.map(m => 
        m.id === megaId 
          ? { ...m, subtasks: m.subtasks.map(s => s.id === subId ? { ...s, completed: !newStatus } : s) }
          : m
      ));
      if (result.error?.includes('Unauthorized')) {
        alert('游客模式：无法修改');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#94a3b8] p-4 md:p-8 overflow-hidden relative" style={{ fontFamily: '"Courier New\", monospace' }}>
      {/* 故障艺术背景效果 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.1]" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100, 116, 139, 0.1) 2px, rgba(100, 116, 139, 0.1) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(148, 163, 184, 0.05) 2px, rgba(148, 163, 184, 0.05) 4px)
        `,
      }} />
      
      {/* 扫描线效果 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(100, 116, 139, 0.1) 1px, rgba(100, 116, 139, 0.1) 2px)`,
      }} />

      {/* 故障边框装饰 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-2 border-2 border-[#94a3b8]/30" style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}></div>
        <div className="absolute inset-4 border border-[#cbd5e1]/20" style={{ clipPath: 'polygon(2% 0, 100% 2%, 100% 100%, 0 98%)' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 朋克风格头部 */}
        <header className="mb-8 pb-6 border-b-2 border-[#94a3b8] relative">
          <div className="absolute -top-2 left-0 text-[#cbd5e1] text-xs font-bold rotate-[-5deg] opacity-60">
            ⚡ REBEL SYSTEM ⚡
          </div>
          <div className="flex items-end justify-between mb-3">
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-black text-[#94a3b8] mb-2" style={{ 
                fontFamily: '"Impact\", \"Arial Black\", sans-serif',
                transform: 'rotate(-1deg)',
                letterSpacing: '0.05em'
              }}>
                CONSOLE
              </h1>
              <div className="absolute -bottom-1 left-2 text-[#cbd5e1] text-xs font-bold rotate-[3deg]">
                [PUNK MODE ACTIVATED]
              </div>
              <p className="text-sm text-[#888888] mt-2 font-mono">任务管理系统</p>
            </div>
            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#94a3b8]">
                <span className="w-2 h-2 bg-[#94a3b8] animate-pulse"></span>
                <span>TASKS: <span className="text-[#cbd5e1]">{stats.totalTasks}</span></span>
              </div>
              <div className="flex items-center gap-2 text-[#cbd5e1]">
                <span className="w-2 h-2 bg-[#cbd5e1] animate-pulse"></span>
                <span>DONE: <span className="text-[#94a3b8]">{stats.completedTasks}</span> ({stats.taskPercent}%)</span>
              </div>
              <div className="flex items-center gap-2 text-[#94a3b8]">
                <span className="w-2 h-2 bg-[#94a3b8] animate-pulse"></span>
                <span>SUBS: <span className="text-[#cbd5e1]">{stats.completedSubs}/{stats.totalSubs}</span></span>
              </div>
            </div>
          </div>
        </header>

        {/* 管理员添加任务 - 朋克风格 */}
        {isAdmin && (
          <div className="mb-8 bg-[#1e293b] border-2 border-[#94a3b8] p-6 relative" style={{ boxShadow: '0 0 20px rgba(100, 116, 139, 0.15)' }}>
            <div className="absolute -top-2 -left-2 bg-[#374151] text-[#e5e7eb] text-xs font-bold px-2 py-1 rotate-[-5deg]">
              NEW TASK
            </div>
            {showAddTask ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const result = await addMegaTaskAction(newTask);
                  if (result.success) {
                    setNewTask({ title: '', date: '', note: '' });
                    setShowAddTask(false);
                    fetchData();
                  } else {
                    alert('错误: ' + (result.error || '未知错误'));
                  }
                }}
                className="space-y-4 mt-4"
              >
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-[#94a3b8] mb-1 block font-bold">任务标题</label>
                    <input 
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      className="w-full bg-slate-900 border-2 border-[#94a3b8] px-3 py-2 text-[#94a3b8] outline-none focus:border-[#cbd5e1] focus:text-[#cbd5e1] transition-colors font-mono"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#cbd5e1] mb-1 block font-bold">截止日期</label>
                    <input 
                      type="date"
                      value={newTask.date}
                      onChange={e => setNewTask({...newTask, date: e.target.value})}
                      className="bg-slate-900 border-2 border-[#cbd5e1] px-3 py-2 text-[#cbd5e1] outline-none focus:border-[#94a3b8] focus:text-[#94a3b8] transition-colors font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#94a3b8] mb-1 block font-bold">备注</label>
                  <input 
                    value={newTask.note}
                    onChange={e => setNewTask({...newTask, note: e.target.value})}
                    className="w-full bg-slate-900 border-2 border-[#94a3b8] px-3 py-2 text-[#94a3b8] outline-none focus:border-[#cbd5e1] focus:text-[#cbd5e1] transition-colors font-mono"
                    placeholder="可选..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-[#94a3b8] text-black px-6 py-2 font-black hover:bg-[#cbd5e1] hover:text-black transition-colors border-2 border-[#cbd5e1]" style={{ boxShadow: '0 0 10px rgba(100, 116, 139, 0.25)' }}>
                    EXECUTE
                  </button>
                  <button type="button" onClick={() => setShowAddTask(false)} className="text-[#888888] hover:text-[#94a3b8] px-5 py-2 transition-colors font-bold">CANCEL</button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddTask(true)}
                className="text-[#94a3b8] hover:text-[#cbd5e1] text-sm border-2 border-dashed border-[#94a3b8] px-6 py-3 hover:border-[#cbd5e1] transition-colors bg-slate-900 font-bold mt-4"
                style={{ boxShadow: '0 0 10px rgba(100, 116, 139, 0.15)' }}
              >
                + ADD NEW TASK
              </button>
            )}
          </div>
        )}

        {/* 任务列表 - 朋克故障风格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((mega, idx) => (
            <TaskCard 
              key={mega.id} 
              mega={mega} 
              index={idx}
              onToggleTask={() => toggleTask(mega.id)}
              onToggleSub={toggleSubTask}
              isAdmin={isAdmin}
              onDelete={async () => {
                if (confirm(`删除任务 "${mega.title}"？`)) {
                  const result = await deleteMegaTaskAction(mega.id);
                  if (result.success) fetchData();
                  else alert('删除失败');
                }
              }}
              onAddSubTask={async (label: string) => {
                const result = await addSubTaskAction({ mega_task_id: mega.id, label });
                if (result.success) fetchData();
                else alert('添加失败');
              }}
              onDeleteSubTask={async (subId: string) => {
                const result = await deleteSubTaskAction(subId);
                if (result.success) fetchData();
                else alert('删除失败');
              }}
              onUpdateMegaTask={async (updates: { title?: string; date?: string; note?: string }) => {
                const result = await updateMegaTaskAction(mega.id, updates);
                if (result.success) fetchData();
                else alert('更新失败');
              }}
              onUpdateSubTask={async (subId: string, label: string) => {
                const result = await updateSubTaskAction(subId, { label });
                if (result.success) fetchData();
                else alert('更新失败');
              }}
            />
          ))}
          {tasks.length === 0 && (
            <div className="col-span-full text-center py-20 text-[#94a3b8] text-sm bg-[#1e293b] border-2 border-dashed border-[#94a3b8] p-8 font-bold" style={{ boxShadow: '0 0 20px rgba(100, 116, 139, 0.15)' }}>
              NO TASKS FOUND
            </div>
          )}
        </div>
      </div>

      {/* 导航栏主题化 */}
      <style dangerouslySetInnerHTML={{ __html: `
        header.fixed { background: rgba(10, 10, 10, 0.95) !important; border-bottom-color: rgba(100, 116, 139, 0.25) !important; }
        aside.fixed { background: rgba(10, 10, 10, 0.95) !important; border-right-color: rgba(100, 116, 139, 0.25) !important; }
        aside.fixed .group\\/item:hover { background: rgba(100, 116, 139, 0.1) !important; }
        aside.fixed .group\\/item:hover .absolute.left-0 { background: rgb(100, 116, 139) !important; }
      `}} />
    </div>
  );
}

function TaskCard({ mega, index, onToggleTask, onToggleSub, isAdmin, onDelete, onAddSubTask, onDeleteSubTask, onUpdateMegaTask, onUpdateSubTask }: { 
  mega: MegaTask, 
  index: number,
  onToggleTask: () => void,
  onToggleSub: (mId: string, sId: string) => void,
  isAdmin?: boolean,
  onDelete?: () => void,
  onAddSubTask?: (label: string) => void,
  onDeleteSubTask?: (subId: string) => void,
  onUpdateMegaTask?: (updates: { title?: string; date?: string; note?: string }) => void,
  onUpdateSubTask?: (subId: string, label: string) => void
}) {
  const [showAddSub, setShowAddSub] = useState(false);
  const [newSubLabel, setNewSubLabel] = useState('');
  const [editingMega, setEditingMega] = useState(false);
  const [editMega, setEditMega] = useState({ title: mega.title, date: mega.date || '', note: mega.note || '' });
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubLabel, setEditSubLabel] = useState('');

  useEffect(() => {
    setEditMega({ title: mega.title, date: mega.date || '', note: mega.note || '' });
  }, [mega.id, mega.title, mega.date, mega.note]);
  
  const progress = useMemo(() => {
    const total = mega.subtasks.length;
    if (total === 0) return 0;
    return Math.round((mega.subtasks.filter(s => s.completed).length / total) * 100);
  }, [mega.subtasks]);

  return (
    <div className={`bg-[#1e293b] border-2 border-[#94a3b8] p-6 relative group hover:border-[#cbd5e1] transition-all ${mega.completed ? 'opacity-50' : ''}`} style={{ 
      boxShadow: '0 0 15px rgba(100, 116, 139, 0.15)',
      transform: 'rotate(-0.5deg)'
    }}>
      <div className="flex items-start gap-3 mb-3">
        <button 
          onClick={onToggleTask}
          className={`w-6 h-6 border-2 flex items-center justify-center text-xs mt-0.5 transition-all font-black ${
            mega.completed 
              ? 'bg-sky-400 border-sky-400 text-slate-900' 
              : 'bg-slate-900 border-[#94a3b8] hover:border-[#cbd5e1] text-[#94a3b8]'
          }`}
          style={{ boxShadow: mega.completed ? '0 0 10px rgba(148, 163, 184, 0.25)' : '0 0 10px rgba(100, 116, 139, 0.15)' }}
        >
          {mega.completed && '✓'}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            {editingMega && isAdmin && onUpdateMegaTask ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editMega.title.trim()) {
                    onUpdateMegaTask(editMega);
                    setEditingMega(false);
                  }
                }}
                className="flex-1 min-w-0 space-y-2"
              >
                <input 
                  value={editMega.title}
                  onChange={e => setEditMega(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-900 border-2 border-[#94a3b8] px-2 py-1 text-sm text-[#94a3b8] outline-none focus:border-[#cbd5e1] font-mono font-black"
                  placeholder="任务标题"
                  required
                />
                <input 
                  value={editMega.date}
                  onChange={e => setEditMega(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-900 border-2 border-[#94a3b8] px-2 py-1 text-xs text-[#cbd5e1] outline-none focus:border-[#cbd5e1] font-mono"
                  placeholder="日期"
                />
                <textarea 
                  value={editMega.note}
                  onChange={e => setEditMega(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full bg-slate-900 border-2 border-[#94a3b8] px-2 py-1 text-xs text-[#888888] outline-none focus:border-[#cbd5e1] font-mono resize-none"
                  placeholder="备注"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-[#cbd5e1] text-black px-2 py-1 text-xs font-black border-2 border-[#cbd5e1]">保存</button>
                  <button type="button" onClick={() => setEditingMega(false)} className="text-[#888888] text-xs font-bold hover:text-[#94a3b8]">取消</button>
                </div>
              </form>
            ) : (
              <h3 className={`font-black text-lg flex-1 min-w-0 ${mega.completed ? 'line-through text-[#94a3b8]' : 'text-[#94a3b8]'}`} style={{ transform: 'rotate(-0.5deg)' }}>
                {mega.title}
              </h3>
            )}
            {isAdmin && !editingMega && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {onUpdateMegaTask && (
                  <button 
                    onClick={() => setEditingMega(true)}
                    className="text-[#94a3b8] hover:text-[#cbd5e1] text-xs font-black border-2 border-[#94a3b8] px-2 py-1"
                  >
                    EDIT
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={onDelete}
                    className="text-red-500 hover:text-red-700 text-xs font-black border-2 border-red-500 px-2 py-1"
                  >
                    DEL
                  </button>
                )}
              </div>
            )}
          </div>
          
          {mega.date && (
            <div className="text-xs text-[#cbd5e1] mb-2 font-mono font-bold">
              ⚡ {mega.date}
            </div>
          )}
          
          {mega.note && (
            <div className="text-sm text-[#a1a1aa] mb-3 pl-2 border-l-4 border-[#94a3b8] font-mono">
              {mega.note}
            </div>
          )}

          {/* 进度条 - 朋克风格 */}
          {mega.subtasks.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-[#94a3b8] mb-1 font-bold">
                <span>PROGRESS</span>
                <span className="text-[#cbd5e1]">{progress}%</span>
              </div>
              <div className="w-full bg-slate-900 border-2 border-[#94a3b8] h-3 relative overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-slate-500 to-sky-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 bg-sky-400/20 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* 子任务 - 故障风格 */}
          {mega.subtasks.length > 0 && (
            <div className="space-y-2 mb-3 pl-2 border-l-4 border-[#cbd5e1]">
              {mega.subtasks.map(sub => (
                <div key={sub.id} className="flex items-center gap-2 text-sm">
                  <button 
                    onClick={() => onToggleSub(mega.id, sub.id)}
                    className={`w-4 h-4 border-2 flex items-center justify-center text-[10px] transition-all font-black shrink-0 ${
                      sub.completed 
                        ? 'bg-sky-400 border-sky-400 text-slate-900' 
                        : 'bg-slate-900 border-[#94a3b8] hover:border-[#cbd5e1] text-[#94a3b8]'
                    }`}
                  >
                    {sub.completed && '✓'}
                  </button>
                  {editingSubId === sub.id && isAdmin && onUpdateSubTask ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editSubLabel.trim()) {
                          onUpdateSubTask(sub.id, editSubLabel.trim());
                          setEditingSubId(null);
                          setEditSubLabel('');
                        }
                      }}
                      className="flex-1 flex gap-1 min-w-0"
                    >
                      <input 
                        value={editSubLabel}
                        onChange={e => setEditSubLabel(e.target.value)}
                        className="flex-1 min-w-0 bg-slate-900 border border-[#94a3b8] px-2 py-0.5 text-xs text-[#94a3b8] outline-none font-mono"
                        autoFocus
                      />
                      <button type="submit" className="text-[#cbd5e1] text-xs font-black shrink-0">保存</button>
                      <button type="button" onClick={() => { setEditingSubId(null); setEditSubLabel(''); }} className="text-[#888888] text-xs shrink-0">×</button>
                    </form>
                  ) : (
                    <>
                      <span className={`flex-1 font-mono min-w-0 ${sub.completed ? 'line-through text-[#94a3b8]' : 'text-[#cbd5e1]'}`}>
                        {sub.label}
                      </span>
                      {isAdmin && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {onUpdateSubTask && (
                            <button 
                              onClick={() => { setEditingSubId(sub.id); setEditSubLabel(sub.label); }}
                              className="text-[#cbd5e1] hover:text-[#94a3b8] text-xs font-black"
                            >
                              EDIT
                            </button>
                          )}
                          {onDeleteSubTask && (
                            <button 
                              onClick={() => onDeleteSubTask(sub.id)}
                              className="text-red-400 hover:text-red-600 text-xs font-black"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 添加子任务 */}
          {isAdmin && onAddSubTask && (
            showAddSub ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newSubLabel.trim()) {
                    onAddSubTask(newSubLabel);
                    setNewSubLabel('');
                    setShowAddSub(false);
                  }
                }}
                className="flex gap-2 mt-2"
              >
                <input 
                  value={newSubLabel}
                  onChange={e => setNewSubLabel(e.target.value)}
                  placeholder="subtask..."
                  className="flex-1 bg-slate-900 border-2 border-[#94a3b8] px-2 py-1 text-sm text-[#94a3b8] outline-none focus:border-[#cbd5e1] focus:text-[#cbd5e1] transition-colors font-mono"
                  autoFocus
                />
                <button type="submit" className="bg-[#94a3b8] text-black px-3 py-1 text-xs hover:bg-[#cbd5e1] transition-colors font-black border-2 border-[#cbd5e1]">ADD</button>
                <button type="button" onClick={() => setShowAddSub(false)} className="text-[#888888] text-xs hover:text-[#94a3b8] font-bold">X</button>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddSub(true)}
                className="text-[#94a3b8] hover:text-[#cbd5e1] text-xs mt-2 border-2 border-dashed border-[#94a3b8] px-2 py-1 hover:border-[#cbd5e1] transition-colors w-full font-bold"
              >
                + ADD SUBTASK
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
