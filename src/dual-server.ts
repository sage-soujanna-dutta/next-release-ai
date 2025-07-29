#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { MCPToolFactory } from "./core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

class DualModeMCPServer {
  private server: Server;
  private toolFactory: MCPToolFactory;
  private app?: express.Application;
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '3000');
    
    this.server = new Server({
      name: "next-release-ai",
      version: "1.0.0",
    });

    // Initialize tool factory with all categories enabled
    this.toolFactory = new MCPToolFactory({
      enabledCategories: ['release', 'analysis', 'integration', 'jira']
    });

    this.setupMCPHandlers();
  }

  private setupMCPHandlers(): void {
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

  private setupHttpServer(): void {
    this.app = express();
    
    // Middleware
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'next-release-ai-mcp',
        version: '1.0.0',
        mode: 'http'
      });
    });

    // List available tools
    this.app.get('/tools', async (req: Request, res: Response) => {
      try {
        const tools = this.toolFactory.getAllTools();
        const toolDefinitions: Tool[] = tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        }));

        res.json({
          tools: toolDefinitions,
          count: toolDefinitions.length,
          categories: this.toolFactory.getCategories().map(cat => ({
            name: cat.name,
            description: cat.description,
            toolCount: cat.tools.length
          }))
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Failed to list tools',
          message: error.message
        });
      }
    });

    // Execute a tool
    this.app.post('/tools/:toolName/execute', async (req: Request, res: Response) => {
      const { toolName } = req.params;
      const args = req.body || {};

      try {
        const tool = this.toolFactory.getTool(toolName);
        
        if (!tool) {
          return res.status(404).json({
            error: 'Tool not found',
            message: `Tool '${toolName}' not found.`,
            availableTools: this.toolFactory.getAllTools().map(t => t.name)
          });
        }

        const result = await tool.execute(args);

        res.json({
          success: !result.isError,
          result: {
            content: result.content,
            isError: result.isError
          },
          toolName,
          executedAt: new Date().toISOString()
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Tool execution failed',
          message: error.message,
          toolName,
          executedAt: new Date().toISOString()
        });
      }
    });

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Next Release AI MCP Server',
        version: '1.0.0',
        mode: 'http',
        description: 'HTTP-enabled MCP server for automated release notes generation',
        endpoints: {
          health: 'GET /health',
          tools: 'GET /tools',
          execute: 'POST /tools/:toolName/execute'
        },
        toolCount: this.toolFactory.getToolCount(),
        categories: this.toolFactory.getCategoryCount()
      });
    });
  }

  async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error("🚀 Next Release AI MCP Server (STDIO) started successfully!");
    console.error("📱 Mode: STDIO (Compatible with Claude Desktop and MCP clients)");
    console.error(`📊 Total tools loaded: ${this.toolFactory.getToolCount()}`);
    console.error(`📂 Categories available: ${this.toolFactory.getCategoryCount()}`);
    console.error("✅ Server ready for MCP client connections");
  }

  async startHttp(): Promise<void> {
    if (!this.app) {
      this.setupHttpServer();
    }

    return new Promise((resolve, reject) => {
      try {
        this.app!.listen(this.port, () => {
          console.log("🚀 Next Release AI MCP Server (HTTP) started successfully!");
          console.log(`🌐 Mode: HTTP (For hosting and web integration)`);
          console.log(`🌐 Server running on http://localhost:${this.port}`);
          console.log(`📊 Total tools loaded: ${this.toolFactory.getToolCount()}`);
          console.log(`📂 Categories available: ${this.toolFactory.getCategoryCount()}`);
          console.log("\n🔗 Available endpoints:");
          console.log(`  • Health: http://localhost:${this.port}/health`);
          console.log(`  • Tools: http://localhost:${this.port}/tools`);
          console.log(`  • Execute: http://localhost:${this.port}/tools/:toolName/execute`);
          console.log("\n✅ Server ready for HTTP connections");
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Determine mode based on command line arguments or environment
const mode = process.argv[2] || process.env.MCP_MODE || 'stdio';

const server = new DualModeMCPServer();

if (mode === 'http' || mode === 'server') {
  server.startHttp().catch((error) => {
    console.error("❌ Failed to start HTTP server:", error);
    process.exit(1);
  });
} else {
  server.startStdio().catch((error) => {
    console.error("❌ Failed to start STDIO server:", error);
    process.exit(1);
  });
}
