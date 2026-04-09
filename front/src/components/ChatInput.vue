<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'send', text: string): void
}>()

const inputText = ref('')

function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="chat-input">
    <el-input
      v-model="inputText"
      :disabled="disabled"
      placeholder="输入消息..."
      size="large"
      @keydown="handleKeydown"
    >
      <template #append>
        <el-button
          type="primary"
          :disabled="disabled || !inputText.trim()"
          @click="handleSend"
        >
          发送
        </el-button>
      </template>
    </el-input>
    <div class="input-hint" v-if="disabled">
      请求执行中，请等待完成...
    </div>
  </div>
</template>

<style scoped>
.chat-input {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  background: #fff;
}

.input-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #e6a23c;
}
</style>
