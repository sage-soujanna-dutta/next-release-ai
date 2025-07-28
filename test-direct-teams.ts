/**
 * Direct Teams notification test to verify combined sprint data is working
 */

import { TeamsService } from './src/services/TeamsService';

const testCombinedSprintData = {
  title: "🎯 Combined Sprint Test - SCNT-2025-15 & SCNT-2025-16",
  message: `📊 Enhanced Story Points Analysis for Multiple Sprints
============================================================

🔍 Analyzing Sprint: SCNT-2025-15
----------------------------------------
📋 Total Issues: 162
📊 Total Story Points: 319
✅ Completed Story Points: 278
📈 Completion Rate: 87%

🔍 Analyzing Sprint: SCNT-2025-16
----------------------------------------
📋 Total Issues: 119
📊 Total Story Points: 249
✅ Completed Story Points: 197
📈 Completion Rate: 79%

🎯 COMBINED SPRINTS SUMMARY
========================================
📊 Total Story Points: 568
✅ Completed Points: 475
📈 Overall Completion Rate: 84%
📋 Total Issues: 281

🏆 Performance Assessment: ✨ Excellent - Great predictability and delivery!

📊 Sprint Analysis:
  • SCNT-2025-15: 278/319 points (87%)
  • SCNT-2025-16: 197/249 points (79%)

💡 Key Insights:
  • Average Velocity: 238 points/sprint
  • Velocity Trend: Decreasing 📉`,
  type: "sprint-report",
  isImportant: true
};

async function testDirectTeamsNotification() {
  console.log('📨 Testing Direct Teams Notification');
  console.log('====================================\n');
  
  const teamsService = new TeamsService();
  
  try {
    console.log('🚀 Sending combined sprint test notification...');
    await teamsService.sendNotification(testCombinedSprintData);
    console.log('✅ Teams notification sent successfully!');
    console.log('\n📱 Check your Teams channel to verify:');
    console.log('  - Combined sprint data shows both SCNT-2025-15 and SCNT-2025-16');
    console.log('  - Total points show 568 (not individual sprint totals)');
    console.log('  - Completion rate shows 84% overall');
    console.log('  - Issues count shows 281 total');
  } catch (error) {
    console.error('❌ Failed to send Teams notification:', error);
  }
}

testDirectTeamsNotification().catch(console.error);
