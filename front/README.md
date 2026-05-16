# Chun AI 前端

Chun AI 的 Web 控制台，基于 **React 18 + Vite 6 + TypeScript + Tailwind CSS v4**，暖色 Claude 风格界面。

## 功能模块

| 页面 | 路由视图 | 后端接口 |
|------|----------|----------|
| **对话** | `ChatView` | `GET /ai/chat/sse`（SSE 流式） |
| **AI 智能助手** | `AgentView` | `GET /ai/manus/SseChat`（SSE，含工具过程） |
| **知识库** | `RagView` | `/rag/upload`、`/rag/list`、`/rag/ask`、`/rag/search`、`/rag/delete` |

能力概览：

- SSE 流式打字与 Markdown（GFM）渲染
- Agent 时间线展示思考与工具调用
- Markdown 文档上传、列表、检索预览与 RAG 问答

## 开发

**前置条件**：后端运行在 `http://localhost:8888`，且 Qdrant 已启动（见项目根目录 [README.md](../README.md)）。

```bash
cd front
npm install
npm run dev
```

访问 http://localhost:5173 。

`vite.config.ts` 已将 `/ai`、`/rag` 代理到 `8888`：

```ts
proxy: {
  '/ai': { target: 'http://localhost:8888', changeOrigin: true },
  '/rag': { target: 'http://localhost:8888', changeOrigin: true },
}
```

## 构建

```bash
npm run build
```

产物在 `dist/`。Docker 镜像使用 Nginx 托管静态文件，并将 `/ai/`、`/rag/` 反向代理到 `backend:8888`。

## 目录说明

```
front/src/
├── App.tsx              # 布局与导航（桌面侧栏 / 移动抽屉）
├── views/
│   ├── ChatView.tsx     # 普通对话
│   ├── AgentView.tsx    # Agent 任务
│   └── RagView.tsx      # 知识库
├── components/
│   ├── Composer.tsx     # 输入框
│   └── Message.tsx      # 消息气泡
├── lib/
│   ├── api.ts           # 后端 API 封装
│   └── utils.ts         # 样式工具 cn()
└── styles/globals.css   # 设计令牌与全局样式
```

## API 客户端

详见 `src/lib/api.ts`：

- `streamPlainChat` — 普通对话 SSE
- `streamAgentChat` — Agent SSE
- `ragAsk` / `ragUpload` / `ragList` / `ragSearch` / `ragDelete` — 知识库 CRUD

完整 HTTP 说明见 [docs/API.md](../docs/API.md)。

## 设计系统

| 令牌 | 值 / 说明 |
|------|-----------|
| 底色 | `#faf9f5` 米白 |
| 主色 | `#c96442` 赤陶橘 |
| 强调 | `#6b8e7f` 苔藓绿 |
| 字体 | Inter（正文）/ Noto Serif SC（标题）/ JetBrains Mono（代码） |

CSS 变量定义在 `src/styles/globals.css`。
