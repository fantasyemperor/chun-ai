package com.hjc.chunai.rag;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    /**
     * 基于知识库的问答
     */
    @GetMapping("/ask")
    public String ask(@RequestParam String question) {
        return ragService.ask(question);
    }

    /**
     * 上传 Markdown 文档到知识库
     * <p>
     * 调用示例：curl -F "file=@/path/to/xxx.md" http://localhost:8080/rag/upload
     */
    @PostMapping("/upload")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        String source = file.getOriginalFilename();
        if (source == null || source.isBlank()) {
            source = "upload-" + System.currentTimeMillis() + ".md";
        }
        int chunkCount = ragService.upload(source, file.getBytes());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("source", source);
        resp.put("chunkCount", chunkCount);
        resp.put("message", chunkCount > 0 ? "上传成功" : "文件解析后无内容");
        return resp;
    }

    /**
     * 列出知识库中已有的所有文档
     */
    @GetMapping("/list")
    public List<Map<String, Object>> list() {
        return ragService.list();
    }

    /**
     * 相似度检索（不调用大模型），用于查看知识库命中片段
     */
    @GetMapping("/search")
    public List<Map<String, Object>> search(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "5") Integer topK,
            @RequestParam(required = false, defaultValue = "0.0") Double threshold,
            @RequestParam(required = false) String source) {
        return ragService.search(query, topK, threshold, source);
    }

    /**
     * 按文件 source 删除知识库中的文档
     */
    @DeleteMapping("/delete")
    public Map<String, Object> delete(@RequestParam String source) {
        int deleted = ragService.delete(source);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("source", source);
        resp.put("deletedChunks", deleted);
        resp.put("message", deleted > 0 ? "删除成功" : "未找到该文档");
        return resp;
    }
}
