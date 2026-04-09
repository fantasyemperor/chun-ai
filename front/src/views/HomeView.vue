<script setup lang="ts">
import { useChat } from '../composables/useChat'
import ModeSwitcher from '../components/ModeSwitcher.vue'
import MessageList from '../components/MessageList.vue'
import ChatInput from '../components/ChatInput.vue'
import ExecutionDetail from '../components/ExecutionDetail.vue'

const {
  currentMode,
  messages,
  isRunning,
  execution,
  send,
  clearAll,
  setMode,
} = useChat()
</script>

<template>
  <div class="home-layout">
    <!-- 左侧：模式切换 -->
    <aside class="left-panel">
      <ModeSwitcher
        :current-mode="currentMode"
        :disabled="isRunning"
        @change="setMode"
        @clear="clearAll"
      />
    </aside>

    <!-- 中间：聊天区域 -->
    <main class="center-panel">
      <div class="chat-header">
        <h1 class="app-title">YuChun AI</h1>
      </div>
      <MessageList :messages="messages" :is-running="isRunning" />
      <ChatInput :disabled="isRunning" @send="send" />
    </main>

    <!-- 右侧：执行详情 -->
    <aside class="right-panel">
      <ExecutionDetail :execution="execution" :current-mode="currentMode" />
    </aside>
  </div>
</template>

<style scoped>
.home-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

.left-panel {
  width: 260px;
  flex-shrink: 0;
  padding: 20px 16px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  padding: 14px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.right-panel {
  width: 320px;
  flex-shrink: 0;
  padding: 20px 16px;
  background: #fff;
  border-left: 1px solid #ebeef5;
  overflow-y: auto;
}
</style>
