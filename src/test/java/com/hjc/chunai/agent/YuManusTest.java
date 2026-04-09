package com.hjc.chunai.agent;


import jakarta.annotation.Resource;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class YuManusTest {

    @Resource
    private YuManus yuManus;

    @Test
    void run() {
        String userPrompt = """  
                帮我在网上搜索windows下怎么使用命令行测试与百度的延迟 并帮我测试""";
        String answer = yuManus.run(userPrompt);
        Assertions.assertNotNull(answer);
    }
}
