import { useEffect, useRef, useState } from 'react'
import Composer from '@/components/Composer'
import Message, { type Role } from '@/components/Message'
import { streamPlainChat } from '@/lib/api'
import { uuid } from '@/lib/utils'
import { BotMessageSquare } from 'lucide-react'

interface Msg {
  id: string
  role: Role
  content: string
  streaming?: boolean
}

const PRESETS = [
  '帮我写一首关于春天的现代诗',
  '用通俗语言解释一下什么是 RAG',
  '帮我列一份每天 30 分钟的健身计划',
  '用 Python 实现一个简单的快速排序',
]

export default function ChatView() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatIdRef = useRef(uuid())
  const closerRef = useRef<{ close: () => void } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  const send = (text?: string) => {
    const message = (text ?? input).trim()
    if (!message || loading) return

    const userMsg: Msg = { id: uuid(), role: 'user', content: message }
    const aiMsg: Msg = { id: uuid(), role: 'assistant', content: '', streaming: true }
    setMsgs((prev) => [...prev, userMsg, aiMsg])
    setInput('')
    setLoading(true)

    closerRef.current = streamPlainChat({
      message,
      chatId: chatIdRef.current,
      onMessage: (chunk) => {
        setMsgs((prev) =>
          prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content + chunk } : m)),
        )
      },
      onDone: () => {
        setMsgs((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, streaming: false } : m)))
        setLoading(false)
        closerRef.current = null
      },
      onError: () => {
        setMsgs((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id
              ? { ...m, streaming: false, content: m.content || '*连接出错,请稍后重试。*' }
              : m,
          ),
        )
        setLoading(false)
      },
    })
  }

  const stop = () => {
    closerRef.current?.close()
    closerRef.current = null
    setMsgs((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)))
    setLoading(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {msgs.length === 0 ? (
          <Empty onPick={send} />
        ) : (
          <div className="mx-auto max-w-3xl pb-4">
            {msgs.map((m) => (
              <Message key={m.id} role={m.role} content={m.content} streaming={m.streaming} />
            ))}
          </div>
        )}
      </div>
      <Composer
        value={input}
        onChange={setInput}
        onSubmit={() => send()}
        onStop={stop}
        loading={loading}
        placeholder="问我任何问题..."
      />
    </div>
  )
}

function Empty({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-5 py-10 sm:py-12">
      <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-3xl bg-[var(--color-brand-bg)] text-[var(--color-brand)] grid place-items-center mb-5 shadow-[var(--shadow-soft)] border border-[var(--color-brand-soft)]/40">
        <BotMessageSquare size={30} strokeWidth={1.75} aria-label="AI 智能助手" />
      </div>
      <h2 className="font-serif text-[22px] sm:text-2xl font-semibold text-[var(--color-ink)] mb-2 text-center">
        你好,我是 Chun AI
      </h2>
      <p className="text-sm text-[var(--color-ink-mute)] mb-7 sm:mb-8 text-center">今天想聊点什么?</p>
      <div className="grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="text-left px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-line)] text-[13.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-brand-soft)] hover:text-[var(--color-ink)] hover:shadow-[var(--shadow-soft)] transition-all duration-200"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
