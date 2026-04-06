package com.hjc.chunai.advisor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.client.advisor.api.AdvisorChain;
import org.springframework.ai.chat.client.advisor.api.BaseAdvisor;

public class SimpleLoggingAdvisor implements BaseAdvisor {
    
    private static final Logger log = LoggerFactory.getLogger(SimpleLoggingAdvisor.class);
    
    @Override
    public String getName() {
        return "simpleLogging";
    }
    
    @Override
    public int getOrder() {
        return 0;  // 执行顺序，数字越小越先执行
    }
    
    @Override
    public ChatClientRequest before(ChatClientRequest request, AdvisorChain chain) {
        // 请求前打印用户消息
        String userMessage = request.prompt().getUserMessage().getText();
        log.info("用户问题: {}", userMessage);
        return request;  // 不修改请求，直接返回
    }
    
    @Override
    public ChatClientResponse after(ChatClientResponse response, AdvisorChain chain) {
        // 响应后打印 AI 回复
        String aiResponse = response.chatResponse().getResult().getOutput().getText();
        log.info("AI回复: {}", aiResponse);
        return response;  // 不修改响应，直接返回
    }
}