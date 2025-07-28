#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { MCPToolFactory } from "./core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

class MCPServer {
  private server: Server;
  private toolFactory: MCPToolFactory;

  constructor() {
    this.server = new Server({
      name: "next-release-ai",
      version: "1.0.0",
    });

    // Initialize tool factory with all categories enabled
    this.toolFactory = new MCPToolFactory({
      enabledCategories: ['release', 'analysis', 'integration', 'jira']
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.toolFactory.getAllTools();
      const toolDefinitions: Tool[] = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));

      return { tools: toolDefinitions };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;

      try {
        // Find and execute the requested tool
        const tool = this.toolFactory.getTool(toolName);
        
        if (!tool) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Tool '${toolName}' not found. Available tools: ${this.toolFactory.getAllTools().map(t => t.name).join(', ')}`,
              },
            ],
            isError: true,
          };
        }

        // Execute the tool
        const result = await tool.execute(args || {});

        return {
          content: [
            {
              type: "text",
              text: result.content,
            },
          ],
          isError: result.isError,
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing tool '${toolName}': ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Log startup information
    console.error("🚀 Next Release AI MCP Server started successfully!");
    console.error(`📊 Total tools loaded: ${this.toolFactory.getToolCount()}`);
    console.error(`📂 Categories available: ${this.toolFactory.getCategoryCount()}`);
    console.error("📋 Tool categories:");
    
    this.toolFactory.getCategories().forEach(category => {
      console.error(`  • ${category.name}: ${category.tools.length} tools - ${category.description}`);
    });
    
    console.error("✅ Server ready for connections");
  }
}

// Start the server
const server = new MCPServer();
server.start().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
