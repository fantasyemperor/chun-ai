import { useEffect, useRef, useState } from 'react'
import { Sparkles, Cog, CheckCircle2, Loader2, AlertCircle, BotMessageSquare } from 'lucide-react'
import Composer from '@/components/Composer'
import { streamAgentChat } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn, uuid } from '@/lib/utils'

interface Step {
  id: string
  /** 步骤标题(从 SSE chunk 中粗略提取) */
  title: string
  content: string
  status: 'running' | 'done' | 'error'
  ts: number
}

interface Task {
  id: string
  goal: string
  steps: Step[]
  finalAnswer?: string
  status: 'running' | 'done' | 'error'
}

const PRESETS = [
  '帮我搜索最近 AI 行业的三条新闻并总结要点',
  '在桌面创建一个 hello.txt 文件,内容为 "你好春天"',
  '查一下杭州明天的天气并给我穿衣建议',
]

export default function AgentView() {
  const [task, setTask] = useState<Task | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const closerRef = useRef<{ close: () => void } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [task])

  /** 根据后端 SSE chunk 内容粗略归类为 thought / action / result */
  const classify = (chunk: string): { title: string; isNewStep: boolean } => {
    const t = chunk.trim()
    if (/^(Step|步骤|Thought|思考|Thinking)/i.test(t)) return { title: '思考', isNewStep: true }
    if (/^(Action|工具|调用|Calling|Tool)/i.test(t)) return { title: '调用工具', isNewStep: true }
    if (/^(Observation|结果|Result|Output)/i.test(t)) return { title: '观察结果', isNewStep: true }
    if (/^(Final|最终|完成|Done)/i.test(t)) return { title: '最终回复', isNewStep: true }
    return { title: '执行中', isNewStep: false }
  }

  const run = (text?: string) => {
    const goal = (text ?? input).trim()
    if (!goal || loading) return

    const newTask: Task = {
      id: uuid(),
      goal,
      steps: [{ id: uuid(), title: '启动', content: '', status: 'running', ts: Date.now() }],
      status: 'running',
    }
    setTask(newTask)
    setInput('')
    setLoading(true)

    closerRef.current = streamAgentChat({
      message: goal,
      onMessage: (chunk) => {
        setTask((prev) => {
          if (!prev) return prev
          const { title, isNewStep } = classify(chunk)
          const steps = [...prev.steps]
          const last = steps[steps.length - 1]

          if (isNewStep && last.content.trim()) {
            // 上一步收尾
            steps[steps.length - 1] = { ...last, status: 'done' }
            steps.push({
              id: uuid(),
              title,
              content: chunk,
              status: 'running',
              ts: Date.now(),
            })
          } else {
            steps[steps.length - 1] = { ...last, content: last.content + chunk }
          }
          return { ...prev, steps }
        })
      },
      onDone: () => {
        setTask((prev) => {
          if (!prev) return prev
          const steps = prev.steps.map((s, i) =>
            i === prev.steps.length - 1 ? { ...s, status: 'done' as const } : s,
          )
          const final = steps[steps.length - 1]?.content
          return { ...prev, steps, status: 'done', finalAnswer: final }
        })
        setLoading(false)
        closerRef.current = null
      },
      onError: () => {
        setTask((prev) => prev ? { ...prev, status: 'error' } : prev)
        setLoading(false)
      },
    })
  }

  const stop = () => {
    closerRef.current?.close()
    closerRef.current = null
    setTask((prev) => prev ? { ...prev, status: 'done' } : prev)
    setLoading(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!task ? (
          <Empty onPick={run} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-4">
            <div className="card p-4">
              <div className="text-[11px] uppercase tracking-wider text-[var(--color-ink-mute)] mb-1.5">
                任务目标
              </div>
              <div className="font-serif text-[15.5px] text-[var(--color-ink)] leading-relaxed">
                {task.goal}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <StatusPill status={task.status} />
                <span className="text-[var(--color-ink-mute)]">共 {task.steps.length} 个步骤</span>
              </div>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-[10px] top-2 bottom-2 w-px bg-[var(--color-line)]" />
              {task.steps.map((step, i) => (
                <StepCard key={step.id} step={step} index={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Composer
        value={input}
        onChange={setInput}
        onSubmit={() => run()}
        onStop={stop}
        loading={loading}
        placeholder="描述一个目标,Agent 将自动规划并执行..."
        hint="Agent 会调用搜索、终端、文件等工具完成任务"
      />
    </div>
  )
}

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <div className="relative mb-3 animate-in">
      <div
        className={cn(
          'absolute -left-[22px] top-3 w-5 h-5 rounded-full grid place-items-center bg-[var(--color-canvas)] border-2',
          step.status === 'running' && 'border-[var(--color-brand)]',
          step.status === 'done' && 'border-[var(--color-accent)]',
          step.status === 'error' && 'border-[var(--color-danger)]',
        )}
      >
        {step.status === 'running' && <Loader2 size={10} className="animate-spin text-[var(--color-brand)]" />}
        {step.status === 'done' && <CheckCircle2 size={12} className="text-[var(--color-accent)]" />}
        {step.status === 'error' && <AlertCircle size={12} className="text-[var(--color-danger)]" />}
      </div>
      <div className="card p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-[var(--color-ink-mute)]">#{index}</span>
          <Cog size={12} className="text-[var(--color-ink-mute)]" />
          <span className="text-[12.5px] font-medium text-[var(--color-ink-soft)]">{step.title}</span>
        </div>
        <div className="prose-msg text-[13.5px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.content || '_等待输出..._'}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: Task['status'] }) {
  const map = {
    running: { text: '执行中', cls: 'bg-[var(--color-brand-bg)] text-[var(--color-brand)]' },
    done: { text: '已完成', cls: 'bg-[#e8efe9] text-[var(--color-accent)]' },
    error: { text: '出错', cls: 'bg-[#f7e2dd] text-[var(--color-danger)]' },
  }[status]
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', map.cls)}>{map.text}</span>
  )
}

function Empty({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-5 py-10 sm:py-12">
      <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-3xl bg-[var(--color-brand-bg)] text-[var(--color-brand)] grid place-items-center mb-5 shadow-[var(--shadow-soft)] border border-[var(--color-brand-soft)]/40">
        <BotMessageSquare size={30} strokeWidth={1.75} aria-label="AI 智能助手" />
      </div>
      <h2 className="font-serif text-[22px] sm:text-2xl font-semibold text-[var(--color-ink)] mb-2 text-center">
        AI 智能助手
      </h2>
      <p className="text-sm text-[var(--color-ink-mute)] mb-7 sm:mb-8 text-center max-w-md leading-relaxed">
        描述一个目标,Chun AI 会自动思考、调用工具并完成任务,过程完全透明
      </p>
      <div className="space-y-2 w-full max-w-xl">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="w-full text-left px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-line)] text-[13.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-brand-soft)] hover:text-[var(--color-ink)] hover:shadow-[var(--shadow-soft)] transition-all duration-200 flex items-center gap-3"
          >
            <Sparkles size={14} className="text-[var(--color-brand)] shrink-0" />
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
