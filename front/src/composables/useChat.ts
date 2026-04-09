import { reactive, ref } from 'vue'
import type { ChatMessage, ChatMode, ExecutionState } from '../types'
import { sendNormalChat, sendRagQuestion, createSseConnection } from '../api/chat'

let messageIdCounter = 0

export function useChat() {
  const currentMode = ref<ChatMode>('sse')
  const messages = ref<ChatMessage[]>([])
  const isRunning = ref(false)
  const execution = reactive<ExecutionState>({
    status: 'idle',
    steps: [],
    summary: '',
    errorMsg: '',
  })

  let sseSource: EventSource | null = null

  function addMessage(role: ChatMessage['role'], content: string) {
    messages.value.push({
      id: ++messageIdCounter,
      role,
      content,
      mode: currentMode.value,
      timestamp: Date.now(),
    })
  }

  function resetExecution() {
    execution.status = 'idle'
    execution.steps = []
    execution.summary = ''
    execution.errorMsg = ''
  }

  async function send(text: string) {
    if (!text.trim() || isRunning.value) return

    addMessage('user', text)
    isRunning.value = true
    resetExecution()
    execution.status = 'running'

    try {
      if (currentMode.value === 'sse') {
        await handleSse(text)
      } else if (currentMode.value === 'normal') {
        await handleNormal(text)
      } else {
        await handleRag(text)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误'
      execution.status = 'error'
      execution.errorMsg = msg
      addMessage('error', msg)
      isRunning.value = false
    }
  }

  function handleSse(text: string): Promise<void> {
    return new Promise((resolve) => {
      const collected: string[] = []

      sseSource = createSseConnection(
        text,
        (data) => {
          collected.push(data)
          execution.steps = [...collected]
        },
        (_err) => {
          execution.status = 'error'
          execution.errorMsg = 'SSE 连接异常'
          addMessage('error', 'SSE 连接异常')
          isRunning.value = false
          sseSource = null
          resolve()
        },
        () => {
          const summary = collected.join('\n\n')
          execution.summary = summary
          execution.status = 'done'
          addMessage('assistant', summary)
          isRunning.value = false
          sseSource = null
          resolve()
        }
      )
    })
  }

  async function handleNormal(text: string) {
    const result = await sendNormalChat(text)
    execution.summary = result
    execution.status = 'done'
    addMessage('assistant', result)
    isRunning.value = false
  }

  async function handleRag(text: string) {
    const result = await sendRagQuestion(text)
    execution.summary = result
    execution.status = 'done'
    addMessage('assistant', result)
    isRunning.value = false
  }

  function clearAll() {
    if (sseSource) {
      sseSource.close()
      sseSource = null
    }
    messages.value = []
    isRunning.value = false
    resetExecution()
  }

  function setMode(mode: ChatMode) {
    currentMode.value = mode
  }

  return {
    currentMode,
    messages,
    isRunning,
    execution,
    send,
    clearAll,
    setMode,
  }
}
