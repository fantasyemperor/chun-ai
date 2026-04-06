package com.hjc.chunai.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.markdown.MarkdownDocumentReader;
import org.springframework.ai.reader.markdown.config.MarkdownDocumentReaderConfig;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DocumentLoader implements CommandLineRunner {

    private final VectorStore vectorStore;

    public DocumentLoader(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }


    @Override
    public void run(String... args) throws Exception {
        // 配置 Markdown 解析规则
        MarkdownDocumentReaderConfig config = MarkdownDocumentReaderConfig.builder()
                .withHorizontalRuleCreateDocument(true)  // 水平线处切分
                .withIncludeCodeBlock(false)             // 代码块独立成文档
                .withIncludeBlockquote(false)            // 引用块独立成文档
                .withAdditionalMetadata("source", "面试常见问题与回答.md")
                .build();

        // 读取 Markdown 文件
        MarkdownDocumentReader reader = new MarkdownDocumentReader(
                new ClassPathResource("md/面试常见问题与回答.md"),
                config
        );

        // 解析为 Document 列表
        List<Document> documents = reader.get();
        vectorStore.add(documents);



    }
}