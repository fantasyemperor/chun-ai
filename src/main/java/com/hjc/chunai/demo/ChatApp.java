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
public class ChatApp {

    private static final String SYSTEM_PROMPT = "你是一个友好的AI助手。";
    private final ChatClient chatClient;

    public ChatApp(ChatModel dashscopeChatModel, WebSearchTool webSearchTool) {
        ChatMemoryRepository memoryRepository = new InMemoryChatMemoryRepository();
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(memoryRepository)
                .maxMessages(10)
                .build();
        MessageChatMemoryAdvisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory).build();

        chatClient = ChatClient.builder(dashscopeChatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(memoryAdvisor, new SimpleLoggingAdvisor())
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
