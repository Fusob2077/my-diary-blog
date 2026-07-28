'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

// --- 通用权限检查 ---
async function checkAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user, isAuthenticated: !!user }
}

// --- 登录逻辑 ---
export async function loginAction(formData: FormData) {
  const { supabase } = await checkAuth()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

// --- 修改：你原有的 toggleSubTaskAction 加上权限预检 ---
export async function toggleSubTaskAction(subTaskId: string, completed: boolean) {
  try {
    const supabase = await createClient()

    // 关键：在服务端检查用户身份
    const { data: { user } } = await supabase.auth.getUser()
    
    // 如果没有登录用户，或者登录的不是你（可选校验UID），直接拦截
    if (!user) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { error } = await supabase
      .from('sub_tasks')
      .update({ completed })
      .eq('id', subTaskId)

    if (error) throw error

    revalidatePath('/console')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Sync failed' }
  }
}

// --- 添加音乐（需要登录） ---
export async function addMusicAction(track: {
  title: string
  artist: string
  link: string
  tag: string
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { error } = await supabase.from('music_taste').insert([track])

    if (error) throw error

    revalidatePath('/music/taste')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add music' }
  }
}

// --- 获取 Changelog ---
export async function getChangelogAction() {
  try {
    const { supabase } = await checkAuth()
    const { data, error } = await supabase
      .from('changelog')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to fetch changelog', data: [] }
  }
}

// --- 添加 Changelog（需要登录） ---
export async function addChangelogAction(entry: {
  date: string
  content: string
  zh: string
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { error } = await supabase.from('changelog').insert([entry])

    if (error) throw error

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add changelog' }
  }
}

// --- 删除 Changelog 条目（需要登录） ---
export async function deleteChangelogAction(entryId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: 'Unauthorized' }
    const { error } = await supabase.from('changelog').delete().eq('id', entryId)
    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete changelog entry' }
  }
}

// --- 获取文章列表 ---
export async function getArticlesAction() {
  try {
    const { supabase } = await checkAuth()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to fetch articles', data: [] }
  }
}

// --- 添加文章（需要登录，同时自动添加 changelog） ---
export async function addArticleAction(article: {
  num: string
  tag: string
  en_title: string
  zh_title: string
  description: string
  sort_order?: number
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    // 添加文章
    const { error: articleError } = await supabase.from('articles').insert([article])
    if (articleError) throw articleError

    // 自动添加 changelog
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
    const changelogEntry = {
      date: today,
      content: `New article: ${article.en_title}`,
      zh: `新增文章：${article.zh_title}`
    }
    await supabase.from('changelog').insert([changelogEntry])

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add article' }
  }
}

// --- 删除文章（需要登录，同时自动添加 changelog） ---
export async function deleteArticleAction(articleId: string, articleTitle: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { error } = await supabase.from('articles').delete().eq('id', articleId)
    if (error) throw error

    // 自动添加 changelog
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
    const changelogEntry = {
      date: today,
      content: `Removed article: ${articleTitle}`,
      zh: `移除文章：${articleTitle}`
    }
    await supabase.from('changelog').insert([changelogEntry])

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete article' }
  }
}

// ============================================
// Console: 任务管理
// ============================================

// 获取所有任务（包含子任务）
export async function getMegaTasksAction() {
  try {
    const { supabase } = await checkAuth()
    const { data: megaTasks, error: megaError } = await supabase
      .from('mega_tasks')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (megaError) throw megaError

    // 获取所有子任务
    const { data: subTasks, error: subError } = await supabase
      .from('sub_tasks')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (subError) throw subError

    // 组合数据
    const tasksWithSubs = megaTasks?.map(mega => ({
      ...mega,
      subtasks: subTasks?.filter(sub => sub.mega_task_id === mega.id) || []
    })) || []

    return { success: true, data: tasksWithSubs }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to fetch tasks', data: [] }
  }
}

// 添加主任务
export async function addMegaTaskAction(task: {
  title: string
  date?: string
  note?: string
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { data, error } = await supabase.from('mega_tasks').insert([task]).select().single()
    if (error) throw error

    revalidatePath('/console')
    return { success: true, data }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add task' }
  }
}

// 更新主任务
export async function updateMegaTaskAction(taskId: string, updates: { title?: string; date?: string; note?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { error } = await supabase.from('mega_tasks').update(updates).eq('id', taskId)
    if (error) throw error

    revalidatePath('/console')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to update task' }
  }
}

// 删除主任务
export async function deleteMegaTaskAction(taskId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { error } = await supabase.from('mega_tasks').delete().eq('id', taskId)
    if (error) throw error

    revalidatePath('/console')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete task' }
  }
}

// 添加子任务
export async function addSubTaskAction(subTask: {
  mega_task_id: string
  label: string
  weight?: number
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { data, error } = await supabase.from('sub_tasks').insert([subTask]).select().single()
    if (error) throw error

    revalidatePath('/console')
    return { success: true, data }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add subtask' }
  }
}

// 更新子任务
export async function updateSubTaskAction(subTaskId: string, updates: { label?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { error } = await supabase.from('sub_tasks').update(updates).eq('id', subTaskId)
    if (error) throw error

    revalidatePath('/console')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to update subtask' }
  }
}

// 删除子任务
export async function deleteSubTaskAction(subTaskId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) {
      return { success: false, error: "Unauthorized: Admin access required." }
    }

    const { error } = await supabase.from('sub_tasks').delete().eq('id', subTaskId)
    if (error) throw error

    revalidatePath('/console')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete subtask' }
  }
}

// ============================================
// Dreams: 梦日记管理
// ============================================

export async function addDreamAction(dream: { date: string; title: string; content: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('dream_logs').insert([dream])
    if (error) throw error
    
    revalidatePath('/dreams')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add dream' }
  }
}

export async function deleteDreamAction(dreamId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('dream_logs').delete().eq('id', dreamId)
    if (error) throw error
    
    revalidatePath('/dreams')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete dream' }
  }
}

export async function addQuickNoteAction(note: {
  title?: string
  content: string
  mood?: string
  tags?: string
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: 'Unauthorized' }

    const payload = {
      title: note.title?.trim() || null,
      content: note.content.trim(),
      mood: note.mood?.trim() || null,
      tags: note.tags?.trim() || null,
    }

    const { error } = await supabase.from('quick_notes').insert([payload])
    if (error) throw error

    revalidatePath('/dreams')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add quick note' }
  }
}

export async function deleteQuickNoteAction(noteId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase.from('quick_notes').delete().eq('id', noteId)
    if (error) throw error

    revalidatePath('/dreams')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete quick note' }
  }
}

export async function toggleQuickNotePinAction(noteId: string, isPinned: boolean) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('quick_notes')
      .update({ is_pinned: isPinned })
      .eq('id', noteId)

    if (error) throw error

    revalidatePath('/dreams')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to update pin status' }
  }
}

// ============================================
// Engineering: 软工技术树管理
// ============================================

export async function addTechCategoryAction(category: { category: string; icon?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { data, error } = await supabase.from('tech_tree').insert([category]).select().single()
    if (error) throw error
    
    revalidatePath('/engineering')
    return { success: true, data }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add category' }
  }
}

export async function deleteTechCategoryAction(categoryId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('tech_tree').delete().eq('id', categoryId)
    if (error) throw error
    
    revalidatePath('/engineering')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete category' }
  }
}

export async function addTechSkillAction(skill: { tech_tree_id: string; skill: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('tech_skills').insert([skill])
    if (error) throw error
    
    revalidatePath('/engineering')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add skill' }
  }
}

export async function deleteTechSkillAction(skillId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('tech_skills').delete().eq('id', skillId)
    if (error) throw error
    
    revalidatePath('/engineering')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete skill' }
  }
}

// ============================================
// Embedded: 嵌入式技术树管理
// ============================================

export async function addEmbeddedCategoryAction(category: { category: string; icon?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { data, error } = await supabase.from('embedded_tree').insert([category]).select().single()
    if (error) throw error
    
    revalidatePath('/embedded')
    return { success: true, data }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add category' }
  }
}

export async function deleteEmbeddedCategoryAction(categoryId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('embedded_tree').delete().eq('id', categoryId)
    if (error) throw error
    
    revalidatePath('/embedded')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete category' }
  }
}

export async function addEmbeddedSkillAction(skill: { embedded_tree_id: string; skill: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('embedded_skills').insert([skill])
    if (error) throw error
    
    revalidatePath('/embedded')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add skill' }
  }
}

export async function deleteEmbeddedSkillAction(skillId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('embedded_skills').delete().eq('id', skillId)
    if (error) throw error
    
    revalidatePath('/embedded')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete skill' }
  }
}

// ============================================
// ACG: 幻想境界管理
// ============================================

export async function addAcgCategoryAction(category: { title: string; description?: string; color?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { data, error } = await supabase.from('acg_categories').insert([category]).select().single()
    if (error) throw error
    
    revalidatePath('/acg')
    return { success: true, data }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add category' }
  }
}

export async function deleteAcgCategoryAction(categoryId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('acg_categories').delete().eq('id', categoryId)
    if (error) throw error
    
    revalidatePath('/acg')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete category' }
  }
}

export async function addAcgTagAction(tag: { acg_category_id: string; tag: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('acg_tags').insert([tag])
    if (error) throw error
    
    revalidatePath('/acg')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add tag' }
  }
}

export async function deleteAcgTagAction(tagId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('acg_tags').delete().eq('id', tagId)
    if (error) throw error
    
    revalidatePath('/acg')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete tag' }
  }
}

// 娱乐页：论坛式发帖（分类/标签可选，支持多图与链接）
export async function addAcgEntryAction(entry: {
  acg_category_id?: string | null
  title: string
  content?: string
  type?: 'article' | 'drawing' | 'post'
  image_url?: string
  image_urls?: string[]
  link?: string
  tag_ids?: string[]
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    const { tag_ids, image_urls, ...rest } = entry
    const row = {
      ...rest,
      acg_category_id: entry.acg_category_id || null,
      type: entry.type || 'post',
      image_urls: image_urls?.length ? image_urls : (entry.image_url ? [entry.image_url] : []),
    }
    const { data: inserted, error } = await supabase.from('acg_entries').insert([row]).select().single()
    if (error) throw error
    if (inserted && tag_ids?.length) {
      await supabase.from('acg_entry_tags').insert(tag_ids.map(acg_tag_id => ({ acg_entry_id: inserted.id, acg_tag_id })))
    }
    revalidatePath('/acg')
    return { success: true, data: inserted }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add entry' }
  }
}

export async function updateAcgEntryAction(entryId: string, entry: {
  title?: string
  content?: string
  type?: 'article' | 'drawing' | 'post'
  image_url?: string
  image_urls?: string[]
  link?: string
  tag_ids?: string[]
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    const { tag_ids, image_urls, ...updates } = entry
    const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }
    if (image_urls !== undefined) payload.image_urls = image_urls
    if (Object.keys(payload).length > 1) {
      const { error } = await supabase.from('acg_entries').update(payload).eq('id', entryId)
      if (error) throw error
    }
    if (tag_ids !== undefined) {
      await supabase.from('acg_entry_tags').delete().eq('acg_entry_id', entryId)
      if (tag_ids.length)
        await supabase.from('acg_entry_tags').insert(tag_ids.map(acg_tag_id => ({ acg_entry_id: entryId, acg_tag_id })))
    }
    revalidatePath('/acg')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to update entry' }
  }
}

export async function deleteAcgEntryAction(entryId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    const { error } = await supabase.from('acg_entries').delete().eq('id', entryId)
    if (error) throw error
    revalidatePath('/acg')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete entry' }
  }
}

// ============================================
// 产出: 作品管理
// ============================================

export async function addArtWorkAction(work: { 
  category: 'painting' | 'article' | 'video' | 'other'
  title: string
  description?: string
  link?: string
  thumbnail?: string
}) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('art_works').insert([work])
    if (error) throw error
    
    revalidatePath('/art')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add art work' }
  }
}

export async function deleteArtWorkAction(workId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('art_works').delete().eq('id', workId)
    if (error) throw error
    
    revalidatePath('/art')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete art work' }
  }
}

/** Art 缩略图：上传到本机服务器 public/uploads/art，返回可访问路径 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadArtImageAction(formData: FormData) {
  try {
    const { isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: 'Unauthorized' }

    const file = formData.get('file') as File | null
    if (!file || !file.size) return { success: false, error: '请选择图片文件' }
    if (!ALLOWED_TYPES.includes(file.type)) return { success: false, error: '仅支持 JPG/PNG/GIF/WebP' }
    if (file.size > MAX_SIZE) return { success: false, error: '图片不超过 5MB' }

    const ext = path.extname(file.name) || '.jpg'
    const filename = `${crypto.randomUUID()}${ext}`
    const dir = path.join(process.cwd(), 'public', 'uploads', 'art')
    fs.mkdirSync(dir, { recursive: true })
    const filepath = path.join(dir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filepath, buffer)

    const publicPath = `/uploads/art/${filename}`
    return { success: true, path: publicPath }
  } catch (err) {
    console.error(err)
    return { success: false, error: '上传失败' }
  }
}

// ============================================
// Research: 人文社科管理
// ============================================

export async function addReadingNoteAction(note: { title: string; date: string; desc?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('reading_notes').insert([note])
    if (error) throw error
    
    revalidatePath('/research')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add reading note' }
  }
}

export async function deleteReadingNoteAction(noteId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('reading_notes').delete().eq('id', noteId)
    if (error) throw error
    
    revalidatePath('/research')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete reading note' }
  }
}

export async function addMyArticleAction(article: { title: string; type: string; date: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('my_articles').insert([article])
    if (error) throw error
    
    revalidatePath('/research')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add article' }
  }
}

export async function deleteMyArticleAction(articleId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('my_articles').delete().eq('id', articleId)
    if (error) throw error
    
    revalidatePath('/research')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete article' }
  }
}

export async function addResearchResourceAction(resource: { title: string; size?: string; type?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('research_resources').insert([resource])
    if (error) throw error
    
    revalidatePath('/research')
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Failed to add resource' }
  }
}

export async function deleteResearchResourceAction(resourceId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('research_resources').delete().eq('id', resourceId)
    if (error) throw error
    
    revalidatePath('/research')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete resource' }
  }
}

// ============================================
// Journal: 日志管理
// ============================================

export async function addJournalEntryAction(entry: { title: string; content: string; date: string; time: string; tag: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('journal_entries').insert([entry])
    if (error) throw error
    
    revalidatePath('/journal')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add journal entry' }
  }
}

export async function deleteJournalEntryAction(entryId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('journal_entries').delete().eq('id', entryId)
    if (error) throw error
    
    revalidatePath('/journal')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete journal entry' }
  }
}

// ============================================
// Philosophy: 哲学条目管理
// ============================================

export async function addPhilosophyEntryAction(entry: { title: string; content: string; author?: string; category?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('philosophy_entries').insert([entry])
    if (error) throw error
    
    revalidatePath('/philosophy')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add philosophy entry' }
  }
}

export async function deletePhilosophyEntryAction(entryId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    
    const { error } = await supabase.from('philosophy_entries').delete().eq('id', entryId)
    if (error) throw error
    
    revalidatePath('/philosophy')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete philosophy entry' }
  }
}

// 哲学自定义分类：添加 / 删除（仅认证用户）
export async function addPhilosophyCategoryAction(cat: { label: string; en?: string; icon?: string; desc?: string }) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    const { error } = await supabase.from('philosophy_categories').insert([{
      label: cat.label.trim(),
      en: cat.en?.trim() || null,
      icon: cat.icon?.trim() || null,
      desc: cat.desc?.trim() || null,
    }])
    if (error) throw error
    revalidatePath('/philosophy')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to add philosophy category' }
  }
}

export async function deletePhilosophyCategoryAction(categoryId: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }
    const { error } = await supabase.from('philosophy_categories').delete().eq('id', categoryId)
    if (error) throw error
    revalidatePath('/philosophy')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Failed to delete philosophy category' }
  }
}

// ============================================
// 统一详情页内容更新
// articles 表用 description，其余表用 content
// ============================================

export async function updateDetailContentAction(table: string, id: string, content: string) {
  try {
    const { supabase, isAuthenticated } = await checkAuth()
    if (!isAuthenticated) return { success: false, error: "Unauthorized" }

    const payload = table === 'articles'
      ? { description: content }
      : { content }

    const { error } = await supabase.from(table).update(payload).eq('id', id)
    if (error) throw error

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update content' }
  }
}