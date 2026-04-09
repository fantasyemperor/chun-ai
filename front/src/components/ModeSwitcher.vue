<script setup lang="ts">
import type { ChatMode } from '../types'

defineProps<{
  currentMode: ChatMode
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'change', mode: ChatMode): void
  (e: 'clear'): void
}>()

const modes: { key: ChatMode; label: string; desc: string }[] = [
  { key: 'sse', label: '智能体流式模式', desc: 'SSE 步骤级流式输出' },
  { key: 'normal', label: '智能体普通模式', desc: '等待完整结果返回' },
  { key: 'rag', label: '知识库问答模式', desc: '基于 RAG 的文档问答' },
]
</script>

<template>
  <div class="mode-switcher">
    <h2 class="panel-title">模式选择</h2>
    <div class="mode-list">
      <div
        v-for="m in modes"
        :key="m.key"
        class="mode-card"
        :class="{ active: currentMode === m.key, disabled }"
        @click="!disabled && emit('change', m.key)"
      >
        <div class="mode-label">{{ m.label }}</div>
        <div class="mode-desc">{{ m.desc }}</div>
      </div>
    </div>
    <el-button
      class="clear-btn"
      type="danger"
      plain
      size="small"
      :disabled="disabled"
      @click="emit('clear')"
    >
      清空记录
    </el-button>

    <div class="info-section">
      <h3>接口说明</h3>
      <ul>
        <li><strong>流式模式</strong> → <code>/ai/manus/SseChat</code></li>
        <li><strong>普通模式</strong> → <code>/ai/manus/chat</code></li>
        <li><strong>RAG 模式</strong> → <code>/rag/ask</code></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.mode-switcher {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.mode-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mode-card {
  padding: 12px 14px;
  border: 1.5px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.mode-card:hover:not(.disabled) {
  border-color: #409eff;
}

.mode-card.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.mode-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.clear-btn {
  margin-top: 4px;
}

.info-section {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  font-size: 12px;
  color: #606266;
}

.info-section h3 {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}

.info-section ul {
  margin: 0;
  padding-left: 16px;
}

.info-section li {
  margin-bottom: 4px;
}

.info-section code {
  font-size: 11px;
  background: #e4e7ed;
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
