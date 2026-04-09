package com.hjc.chunai.controller;


import com.hjc.chunai.agent.YuManus;
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

    public AiController(YuManus yuManus) {
        this.yuManus = yuManus;
    }

    /**
     * 流式调用 Manus 超级智能体
     *
     * @param message 用户输入的消息
     * @return SSE 流式响应
     */
    @GetMapping(value = "/manus/SseChat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter doChatWithManus(@RequestParam String message) {
        return yuManus.runStream(message);
    }

    @GetMapping(value = "/manus/chat")
    public String ChatWithManus(@RequestParam String message) {
        return yuManus.run(message);

    }


}
