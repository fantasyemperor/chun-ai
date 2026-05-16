package com.hjc.chunai.controller;


import com.hjc.chunai.agent.YuManus;
import com.hjc.chunai.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final YuManus yuManus;
    private final ChatService chatService;

    public AiController(YuManus yuManus, ChatService chatService) {
        this.yuManus = yuManus;
        this.chatService = chatService;
    }

    /**
     * 普通对话：流式输出，不调用工具
     */
    @GetMapping(value = "/chat/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(
            @RequestParam String message,
            @RequestParam(required = false) String chatId) {
        SseEmitter emitter = new SseEmitter(300000L);
        chatService.streamToEmitter(message, chatId, emitter);
        return emitter;
    }

    /**
     * 普通对话：一次性返回，不调用工具
     */
    @GetMapping("/chat")
    public String chat(
            @RequestParam String message,
            @RequestParam(required = false) String chatId) {
        return chatService.chat(message, chatId);
    }

    /**
     * Agent：流式输出思考与工具调用过程
     */
    @GetMapping(value = "/manus/SseChat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter doChatWithManus(@RequestParam String message) {
        return yuManus.runStream(message);
    }

    /**
     * Agent：完整返回（含多步工具调用）
     */
    @GetMapping(value = "/manus/chat")
    public String chatWithManus(@RequestParam String message) {
        return yuManus.run(message);
    }
}
