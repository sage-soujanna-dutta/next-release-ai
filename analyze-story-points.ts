#!/usr/bin/env tsx

import { JiraService } from './src/services/JiraService';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeStoryPoints() {
  console.log('📊 Story Points Analysis for Recent Sprints');
  console.log('===========================================\n');

  const jiraService = new JiraService();

  try {
    // Analyze both sprints from your combined release notes
    const sprints = ['SCNT-2025-20', 'SCNT-2025-21'];
    let totalPoints = 0;
    let totalCompletedPoints = 0;
    let allIssues: any[] = [];

    for (const sprintNumber of sprints) {
      console.log(`🔍 Analyzing Sprint: ${sprintNumber}`);
      console.log('-'.repeat(40));

      try {
        // Fetch issues for the sprint
        const issues = await jiraService.fetchIssues(sprintNumber);
        allIssues.push(...issues);

        // Calculate story points statistics
        const stats = jiraService.calculateStoryPointsStats(issues);

        console.log(`📋 Total Issues: ${issues.length}`);
        console.log(`📊 Total Story Points: ${stats.totalStoryPoints}`);
        console.log(`✅ Completed Story Points: ${stats.completedStoryPoints}`);
        console.log(`📈 Completion Rate: ${stats.completionRate}%`);

        if (stats.totalStoryPoints > 0) {
          console.log('\n📊 Story Points by Status:');
          Object.entries(stats.byStatus)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .forEach(([status, points]) => {
              const percentage = Math.round(((points as number) / stats.totalStoryPoints) * 100);
              console.log(`   ${getStatusIcon(status)} ${status}: ${points} points (${percentage}%)`);
            });

          console.log('\n📋 Story Points by Issue Type:');
          Object.entries(stats.byType)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .forEach(([type, points]) => {
              const percentage = Math.round(((points as number) / stats.totalStoryPoints) * 100);
              console.log(`   ${getTypeIcon(type)} ${type}: ${points} points (${percentage}%)`);
            });
        } else {
          console.log('⚠️  No story points found - issues may not have story point estimates');
        }

        totalPoints += stats.totalStoryPoints;
        totalCompletedPoints += stats.completedStoryPoints;

        console.log('\n');
      } catch (error) {
        console.error(`❌ Error analyzing ${sprintNumber}:`, error.message);
        console.log('');
      }
    }

    // Combined summary
    console.log('🎯 COMBINED SPRINTS SUMMARY');
    console.log('='.repeat(40));
    console.log(`📊 Total Story Points Planned: ${totalPoints}`);
    console.log(`✅ Total Story Points Completed: ${totalCompletedPoints}`);
    
    if (totalPoints > 0) {
      const overallCompletion = Math.round((totalCompletedPoints / totalPoints) * 100);
      console.log(`📈 Overall Completion Rate: ${overallCompletion}%`);
      
      // Performance assessment
      console.log('\n🏆 Performance Assessment:');
      if (overallCompletion >= 90) {
        console.log('   🌟 Exceptional - Outstanding sprint execution!');
      } else if (overallCompletion >= 80) {
        console.log('   ✨ Excellent - Great predictability and delivery!');
      } else if (overallCompletion >= 70) {
        console.log('   👍 Good - Solid performance with room for improvement');
      } else if (overallCompletion >= 50) {
        console.log('   ⚠️  Fair - Consider sprint planning and capacity review');
      } else {
        console.log('   🚨 Needs Attention - Significant planning and execution gaps');
      }

      // Velocity calculation (if we have time period info)
      const totalIssues = allIssues.length;
      const avgPointsPerIssue = totalPoints / totalIssues;
      console.log(`\n📊 Additional Metrics:`);
      console.log(`   📋 Total Issues: ${totalIssues}`);
      console.log(`   🎯 Average Points per Issue: ${avgPointsPerIssue.toFixed(1)}`);
      console.log(`   🚀 Velocity: ${totalCompletedPoints} points completed`);
    } else {
      console.log('⚠️  No story points data available for analysis');
      console.log('\n💡 Recommendations:');
      console.log('   1. Ensure story point estimates are added to JIRA issues');
      console.log('   2. Check if story points field is configured correctly');
      console.log('   3. Verify the story points custom field ID in JIRA');
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('\n💡 Troubleshooting steps:');
    console.error('   1. Verify JIRA credentials in .env file');
    console.error('   2. Check if sprint numbers exist in JIRA');
    console.error('   3. Ensure proper permissions to access sprint data');
  }
}

function getStatusIcon(status: string): string {
  const statusIcons: Record<string, string> = {
    'Done': '✅',
    'In Progress': '🔄',
    'To Do': '📋',
    'In Review': '👀',
    'Testing': '🧪',
    'Blocked': '🚫'
  };
  return statusIcons[status] || '📌';
}

function getTypeIcon(type: string): string {
  const typeIcons: Record<string, string> = {
    'Story': '✨',
    'Bug': '🐛',
    'Task': '🧹',
    'Sub-task': '📋',
    'Epic': '🎯'
  };
  return typeIcons[type] || '📝';
}

// Run the analysis
analyzeStoryPoints().catch(console.error);
