/**
 * Test the Teams Service parsing functionality
 * Quick verification to ensure our parsing logic works correctly
 */

import { TeamsService } from './src/services/TeamsService';

const sampleContent = `📊 Enhanced Story Points Analysis for Multiple Sprints
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

🏆 Performance Assessment:
   ✨ Excellent - Great predictability and delivery!`;

async function testTeamsServiceParsing() {
  console.log('🧪 Testing Teams Service Parsing Logic');
  console.log('===============================================\n');
  
  const teamsService = new TeamsService();
  
  // Test the conversion to professional template
  const result = await teamsService.convertToProfessionalTemplate(sampleContent, {
    title: 'Test Sprint Report',
    isImportant: true
  });
  
  console.log('📊 Parsed Data:');
  console.log('Title:', result.title);
  console.log('Subtitle:', result.subtitle);
  console.log('Type:', result.type);
  console.log('\n🎯 Sprint Data:');
  console.log('Completion Rate:', result.sprintData?.completionRate + '%');
  console.log('Completed Points:', result.sprintData?.completedPoints);
  console.log('Total Points:', result.sprintData?.totalPoints);
  console.log('Completed Issues:', result.sprintData?.completedIssues);
  console.log('Total Issues:', result.sprintData?.totalIssues);
  
  console.log('\n✅ Test Results:');
  console.log('- Should show 84% completion rate:', result.sprintData?.completionRate === 84 ? '✅' : '❌');
  console.log('- Should show 475 completed points:', result.sprintData?.completedPoints === 475 ? '✅' : '❌');
  console.log('- Should show 568 total points:', result.sprintData?.totalPoints === 568 ? '✅' : '❌');
  console.log('- Should show 281 total issues:', result.sprintData?.totalIssues === 281 ? '✅' : '❌');
  console.log('- Should identify as multi-sprint:', result.subtitle?.includes('Combined') ? '✅' : '❌');
}

testTeamsServiceParsing().catch(console.error);
