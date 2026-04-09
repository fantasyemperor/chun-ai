<script setup lang="ts">
import type { ExecutionState } from '../types'

defineProps<{
  execution: ExecutionState
  currentMode: string
}>()

const statusLabels: Record<string, { text: string; type: string }> = {
  idle: { text: '空闲', type: 'info' },
  running: { text: '运行中', type: '' },
  done: { text: '已完成', type: 'success' },
  error: { text: '错误', type: 'danger' },
}
</script>

<template>
  <div class="execution-detail">
    <h2 class="panel-title">执行详情</h2>

    <div class="status-row">
      <span class="status-label">当前状态：</span>
      <el-tag :type="(statusLabels[execution.status]?.type as any) || 'info'" size="small">
        {{ statusLabels[execution.status]?.text || execution.status }}
      </el-tag>
    </div>

    <div v-if="currentMode === 'sse'" class="steps-section">
      <h3 class="section-title">步骤记录</h3>
      <div v-if="execution.steps.length === 0" class="empty-steps">
        暂无步骤
      </div>
      <div v-else class="steps-list">
        <div
          v-for="(step, idx) in execution.steps"
          :key="idx"
          class="step-item"
        >
          <span class="step-index">{{ idx + 1 }}</span>
          <pre class="step-content">{{ step }}</pre>
        </div>
      </div>
    </div>

    <div v-if="execution.summary" class="summary-section">
      <h3 class="section-title">最终结果</h3>
      <pre class="summary-content">{{ execution.summary }}</pre>
    </div>

    <div v-if="execution.errorMsg" class="error-section">
      <h3 class="section-title">错误信息</h3>
      <div class="error-content">{{ execution.errorMsg }}</div>
    </div>
  </div>
</template>

<style scoped>
.execution-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.section-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.empty-steps {
  font-size: 13px;
  color: #c0c4cc;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.step-item {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
}

.step-index {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.step-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  color: #303133;
  line-height: 1.5;
}

.summary-section {
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
}

.summary-content {
  margin: 0;
  padding: 10px;
  background: #f0f9eb;
  border-radius: 6px;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  color: #303133;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.5;
}

.error-section {
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
}

.error-content {
  padding: 10px;
  background: #fef0f0;
  border-radius: 6px;
  font-size: 13px;
  color: #f56c6c;
}
</style>
