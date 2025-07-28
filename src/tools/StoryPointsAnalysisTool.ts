import { JiraService } from '../services/JiraService.js';
import { TeamsService } from '../services/TeamsService.js';
import { FileService } from '../services/FileService.js';
import { HtmlFormatter } from '../utils/HtmlFormatter.js';

export interface StoryPointsConfig {
  sprintNumbers: string[];
  includeTeamsNotification?: boolean;
  generateHtmlReport?: boolean;
  outputPath?: string;
}

export interface StoryPointsResult {
  totalPoints: number;
  completedPoints: number;
  overallCompletionRate: number;
  sprintMetrics: SprintMetrics[];
  performanceAssessment: string;
  recommendations: string[];
}

export interface SprintMetrics {
  sprintNumber: string;
  issues: any[];
  stats: any;
  detailedBreakdown: any;
}

export class StoryPointsAnalysisTool {
  private jiraService: JiraService;
  private teamsService: TeamsService;
  private fileService: FileService;
  private htmlFormatter: HtmlFormatter;

  constructor() {
    this.jiraService = new JiraService();
    this.teamsService = new TeamsService();
    this.fileService = new FileService();
    this.htmlFormatter = new HtmlFormatter();
  }

  async analyzeStoryPoints(config: StoryPointsConfig): Promise<StoryPointsResult> {
    console.log('📊 Enhanced Story Points Analysis for Multiple Sprints');
    console.log('='.repeat(60));

    let totalPoints = 0;
    let totalCompletedPoints = 0;
    const sprintMetrics: SprintMetrics[] = [];
    let allIssues: any[] = [];

    for (const sprintNumber of config.sprintNumbers) {
      console.log(`\n🔍 Analyzing Sprint: ${sprintNumber}`);
      console.log('-'.repeat(40));

      try {
        const issues = await this.jiraService.fetchIssues(sprintNumber);
        const stats = this.jiraService.calculateStoryPointsStats(issues);
        const detailedBreakdown = this.generateDetailedBreakdown(issues, stats);

        allIssues.push(...issues);

        const metrics: SprintMetrics = {
          sprintNumber,
          issues,
          stats,
          detailedBreakdown
        };

        sprintMetrics.push(metrics);

        // Log sprint details
        this.logSprintDetails(sprintNumber, issues, stats);

        totalPoints += stats.totalStoryPoints;
        totalCompletedPoints += stats.completedStoryPoints;

      } catch (error) {
        console.error(`❌ Error analyzing ${sprintNumber}:`, (error as Error).message);
      }
    }

    const overallCompletionRate = totalPoints > 0 ? Math.round((totalCompletedPoints / totalPoints) * 100) : 0;
    const performanceAssessment = this.generatePerformanceAssessment(overallCompletionRate, allIssues.length);
    const recommendations = this.generateRecommendations(sprintMetrics, overallCompletionRate);

    // Log combined summary
    this.logCombinedSummary(totalPoints, totalCompletedPoints, overallCompletionRate, allIssues.length);

    const result: StoryPointsResult = {
      totalPoints,
      completedPoints: totalCompletedPoints,
      overallCompletionRate,
      sprintMetrics,
      performanceAssessment,
      recommendations
    };

    // Generate HTML report if requested
    if (config.generateHtmlReport) {
      await this.generateHtmlReport(result, config.outputPath);
    }

    // Send Teams notification if requested
    if (config.includeTeamsNotification) {
      await this.sendTeamsNotification(result);
    }

    return result;
  }

  private generateDetailedBreakdown(issues: any[], stats: any) {
    return {
      byStatus: stats.byStatus,
      byType: stats.byType,
      byPriority: this.groupByPriority(issues),
      byAssignee: this.groupByAssignee(issues),
      riskAnalysis: this.analyzeRisks(issues)
    };
  }

  private groupByPriority(issues: any[]): Record<string, number> {
    const priorityGroups: Record<string, number> = {};
    issues.forEach(issue => {
      const priority = issue.fields.priority?.name || 'No Priority';
      const storyPoints = parseFloat(issue.fields.customfield_10016) || 0;
      priorityGroups[priority] = (priorityGroups[priority] || 0) + storyPoints;
    });
    return priorityGroups;
  }

  private groupByAssignee(issues: any[]): Record<string, number> {
    const assigneeGroups: Record<string, number> = {};
    issues.forEach(issue => {
      const assignee = issue.fields.assignee?.displayName || 'Unassigned';
      const storyPoints = parseFloat(issue.fields.customfield_10016) || 0;
      assigneeGroups[assignee] = (assigneeGroups[assignee] || 0) + storyPoints;
    });
    return assigneeGroups;
  }

  private analyzeRisks(issues: any[]): string[] {
    const risks: string[] = [];
    const highPriorityCount = issues.filter(i => i.fields.priority?.name === 'High').length;
    const unassignedCount = issues.filter(i => !i.fields.assignee).length;
    const blockedCount = issues.filter(i => i.fields.status.name.toLowerCase().includes('blocked')).length;

    if (highPriorityCount > issues.length * 0.3) {
      risks.push('High concentration of high-priority issues');
    }
    if (unassignedCount > 0) {
      risks.push(`${unassignedCount} unassigned issues`);
    }
    if (blockedCount > 0) {
      risks.push(`${blockedCount} blocked issues requiring attention`);
    }

    return risks;
  }

  private logSprintDetails(sprintNumber: string, issues: any[], stats: any) {
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
          console.log(`   ${this.getStatusIcon(status)} ${status}: ${points} points (${percentage}%)`);
        });

      console.log('\n📋 Story Points by Issue Type:');
      Object.entries(stats.byType)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .forEach(([type, points]) => {
          const percentage = Math.round(((points as number) / stats.totalStoryPoints) * 100);
          console.log(`   ${this.getTypeIcon(type)} ${type}: ${points} points (${percentage}%)`);
        });
    } else {
      console.log('⚠️  No story points found - issues may not have story point estimates');
    }
  }

  private logCombinedSummary(totalPoints: number, totalCompletedPoints: number, overallCompletion: number, totalIssues: number) {
    console.log('\n🎯 COMBINED SPRINTS SUMMARY');
    console.log('='.repeat(40));
    console.log(`📊 Total Story Points Planned: ${totalPoints}`);
    console.log(`✅ Total Story Points Completed: ${totalCompletedPoints}`);
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

    const avgPointsPerIssue = totalIssues > 0 ? totalPoints / totalIssues : 0;
    console.log(`\n📊 Additional Metrics:`);
    console.log(`   📋 Total Issues: ${totalIssues}`);
    console.log(`   🎯 Average Points per Issue: ${avgPointsPerIssue.toFixed(1)}`);
    console.log(`   🚀 Velocity: ${totalCompletedPoints} points completed`);
  }

  private generatePerformanceAssessment(completionRate: number, totalIssues: number): string {
    if (completionRate >= 90) {
      return '🌟 Exceptional - Outstanding sprint execution!';
    } else if (completionRate >= 80) {
      return '✨ Excellent - Great predictability and delivery!';
    } else if (completionRate >= 70) {
      return '👍 Good - Solid performance with room for improvement';
    } else if (completionRate >= 50) {
      return '⚠️ Fair - Consider sprint planning and capacity review';
    } else {
      return '🚨 Needs Attention - Significant planning and execution gaps';
    }
  }

  private generateRecommendations(sprintMetrics: SprintMetrics[], completionRate: number): string[] {
    const recommendations: string[] = [];

    if (completionRate < 70) {
      recommendations.push('Review sprint planning process and capacity estimation');
      recommendations.push('Consider reducing sprint scope or increasing team capacity');
    }

    const hasUnestimatedIssues = sprintMetrics.some(s => s.stats.totalStoryPoints === 0);
    if (hasUnestimatedIssues) {
      recommendations.push('Ensure all issues have story point estimates');
      recommendations.push('Implement story point estimation guidelines');
    }

    const hasHighVariance = this.checkVelocityVariance(sprintMetrics);
    if (hasHighVariance) {
      recommendations.push('Work on improving velocity consistency across sprints');
      recommendations.push('Analyze factors causing velocity variations');
    }

    return recommendations;
  }

  private checkVelocityVariance(sprintMetrics: SprintMetrics[]): boolean {
    if (sprintMetrics.length < 2) return false;
    
    const velocities = sprintMetrics.map(s => s.stats.completedStoryPoints);
    const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const variance = velocities.reduce((sum, vel) => sum + Math.pow(vel - avg, 2), 0) / velocities.length;
    
    return variance > avg * 0.5; // High variance if > 50% of average
  }

  private async generateHtmlReport(result: StoryPointsResult, outputPath?: string): Promise<void> {
    const html = this.generateHtmlContent(result);
    const sprintNumbers = result.sprintMetrics.map(s => s.sprintNumber).join('-');
    const fileName = `story-points-analysis-${sprintNumbers}`;
    
    const filePath = await this.fileService.saveReleaseNotes(html, fileName);
    console.log(`📄 HTML report generated: ${filePath}`);
  }

  private generateHtmlContent(result: StoryPointsResult): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Story Points Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #0066cc; color: white; padding: 20px; border-radius: 8px; }
        .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 5px; border: 1px solid #ddd; }
        .sprint { margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 8px; }
        .recommendations { background: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Story Points Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <h2>🎯 Overall Summary</h2>
        <div class="metric">
            <strong>Total Points:</strong> ${result.totalPoints}
        </div>
        <div class="metric">
            <strong>Completed:</strong> ${result.completedPoints}
        </div>
        <div class="metric">
            <strong>Completion Rate:</strong> ${result.overallCompletionRate}%
        </div>
        <div class="metric">
            <strong>Assessment:</strong> ${result.performanceAssessment}
        </div>
    </div>

    <div class="sprints">
        <h2>📋 Sprint Details</h2>
        ${result.sprintMetrics.map(sprint => `
        <div class="sprint">
            <h3>Sprint ${sprint.sprintNumber}</h3>
            <p><strong>Issues:</strong> ${sprint.issues.length}</p>
            <p><strong>Story Points:</strong> ${sprint.stats.completedStoryPoints}/${sprint.stats.totalStoryPoints} (${sprint.stats.completionRate}%)</p>
        </div>
        `).join('')}
    </div>

    <div class="recommendations">
        <h2>💡 Recommendations</h2>
        <ul>
            ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
  }

  private async sendTeamsNotification(result: StoryPointsResult): Promise<void> {
    const summary = `Story Points Analysis Complete - ${result.overallCompletionRate}% completion`;
    
    // Generate full detailed content similar to terminal output for better parsing
    const content = this.generateFullAnalysisContent(result);

    await this.teamsService.sendNotification(summary, content);
    console.log('� Teams notification sent successfully');
  }

  /**
   * Generate full detailed analysis content for Teams notification
   * This matches the terminal output format so TeamsService can parse it correctly
   */
  private generateFullAnalysisContent(result: StoryPointsResult): string {
    let content = '📊 Enhanced Story Points Analysis for Multiple Sprints\n';
    content += '='.repeat(60) + '\n\n';

    // Add individual sprint details
    for (const sprint of result.sprintMetrics) {
      content += `🔍 Analyzing Sprint: ${sprint.sprintNumber}\n`;
      content += '-'.repeat(40) + '\n';
      content += `📋 Total Issues: ${sprint.issues.length}\n`;
      content += `📊 Total Story Points: ${sprint.stats.totalStoryPoints}\n`;
      content += `✅ Completed Story Points: ${sprint.stats.completedStoryPoints}\n`;
      content += `📈 Completion Rate: ${Math.round((sprint.stats.completedStoryPoints / sprint.stats.totalStoryPoints) * 100)}%\n\n`;
      
      // Add story points by status for first few sprints
      if (result.sprintMetrics.indexOf(sprint) < 2) {
        content += '📊 Story Points by Status:\n';
        Object.entries(sprint.stats.byStatus || {}).forEach(([status, points]) => {
          const pointsValue = typeof points === 'number' ? points : 0;
          const percentage = Math.round((pointsValue / sprint.stats.totalStoryPoints) * 100);
          content += `   ${this.getStatusIcon(status)} ${status}: ${pointsValue} points (${percentage}%)\n`;
        });
        content += '\n';
        
        content += '📋 Story Points by Issue Type:\n';
        Object.entries(sprint.stats.byType || {}).forEach(([type, points]) => {
          const pointsValue = typeof points === 'number' ? points : 0;
          const percentage = Math.round((pointsValue / sprint.stats.totalStoryPoints) * 100);
          content += `   ${this.getTypeIcon(type)} ${type}: ${pointsValue} points (${percentage}%)\n`;
        });
        content += '\n';
      }
    }

    // Add combined summary - this is crucial for TeamsService parsing!
    content += '🎯 COMBINED SPRINTS SUMMARY\n';
    content += '='.repeat(40) + '\n';
    content += `📊 Total Story Points Planned: ${result.totalPoints}\n`;
    content += `✅ Total Story Points Completed: ${result.completedPoints}\n`;
    content += `📈 Overall Completion Rate: ${result.overallCompletionRate}%\n\n`;
    
    content += '🏆 Performance Assessment:\n';
    content += `   ${result.performanceAssessment}\n\n`;
    
    // Add total issues count (calculated from all sprints)
    const totalIssues = result.sprintMetrics.reduce((sum, sprint) => sum + sprint.issues.length, 0);
    const avgPointsPerIssue = totalIssues > 0 ? (result.totalPoints / totalIssues).toFixed(1) : '0';
    
    content += '📊 Additional Metrics:\n';
    content += `   � Total Issues: ${totalIssues}\n`;
    content += `   🎯 Average Points per Issue: ${avgPointsPerIssue}\n`;
    content += `   🚀 Velocity: ${result.completedPoints} points completed\n`;

    return content;
  }

  private getTypeIcon(type: string): string {
    const typeIcons: Record<string, string> = {
      'Story': '✨',
      'Task': '🧹', 
      'Bug': '🐛',
      'Sub-task': '📋',
      'Epic': '🎯',
      'Improvement': '🔧'
    };
    return typeIcons[type] || '📌';
  }

  private getStatusIcon(status: string): string {
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
}
