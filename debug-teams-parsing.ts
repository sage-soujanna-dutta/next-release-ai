/**
 * Debug the Teams Service parsing by logging actual values
 */

import { TeamsService } from './src/services/TeamsService';

// Create a modified TeamsService that logs the parsing process
class DebugTeamsService extends TeamsService {
  // Make the private method public for testing
  public debugConvertToProfessionalTemplate(content: string, originalData: any) {
    console.log('🔍 DEBUG: Parsing content for Teams notification');
    console.log('============================================');
    console.log('Original content length:', content.length);
    console.log('\n📊 Content preview:');
    console.log(content.substring(0, 500) + '...\n');
    
    // Test our parsing patterns
    console.log('🧪 Testing NEW Parsing Patterns:');
    
    // NEW Completion rate patterns - prioritize combined summary
    const overallCompletionMatch = content.match(/Overall Completion Rate:\s*(\d+)%/i);
    const combinedCompletionMatch = content.match(/COMBINED.*?(\d+)%/i);
    const generalCompletionMatch = content.match(/(\d+)%\s*(completion|complete|average)/i);
    
    console.log('Overall Completion Rate:', overallCompletionMatch ? `${overallCompletionMatch[1]}%` : 'Not found');
    console.log('Combined Section Rate:', combinedCompletionMatch ? `${combinedCompletionMatch[1]}%` : 'Not found');
    console.log('General Completion Rate:', generalCompletionMatch ? `${generalCompletionMatch[1]}%` : 'Not found');
    
    // NEW Story points patterns - prioritize combined section
    const combinedSection = content.indexOf('COMBINED');
    const combinedContent = combinedSection >= 0 ? content.substring(combinedSection) : '';
    console.log('Combined Section Found:', combinedSection >= 0 ? 'Yes' : 'No');
    console.log('Combined Content Preview:', combinedContent.substring(0, 200));
    
    const totalPointsMatch = combinedContent.match(/Total Story Points:\s*(\d+)/i) || 
                           content.match(/Total Story Points:\s*(\d+)(?![\s\S]*Total Story Points:)/i);
    const completedPointsMatch = combinedContent.match(/Completed Points:\s*(\d+)/i) || 
                               content.match(/Completed Points:\s*(\d+)(?![\s\S]*Completed Points:)/i);
    const totalIssuesMatch = combinedContent.match(/Total Issues:\s*(\d+)/i) || 
                           content.match(/Total Issues:\s*(\d+)(?![\s\S]*Total Issues:)/i);
    
    console.log('NEW Total Points:', totalPointsMatch ? totalPointsMatch[1] : 'Not found');
    console.log('NEW Completed Points:', completedPointsMatch ? completedPointsMatch[1] : 'Not found');
    console.log('NEW Total Issues:', totalIssuesMatch ? totalIssuesMatch[1] : 'Not found');
    
    // Calculate final values using NEW logic
    let completionRate: number;
    if (overallCompletionMatch) {
      completionRate = parseInt(overallCompletionMatch[1]);
    } else if (combinedCompletionMatch) {
      completionRate = parseInt(combinedCompletionMatch[1]);
    } else if (generalCompletionMatch) {
      completionRate = parseInt(generalCompletionMatch[1]);
    } else {
      completionRate = 90;
    }
    
    let totalIssues = totalIssuesMatch ? parseInt(totalIssuesMatch[1]) : 50;
    let completedIssues = Math.round((totalIssues * completionRate) / 100);
    
    console.log('\n📈 Calculated Values:');
    console.log('Completion Rate:', completionRate + '%');
    console.log('Total Issues:', totalIssues);
    console.log('Completed Issues (estimated):', completedIssues);
    console.log('Total Points:', totalPointsMatch ? totalPointsMatch[1] : 'Default');
    console.log('Completed Points:', completedPointsMatch ? completedPointsMatch[1] : 'Default');
  }
}

// Test with the actual content from latest sprint analysis
const sampleContent = `📊 Enhanced Story Points Analysis for Multiple Sprints
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

🔍 Analyzing Sprint: SCNT-2025-16
----------------------------------------
Fetched 100 of 119 issues for sprint SCNT-2025-16...
Fetched 119 of 119 issues for sprint SCNT-2025-16...
✅ Successfully fetched all 119 issues for sprint SCNT-2025-16
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

async function runDebug() {
  const debugService = new DebugTeamsService();
  debugService.debugConvertToProfessionalTemplate(sampleContent, {
    title: 'Combined Sprint Test',
    isImportant: true
  });
}

runDebug().catch(console.error);
