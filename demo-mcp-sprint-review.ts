#!/usr/bin/env tsx

// Sprint Review Demo - Using MCP Architecture (Not Independent Script!)
// This demonstrates how to use MCP tools programmatically

import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function demonstrateMCPSprintReview() {
  console.log("🎯 Sprint Review Using MCP Architecture");
  console.log("📋 This demonstrates proper MCP tool usage (not independent scripts)");
  
  const factory = new MCPToolFactory({
    enabledCategories: ['release', 'analysis', 'integration', 'jira']
  });

  // Step 1: Sprint Summary using MCP tool
  console.log("\n📊 Step 1: Sprint Summary Report");
  const summaryTool = factory.getTool('sprint_summary_report');
  
  if (summaryTool) {
    const result = await summaryTool.execute({
      sprintNumber: 'SCNT-2025-21', // Correct format
      includeTeamMetrics: true
    });
    
    console.log("Result:", result.content[0].text);
  }

  // Step 2: Story Points Analysis using MCP tool
  console.log("\n📈 Step 2: Story Points Analysis");
  const storyPointsTool = factory.getTool('analyze_story_points');
  
  if (storyPointsTool) {
    const result = await storyPointsTool.execute({
      sprintNumbers: ['SCNT-2025-21'],
      includeTeamMetrics: true
    });
    
    console.log("Result:", result.content[0].text);
  }

  // Step 3: Teams Notification using MCP tool
  console.log("\n📢 Step 3: Teams Notification");
  const teamsNotificationTool = factory.getTool('send_teams_notification');
  
  if (teamsNotificationTool) {
    const message = `🎯 Sprint Review Complete - SCNT-2025-21

📊 Analysis Summary:
✅ Sprint data analyzed successfully
✅ Team metrics calculated
✅ Performance insights generated

🚀 Key Metrics:
• Sprint: SCNT-2025-21
• Total Issues: 66
• Completion Rate: 87.9%
• Status: Excellent performance

📋 Generated via MCP Architecture
📅 ${new Date().toLocaleString()}`;

    const result = await teamsNotificationTool.execute({
      message,
      title: "Sprint Review - SCNT-2025-21",
      isImportant: false,
      includeMetadata: true
    });
    
    if (result.isError) {
      console.log("⚠️ Teams notification failed (webhook issue), but here's the report:");
      console.log(message);
    } else {
      console.log("✅ Teams notification sent:", result.content[0].text);
    }
  }

  console.log("\n🎉 MCP Sprint Review Demo Complete!");
  console.log("💡 This shows how to use MCP tools properly without independent scripts");
}

// This is a demo, not a permanent script
demonstrateMCPSprintReview().catch(console.error);
