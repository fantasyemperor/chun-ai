# Chun AI API 文档

默认 Base URL：`http://localhost:8888`（Docker 生产环境前端经 Nginx 代理时，浏览器侧使用相对路径 `/ai`、`/rag` 即可）。

除特别说明外，响应 `Content-Type` 为 `text/plain`（字符串）或 `application/json`。

---

## 对话接口 `/ai`

普通对话**不调用任何工具**，由 `ChatService` 处理；支持可选 `chatId` 以区分会话（内存窗口最多保留 20 条消息）。

### 流式对话（SSE）

```
GET /ai/chat/sse?message={message}&chatId={chatId}
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `message` | 是 | 用户输入 |
| `chatId` | 否 | 会话 ID，缺省为 `default` |

- **响应**：`text/event-stream`，每个 SSE `data` 字段为模型输出的一小段文本。
- **超时**：服务端 `SseEmitter` 超时 300 秒。

**curl 示例**

```bash
curl -N "http://localhost:8888/ai/chat/sse?message=你好&chatId=user-1"
```

**前端调用**：`streamPlainChat()`（`front/src/lib/api.ts`）

---

### 一次性对话

```
GET /ai/chat?message={message}&chatId={chatId}
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `message` | 是 | 用户输入 |
| `chatId` | 否 | 会话 ID |

- **响应**：完整回复字符串。

```bash
curl "http://localhost:8888/ai/chat?message=用一句话介绍Spring%20AI"
```

---

## Agent 接口 `/ai`

由 `YuManus` 智能体处理，支持多步推理与工具调用（搜索、终端、终止），最多 **20** 步。

### 流式 Agent（SSE）

```
GET /ai/manus/SseChat?message={message}
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `message` | 是 | 任务描述 |

- **响应**：`text/event-stream`，流式输出思考过程、工具调用与最终结果文本。

```bash
curl -N "http://localhost:8888/ai/manus/SseChat?message=搜索今天杭州天气并总结"
```

**前端调用**：`streamAgentChat()`

---

### 一次性 Agent

```
GET /ai/manus/chat?message={message}
```

- **响应**：完成全部工具循环后的最终字符串。

```bash
curl "http://localhost:8888/ai/manus/chat?message=列出当前目录下的文件"
```

> **注意**：终端工具在服务器本机执行命令，仅适合开发/受信环境。

---

## 知识库接口 `/rag`

向量存储使用 **Qdrant**，Embedding 与问答均走 DashScope。文档格式限定为 **Markdown**。

### 基于知识库问答

```
GET /rag/ask?question={question}
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `question` | 是 | 用户问题 |

- **响应**：基于检索上下文的模型回答（纯文本）。

```bash
curl "http://localhost:8888/rag/ask?question=文档里提到了哪些要点"
```

---

### 上传文档

```
POST /rag/upload
Content-Type: multipart/form-data
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `file` | 是 | `.md` 文件 |

**响应 JSON**

```json
{
  "source": "example.md",
  "chunkCount": 12,
  "message": "上传成功"
}
```

```bash
curl -F "file=@./my-doc.md" http://localhost:8888/rag/upload
```

同名 `source`（文件名）会先删除旧向量再写入。

---

### 文档列表

```
GET /rag/list
```

**响应**：JSON 数组，每项包含 `source`、`chunkCount`（近似统计）。

```json
[
  { "source": "1.md", "chunkCount": 5 }
]
```

---

### 相似度检索（不调用大模型）

```
GET /rag/search?query={query}&topK={topK}&threshold={threshold}&source={source}
```

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | 是 | — | 检索语句 |
| `topK` | 否 | `5` | 返回条数 |
| `threshold` | 否 | `0.0` | 相似度下限 |
| `source` | 否 | — | 仅检索指定文件名 |

**响应**：JSON 数组，字段包括 `id`、`score`、`text`、`metadata`。

```bash
curl "http://localhost:8888/rag/search?query=配置说明&topK=3"
```

---

### 删除文档

```
DELETE /rag/delete?source={source}
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `source` | 是 | 上传时的文件名（如 `example.md`） |

**响应 JSON**

```json
{
  "source": "example.md",
  "deletedChunks": 12,
  "message": "删除成功"
}
```

```bash
curl -X DELETE "http://localhost:8888/rag/delete?source=example.md"
```

---

## 错误处理

| HTTP 状态 | 场景 |
|-----------|------|
| `400` | 参数非法（如上传空文件） |
| `500` | 模型/向量库/工具执行异常 |

流式接口在连接中断或超时时，客户端应关闭 `EventSource` 并提示用户重试。

---

## 跨域

后端 `CorsConfig` 对 `/**` 放行常见方法与请求头。本地开发推荐通过 Vite 或 Nginx 代理访问 API，避免浏览器直连跨域问题。

## 相关源码

| 路径 | 职责 |
|------|------|
| `controller/AiController.java` | `/ai` 路由 |
| `rag/RagController.java` | `/rag` 路由 |
| `service/ChatService.java` | 普通对话与记忆 |
| `agent/YuManus.java` | Agent 入口 |
| `rag/RagService.java` | RAG 业务逻辑 |
