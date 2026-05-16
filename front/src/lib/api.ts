/**
 * 后端 API 客户端
 * 开发环境通过 vite 代理转发到 http://localhost:8080
 */

export interface RagDoc {
  source: string
  chunkCount?: number
  [k: string]: unknown
}

export interface RagHit {
  source?: string
  content?: string
  score?: number
  [k: string]: unknown
}

/**
 * 普通对话 SSE：仅大模型回复，不调用工具
 */
export function streamPlainChat(opts: {
  message: string
  chatId?: string
  onMessage: (chunk: string) => void
  onDone?: () => void
  onError?: (err: unknown) => void
}) {
  const params = new URLSearchParams({ message: opts.message })
  if (opts.chatId) params.set('chatId', opts.chatId)
  return openSse(`/ai/chat/sse?${params}`, opts)
}

/**
 * Agent SSE：会规划并调用搜索、终端等工具
 */
export function streamAgentChat(opts: {
  message: string
  onMessage: (chunk: string) => void
  onDone?: () => void
  onError?: (err: unknown) => void
}) {
  const url = `/ai/manus/SseChat?message=${encodeURIComponent(opts.message)}`
  return openSse(url, opts)
}

/** @deprecated 请使用 streamPlainChat 或 streamAgentChat */
export function streamChat(opts: {
  message: string
  onMessage: (chunk: string) => void
  onDone?: () => void
  onError?: (err: unknown) => void
}) {
  return streamAgentChat(opts)
}

function openSse(
  url: string,
  opts: {
    onMessage: (chunk: string) => void
    onDone?: () => void
    onError?: (err: unknown) => void
  },
) {
  const es = new EventSource(url)

  es.onmessage = (e) => {
    if (e.data) opts.onMessage(e.data)
  }
  es.onerror = (err) => {
    // SSE 在服务端 complete 后会触发 onerror,这里视为正常结束
    es.close()
    opts.onDone?.()
    if (err && (es.readyState === EventSource.CLOSED)) return
  }
  // 服务端如果显式发送 "done" 事件
  es.addEventListener('done', () => {
    es.close()
    opts.onDone?.()
  })

  return {
    close: () => es.close(),
  }
}

export async function ragAsk(question: string): Promise<string> {
  const r = await fetch(`/rag/ask?question=${encodeURIComponent(question)}`)
  if (!r.ok) throw new Error(`RAG 问答失败: ${r.status}`)
  return r.text()
}

export async function ragUpload(file: File): Promise<{ source: string; chunkCount: number; message: string }> {
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch('/rag/upload', { method: 'POST', body: fd })
  if (!r.ok) throw new Error(`上传失败: ${r.status}`)
  return r.json()
}

export async function ragList(): Promise<RagDoc[]> {
  const r = await fetch('/rag/list')
  if (!r.ok) throw new Error(`获取列表失败: ${r.status}`)
  return r.json()
}

export async function ragSearch(query: string, topK = 5): Promise<RagHit[]> {
  const r = await fetch(`/rag/search?query=${encodeURIComponent(query)}&topK=${topK}`)
  if (!r.ok) throw new Error(`检索失败: ${r.status}`)
  return r.json()
}

export async function ragDelete(source: string): Promise<{ source: string; deletedChunks: number; message: string }> {
  const r = await fetch(`/rag/delete?source=${encodeURIComponent(source)}`, { method: 'DELETE' })
  if (!r.ok) throw new Error(`删除失败: ${r.status}`)
  return r.json()
}
