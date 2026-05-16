package com.hjc.chunai.rag;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.markdown.MarkdownDocumentReader;
import org.springframework.ai.reader.markdown.config.MarkdownDocumentReaderConfig;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 基于 Qdrant 的 RAG 服务。
 * <p>
 * - 文档按 metadata.source 区分（一个 source 对应一个原始文件）。
 * - 删除使用 Qdrant 的 metadata 过滤删除，无需手工维护 doc id 列表。
 * - 仅在内存中维护已上传的 source 名单用于 list 接口；服务重启后会通过启动加载与默认文档刷新。
 */
@Service
public class RagService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    /** 已知的文档 source 集合（用于 /rag/list 枚举展示） */
    private final Set<String> knownSources = ConcurrentHashMap.newKeySet();

    public RagService(VectorStore vectorStore, ChatClient.Builder builder) {
        this.vectorStore = vectorStore;

        // 中文短问句与文档标题的向量相似度常在 0.4～0.55，阈值过高会导致检索为空
        QuestionAnswerAdvisor advisor = QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(
                        SearchRequest.builder()
                                .topK(5)
                                .similarityThreshold(0.35)
                                .build()
                )
                .build();

        this.chatClient = builder
                .defaultSystem("""
                        你是基于用户上传文档的问答助手。
                        请优先根据检索到的文档内容回答；若文档中有相关内容，不要声称「上下文中没有信息」。
                        可整理、归纳文档中的要点；仅当文档确实无法支撑时再说明信息不足。
                        """)
                .defaultAdvisors(advisor)
                .build();
    }

    /** RAG 问答 */
    public String ask(String question) {
        return chatClient.prompt()
                .user(question)
                .call()
                .content();
    }

    /**
     * 上传 Markdown 文档：解析切分后写入 Qdrant；同名 source 先按 metadata 过滤删除旧版本。
     */
    public int upload(String source, byte[] content) {
        if (source == null || source.isBlank()) {
            throw new IllegalArgumentException("source 不能为空");
        }
        if (content == null || content.length == 0) {
            throw new IllegalArgumentException("文件内容不能为空");
        }

        // 同名先删，避免重复
        deleteBySource(source);

        MarkdownDocumentReaderConfig config = MarkdownDocumentReaderConfig.builder()
                .withHorizontalRuleCreateDocument(true)
                .withIncludeCodeBlock(false)
                .withIncludeBlockquote(false)
                .withAdditionalMetadata("source", source)
                .build();

        Resource resource = new ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return source;
            }
        };

        List<Document> documents = new MarkdownDocumentReader(resource, config).get();
        if (documents.isEmpty()) {
            return 0;
        }

        vectorStore.add(documents);
        knownSources.add(source);
        return documents.size();
    }

    /**
     * 按文件 source 删除其所有 chunk。
     */
    public int delete(String source) {
        if (source == null || source.isBlank()) {
            return 0;
        }
        int deleted = deleteBySource(source);
        knownSources.remove(source);
        return deleted;
    }

    /**
     * 列出已上传的文档 source 与命中的 chunk 数量（chunk 数量通过一次大 topK 检索粗略统计）。
     */
    public List<Map<String, Object>> list() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (String source : knownSources) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("source", source);
            item.put("chunkCount", countBySource(source));
            result.add(item);
        }
        return result;
    }

    /**
     * 相似度检索（不调用大模型），可选按 source 过滤。
     */
    public List<Map<String, Object>> search(String query, Integer topK, Double threshold, String source) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        SearchRequest.Builder reqBuilder = SearchRequest.builder()
                .query(query)
                .topK(topK == null || topK <= 0 ? 5 : topK)
                .similarityThreshold(threshold == null ? 0.0 : threshold);
        if (source != null && !source.isBlank()) {
            reqBuilder.filterExpression("source == '" + escape(source) + "'");
        }

        List<Document> docs = vectorStore.similaritySearch(reqBuilder.build());
        if (docs == null || docs.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> result = new ArrayList<>(docs.size());
        for (Document doc : docs) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", doc.getId());
            item.put("score", doc.getScore());
            item.put("text", doc.getText());
            item.put("metadata", doc.getMetadata());
            result.add(item);
        }
        return result;
    }

    /** 启动时让 DocumentLoader 登记默认 source */
    void registerSource(String source) {
        if (source != null && !source.isBlank()) {
            knownSources.add(source);
        }
    }

    /** 通过 metadata 过滤删除指定 source 的全部向量；返回删除前的 chunk 数（近似） */
    private int deleteBySource(String source) {
        int before = countBySource(source);
        try {
            vectorStore.delete("source == '" + escape(source) + "'");
        } catch (Exception ignored) {
            // Qdrant 在集合或匹配为空时可能抛错，按 0 处理
            return 0;
        }
        return before;
    }

    /** 通过一次大 topK 的相似检索粗略统计某个 source 的 chunk 数（无精确 count API 时的折中） */
    private int countBySource(String source) {
        try {
            SearchRequest req = SearchRequest.builder()
                    .query(source)
                    .topK(1000)
                    .similarityThreshold(0.0)
                    .filterExpression("source == '" + escape(source) + "'")
                    .build();
            List<Document> docs = vectorStore.similaritySearch(req);
            return docs == null ? 0 : docs.size();
        } catch (Exception ignored) {
            return 0;
        }
    }

    private static String escape(String s) {
        return s.replace("'", "\\'");
    }
}
