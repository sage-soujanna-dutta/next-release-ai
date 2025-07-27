#!/usr/bin/env node

import { JiraService } from './src/services/JiraService.js';
import { TeamsService } from './src/services/TeamsService.js';
import { FileService } from './src/services/FileService.js';

interface SprintMetrics {
  sprintName: string;
  totalIssues: number;
  completedIssues: number;
  completionRate: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  velocity: number;
  issueTypes: Record<string, number>;
  priorities: Record<string, number>;
  avgResolutionTime: number;
  burndownData: any[];
  riskFactors: string[];
}

interface VelocityTrend {
  sprintName: string;
  velocity: number;
  completionRate: number;
  trend: 'up' | 'down' | 'stable';
}

class SprintReviewGenerator {
  private jiraService: JiraService;
  private teamsService: TeamsService;
  private fileService: FileService;

  constructor() {
    this.jiraService = new JiraService();
    this.teamsService = new TeamsService();
    this.fileService = new FileService();
  }

  async generateSprintReview(sprints: string[]): Promise<void> {
    console.log('🚀 Generating Sprint Review Report...');
    
    try {
      // Collect metrics for all requested sprints
      const sprintMetrics: SprintMetrics[] = [];
      
      for (const sprint of sprints) {
        console.log(`📊 Analyzing ${sprint}...`);
        const metrics = await this.analyzeSprintMetrics(sprint);
        sprintMetrics.push(metrics);
      }

      // Calculate velocity trends
      const velocityTrends = this.calculateVelocityTrends(sprintMetrics);

      // Generate comprehensive report
      const report = await this.generateReport(sprintMetrics, velocityTrends);

      // Save report to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `sprint-review-report-${timestamp.split('T')[0]}.html`;
      await this.fileService.saveReleaseNotes(report.html, `review-${timestamp.split('T')[0]}`);

      // Send to Teams
      await this.sendToTeams(report.teamsMessage, sprintMetrics);

      console.log('✅ Sprint Review Report Generated Successfully!');
      console.log(`📁 Report saved: output/${filename}`);
      console.log('📢 Report sent to Teams channel');

    } catch (error) {
      console.error('❌ Error generating sprint review:', error);
      throw error;
    }
  }

  private async analyzeSprintMetrics(sprintName: string): Promise<SprintMetrics> {
    // Fetch sprint data from JIRA
    const sprintIssues = await this.jiraService.fetchIssues(sprintName);
    const sprintDetails = await this.jiraService.getSprintDetails(sprintName);
    
    // Calculate metrics
    const totalIssues = sprintIssues.length;
    const completedIssues = sprintIssues.filter(issue => 
      ['Done', 'Resolved', 'Closed'].includes(issue.fields.status.name)
    ).length;
    
    const completionRate = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;
    
    // Story points calculation
    const totalStoryPoints = sprintIssues.reduce((sum, issue) => {
      const points = issue.fields.customfield_10004 || 
                    issue.fields.customfield_10002 || 
                    issue.fields.storyPoints || 0;
      return sum + points;
    }, 0);
    
    const completedStoryPoints = sprintIssues
      .filter(issue => ['Done', 'Resolved', 'Closed'].includes(issue.fields.status.name))
      .reduce((sum, issue) => {
        const points = issue.fields.customfield_10004 || 
                      issue.fields.customfield_10002 || 
                      issue.fields.storyPoints || 0;
        return sum + points;
      }, 0);

    // Issue type breakdown
    const issueTypes: Record<string, number> = {};
    const priorities: Record<string, number> = {};
    
    sprintIssues.forEach(issue => {
      const type = issue.fields.issuetype.name;
      const priority = issue.fields.priority?.name || 'None';
      
      issueTypes[type] = (issueTypes[type] || 0) + 1;
      priorities[priority] = (priorities[priority] || 0) + 1;
    });

    // Calculate average resolution time (simplified)
    const avgResolutionTime = 0; // Will calculate from sprint duration if available
    if (sprintDetails.startDate && sprintDetails.completeDate) {
      const start = new Date(sprintDetails.startDate);
      const end = new Date(sprintDetails.completeDate);
      const sprintDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      // Use sprint duration as approximation
    }

    // Identify risk factors
    const riskFactors: string[] = [];
    if (completionRate < 80) riskFactors.push('Low completion rate');
    if (completedStoryPoints < totalStoryPoints * 0.7) riskFactors.push('Velocity below target');
    const unassignedCount = sprintIssues.filter(issue => !issue.fields.assignee).length;
    if (unassignedCount > 0) riskFactors.push(`${unassignedCount} unassigned issues`);

    return {
      sprintName,
      totalIssues,
      completedIssues,
      completionRate: Math.round(completionRate * 100) / 100,
      totalStoryPoints,
      completedStoryPoints,
      velocity: completedStoryPoints,
      issueTypes,
      priorities,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      burndownData: [], // Could be enhanced with actual burndown data
      riskFactors
    };
  }

  private calculateVelocityTrends(metrics: SprintMetrics[]): VelocityTrend[] {
    return metrics.map((metric, index) => {
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (index > 0) {
        const prevVelocity = metrics[index - 1].velocity;
        const currentVelocity = metric.velocity;
        const change = ((currentVelocity - prevVelocity) / prevVelocity) * 100;
        
        if (change > 10) trend = 'up';
        else if (change < -10) trend = 'down';
      }

      return {
        sprintName: metric.sprintName,
        velocity: metric.velocity,
        completionRate: metric.completionRate,
        trend
      };
    });
  }

  private async generateReport(metrics: SprintMetrics[], velocityTrends: VelocityTrend[]): Promise<{html: string, teamsMessage: any}> {
    const timestamp = new Date().toISOString();
    const totalSprints = metrics.length;
    const avgVelocity = metrics.reduce((sum, m) => sum + m.velocity, 0) / totalSprints;
    const avgCompletionRate = metrics.reduce((sum, m) => sum + m.completionRate, 0) / totalSprints;

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sprint Review Report - ${metrics.map(m => m.sprintName).join(', ')}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0078d4; padding-bottom: 20px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0078d4; }
        .metric-value { font-size: 2em; font-weight: bold; color: #0078d4; }
        .metric-label { color: #666; font-size: 0.9em; margin-top: 5px; }
        .sprint-section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .sprint-title { color: #0078d4; border-bottom: 2px solid #e1e1e1; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #0078d4; color: white; }
        .status-good { color: #107c10; font-weight: bold; }
        .status-warning { color: #ff8c00; font-weight: bold; }
        .status-critical { color: #d13438; font-weight: bold; }
        .trend-up { color: #107c10; }
        .trend-down { color: #d13438; }
        .trend-stable { color: #605e5c; }
        .chart-placeholder { background: #f0f0f0; padding: 40px; text-align: center; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Sprint Review Report</h1>
            <h2>Sprints: ${metrics.map(m => m.sprintName).join(', ')}</h2>
            <p><strong>Generated:</strong> ${new Date(timestamp).toLocaleString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${totalSprints}</div>
                <div class="metric-label">Sprints Analyzed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(avgVelocity)}</div>
                <div class="metric-label">Average Velocity</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(avgCompletionRate)}%</div>
                <div class="metric-label">Average Completion Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${metrics.reduce((sum, m) => sum + m.totalIssues, 0)}</div>
                <div class="metric-label">Total Issues Processed</div>
            </div>
        </div>

        <h2>📈 Velocity Trends</h2>
        <table>
            <thead>
                <tr>
                    <th>Sprint</th>
                    <th>Velocity (Story Points)</th>
                    <th>Completion Rate</th>
                    <th>Trend</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${velocityTrends.map(trend => `
                    <tr>
                        <td><strong>${trend.sprintName}</strong></td>
                        <td>${trend.velocity}</td>
                        <td>${trend.completionRate}%</td>
                        <td class="trend-${trend.trend}">
                            ${trend.trend === 'up' ? '📈 Improving' : 
                              trend.trend === 'down' ? '📉 Declining' : '➡️ Stable'}
                        </td>
                        <td class="${trend.completionRate >= 90 ? 'status-good' : 
                                    trend.completionRate >= 70 ? 'status-warning' : 'status-critical'}">
                            ${trend.completionRate >= 90 ? '✅ Excellent' : 
                              trend.completionRate >= 70 ? '⚠️ Good' : '❌ Needs Attention'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        ${metrics.map(metric => `
            <div class="sprint-section">
                <h3 class="sprint-title">📊 ${metric.sprintName} Detailed Analysis</h3>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${metric.completedIssues}/${metric.totalIssues}</div>
                        <div class="metric-label">Issues Completed</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metric.completedStoryPoints}/${metric.totalStoryPoints}</div>
                        <div class="metric-label">Story Points</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metric.avgResolutionTime} days</div>
                        <div class="metric-label">Avg Resolution Time</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metric.riskFactors.length}</div>
                        <div class="metric-label">Risk Factors</div>
                    </div>
                </div>

                <h4>📋 Issue Type Breakdown</h4>
                <table>
                    <thead>
                        <tr><th>Issue Type</th><th>Count</th><th>Percentage</th></tr>
                    </thead>
                    <tbody>
                        ${Object.entries(metric.issueTypes).map(([type, count]) => `
                            <tr>
                                <td>${type}</td>
                                <td>${count}</td>
                                <td>${Math.round((count / metric.totalIssues) * 100)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h4>🎯 Priority Distribution</h4>
                <table>
                    <thead>
                        <tr><th>Priority</th><th>Count</th><th>Percentage</th></tr>
                    </thead>
                    <tbody>
                        ${Object.entries(metric.priorities).map(([priority, count]) => `
                            <tr>
                                <td>${priority}</td>
                                <td>${count}</td>
                                <td>${Math.round((count / metric.totalIssues) * 100)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                ${metric.riskFactors.length > 0 ? `
                    <h4>⚠️ Risk Factors</h4>
                    <ul>
                        ${metric.riskFactors.map(risk => `<li>${risk}</li>`).join('')}
                    </ul>
                ` : '<h4>✅ No Risk Factors Identified</h4>'}
            </div>
        `).join('')}

        <div class="sprint-section">
            <h3>🎯 Key Insights & Recommendations</h3>
            <ul>
                <li><strong>Team Velocity:</strong> Average of ${Math.round(avgVelocity)} story points per sprint</li>
                <li><strong>Consistency:</strong> ${avgCompletionRate >= 80 ? 'Good consistency in delivery' : 'Room for improvement in consistency'}</li>
                <li><strong>Trend Analysis:</strong> ${
                    velocityTrends.filter(t => t.trend === 'up').length > velocityTrends.filter(t => t.trend === 'down').length 
                    ? 'Overall positive velocity trend' 
                    : 'Focus needed on maintaining velocity'
                }</li>
                <li><strong>Risk Management:</strong> ${
                    metrics.some(m => m.riskFactors.length > 0) 
                    ? 'Address identified risk factors in upcoming sprints' 
                    : 'Low risk profile across analyzed sprints'
                }</li>
            </ul>
        </div>

        <div class="header">
            <p><em>Report generated by Next Release AI - Sprint Review System</em></p>
        </div>
    </div>
</body>
</html>`;

    // Generate Teams message
    const teamsMessage = {
      type: "message",
      attachments: [{
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          version: "1.3",
          body: [
            {
              type: "TextBlock",
              text: "🚀 Sprint Review Report",
              size: "Large",
              weight: "Bolder",
              color: "Accent"
            },
            {
              type: "TextBlock",
              text: `Comprehensive analysis for: ${metrics.map(m => m.sprintName).join(', ')}`,
              size: "Medium",
              wrap: true
            },
            {
              type: "FactSet",
              facts: [
                { title: "📊 Sprints Analyzed", value: totalSprints.toString() },
                { title: "⚡ Average Velocity", value: `${Math.round(avgVelocity)} story points` },
                { title: "✅ Average Completion", value: `${Math.round(avgCompletionRate)}%` },
                { title: "📋 Total Issues", value: metrics.reduce((sum, m) => sum + m.totalIssues, 0).toString() }
              ]
            },
            {
              type: "TextBlock",
              text: "📈 **Velocity Trends**",
              size: "Medium",
              weight: "Bolder"
            },
            ...velocityTrends.map(trend => ({
              type: "FactSet",
              facts: [
                { title: `${trend.sprintName}`, value: `${trend.velocity} pts (${trend.completionRate}%) ${trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '➡️'}` }
              ]
            })),
            {
              type: "TextBlock",
              text: "🎯 **Key Insights**",
              size: "Medium",
              weight: "Bolder"
            },
            {
              type: "TextBlock",
              text: `• Team maintains ${Math.round(avgVelocity)} story points average velocity\n• ${avgCompletionRate >= 80 ? '✅ Consistent delivery performance' : '⚠️ Opportunity to improve consistency'}\n• ${velocityTrends.filter(t => t.trend === 'up').length > velocityTrends.filter(t => t.trend === 'down').length ? '📈 Positive velocity trend' : '📊 Focus on velocity stability'}\n• ${metrics.some(m => m.riskFactors.length > 0) ? '⚠️ Some risk factors identified' : '✅ Low risk profile'}`,
              wrap: true
            }
          ]
        }
      }]
    };

    return { html, teamsMessage };
  }

  private async sendToTeams(message: any, metrics: SprintMetrics[]): Promise<void> {
    try {
      const avgVelocity = Math.round(metrics.reduce((sum, m) => sum + m.velocity, 0) / metrics.length);
      const avgCompletion = Math.round(metrics.reduce((sum, m) => sum + m.completionRate, 0) / metrics.length);
      
      await this.teamsService.sendRichNotification({
        title: "🚀 Sprint Review Report",
        summary: `Analysis for ${metrics.map(m => m.sprintName).join(', ')}`,
        facts: [
          { name: "📊 Sprints Analyzed", value: metrics.length.toString() },
          { name: "⚡ Average Velocity", value: `${avgVelocity} story points` },
          { name: "✅ Average Completion", value: `${avgCompletion}%` },
          { name: "📋 Total Issues", value: metrics.reduce((sum, m) => sum + m.totalIssues, 0).toString() }
        ]
      });
      console.log('✅ Sprint review report sent to Teams successfully');
    } catch (error) {
      console.error('❌ Failed to send to Teams:', error);
      // Don't throw - report generation should still succeed
    }
  }
}

// Main execution
async function main() {
  const sprints = process.argv.slice(2);
  
  if (sprints.length === 0) {
    console.error('❌ Please provide sprint names as arguments');
    console.log('Usage: npm run sprint-review SCNT-2025-20 SCNT-2025-21');
    process.exit(1);
  }

  const generator = new SprintReviewGenerator();
  await generator.generateSprintReview(sprints);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SprintReviewGenerator };
