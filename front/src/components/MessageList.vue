<script setup lang="ts">
import { nextTick, watch, ref } from 'vue'
import type { ChatMessage } from '../types'

const props = defineProps<{
  messages: ChatMessage[]
  isRunning: boolean
}>()

const listRef = ref<HTMLDivElement>()

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  }
)

const modeLabels: Record<string, string> = {
  sse: '流式模式',
  normal: '普通模式',
  rag: '知识库问答',
}
</script>

<template>
  <div class="message-list" ref="listRef">
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-icon">💬</div>
      <div class="empty-text">发送消息开始对话</div>
    </div>

    <div
      v-for="msg in messages"
      :key="msg.id"
      class="message-item"
      :class="msg.role"
    >
      <div class="msg-header">
        <span class="msg-role">
          {{ msg.role === 'user' ? '我' : msg.role === 'error' ? '错误' : 'AI' }}
        </span>
        <span class="msg-mode-tag">{{ modeLabels[msg.mode] || msg.mode }}</span>
      </div>
      <div class="msg-content" :class="{ 'error-content': msg.role === 'error' }">
        <pre>{{ msg.content }}</pre>
      </div>
    </div>

    <div v-if="isRunning" class="loading-indicator">
      <div class="dot-pulse"></div>
      <span>AI 正在思考中...</span>
    </div>
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}

.message-item {
  max-width: 85%;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-item.user {
  align-self: flex-end;
}

.message-item.assistant,
.message-item.error {
  align-self: flex-start;
}

.msg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}

.msg-role {
  font-weight: 600;
}

.msg-mode-tag {
  font-size: 11px;
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 3px;
}

.msg-content {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.msg-content pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
}

.user .msg-content {
  background: #409eff;
  color: #fff;
  border-bottom-right-radius: 2px;
}

.assistant .msg-content {
  background: #f5f7fa;
  color: #303133;
  border-bottom-left-radius: 2px;
}

.error-content {
  background: #fef0f0 !important;
  color: #f56c6c !important;
  border: 1px solid #fde2e2;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #909399;
  font-size: 13px;
  padding: 8px 0;
}

.dot-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
