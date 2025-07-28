#!/usr/bin/env node

/**
 * Demo MCP Client with Mock Data
 * Shows how to use MCP server without real JIRA/Teams integration
 */

import { MCPClient } from './mcp-client.js';

class DemoMCPClient {
  async demonstrateSprintReport() {
    console.log('🎯 Demo: MCP Server Sprint Report Generation\n');
    
    const client = new MCPClient();
    
    try {
      console.log('🚀 Starting MCP Server...');
      await client.startServer();
      console.log('✅ MCP Server ready!\n');

      // Demo 1: List all tools
      console.log('📋 Demo 1: Listing all available tools');
      const tools = await client.listTools();
      console.log(`Found ${tools.length} tools across 4 categories\n`);

      // Demo 2: Generate Teams notification (works without external deps)
      console.log('📱 Demo 2: Sending Teams notification');
      try {
        const teamsResult = await client.callTool('send_teams_notification', {
          message: 'Demo: Sprint SCNT-2025-22 report generation completed!',
          title: 'MCP Server Demo',
          isImportant: false
        });
        console.log('✅ Teams notification result:', teamsResult.content[0].text);
      } catch (error) {
        console.log('ℹ️  Teams integration not configured (expected for demo)');
      }

      // Demo 3: Show how to use HTML report generator
      console.log('\n📄 Demo 3: HTML Report Generator (structure)');
      const mockSprintData = {
        sprintId: 'SCNT-2025-22',
        period: 'Dec 16, 2024 - Dec 30, 2024',
        totalIssues: 15,
        completedIssues: 12,
        completionRate: 80,
        totalStoryPoints: 42,
        completedStoryPoints: 34,
        contributors: [
          { name: 'Alice Smith', issuesCount: 5, completedCount: 4 },
          { name: 'Bob Johnson', issuesCount: 6, completedCount: 5 },
          { name: 'Carol Williams', issuesCount: 4, completedCount: 3 }
        ]
      };

      try {
        const htmlResult = await client.callTool('generate_html_report', {
          reportType: 'sprint_analysis',
          data: mockSprintData,
          templateStyle: 'professional',
          includeCharts: true
        });
        console.log('✅ HTML report generated:', htmlResult.content[0].text);
      } catch (error) {
        console.log('ℹ️  HTML generator ready, mock data structure shown above');
      }

      // Demo 4: Show JIRA tools available
      console.log('\n🎫 Demo 4: JIRA Management Tools Available');
      const jiraTools = tools.filter(tool => 
        tool.name.includes('jira') || 
        tool.name.includes('fetch') || 
        tool.name.includes('sprint')
      );
      
      console.log('Available JIRA tools:');
      jiraTools.forEach(tool => {
        console.log(`  • ${tool.name} - ${tool.description}`);
      });

      console.log('\n🎉 Demo Complete!');
      console.log('\n🎯 To use with real data, configure:');
      console.log('  • JIRA_DOMAIN, JIRA_TOKEN in .env');
      console.log('  • TEAMS_WEBHOOK_URL for notifications');
      console.log('  • Then run: node mcp-client.js generate-sprint-report SCNT-2025-22');
      
    } catch (error) {
      console.error('❌ Demo error:', error.message);
    } finally {
      await client.close();
    }
  }

  async showArchitecturalBenefits() {
    console.log('\n🏗️  MCP Server vs Standalone Scripts:\n');
    
    console.log('❌ Old Approach (Standalone Scripts):');
    console.log('  • generate-scnt-2025-22-executive-pdf.ts');
    console.log('  • generate-professional-html-pdf.ts');
    console.log('  • send-pdf-teams-notification.ts');
    console.log('  • clean-teams-message-preview.ts');
    console.log('  • ... (50+ similar files)');
    
    console.log('\n✅ New Approach (MCP Server):');
    console.log('  • One server: npm run mcp-server');
    console.log('  • One command: node mcp-client.js generate-sprint-report SCNT-2025-22');
    console.log('  • 23 tools, 4 categories, shared services');
    console.log('  • Extensible, maintainable, professional');
  }
}

// Main demo execution
async function main() {
  const demo = new DemoMCPClient();
  
  await demo.demonstrateSprintReport();
  await demo.showArchitecturalBenefits();
  
  console.log('\n🚀 Ready to eliminate script proliferation with MCP Server!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DemoMCPClient };
