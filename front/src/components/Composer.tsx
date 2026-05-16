import { useRef, useEffect } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onStop?: () => void
  loading?: boolean
  placeholder?: string
  hint?: string
}

export default function Composer({ value, onChange, onSubmit, onStop, loading, placeholder, hint }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // 自动撑高
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 220) + 'px'
  }, [value])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (!loading && value.trim()) onSubmit()
    }
  }

  const canSend = !loading && value.trim().length > 0

  return (
    <div
      className="px-3 sm:px-6 pt-3 bg-gradient-to-b from-transparent to-[var(--color-canvas)]"
      style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="card p-2 flex items-end gap-2 focus-within:border-[var(--color-brand-soft)] focus-within:shadow-[var(--shadow-pop)] transition-all duration-200">
          <textarea
            ref={ref}
            value={value}
            rows={1}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder ?? '输入消息,Enter 发送,Shift+Enter 换行'}
            disabled={loading}
            aria-label="消息输入框"
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[14.5px] leading-6 text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] outline-none disabled:opacity-60"
            style={{ maxHeight: 220 }}
          />
          {loading && onStop ? (
            <button
              onClick={onStop}
              aria-label="停止"
              className="shrink-0 w-9 h-9 grid place-items-center rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-ink-soft)] transition-colors"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!canSend}
              aria-label="发送"
              className={cn(
                'shrink-0 w-9 h-9 grid place-items-center rounded-lg transition-all',
                canSend
                  ? 'btn-primary'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-ink-mute)] cursor-not-allowed',
              )}
            >
              <ArrowUp size={16} strokeWidth={2.25} />
            </button>
          )}
        </div>
        <div className="px-2 pt-2 text-[11px] text-[var(--color-ink-mute)] text-center">
          {hint ?? 'Chun AI 可能会出错,重要信息请自行核实'}
        </div>
      </div>
    </div>
  )
}
