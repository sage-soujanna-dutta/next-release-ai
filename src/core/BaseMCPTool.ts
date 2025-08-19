import { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface MCPToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  execute(args: any): Promise<MCPToolResult>;
}

export interface MCPToolCategory {
  name: string;
  description: string;
  tools: MCPTool[];
}

export interface ToolExecutionContext {
  toolName: string;
  startTime: number;
  args: any;
}

export abstract class BaseMCPTool implements MCPTool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: any;

  abstract execute(args: any): Promise<MCPToolResult>;

  protected createSuccessResponse(message: string): MCPToolResult {
    return {
      content: [{ type: "text", text: message }],
      isError: false
    };
  }

  protected createErrorResponse(message: string): MCPToolResult {
    return {
      content: [{ type: "text", text: `❌ ${message}` }],
      isError: true
    };
  }

  protected validateRequiredArgs(args: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!args[field]) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }

  protected logExecution(context: ToolExecutionContext): void {
    const duration = Date.now() - context.startTime;
    console.log(`🔧 Tool: ${context.toolName} executed in ${duration}ms`);
  }
}
