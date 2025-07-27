#!/usr/bin/env tsx

import { JiraService } from './src/services/JiraService';
import { TeamsService } from './src/services/TeamsService';
import dotenv from 'dotenv';

dotenv.config();

interface SprintVelocityData {
  sprintNumber: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  totalIssues: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  completionRate: number;
  velocity: number;
  issueTypes: Record<string, number>;
  status: Record<string, number>;
}

async function generateVelocityReport() {
  console.log('📊 Generating 6-Month Velocity Report');
  console.log('====================================\n');

  const jiraService = new JiraService();
  const teamsService = new TeamsService();

  try {
    // Define sprints for the last 6 months (approximate)
    const sprintNumbers = [
      'SCNT-2025-15', 'SCNT-2025-16', 'SCNT-2025-17', 'SCNT-2025-18', 
      'SCNT-2025-19', 'SCNT-2025-20', 'SCNT-2025-21'
    ];

    const velocityData: SprintVelocityData[] = [];
    let totalVelocityPoints = 0;

    console.log('🔍 Analyzing sprints...\n');

    for (const sprintNumber of sprintNumbers) {
      try {
        console.log(`📋 Processing ${sprintNumber}...`);
        
        // Get sprint details
        const sprintDetails = await jiraService.getSprintDetails(sprintNumber);
        
        // Fetch issues
        const issues = await jiraService.fetchIssues(sprintNumber);
        
        // Calculate statistics
        const stats = jiraService.calculateStoryPointsStats(issues);
        
        // Issue type breakdown
        const issueTypes = issues.reduce((acc, issue) => {
          const type = issue.fields.issuetype.name;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sprintData: SprintVelocityData = {
          sprintNumber,
          sprintName: sprintDetails.name,
          startDate: sprintDetails.startDate || 'Unknown',
          endDate: sprintDetails.endDate || 'Unknown',
          totalIssues: issues.length,
          totalStoryPoints: stats.totalStoryPoints,
          completedStoryPoints: stats.completedStoryPoints,
          completionRate: stats.completionRate,
          velocity: stats.completedStoryPoints,
          issueTypes,
          status: stats.byStatus
        };

        velocityData.push(sprintData);
        totalVelocityPoints += stats.completedStoryPoints;

        console.log(`   ✅ ${issues.length} issues, ${stats.completedStoryPoints} story points completed`);

      } catch (error) {
        console.log(`   ⚠️  Skipping ${sprintNumber}: ${error.message}`);
      }
    }

    if (velocityData.length === 0) {
      throw new Error('No sprint data available for velocity analysis');
    }

    // Calculate velocity metrics
    const avgVelocity = Math.round(totalVelocityPoints / velocityData.length);
    const validSprints = velocityData.filter(s => s.totalStoryPoints > 0);
    const avgCompletionRate = validSprints.length > 0 
      ? Math.round(validSprints.reduce((sum, s) => sum + s.completionRate, 0) / validSprints.length)
      : 0;

    // Current sprint analysis (SCNT-2025-21)
    const currentSprint = velocityData.find(s => s.sprintNumber === 'SCNT-2025-21');
    
    // Trend analysis
    const recentSprints = velocityData.slice(-3); // Last 3 sprints
    const velocityTrend = calculateTrend(recentSprints.map(s => s.velocity));
    const completionTrend = calculateTrend(recentSprints.map(s => s.completionRate));

    // Generate comprehensive report
    await generateAndSendReport({
      velocityData,
      avgVelocity,
      avgCompletionRate,
      totalVelocityPoints,
      currentSprint,
      velocityTrend,
      completionTrend,
      recentSprints
    }, teamsService);

    console.log('\n✅ Velocity report generated and sent to Teams!');
    console.log('📱 Check your Teams channel for the comprehensive analysis');

  } catch (error) {
    console.error('❌ Failed to generate velocity report:', error.message);
    process.exit(1);
  }
}

function calculateTrend(values: number[]): { direction: string; percentage: number; icon: string } {
  if (values.length < 2) return { direction: 'stable', percentage: 0, icon: '➡️' };
  
  const first = values[0];
  const last = values[values.length - 1];
  const change = ((last - first) / first) * 100;
  
  if (Math.abs(change) < 5) {
    return { direction: 'stable', percentage: Math.abs(change), icon: '➡️' };
  } else if (change > 0) {
    return { direction: 'increasing', percentage: change, icon: '📈' };
  } else {
    return { direction: 'decreasing', percentage: Math.abs(change), icon: '📉' };
  }
}

async function generateAndSendReport(data: any, teamsService: TeamsService) {
  const { velocityData, avgVelocity, avgCompletionRate, totalVelocityPoints, currentSprint, velocityTrend, completionTrend, recentSprints } = data;

  // Create detailed report content
  const reportContent = `## 📊 6-Month Velocity & Sprint Analysis Report

### 🎯 Executive Summary
**Period Analyzed:** ${velocityData.length} sprints over 6 months
**Total Story Points Delivered:** ${totalVelocityPoints} points
**Average Velocity:** ${avgVelocity} story points per sprint
**Average Completion Rate:** ${avgCompletionRate}%

### 🚀 Current Sprint Performance (SCNT-2025-21)
${currentSprint ? `
**Sprint Details:**
- **Issues:** ${currentSprint.totalIssues} total
- **Story Points:** ${currentSprint.completedStoryPoints}/${currentSprint.totalStoryPoints} (${currentSprint.completionRate}%)
- **Velocity:** ${currentSprint.velocity} points
- **Performance vs Average:** ${currentSprint.velocity > avgVelocity ? '📈 Above' : currentSprint.velocity < avgVelocity ? '📉 Below' : '➡️ On'} average (${avgVelocity} pts)
- **Status:** ${currentSprint.completionRate >= 90 ? '🌟 Exceptional' : currentSprint.completionRate >= 80 ? '✨ Excellent' : currentSprint.completionRate >= 70 ? '👍 Good' : '⚠️ Needs Attention'}
` : '❌ Current sprint data not available'}

### 📈 Velocity Trend Analysis
**Last 3 Sprints Trend:**
- **Velocity:** ${velocityTrend.icon} ${velocityTrend.direction} by ${velocityTrend.percentage.toFixed(1)}%
- **Completion Rate:** ${completionTrend.icon} ${completionTrend.direction} by ${completionTrend.percentage.toFixed(1)}%

### 📋 Sprint Performance History
${velocityData.map((sprint, index) => `
**${sprint.sprintNumber}** (${formatDate(sprint.startDate)})
- Velocity: ${sprint.velocity} pts | Completion: ${sprint.completionRate}% | Issues: ${sprint.totalIssues}
- Performance: ${sprint.velocity > avgVelocity ? '🔥' : sprint.velocity < avgVelocity * 0.8 ? '⚠️' : '✅'} ${getPerformanceLabel(sprint.velocity, avgVelocity)}
`).join('')}

### 🔍 Detailed Insights

**🏆 Best Performing Sprints:**
${velocityData
  .sort((a, b) => b.velocity - a.velocity)
  .slice(0, 3)
  .map((sprint, i) => `${i + 1}. ${sprint.sprintNumber}: ${sprint.velocity} points (${sprint.completionRate}% completion)`)
  .join('\n')}

**📊 Key Metrics:**
- **Highest Velocity:** ${Math.max(...velocityData.map(s => s.velocity))} story points
- **Lowest Velocity:** ${Math.min(...velocityData.map(s => s.velocity))} story points
- **Most Consistent Sprint:** ${findMostConsistent(velocityData, avgVelocity)}
- **Total Issues Completed:** ${velocityData.reduce((sum, s) => sum + s.totalIssues, 0)}

### 🎯 Predictability Analysis
**Completion Rate Distribution:**
${getCompletionDistribution(velocityData)}

**Velocity Consistency:**
- **Standard Deviation:** ${calculateStandardDeviation(velocityData.map(s => s.velocity)).toFixed(1)} points
- **Consistency Rating:** ${getConsistencyRating(velocityData.map(s => s.velocity))}

### 💡 Strategic Recommendations

**Based on 6-month analysis:**
${generateRecommendations(velocityData, avgVelocity, avgCompletionRate, velocityTrend, completionTrend)}

### 📈 Future Sprint Planning
- **Suggested Capacity:** ${Math.round(avgVelocity * 0.9)}-${Math.round(avgVelocity * 1.1)} story points
- **Risk Buffer:** Plan for ${Math.round(avgVelocity * 0.85)} points to ensure ${avgCompletionRate}%+ completion
- **Stretch Goal:** Up to ${Math.round(avgVelocity * 1.15)} points for high-confidence sprints

---
*Generated on ${new Date().toLocaleString()} | Data Source: JIRA Board ${process.env.JIRA_BOARD_ID}*`;

  // Send to Teams with rich formatting
  await teamsService.sendRichNotification({
    title: '📊 6-Month Velocity & Sprint Analysis Report',
    summary: `Comprehensive velocity analysis: ${avgVelocity} avg points/sprint, ${avgCompletionRate}% completion rate across ${velocityData.length} sprints`,
    facts: [
      { name: '🎯 Average Velocity', value: `${avgVelocity} story points` },
      { name: '📈 Completion Rate', value: `${avgCompletionRate}%` },
      { name: '🚀 Current Sprint', value: currentSprint ? `${currentSprint.velocity} pts (${currentSprint.completionRate}%)` : 'N/A' },
      { name: '📊 Total Points Delivered', value: `${totalVelocityPoints} points` },
      { name: '🔄 Velocity Trend', value: `${velocityTrend.icon} ${velocityTrend.direction}` },
      { name: '📋 Sprints Analyzed', value: `${velocityData.length} sprints` },
      { name: '🏆 Best Sprint', value: `${Math.max(...velocityData.map(s => s.velocity))} points` },
      { name: '⚡ Consistency', value: getConsistencyRating(velocityData.map(s => s.velocity)) }
    ],
    actions: [
      { 
        name: 'View Current Sprint in JIRA', 
        url: `https://jira.sage.com/secure/RapidBoard.jspa?rapidView=${process.env.JIRA_BOARD_ID}&sprint=SCNT-2025-21` 
      },
      { 
        name: 'Sprint Planning Board', 
        url: `https://jira.sage.com/secure/RapidBoard.jspa?rapidView=${process.env.JIRA_BOARD_ID}` 
      }
    ]
  });

  console.log('📤 Comprehensive velocity report sent to Teams');
}

// Helper functions
function formatDate(dateString: string): string {
  if (dateString === 'Unknown') return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

function getPerformanceLabel(velocity: number, avgVelocity: number): string {
  const ratio = velocity / avgVelocity;
  if (ratio >= 1.2) return 'Exceptional';
  if (ratio >= 1.1) return 'Above Average';
  if (ratio >= 0.9) return 'On Target';
  if (ratio >= 0.8) return 'Below Average';
  return 'Needs Attention';
}

function findMostConsistent(velocityData: SprintVelocityData[], avgVelocity: number): string {
  const consistencyScores = velocityData.map(sprint => ({
    sprint: sprint.sprintNumber,
    score: Math.abs(sprint.velocity - avgVelocity)
  }));
  
  const mostConsistent = consistencyScores.reduce((min, current) => 
    current.score < min.score ? current : min
  );
  
  return mostConsistent.sprint;
}

function getCompletionDistribution(velocityData: SprintVelocityData[]): string {
  const ranges = [
    { label: '90-100%', min: 90, max: 100 },
    { label: '80-89%', min: 80, max: 89 },
    { label: '70-79%', min: 70, max: 79 },
    { label: 'Below 70%', min: 0, max: 69 }
  ];

  return ranges.map(range => {
    const count = velocityData.filter(s => s.completionRate >= range.min && s.completionRate <= range.max).length;
    const percentage = Math.round((count / velocityData.length) * 100);
    return `- ${range.label}: ${count} sprints (${percentage}%)`;
  }).join('\n');
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
  return Math.sqrt(avgSquaredDiff);
}

function getConsistencyRating(velocities: number[]): string {
  const stdDev = calculateStandardDeviation(velocities);
  const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  const coefficientOfVariation = (stdDev / mean) * 100;

  if (coefficientOfVariation <= 15) return '🌟 Excellent';
  if (coefficientOfVariation <= 25) return '✨ Good';
  if (coefficientOfVariation <= 35) return '👍 Fair';
  return '⚠️ Inconsistent';
}

function generateRecommendations(velocityData: SprintVelocityData[], avgVelocity: number, avgCompletionRate: number, velocityTrend: any, completionTrend: any): string {
  const recommendations: string[] = [];

  // Velocity-based recommendations
  if (velocityTrend.direction === 'increasing') {
    recommendations.push('🚀 **Scaling Success:** Velocity is trending up! Consider gradually increasing sprint capacity while maintaining quality.');
  } else if (velocityTrend.direction === 'decreasing') {
    recommendations.push('📉 **Velocity Concern:** Downward trend detected. Review team capacity, technical debt, and sprint planning effectiveness.');
  }

  // Completion rate recommendations
  if (avgCompletionRate >= 90) {
    recommendations.push('🎯 **Planning Excellence:** Exceptional completion rate indicates strong estimation and planning skills.');
  } else if (avgCompletionRate < 80) {
    recommendations.push('⚠️ **Planning Review:** Consider improving story estimation, reducing scope creep, or addressing impediments.');
  }

  // Consistency recommendations
  const velocities = velocityData.map(s => s.velocity);
  const consistency = getConsistencyRating(velocities);
  if (consistency.includes('Inconsistent')) {
    recommendations.push('🔄 **Consistency Focus:** High velocity variation suggests need for better capacity planning and estimation.');
  }

  // Current sprint specific
  const currentSprint = velocityData.find(s => s.sprintNumber === 'SCNT-2025-21');
  if (currentSprint && currentSprint.velocity > avgVelocity * 1.1) {
    recommendations.push('🔥 **Current Sprint Success:** Exceeding average velocity - great execution!');
  }

  return recommendations.length > 0 ? recommendations.join('\n\n') : '✅ **Strong Performance:** Team is performing well across all metrics.';
}

// Run the velocity analysis
generateVelocityReport().catch(console.error);
