import { API_BASE_URL } from './config'

export async function sendNormalChat(message: string): Promise<string> {
  const url = `${API_BASE_URL}/ai/manus/chat?message=${encodeURIComponent(message)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`请求失败: ${res.status}`)
  return await res.text()
}

export async function sendRagQuestion(question: string): Promise<string> {
  const url = `${API_BASE_URL}/rag/ask?question=${encodeURIComponent(question)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`请求失败: ${res.status}`)
  return await res.text()
}

export function createSseConnection(
  message: string,
  onMessage: (data: string) => void,
  onError: (err: Event) => void,
  onComplete: () => void
): EventSource {
  const url = `${API_BASE_URL}/ai/manus/SseChat?message=${encodeURIComponent(message)}`
  const es = new EventSource(url)

  es.onmessage = (event) => {
    onMessage(event.data)
  }

  es.onerror = (event) => {
    // 后端正常关闭连接时，EventSource 会进入 CONNECTING(0) 状态尝试重连，或直接变为 CLOSED(2)
    // 两种情况都视为正常完成，手动关闭连接并触发 onComplete
    if (es.readyState === EventSource.CLOSED || es.readyState === EventSource.CONNECTING) {
      es.close()
      onComplete()
    } else {
      onError(event)
      es.close()
    }
  }

  return es
}
