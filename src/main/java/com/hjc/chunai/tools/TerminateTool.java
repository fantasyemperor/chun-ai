package com.hjc.chunai.tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

/**
 * 终止工具：Agent 完成任务后调用此工具结束执行循环
 */
@Component
public class TerminateTool {

    @Tool(description = "Terminate the interaction when the task is complete or when you determine that no further actions are needed. Call this to signal that the task has been finished.")
    public String terminate(@ToolParam(description = "Final summary of the completed task or reason for termination") String summary) {
        return summary;
    }
}
