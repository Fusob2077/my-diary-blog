'use client'

/** 将正文中的 ![](url) 和独立图片 URL 行渲染为图片，其余保留换行 */
const IMG_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g
const IMG_EXT = /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i
const HTTPS_ONLY = /^https:\/\//i

function isImageUrl(s: string): boolean {
  const t = s.trim()
  return HTTPS_ONLY.test(t) && (IMG_EXT.test(t) || t.includes('supabase.co/storage'))
}

export function ContentWithImages({ content, className = '' }: { content: string; className?: string }) {
  if (!content?.trim()) return null

  const parts: React.ReactNode[] = []
  const lines = content.split('\n')

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) {
      parts.push(<br key={i} />)
      return
    }
    if (isImageUrl(trimmed)) {
      parts.push(
        <img
          key={i}
          src={trimmed}
          alt=""
          className="max-w-full h-auto rounded my-2 block"
          loading="lazy"
        />
      )
      return
    }
    const segments: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    IMG_REGEX.lastIndex = 0
    while ((match = IMG_REGEX.exec(line)) !== null) {
      segments.push(line.slice(lastIndex, match.index))
      const url = match[2].trim()
      if (HTTPS_ONLY.test(url)) {
        segments.push(
          <img
            key={`${i}-${match.index}`}
            src={url}
            alt={match[1] || ''}
            className="max-w-full h-auto rounded my-1 inline-block align-middle"
            loading="lazy"
          />
        )
      }
      lastIndex = IMG_REGEX.lastIndex
    }
    segments.push(line.slice(lastIndex))
    parts.push(
      <span key={i}>
        {segments}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })

  return <div className={`whitespace-pre-wrap break-words ${className}`}>{parts}</div>
}
