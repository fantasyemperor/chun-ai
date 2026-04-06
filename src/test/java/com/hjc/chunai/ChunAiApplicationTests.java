package com.hjc.chunai;

import com.hjc.chunai.demo.RagSearchApp;
import com.hjc.chunai.demo.app;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

@SpringBootTest
class ChunAiApplicationTests {

    @Autowired
    private app app1;

    @Autowired
    private RagSearchApp ragSearchApp;



    @Test
    void chat(){
        String chatId = UUID.randomUUID().toString();
        // 第一轮
        String message = "你好，我是程序员鱼纯, 查询 鱼皮的网站是什么";
        String answer = app1.chat(message, chatId);
        Assertions.assertNotNull(answer);
//
//        // 第二轮
//        message = "我想让另一半（纯鱼）更爱我";
//        answer = app1.chat(message, chatId);
//        Assertions.assertNotNull(answer);
//        // 第三轮
//        message = "我的另一半叫什么来着？刚跟你说过，帮我回忆一下";
//        answer = app1.chat(message, chatId);
//        Assertions.assertNotNull(answer);

    }

    @Test
    void ragSearch() {
        String chatId = UUID.randomUUID().toString();
        String message = "你好，请介绍一下你自己";
        String answer = ragSearchApp.chat(message, chatId);
        Assertions.assertNotNull(answer);
    }

}


