package com.hjc.chunai.rag;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;


@Service
public class RagService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    public RagService(VectorStore vectorStore, ChatClient.Builder builder) {
        this.vectorStore = vectorStore;



        // 自定义 QuestionAnswerAdvisor
        QuestionAnswerAdvisor advisor = QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(
                        SearchRequest.builder()
                                .topK(5)                          // 检索最相关的 5 个文档块
                                .similarityThreshold(0.6)         // 相似度低于 0.6 的过滤掉
                                .build()
                )
                .build();

        System.out.println("rag使用了");
        this.chatClient = builder
                .defaultAdvisors(advisor)
                .build();


    }




    public String ask(String question) {
        return chatClient.prompt()
                .user(question)
                .call()
                .content();
    }
}