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
        <p class="app-subtitle">自主规划智能体</p>
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
  background: linear-gradient(160deg, #e8eaf6 0%, #f5f7fa 40%, #e3f2fd 100%);
}

.chat-header {
  padding: 18px 24px;
  border-bottom: 1px solid rgba(200, 210, 230, 0.5);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(16px);
}

.app-title {
  margin: 0;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #409eff 0%, #6366f1 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.app-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #909399;
  letter-spacing: 1px;
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
