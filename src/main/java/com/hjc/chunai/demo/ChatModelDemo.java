package com.hjc.chunai.demo;

import jakarta.annotation.Resource;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;

@Component
public class ChatModelDemo {

    @Resource
    private ChatModel dashscopeChatModel;

    public void run(String... args) throws Exception {
        String call = dashscopeChatModel.call("你是什么模型？");
        System.out.println(call);

        AssistantMessage assistantMessage = dashscopeChatModel.call(new Prompt("你好，请介绍一下你自己"))
                .getResult()
                .getOutput();
        System.out.println(assistantMessage.getText());
    }
}
