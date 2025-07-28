/**
 * Debug the Teams Service to see exact values being extracted and passed
 */

// Copy the exact content from the latest run
const actualContent = `📊 Enhanced Story Points Analysis for Multiple Sprints
============================================================

🔍 Analyzing Sprint: SCNT-2025-15
----------------------------------------
Fetched 100 of 162 issues for sprint SCNT-2025-15...
Fetched 162 of 162 issues for sprint SCNT-2025-15...
✅ Successfully fetched all 162 issues for sprint SCNT-2025-15
📋 Total Issues: 162
📊 Total Story Points: 319
✅ Completed Story Points: 278
📈 Completion Rate: 87%

📊 Story Points by Status:
   ✅ Done: 278 points (87%)
   📌 Discarded: 18 points (6%)
   📌 New: 12 points (4%)
   🚫 Blocked: 6 points (2%)
   📌 Ready To Test: 2 points (1%)
   📌 Building: 2 points (1%)
   📋 To Do: 1 points (0%)

📋 Story Points by Issue Type:
   🧹 Task: 125 points (39%)
   🐛 Bug: 83 points (26%)
   ✨ Story: 64 points (20%)
   📋 Sub-task: 47 points (15%)

🔍 Analyzing Sprint: SCNT-2025-16
----------------------------------------
Fetched 100 of 119 issues for sprint SCNT-2025-16...
Fetched 119 of 119 issues for sprint SCNT-2025-16...
✅ Successfully fetched all 119 issues for sprint SCNT-2025-16
📋 Total Issues: 119
📊 Total Story Points: 249
✅ Completed Story Points: 197
📈 Completion Rate: 79%

📊 Story Points by Status:
   ✅ Done: 197 points (79%)
   📌 Discarded: 28 points (11%)
   📌 New: 11 points (4%)
   🚫 Blocked: 6 points (2%)
   🧪 Testing: 5 points (2%)
   📌 Building: 2 points (1%)

📋 Story Points by Issue Type:
   🧹 Task: 100 points (40%)
   🐛 Bug: 83 points (33%)
   ✨ Story: 45 points (18%)
   📋 Sub-task: 21 points (8%)

🎯 COMBINED SPRINTS SUMMARY
========================================
📊 Total Story Points Planned: 568
✅ Total Story Points Completed: 475
📈 Overall Completion Rate: 84%

🏆 Performance Assessment:
   ✨ Excellent - Great predictability and delivery!

📊 Additional Metrics:
   📋 Total Issues: 281
   🎯 Average Points per Issue: 2.0
   🚀 Velocity: 475 points completed`;

function debugExactParsing() {
  console.log('🔍 EXACT DEBUG: Testing Teams Service Parsing');
  console.log('=============================================\n');
  
  // Test the exact parsing logic from TeamsService
  
  // 1. Completion Rate Parsing
  console.log('1️⃣ COMPLETION RATE PARSING:');
  const overallCompletionMatch = actualContent.match(/Overall Completion Rate:\s*(\d+)%/i);
  const combinedCompletionMatch = actualContent.match(/COMBINED.*?(\d+)%/i);
  const generalCompletionMatch = actualContent.match(/(\d+)%\s*(completion|complete|average)/i);
  
  console.log('   Overall Completion Rate match:', overallCompletionMatch);
  console.log('   Combined section match:', combinedCompletionMatch);
  console.log('   General completion match:', generalCompletionMatch);
  
  let completionRate: number;
  if (overallCompletionMatch) {
    completionRate = parseInt(overallCompletionMatch[1]);
    console.log('   ✅ Using Overall Completion Rate:', completionRate);
  } else if (combinedCompletionMatch) {
    completionRate = parseInt(combinedCompletionMatch[1]);
    console.log('   ✅ Using Combined section rate:', completionRate);
  } else if (generalCompletionMatch) {
    completionRate = parseInt(generalCompletionMatch[1]);
    console.log('   ✅ Using General completion rate:', completionRate);
  } else {
    completionRate = 90;
    console.log('   ❌ Using DEFAULT completion rate:', completionRate);
  }
  
  // 2. Story Points Parsing
  console.log('\n2️⃣ STORY POINTS PARSING:');
  const combinedSection = actualContent.indexOf('COMBINED');
  const combinedContent = combinedSection >= 0 ? actualContent.substring(combinedSection) : '';
  console.log('   Combined section starts at index:', combinedSection);
  console.log('   Combined content preview:', combinedContent.substring(0, 150));
  
  const totalPointsMatch = combinedContent.match(/Total Story Points Planned:\s*(\d+)/i) || 
                         combinedContent.match(/Total Story Points:\s*(\d+)/i) ||
                         actualContent.match(/Total Story Points:\s*(\d+)(?![\s\S]*Total Story Points:)/i);
  const completedPointsMatch = combinedContent.match(/Total Story Points Completed:\s*(\d+)/i) ||
                             combinedContent.match(/Completed Points:\s*(\d+)/i) || 
                             actualContent.match(/Completed Points:\s*(\d+)(?![\s\S]*Completed Points:)/i);
  
  console.log('   Total Points Planned match:', combinedContent.match(/Total Story Points Planned:\s*(\d+)/i));
  console.log('   Total Points Completed match:', combinedContent.match(/Total Story Points Completed:\s*(\d+)/i));
  console.log('   Final Total Points match:', totalPointsMatch);
  console.log('   Final Completed Points match:', completedPointsMatch);
  
  let completedPoints: number;
  let totalPoints: number;
  
  if (totalPointsMatch && completedPointsMatch) {
    totalPoints = parseInt(totalPointsMatch[1]);
    completedPoints = parseInt(completedPointsMatch[1]);
    console.log('   ✅ Using combined summary format:');
    console.log('      Total Points:', totalPoints);
    console.log('      Completed Points:', completedPoints);
  } else {
    console.log('   ❌ Falling back to defaults');
    completedPoints = 80;
    totalPoints = 90;
  }
  
  // 3. Issues Parsing
  console.log('\n3️⃣ ISSUES PARSING:');
  const totalIssuesMatch = combinedContent.match(/Total Issues:\s*(\d+)/i) || 
                         actualContent.match(/Total Issues:\s*(\d+)(?![\s\S]*Total Issues:)/i);
  
  console.log('   Total Issues match:', totalIssuesMatch);
  
  let totalIssues: number;
  let completedIssues: number;
  
  if (totalIssuesMatch) {
    totalIssues = parseInt(totalIssuesMatch[1]);
    completedIssues = Math.round((totalIssues * completionRate) / 100);
    console.log('   ✅ Using combined summary format:');
    console.log('      Total Issues:', totalIssues);
    console.log('      Completed Issues (estimated):', completedIssues);
  } else {
    console.log('   ❌ Falling back to defaults');
    completedIssues = 45;
    totalIssues = 50;
  }
  
  // 4. Final Values that would be sent to Teams
  console.log('\n🎯 FINAL VALUES FOR TEAMS:');
  console.log('   Completion Rate:', completionRate + '%');
  console.log('   Story Points (completed):', completedPoints);
  console.log('   Total Issues:', totalIssues);
  console.log('   Completed Issues:', completedIssues);
  console.log('   Display format: ' + completionRate + '% (' + completedIssues + '/' + totalIssues + ')');
  
  // 5. Compare with Teams message
  console.log('\n📊 TEAMS MESSAGE COMPARISON:');
  console.log('   Expected: 84% (236/281)');
  console.log('   Current:  90% (45/50)');
  console.log('   Match?', (completionRate === 84 && completedIssues === 236 && totalIssues === 281) ? '✅' : '❌');
}

debugExactParsing();
