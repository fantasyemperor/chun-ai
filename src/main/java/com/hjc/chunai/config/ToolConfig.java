package com.hjc.chunai.config;

import com.hjc.chunai.tools.TerminalOperationTool;
import com.hjc.chunai.tools.TerminateTool;
import com.hjc.chunai.tools.WebSearchTool;
import org.springframework.ai.support.ToolCallbacks;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ToolConfig {

    @Bean
    public ToolCallback[] toolCallbacks(WebSearchTool webSearchTool,
                                        TerminalOperationTool terminalOperationTool,
                                        TerminateTool terminateTool) {
        return ToolCallbacks.from(webSearchTool, terminalOperationTool, terminateTool);
    }
}
