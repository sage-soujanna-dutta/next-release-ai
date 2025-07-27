#!/usr/bin/env tsx

import { JiraService } from './src/services/JiraService';
import { TeamsService } from './src/services/TeamsService';
import dotenv from 'dotenv';

dotenv.config();

async function generateSprintSummaryReport() {
  console.log('📋 Generating Current Sprint Summary Report');
  console.log('=========================================\n');

  const jiraService = new JiraService();
  const teamsService = new TeamsService();

  try {
    const sprintNumber = 'SCNT-2025-21';
    
    // Get sprint details and issues
    console.log(`🔍 Analyzing Sprint ${sprintNumber}...`);
    const sprintDetails = await jiraService.getSprintDetails(sprintNumber);
    const issues = await jiraService.fetchIssues(sprintNumber);
    const stats = jiraService.calculateStoryPointsStats(issues);

    // Detailed analysis
    const issuesByType = issues.reduce((acc, issue) => {
      const type = issue.fields.issuetype.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByStatus = issues.reduce((acc, issue) => {
      const status = issue.fields.status.name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assigneeStats = issues.reduce((acc, issue) => {
      const assignee = issue.fields.assignee?.displayName || 'Unassigned';
      const points = issue.fields.storyPoints || 0;
      if (!acc[assignee]) {
        acc[assignee] = { issues: 0, points: 0, completed: 0 };
      }
      acc[assignee].issues++;
      acc[assignee].points += points;
      if (issue.fields.status.name === 'Done') {
        acc[assignee].completed++;
      }
      return acc;
    }, {} as Record<string, { issues: number; points: number; completed: number }>);

    // Top performers
    const topPerformers = Object.entries(assigneeStats)
      .sort(([,a], [,b]) => b.points - a.points)
      .slice(0, 5);

    // Sprint period calculation
    const startDate = sprintDetails.startDate ? new Date(sprintDetails.startDate) : null;
    const endDate = sprintDetails.endDate ? new Date(sprintDetails.endDate) : null;
    const today = new Date();
    
    let sprintProgress = 'Unknown';
    if (startDate && endDate) {
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const progressPercentage = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
      sprintProgress = `${Math.round(progressPercentage)}% (Day ${Math.max(daysPassed, 1)} of ${totalDays})`;
    }

    // Generate comprehensive summary
    const summaryContent = `## 📋 Sprint ${sprintNumber} - Comprehensive Summary

### 🎯 Sprint Overview
**Sprint Name:** ${sprintDetails.name}
**Period:** ${formatDate(sprintDetails.startDate)} → ${formatDate(sprintDetails.endDate)}
**Progress:** ${sprintProgress}
**Status:** ${sprintDetails.state}

### 📊 Performance Metrics
- **Total Issues:** ${issues.length}
- **Story Points:** ${stats.completedStoryPoints}/${stats.totalStoryPoints} (${stats.completionRate}%)
- **Current Velocity:** ${stats.completedStoryPoints} story points
- **Success Rate:** ${stats.completionRate >= 90 ? '🌟 Exceptional' : stats.completionRate >= 80 ? '✨ Excellent' : stats.completionRate >= 70 ? '👍 Good' : '⚠️ Needs Attention'}

### 📈 Work Breakdown

**By Issue Type:**
${Object.entries(issuesByType).map(([type, count]) => {
  const points = Object.entries(stats.byType).find(([t]) => t === type)?.[1] || 0;
  const icon = type === 'Story' ? '✨' : type === 'Bug' ? '🐛' : type === 'Task' ? '🧹' : '📋';
  return `- ${icon} **${type}:** ${count} issues (${points} points)`;
}).join('\n')}

**By Status:**
${Object.entries(issuesByStatus).map(([status, count]) => {
  const points = Object.entries(stats.byStatus).find(([s]) => s === status)?.[1] || 0;
  const icon = status === 'Done' ? '✅' : status === 'In Progress' ? '🔄' : status === 'To Do' ? '📋' : '📌';
  return `- ${icon} **${status}:** ${count} issues (${points} points)`;
}).join('\n')}

### 👥 Team Performance

**Top Contributors:**
${topPerformers.map(([name, stats], index) => {
  const completionRate = stats.issues > 0 ? Math.round((stats.completed / stats.issues) * 100) : 0;
  return `${index + 1}. **${name}:** ${stats.points} points, ${stats.issues} issues (${completionRate}% completion)`;
}).join('\n')}

### 🎯 Sprint Health Indicators

**Completion Rate:** ${getHealthIcon(stats.completionRate, 90, 80)} ${stats.completionRate}%
**Story Points Velocity:** ${getHealthIcon(stats.completedStoryPoints, 100, 80)} ${stats.completedStoryPoints} points
**Issue Distribution:** ${getBalanceIcon(issuesByType)} ${Object.keys(issuesByType).length} types
**Team Engagement:** ${getHealthIcon(Object.keys(assigneeStats).length - 1, 8, 5)} ${Object.keys(assigneeStats).length - 1} active contributors

### 💡 Key Insights

**Sprint Strengths:**
${generateSprintStrengths(stats, issuesByType, assigneeStats)}

**Areas for Improvement:**
${generateImprovementAreas(stats, issuesByStatus, assigneeStats)}

### 🎯 Sprint Goals Assessment
${assessSprintGoals(stats, issues)}

---
*Report generated on ${new Date().toLocaleString()} | Sprint ${sprintNumber}*`;

    // Send detailed sprint summary to Teams
    await teamsService.sendRichNotification({
      title: `📋 Sprint ${sprintNumber} - Comprehensive Summary`,
      summary: `Sprint summary: ${stats.completedStoryPoints}/${stats.totalStoryPoints} points (${stats.completionRate}%), ${issues.length} issues across ${Object.keys(issuesByType).length} types`,
      facts: [
        { name: '🎯 Sprint Progress', value: sprintProgress },
        { name: '📊 Completion Rate', value: `${stats.completionRate}%` },
        { name: '🚀 Story Points', value: `${stats.completedStoryPoints}/${stats.totalStoryPoints}` },
        { name: '📋 Total Issues', value: `${issues.length}` },
        { name: '✅ Completed Issues', value: `${issuesByStatus['Done'] || 0}` },
        { name: '🔄 In Progress', value: `${issuesByStatus['In Progress'] || 0}` },
        { name: '👥 Active Contributors', value: `${Object.keys(assigneeStats).length - 1}` },
        { name: '🏆 Sprint Health', value: stats.completionRate >= 90 ? '🌟 Excellent' : '✨ Good' }
      ],
      actions: [
        { 
          name: 'View Sprint in JIRA', 
          url: `https://jira.sage.com/secure/RapidBoard.jspa?rapidView=${process.env.JIRA_BOARD_ID}&sprint=${sprintNumber}` 
        },
        { 
          name: 'Sprint Planning Board', 
          url: `https://jira.sage.com/secure/RapidBoard.jspa?rapidView=${process.env.JIRA_BOARD_ID}` 
        }
      ]
    });

    console.log(`✅ Sprint ${sprintNumber} summary report sent to Teams!`);
    console.log('📱 Check your Teams channel for the detailed sprint analysis');

  } catch (error) {
    console.error('❌ Failed to generate sprint summary:', error.message);
    process.exit(1);
  }
}

// Helper functions
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Not set';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
}

function getHealthIcon(value: number, excellent: number, good: number): string {
  if (value >= excellent) return '🌟';
  if (value >= good) return '✨';
  return '⚠️';
}

function getBalanceIcon(issuesByType: Record<string, number>): string {
  const types = Object.keys(issuesByType).length;
  if (types >= 4) return '🎯'; // Good balance
  if (types >= 3) return '📊'; // Decent balance
  return '⚠️'; // Limited variety
}

function generateSprintStrengths(stats: any, issuesByType: Record<string, number>, assigneeStats: Record<string, any>): string {
  const strengths: string[] = [];
  
  if (stats.completionRate >= 90) {
    strengths.push('🎯 **Exceptional completion rate** - excellent sprint execution');
  }
  
  if (stats.completedStoryPoints > 90) {
    strengths.push('🚀 **High velocity** - strong delivery capacity');
  }
  
  if (Object.keys(issuesByType).length >= 4) {
    strengths.push('📊 **Well-balanced workload** across multiple issue types');
  }
  
  const activeContributors = Object.keys(assigneeStats).length - 1;
  if (activeContributors >= 8) {
    strengths.push('👥 **Strong team engagement** with broad participation');
  }
  
  return strengths.length > 0 ? strengths.join('\n') : '✅ Solid overall performance across metrics';
}

function generateImprovementAreas(stats: any, issuesByStatus: Record<string, number>, assigneeStats: Record<string, any>): string {
  const improvements: string[] = [];
  
  if (stats.completionRate < 80) {
    improvements.push('📈 **Sprint planning** - consider capacity and estimation review');
  }
  
  const inProgress = issuesByStatus['In Progress'] || 0;
  const total = Object.values(issuesByStatus).reduce((sum, count) => sum + count, 0);
  if ((inProgress / total) > 0.3) {
    improvements.push('🔄 **Work in progress** - high WIP may indicate bottlenecks');
  }
  
  const unassigned = assigneeStats['Unassigned']?.issues || 0;
  if (unassigned > 5) {
    improvements.push('👤 **Task assignment** - several issues remain unassigned');
  }
  
  return improvements.length > 0 ? improvements.join('\n') : '✨ No significant areas of concern identified';
}

function assessSprintGoals(stats: any, issues: any[]): string {
  const completionRate = stats.completionRate;
  const velocity = stats.completedStoryPoints;
  
  if (completionRate >= 95 && velocity >= 90) {
    return '🎯 **Goals Exceeded** - Outstanding sprint execution with high velocity and completion rate';
  } else if (completionRate >= 85 && velocity >= 70) {
    return '✅ **Goals Met** - Strong performance meeting sprint commitments';
  } else if (completionRate >= 70) {
    return '📈 **Partially Met** - Good progress with room for improvement in future sprints';
  } else {
    return '⚠️ **Goals Missed** - Sprint retrospective recommended to identify improvement opportunities';
  }
}

// Run the sprint summary
generateSprintSummaryReport().catch(console.error);
