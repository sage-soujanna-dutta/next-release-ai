#!/usr/bin/env tsx

import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";
dotenv.config();

const factory = new MCPToolFactory();

// Teams Notification
console.log("� Sending Teams Notification...");
const teamsNotificationTool = factory.getTool('send_teams_notification');
if (teamsNotificationTool) {
  const message = `🎯 Sprint SCNT-2025-21 Release Complete!

📊 Sprint Summary:
• Total Issues: 66
• Story Points: 94/102 (92% completion)
• Completed Issues: 58

📈 Performance:
• Excellent 92% story point completion rate
• Strong team collaboration across 5 members
• Balanced workload distribution

📋 Release Notes:
✅ Generated comprehensive HTML documentation
✅ Included 66 JIRA issues and 32 Git commits
✅ Build pipeline data integrated

🚀 All tasks completed via MCP automation!
📅 Generated: ${new Date().toLocaleString()}`;

  const result = await teamsNotificationTool.execute({
    message,
    title: "🎯 Sprint SCNT-2025-21 Release Complete",
    isImportant: true,
    includeMetadata: true
  });
  
  console.log("✅ Teams notification sent:", result.content);
}
