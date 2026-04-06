package com.hjc.chunai.demo;

import com.hjc.chunai.advisor.SimpleLoggingAdvisor;
import com.hjc.chunai.tools.WebSearchTool;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Component;


@Component
@Slf4j
public class app   {


        private WebSearchTool webSearchTool;

        private static final String SYSTEM_PROMPT = "你是一个友好的AI助手。";
        private final ChatClient chatClient;

        public app(ChatModel dashscopeChatModel,WebSearchTool webSearchTool) {
            // 新版本：需要分离存储和策略

            // 步骤1: 创建存储库（负责实际存储消息）
            ChatMemoryRepository memoryRepository = new InMemoryChatMemoryRepository();

            // 步骤2: 创建聊天记忆管理器（负责管理策略，如保留最近N条消息）
            ChatMemory chatMemory = MessageWindowChatMemory.builder()
                    .chatMemoryRepository(memoryRepository)
                    .maxMessages(10)  // 保留最近10条消息
                    .build();

            MessageChatMemoryAdvisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory)
                    .build();

            // 步骤3: 构建 ChatClient
            chatClient = ChatClient.builder(dashscopeChatModel)
                    .defaultSystem(SYSTEM_PROMPT)
                    .defaultAdvisors(memoryAdvisor,new  SimpleLoggingAdvisor())
                    .defaultTools(webSearchTool)
                    .build();
        }

        public String chat(String userMessage, String chatId) {
            return chatClient.prompt()
                    .user(userMessage)
                    .advisors(advisor -> advisor.param("conversationId", chatId))
                    .call()
                    .content();
        }



    }



