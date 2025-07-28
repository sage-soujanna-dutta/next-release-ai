#!/usr/bin/env tsx

// Quick Release Tasks Execution
import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function executeReleaseTasks() {
  const factory = new MCPToolFactory({
    enabledCategories: ['release', 'analysis', 'integration', 'jira']
  });

  console.log("🚀 Executing Release Tasks for SCNT-2025-21\n");

  // Task 1: Sprint Summary
  console.log("📊 1. Generating Sprint Summary...");
  const summaryTool = factory.getTool('sprint_summary_report');
  let sprintSummary = "";
  
  if (summaryTool) {
    const result = await summaryTool.execute({
      sprintNumber: 'SCNT-2025-21',
      includeTeamMetrics: true
    });
    sprintSummary = typeof result.content === 'string' ? result.content : result.content[0]?.text || '';
    console.log("✅ Sprint summary completed\n");
  }

  // Task 2: Story Points Analysis
  console.log("📈 2. Analyzing Story Points...");
  const storyPointsTool = factory.getTool('analyze_story_points');
  let storyPointsAnalysis = "";
  
  if (storyPointsTool) {
    const result = await storyPointsTool.execute({
      sprintNumbers: ['SCNT-2025-21'],
      includeTeamMetrics: true
    });
    storyPointsAnalysis = typeof result.content === 'string' ? result.content : result.content[0]?.text || '';
    console.log("✅ Story points analysis completed\n");
  }

  // Task 3: Release Notes
  console.log("📋 3. Creating Release Notes...");
  const releaseNotesTool = factory.getTool('generate_release_notes');
  let releaseNotes = "";
  
  if (releaseNotesTool) {
    const result = await releaseNotesTool.execute({
      sprintNumber: 'SCNT-2025-21',
      includeMetrics: true
    });
    releaseNotes = typeof result.content === 'string' ? result.content : result.content[0]?.text || '';
    console.log("✅ Release notes generated\n");
  }

  // Task 4: Teams Notification
  console.log("📢 4. Sending Teams Notification...");
  const teamsNotificationTool = factory.getTool('send_teams_notification');
  
  if (teamsNotificationTool) {
    const message = `🎯 Sprint SCNT-2025-21 Release Update

📊 Sprint Highlights:
${sprintSummary.split('\n').slice(2, 6).join('\n')}

📈 Story Points Summary:
${storyPointsAnalysis.split('\n').slice(2, 5).join('\n')}

📋 Release Documentation: Generated successfully
🕐 Completed: ${new Date().toLocaleString()}

All tasks executed via MCP automation! 🚀`;

    const result = await teamsNotificationTool.execute({
      message,
      title: "🎯 Sprint SCNT-2025-21 Release Complete",
      isImportant: true,
      includeMetadata: true
    });
    
    console.log("✅ Teams notification sent\n");
  }

  console.log("🎉 All release tasks completed successfully!");
}

executeReleaseTasks().catch(console.error);
