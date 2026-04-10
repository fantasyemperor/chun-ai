package com.hjc.chunai.tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

@Component
public class TerminalOperationTool {

    //TODO
    private static final boolean IS_WINDOWS = false;

    @Tool(description = "Execute a command in the terminal")
    public String executeTerminalCommand(@ToolParam(description = "Command to execute in the terminal") String command) {
        StringBuilder output = new StringBuilder();

        ProcessBuilder builder;
        Charset charset;
        if (IS_WINDOWS) {
            builder = new ProcessBuilder("cmd.exe", "/c", command);
            charset = Charset.forName("GBK");
        } else {
            builder = new ProcessBuilder("/bin/sh", "-c", command);
            charset = StandardCharsets.UTF_8;
        }
        builder.redirectErrorStream(true);

        try {
            Process process = builder.start();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), charset))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                output.append("Command execution failed with exit code: ").append(exitCode);
            }
        } catch (IOException e) {
            output.append("Error executing command: ").append(e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            output.append("Command interrupted: ").append(e.getMessage());
        }
        return output.toString();
    }
}
