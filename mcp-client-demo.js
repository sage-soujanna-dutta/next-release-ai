#!/usr/bin/env node

// MCP Client Example - How to interact with the MCP Server
import { spawn } from 'child_process';

class MCPClient {
  constructor() {
    this.serverProcess = null;
    this.messageId = 1;
  }

  async startServer() {
    console.log("🚀 Starting MCP Server Client Demo");
    
    this.serverProcess = spawn('npm', ['run', 'mcp-server'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("✅ MCP Server started");
  }

  async sendMessage(method, params = {}) {
    const message = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method,
      params
    };

    console.log(`📤 Sending: ${method}`);
    
    return new Promise((resolve, reject) => {
      let responseData = '';
      
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);

      this.serverProcess.stdout.on('data', (data) => {
        responseData += data.toString();
        
        try {
          // Try to parse complete JSON response
          const lines = responseData.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.startsWith('{') && line.includes('"jsonrpc"')) {
              const response = JSON.parse(line);
              if (response.id === message.id) {
                clearTimeout(timeout);
                resolve(response);
                return;
              }
            }
          }
        } catch (e) {
          // Continue collecting data
        }
      });

      // Send the message
      this.serverProcess.stdin.write(JSON.stringify(message) + '\n');
    });
  }

  async demonstrateUsage() {
    try {
      await this.startServer();

      // 1. List all available tools
      console.log("\n📋 Step 1: Listing all available tools");
      const toolsResponse = await this.sendMessage('tools/list');
      console.log(`✅ Found ${toolsResponse.result?.tools?.length || 0} tools`);
      
      if (toolsResponse.result?.tools) {
        console.log("🛠️ Available tools:");
        toolsResponse.result.tools.forEach((tool) => {
          console.log(`  • ${tool.name}: ${tool.description.substring(0, 60)}...`);
        });
      }

      // 2. Test JIRA connection
      console.log("\n🔍 Step 2: Testing JIRA connection");
      const jiraTest = await this.sendMessage('tools/call', {
        name: 'validate_jira_connection',
        arguments: {}
      });
      
      if (jiraTest.result && !jiraTest.result.isError) {
        console.log("✅ JIRA connection successful");
      } else {
        console.log("⚠️ JIRA connection issue:", jiraTest.result?.content?.[0]?.text || 'Unknown error');
      }

      // 3. Generate sprint summary (if JIRA works)
      if (jiraTest.result && !jiraTest.result.isError) {
        console.log("\n📊 Step 3: Generating sprint summary");
        const sprintSummary = await this.sendMessage('tools/call', {
          name: 'sprint_summary_report',
          arguments: {
            sprintNumber: 'SCNT-2025-21',
            includeTeamMetrics: true
          }
        });
        
        if (sprintSummary.result && !sprintSummary.result.isError) {
          console.log("✅ Sprint summary generated successfully");
          console.log("📋 Summary preview:");
          const content = sprintSummary.result.content?.[0]?.text || '';
          console.log(content.substring(0, 200) + '...');
        } else {
          console.log("⚠️ Sprint summary failed:", sprintSummary.result?.content?.[0]?.text || 'Unknown error');
        }
      }

      // 4. Test Teams notification
      console.log("\n📢 Step 4: Testing Teams notification");
      const teamsTest = await this.sendMessage('tools/call', {
        name: 'send_teams_notification',
        arguments: {
          message: "🧪 MCP Server Demo - Testing notification system\n\n✅ MCP Server is working correctly\n📅 " + new Date().toLocaleString(),
          title: "MCP Server Demo",
          isImportant: false
        }
      });
      
      if (teamsTest.result && !teamsTest.result.isError) {
        console.log("✅ Teams notification sent successfully");
      } else {
        console.log("⚠️ Teams notification issue:", teamsTest.result?.content?.[0]?.text || 'Unknown error');
      }

    } catch (error) {
      console.error("❌ Demo failed:", error.message);
    } finally {
      console.log("\n🏁 Demo complete - stopping server");
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
    }
  }

  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

// Run the demonstration
const client = new MCPClient();
client.demonstrateUsage().then(() => {
  console.log("✅ MCP Client demo finished");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Demo error:", error);
  process.exit(1);
});

// Cleanup on exit
process.on('SIGINT', () => {
  client.cleanup();
  process.exit(0);
});
