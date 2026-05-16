import { useEffect, useRef, useState } from 'react'
import { Upload, FileText, Trash2, Search, BookOpen, Loader2 } from 'lucide-react'
import { ragAsk, ragDelete, ragList, ragUpload, type RagDoc } from '@/lib/api'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function RagView() {
  const [docs, setDocs] = useState<RagDoc[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = async () => {
    setLoadingList(true)
    try {
      const list = await ragList()
      setDocs(Array.isArray(list) ? list : [])
    } catch (e) {
      setToast({ type: 'err', text: '获取文档列表失败,请确认后端已启动' })
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.md')) {
      setToast({ type: 'err', text: '当前仅支持 .md 文档' })
      return
    }
    setUploading(true)
    try {
      const r = await ragUpload(file)
      setToast({ type: 'ok', text: `${r.source} 已切分为 ${r.chunkCount} 块` })
      refresh()
    } catch {
      setToast({ type: 'err', text: '上传失败' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (source: string) => {
    if (!confirm(`确定删除 "${source}" 吗?`)) return
    try {
      await ragDelete(source)
      setToast({ type: 'ok', text: '删除成功' })
      refresh()
    } catch {
      setToast({ type: 'err', text: '删除失败' })
    }
  }

  const ask = async () => {
    const q = question.trim()
    if (!q || asking) return
    setAsking(true)
    setAnswer('')
    try {
      const a = await ragAsk(q)
      setAnswer(a)
    } catch {
      setAnswer('*问答失败,请稍后重试。*')
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
        {/* 头部介绍 */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-bg)] text-[var(--color-brand)] grid place-items-center shrink-0">
            <BookOpen size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[var(--color-ink)]">私有知识库</h2>
            <p className="text-sm text-[var(--color-ink-mute)] mt-0.5">
              上传 Markdown 文档,基于向量检索 + 大模型给出针对你内容的精准回答
            </p>
          </div>
        </div>

        {/* 上传 + 列表 */}
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-4 sm:gap-5">
          <section className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[14.5px] text-[var(--color-ink)]">文档管理</h3>
              <span className="text-xs text-[var(--color-ink-mute)]">共 {docs.length} 篇</span>
            </div>

            <label
              className={cn(
                'block border-2 border-dashed rounded-xl px-5 py-7 text-center cursor-pointer transition-all',
                uploading
                  ? 'border-[var(--color-brand-soft)] bg-[var(--color-brand-bg)]/40'
                  : 'border-[var(--color-line)] hover:border-[var(--color-brand-soft)] hover:bg-[var(--color-surface-2)]/50',
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".md"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUpload(f)
                }}
              />
              {uploading ? (
                <Loader2 size={22} className="mx-auto mb-2 text-[var(--color-brand)] animate-spin" />
              ) : (
                <Upload size={22} className="mx-auto mb-2 text-[var(--color-ink-mute)]" strokeWidth={1.5} />
              )}
              <div className="text-[13.5px] text-[var(--color-ink-soft)] font-medium">
                {uploading ? '上传中...' : '点击上传 Markdown 文档'}
              </div>
              <div className="text-[11px] text-[var(--color-ink-mute)] mt-1">仅支持 .md 格式</div>
            </label>

            <div className="mt-4 space-y-1.5 max-h-[320px] overflow-y-auto -mx-2 px-2">
              {loadingList ? (
                <div className="text-center py-8 text-xs text-[var(--color-ink-mute)]">
                  <Loader2 size={16} className="mx-auto mb-2 animate-spin" />
                  加载中...
                </div>
              ) : docs.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--color-ink-mute)]">
                  暂无文档,先上传一份吧
                </div>
              ) : (
                docs.map((d) => (
                  <div
                    key={String(d.source)}
                    className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <FileText size={15} className="text-[var(--color-brand)] shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-[var(--color-ink)] truncate">{String(d.source)}</div>
                      {d.chunkCount != null && (
                        <div className="text-[11px] text-[var(--color-ink-mute)]">{String(d.chunkCount)} 块</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(String(d.source))}
                      aria-label={`删除 ${d.source}`}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 grid place-items-center rounded-md text-[var(--color-ink-mute)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-danger)] transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 问答 */}
          <section className="card p-5 flex flex-col">
            <h3 className="font-medium text-[14.5px] text-[var(--color-ink)] mb-3">基于知识库提问</h3>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-mute)]"
                  strokeWidth={1.75}
                />
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && ask()}
                  placeholder="基于已上传的文档提问..."
                  className="w-full pl-9 pr-3 py-2.5 text-[13.5px] bg-[var(--color-surface-2)] border border-transparent rounded-lg outline-none focus:border-[var(--color-brand-soft)] focus:bg-[var(--color-surface)] transition-all placeholder:text-[var(--color-ink-mute)]"
                />
              </div>
              <button
                onClick={ask}
                disabled={asking || !question.trim()}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all',
                  asking || !question.trim()
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-ink-mute)] cursor-not-allowed'
                    : 'btn-primary',
                )}
              >
                {asking ? <Loader2 size={14} className="animate-spin" /> : '提问'}
              </button>
            </div>

            <div className="flex-1 min-h-[200px] rounded-lg bg-[var(--color-surface-2)]/50 border border-[var(--color-line)] p-4 overflow-y-auto">
              {asking && !answer ? (
                <div className="h-full grid place-items-center text-xs text-[var(--color-ink-mute)]">
                  <div className="text-center">
                    <Loader2 size={18} className="mx-auto mb-2 animate-spin text-[var(--color-brand)]" />
                    正在检索文档并生成回答...
                  </div>
                </div>
              ) : answer ? (
                <div className="prose-msg text-[13.5px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full grid place-items-center text-xs text-[var(--color-ink-mute)] text-center px-6">
                  回答会显示在这里
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-6 right-6 px-4 py-2.5 rounded-lg shadow-[var(--shadow-pop)] text-[13px] animate-in',
            toast.type === 'ok'
              ? 'bg-[#e8efe9] text-[var(--color-accent)] border border-[#c9d9cd]'
              : 'bg-[#f7e2dd] text-[var(--color-danger)] border border-[#ebc2bb]',
          )}
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
