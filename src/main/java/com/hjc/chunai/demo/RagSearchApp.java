package com.hjc.chunai.demo;

import com.hjc.chunai.advisor.SimpleLoggingAdvisor;
import com.hjc.chunai.tools.WebSearchTool;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Component;

/**
 * 打通 RAG 检索增强 + 联网搜索的对话组件
 */
@Component
@Slf4j
public class RagSearchApp {

    private static final String SYSTEM_PROMPT = """
            你是一个友好的AI助手。当用户提问问题时：
            1. 优先从内部知识库（已加载的文档）中寻找答案
            2. 如果内部知识不足以回答，可以调用搜索工具获取最新信息
            3. 综合两方面信息后给出准确、完整的回答
            """;

    private final ChatClient chatClient;

    public RagSearchApp(
            ChatModel dashscopeChatModel,
            VectorStore vectorStore,
            WebSearchTool webSearchTool
    ) {
        // 多轮对话记忆（保留最近 10 条消息）
        ChatMemoryRepository memoryRepository = new InMemoryChatMemoryRepository();
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(memoryRepository)
                .maxMessages(10)
                .build();
        MessageChatMemoryAdvisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory).build();

        // RAG 检索 Advisor（top-5，相似度阈值 0.6）
        QuestionAnswerAdvisor ragAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(SearchRequest.builder()
                        .topK(5)
                        .similarityThreshold(0.6)
                        .build())
                .build();

        // 构建 ChatClient：系统提示 + 记忆 + RAG + 日志 + 联网搜索工具
        this.chatClient = ChatClient.builder(dashscopeChatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(memoryAdvisor, ragAdvisor, new SimpleLoggingAdvisor())
                .defaultTools(webSearchTool)
                .build();
    }

    /**
     * 发送消息并获取回复
     *
     * @param userMessage 用户消息
     * @param chatId      会话 ID，用于区分不同对话上下文
     * @return AI 回复内容
     */
    public String chat(String userMessage, String chatId) {
        return chatClient.prompt()
                .advisors(a -> a.param("conversationId", chatId))
                .user(userMessage)
                .call()
                .content();
    }
}