package com.hjc.chunai.service;

import cn.hutool.core.util.StrUtil;
import com.hjc.chunai.advisor.SimpleLoggingAdvisor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.io.UncheckedIOException;

/**
 * 普通对话：仅大模型回复，不注册、不调用任何工具。
 */
@Service
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            你是一个友好、专业的 AI 助手。
            请直接用自然语言回答用户问题。
            不要调用任何外部工具，不要执行系统命令或联网搜索，除非用户明确要求你描述如何做。
            """;

    private final ChatClient chatClient;

    public ChatService(ChatModel dashscopeChatModel) {
        ChatMemoryRepository memoryRepository = new InMemoryChatMemoryRepository();
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(memoryRepository)
                .maxMessages(20)
                .build();
        MessageChatMemoryAdvisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory).build();

        this.chatClient = ChatClient.builder(dashscopeChatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(memoryAdvisor, new SimpleLoggingAdvisor())
                .build();
    }

    public String chat(String userMessage, String chatId) {
        return chatClient.prompt()
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId(chatId)))
                .call()
                .content();
    }

    public void streamToEmitter(String userMessage, String chatId, SseEmitter emitter) {
        String conversationId = conversationId(chatId);
        chatClient.prompt()
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                .stream()
                .content()
                .subscribe(
                        chunk -> {
                            try {
                                emitter.send(chunk);
                            } catch (IOException e) {
                                throw new UncheckedIOException(e);
                            }
                        },
                        emitter::completeWithError,
                        emitter::complete
                );
    }

    private static String conversationId(String chatId) {
        return StrUtil.blankToDefault(chatId, "default");
    }
}
