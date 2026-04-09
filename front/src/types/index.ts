export type ChatMode = 'sse' | 'normal' | 'rag'

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant' | 'error'
  content: string
  mode: ChatMode
  timestamp: number
}

export type ExecutionStatus = 'idle' | 'running' | 'done' | 'error'

export interface ExecutionState {
  status: ExecutionStatus
  steps: string[]
  summary: string
  errorMsg: string
}
