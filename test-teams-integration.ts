#!/usr/bin/env tsx

// Teams Integration Test - Testing the Fixed Format
import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function testTeamsIntegration() {
  console.log("🧪 Testing Teams Integration Fix");
  
  const factory = new MCPToolFactory({
    enabledCategories: ['integration']
  });

  const teamsNotificationTool = factory.getTool('send_teams_notification');
  
  if (!teamsNotificationTool) {
    console.log("❌ Teams notification tool not found");
    return;
  }

  // Test the fixed Teams notification
  console.log("\n📢 Testing Teams Notification with Fixed Format");
  
  const testMessage = `🧪 Teams Integration Test - SCNT-2025-21

📊 Test Summary:
✅ Fixed payload format issues
✅ Added Adaptive Card support  
✅ Backward compatibility maintained

🚀 Key Changes:
• Updated payload structure
• Added modern Adaptive Cards format
• Improved error handling
• Better message formatting

📋 Generated via Fixed MCP Architecture
📅 ${new Date().toLocaleString()}`;

  try {
    const result = await teamsNotificationTool.execute({
      message: testMessage,
      title: "🧪 Teams Integration Test",
      isImportant: false,
      includeMetadata: true
    });
    
    if (result.isError) {
      console.log("❌ Teams notification still failed:");
      console.log(result.content[0].text);
    } else {
      console.log("✅ Teams notification sent successfully!");
      console.log(result.content[0].text);
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }

  console.log("\n🎉 Teams Integration Test Complete!");
}

testTeamsIntegration().catch(console.error);
