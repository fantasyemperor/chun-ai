package com.hjc.chunai.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.markdown.MarkdownDocumentReader;
import org.springframework.ai.reader.markdown.config.MarkdownDocumentReaderConfig;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 启动时把默认的 classpath:md/1.md 写入向量库。
 * 使用 Qdrant 时数据已持久化，这里采用「先按 source 删除再写入」保证幂等。
 */
@Component
public class DocumentLoader implements CommandLineRunner {

    private static final String DEFAULT_SOURCE = "1.md";

    private final VectorStore vectorStore;
    private final RagService ragService;

    public DocumentLoader(VectorStore vectorStore, RagService ragService) {
        this.vectorStore = vectorStore;
        this.ragService = ragService;
    }

    @Override
    public void run(String... args) throws Exception {
        ClassPathResource resource = new ClassPathResource("md/" + DEFAULT_SOURCE);
        if (!resource.exists()) {
            return;
        }

        MarkdownDocumentReaderConfig config = MarkdownDocumentReaderConfig.builder()
                .withHorizontalRuleCreateDocument(true)
                .withIncludeCodeBlock(false)
                .withIncludeBlockquote(false)
                .withAdditionalMetadata("source", DEFAULT_SOURCE)
                .build();

        List<Document> documents = new MarkdownDocumentReader(resource, config).get();
        if (documents.isEmpty()) {
            return;
        }

        // 幂等写入：先删旧版本（如有），再 add
        try {
            vectorStore.delete("source == '" + DEFAULT_SOURCE + "'");
        } catch (Exception ignored) {
            // 集合首次启动可能为空，忽略
        }
        vectorStore.add(documents);
        ragService.registerSource(DEFAULT_SOURCE);
    }
}
