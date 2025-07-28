#!/usr/bin/env node

/**
 * Simple MCP Client for Sprint Report Generation
 * Usage: node mcp-client.js [command] [options]
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

class MCPClient {
  constructor() {
    this.server = null;
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = spawn('npx', ['tsx', 'src/index.ts'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverReady = false;
      
      this.server.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('Server:', output.trim());
        
        if (output.includes('✅ Server ready for connections') && !serverReady) {
          serverReady = true;
          resolve();
        }
      });

      this.server.on('error', reject);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Server startup timeout'));
        }
      }, 10000);
    });
  }

  async sendRequest(method, params = {}) {
    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: method,
      params: params
    };

    return new Promise((resolve, reject) => {
      let responseData = '';
      
      const dataHandler = (data) => {
        responseData += data.toString();
        
        try {
          const lines = responseData.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.startsWith('{')) {
              const response = JSON.parse(line);
              if (response.id === request.id) {
                this.server.stdout.removeListener('data', dataHandler);
                resolve(response);
                return;
              }
            }
          }
        } catch (e) {
          // Continue waiting for complete response
        }
      };

      this.server.stdout.on('data', dataHandler);
      
      this.server.stdin.write(JSON.stringify(request) + '\n');
      
      // Timeout after 30 seconds
      setTimeout(() => {
        this.server.stdout.removeListener('data', dataHandler);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  async listTools() {
    try {
      const response = await this.sendRequest('tools/list');
      return response.result?.tools || [];
    } catch (error) {
      console.error('Failed to list tools:', error.message);
      return [];
    }
  }

  async callTool(toolName, toolArgs = {}) {
    try {
      const response = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: toolArgs
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return response.result;
    } catch (error) {
      console.error(`Failed to call tool ${toolName}:`, error.message);
      throw error;
    }
  }

  async close() {
    if (this.server) {
      this.server.kill();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const client = new MCPClient();
  
  try {
    console.log('🚀 Starting MCP Server...');
    await client.startServer();
    console.log('✅ MCP Server ready!\n');

    switch (command) {
      case 'list-tools':
        await listTools(client);
        break;
        
      case 'generate-sprint-report':
        await generateSprintReport(client, args[1]);
        break;
        
      case 'generate-pdf':
        await generatePDFReport(client, args[1]);
        break;
        
      case 'send-teams':
        await sendTeamsNotification(client, args[1]);
        break;
        
      default:
        showHelp();
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

async function listTools(client) {
  console.log('📋 Available Tools:\n');
  
  const tools = await client.listTools();
  const categories = {};
  
  // Group tools by category (inferred from description)
  for (const tool of tools) {
    const category = inferCategory(tool.name);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(tool);
  }
  
  for (const [category, categoryTools] of Object.entries(categories)) {
    console.log(`🎯 ${category}:`);
    for (const tool of categoryTools) {
      console.log(`  • ${tool.name} - ${tool.description}`);
    }
    console.log();
  }
  
  console.log(`Total: ${tools.length} tools available`);
}

async function generateSprintReport(client, sprintNumber) {
  if (!sprintNumber) {
    console.error('❌ Please provide sprint number: node mcp-client.js generate-sprint-report SCNT-2025-22');
    return;
  }
  
  console.log(`📊 Generating comprehensive sprint report for ${sprintNumber}...`);
  
  try {
    const result = await client.callTool('generate_comprehensive_sprint_report', {
      sprintNumber: sprintNumber,
      formats: ['both'],
      sendToTeams: true,
      reportConfig: {
        theme: 'professional',
        includeCharts: true,
        pdfFormat: 'A4'
      }
    });
    
    console.log('✅ Sprint Report Generated!');
    console.log(result.content[0].text);
    
  } catch (error) {
    console.error('❌ Failed to generate sprint report:', error.message);
  }
}

async function generatePDFReport(client, sprintNumber) {
  if (!sprintNumber) {
    console.error('❌ Please provide sprint number');
    return;
  }
  
  console.log(`📄 Generating PDF report for ${sprintNumber}...`);
  
  // First get sprint data
  const sprintData = await client.callTool('fetch_sprint_data', {
    sprintNumber: sprintNumber
  });
  
  // Then generate PDF
  const result = await client.callTool('generate_pdf_report', {
    reportData: sprintData,
    reportType: 'sprint_review',
    sendToTeams: true,
    config: {
      format: 'A4',
      theme: 'professional'
    }
  });
  
  console.log('✅ PDF Generated!');
  console.log(result.content[0].text);
}

async function sendTeamsNotification(client, message) {
  if (!message) {
    console.error('❌ Please provide message');
    return;
  }
  
  const result = await client.callTool('send_teams_notification', {
    message: message,
    title: 'Sprint Report Notification',
    isImportant: true
  });
  
  console.log('✅ Teams notification sent!');
  console.log(result.content[0].text);
}

function inferCategory(toolName) {
  if (toolName.includes('jira') || toolName.includes('sprint_data')) return 'JIRA Management';
  if (toolName.includes('teams') || toolName.includes('confluence')) return 'Integration';
  if (toolName.includes('analysis') || toolName.includes('velocity')) return 'Analysis';
  if (toolName.includes('release') || toolName.includes('report')) return 'Release Management';
  return 'Other';
}

function showHelp() {
  console.log(`
🎯 MCP Client Usage:

Commands:
  list-tools                     - List all available MCP tools
  generate-sprint-report <sprint> - Generate comprehensive sprint report (HTML + PDF + Teams)
  generate-pdf <sprint>          - Generate PDF report only
  send-teams <message>           - Send Teams notification

Examples:
  node mcp-client.js list-tools
  node mcp-client.js generate-sprint-report SCNT-2025-22
  node mcp-client.js generate-pdf SCNT-2025-22
  node mcp-client.js send-teams "Sprint 22 completed!"

Available Sprint Formats:
  • SCNT-2025-22 (standard format)
  • Any valid sprint identifier from your JIRA system
`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MCPClient };
