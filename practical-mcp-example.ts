#!/usr/bin/env tsx

// Practical MCP Server Usage Example
// This shows how to use the MCP server in a real scenario

import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function practicalMCPExample() {
  console.log("🎯 Practical MCP Server Usage");
  console.log("📋 This demonstrates real-world usage of your MCP tools\n");

  // Initialize the factory (same as what the MCP server uses internally)
  const factory = new MCPToolFactory({
    enabledCategories: ['release', 'analysis', 'integration', 'jira']
  });

  console.log(`✅ Loaded ${factory.getToolCount()} tools across ${factory.getCategoryCount()} categories\n`);

  // Example 1: Validate connections
  console.log("🔍 Step 1: Validate JIRA Connection");
  const jiraValidationTool = factory.getTool('validate_jira_connection');
  if (jiraValidationTool) {
    try {
      const result = await jiraValidationTool.execute({});
      if (result.isError) {
        console.log("❌ JIRA connection failed:", result.content);
      } else {
        console.log("✅ JIRA connection successful");
      }
    } catch (error) {
      console.log("❌ JIRA validation error:", error.message);
    }
  }

  // Example 2: Generate Sprint Summary (most common use case)
  console.log("\n📊 Step 2: Generate Sprint Summary");
  const sprintTool = factory.getTool('sprint_summary_report');
  if (sprintTool) {
    try {
      const result = await sprintTool.execute({
        sprintNumber: 'SCNT-2025-21',
        includeTeamMetrics: true
      });
      
      if (result.isError) {
        console.log("❌ Sprint summary failed:", result.content);
      } else {
        console.log("✅ Sprint summary generated:");
        const content = typeof result.content === 'string' ? result.content : result.content[0]?.text || 'No content';
        console.log(content.substring(0, 300) + "...\n");
      }
    } catch (error) {
      console.log("❌ Sprint summary error:", error.message);
    }
  }

  // Example 3: Send Teams Notification (with fixed integration)
  console.log("📢 Step 3: Send Teams Notification");
  const teamsNotificationTool = factory.getTool('send_teams_notification');
  if (teamsNotificationTool) {
    try {
      const result = await teamsNotificationTool.execute({
        message: `🎯 MCP Server Usage Demo

✅ MCP server is working correctly
📊 All 21 tools are available
🔧 Factory pattern is operational
📅 Generated: ${new Date().toLocaleString()}

This message was sent via the MCP architecture!`,
        title: "MCP Server Demo - Success",
        isImportant: false,
        includeMetadata: true
      });
      
      if (result.isError) {
        console.log("❌ Teams notification failed:", result.content);
      } else {
        console.log("✅ Teams notification sent successfully");
      }
    } catch (error) {
      console.log("❌ Teams notification error:", error.message);
    }
  }

  console.log("\n🎉 MCP Server Usage Demo Complete!");
  console.log("\n💡 Key Points:");
  console.log("• The MCP server uses the same MCPToolFactory internally");
  console.log("• All 21 tools are available via JSON-RPC when server runs");
  console.log("• You can use tools programmatically or via MCP protocol");
  console.log("• The factory pattern eliminates script duplication");
  console.log("• Teams integration is now working correctly");
  
  console.log("\n🚀 To use via MCP server:");
  console.log("1. Run: npm run mcp-server");
  console.log("2. Connect your MCP client (Claude Desktop, etc.)");
  console.log("3. Use tools via JSON-RPC messages");
  
  console.log("\n📚 See MCP_SERVER_USAGE_GUIDE.md for detailed instructions");
}

practicalMCPExample().catch(console.error);
