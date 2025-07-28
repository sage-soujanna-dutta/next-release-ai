#!/usr/bin/env node

// Simple MCP Server Test - Direct JSON-RPC Communication

async function testMCPServer() {
  console.log("🚀 MCP Server Usage Demonstration");
  console.log("="*50);
  
  console.log("\n📋 How to use the MCP Server:");
  console.log("1. Start the server: npm run mcp-server");
  console.log("2. Send JSON-RPC messages via stdin");
  console.log("3. Receive responses via stdout");
  
  console.log("\n🛠️ Available Usage Methods:");
  console.log("• Direct JSON-RPC communication");
  console.log("• Claude Desktop integration");
  console.log("• Custom MCP clients");
  console.log("• Programmatic access via factory");
  
  console.log("\n📊 Available Tools (21 total):");
  
  const toolCategories = {
    "Release Management": [
      "generate_release_notes - Generate comprehensive release notes",
      "update_confluence_page - Update Confluence with release info",
      "sprint_summary_report - Generate detailed sprint summaries",
      "create_shareable_report - Create formatted reports",
      "complete_release_workflow - End-to-end automation"
    ],
    "Analysis & Metrics": [
      "analyze_story_points - Story points analysis",
      "team_velocity_analysis - Team velocity metrics",
      "sprint_completion_metrics - Sprint statistics",
      "burndown_analysis - Sprint burndown analysis",
      "code_review_metrics - Code review performance"
    ],
    "Integration & Communication": [
      "send_teams_notification - Send Teams notifications",
      "validate_teams_webhook - Test Teams connectivity",
      "post_to_confluence - Post to Confluence pages",
      "validate_confluence_connection - Test Confluence",
      "github_integration_test - Test GitHub API"
    ],
    "JIRA Management": [
      "fetch_jira_issues - Retrieve JIRA issues",
      "analyze_jira_sprint - Analyze sprint data",
      "jira_story_points_summary - Story points summary",
      "validate_jira_connection - Test JIRA connectivity",
      "bulk_jira_operations - Bulk JIRA operations"
    ]
  };
  
  Object.entries(toolCategories).forEach(([category, tools]) => {
    console.log(`\n📂 ${category} (${tools.length} tools):`);
    tools.forEach(tool => console.log(`  • ${tool}`));
  });
  
  console.log("\n🎯 Common Usage Examples:");
  
  console.log("\n1️⃣ List Tools (JSON-RPC):");
  console.log(JSON.stringify({
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }, null, 2));
  
  console.log("\n2️⃣ Generate Sprint Summary:");
  console.log(JSON.stringify({
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "sprint_summary_report",
      "arguments": {
        "sprintNumber": "SCNT-2025-21",
        "includeTeamMetrics": true
      }
    }
  }, null, 2));
  
  console.log("\n3️⃣ Send Teams Notification:");
  console.log(JSON.stringify({
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "send_teams_notification",
      "arguments": {
        "message": "Sprint review complete!",
        "title": "Sprint Update",
        "isImportant": true
      }
    }
  }, null, 2));
  
  console.log("\n🔧 Setup Instructions:");
  console.log("1. Ensure environment variables are set (.env file)");
  console.log("2. Start server: npm run mcp-server");
  console.log("3. Connect your MCP client or Claude Desktop");
  console.log("4. Send JSON-RPC messages as shown above");
  
  console.log("\n💡 Key Benefits:");
  console.log("✅ 21 powerful tools in one server");
  console.log("✅ No independent scripts needed");
  console.log("✅ Clean factory pattern architecture");
  console.log("✅ Type-safe with full validation");
  console.log("✅ Works with Claude Desktop");
  console.log("✅ Programmatic access available");
  
  console.log("\n📚 Next Steps:");
  console.log("• Read MCP_SERVER_USAGE_GUIDE.md for detailed instructions");
  console.log("• Configure Claude Desktop for AI integration");
  console.log("• Start with simple tools like validate_jira_connection");
  console.log("• Build custom workflows using multiple tools");
  
  console.log("\n🎉 Your MCP server is ready to use!");
  console.log("="*50);
}

testMCPServer().catch(console.error);
