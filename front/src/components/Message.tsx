import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Role = 'user' | 'assistant'

interface Props {
  role: Role
  content: string
  streaming?: boolean
}

export default function Message({ role, content, streaming }: Props) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex gap-2.5 sm:gap-3 px-3 sm:px-6 py-4 sm:py-5 animate-in', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-full grid place-items-center shadow-sm',
          isUser
            ? 'bg-[var(--color-surface-3)] text-[var(--color-ink-soft)]'
            : 'bg-[var(--color-brand)] text-white',
        )}
        aria-hidden
      >
        {isUser ? <User size={15} strokeWidth={1.75} /> : <Sparkles size={15} strokeWidth={1.75} />}
      </div>

      <div className={cn('min-w-0 max-w-[min(720px,calc(100%-60px))]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-[14.5px]',
            isUser
              ? 'bg-[var(--color-brand-bg)] text-[var(--color-ink)] rounded-tr-md'
              : 'bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-ink)] rounded-tl-md shadow-[var(--shadow-soft)]',
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className={cn('prose-msg', streaming && !content && 'min-h-[1.5em]')}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
              {streaming && <span className="typing-cursor" aria-hidden />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
