/**
 * Comprehensive Sprint Report & Teams Integration Solution
 * 
 * This module provides a robust solution for generating sprint reports
 * and sending them to Teams using the verified working tools.
 */

import { ReleaseNotesService } from './src/services/ReleaseNotesService.js';
import { TeamsIntegrationTool } from './src/tools/TeamsIntegrationTool.js';
import { JiraService } from './src/services/JiraService.js';
import { GitHubService } from './src/services/GitHubService.js';

export interface SprintReportConfig {
  sprintNumber: string;
  sendToTeams?: boolean;
  format?: 'markdown' | 'html';
  teamsMessage?: string;
  includeMetrics?: boolean;
}

export interface SprintReportResult {
  reportPath: string;
  teamsNotificationId?: string;
  metrics: {
    totalIssues: number;
    completedIssues: number;
    completionRate: number;
    storyPoints: string;
    commits: number;
    contributors: number;
    sprintDates: string;
  };
}

export class ComprehensiveSprintReporter {
  private releaseNotesService: ReleaseNotesService;
  private teamsIntegrationTool: TeamsIntegrationTool;
  private jiraService: JiraService;
  private githubService: GitHubService;

  constructor() {
    this.releaseNotesService = new ReleaseNotesService();
    this.teamsIntegrationTool = new TeamsIntegrationTool();
    this.jiraService = new JiraService();
    this.githubService = new GitHubService();
  }

  /**
   * Generate comprehensive sprint report and optionally send to Teams
   */
  async generateSprintReport(config: SprintReportConfig): Promise<SprintReportResult> {
    console.log(`🚀 Starting comprehensive sprint report for ${config.sprintNumber}...`);

    try {
      // Step 1: Generate the markdown report
      console.log('📝 Generating markdown report...');
      const reportResult = await this.releaseNotesService.generateReleaseNotes({
        sprintNumber: config.sprintNumber,
        format: config.format || 'markdown'
      });

      // Step 2: Extract metrics from JIRA and GitHub
      console.log('📊 Extracting sprint metrics...');
      const metrics = await this.extractSprintMetrics(config.sprintNumber);

      // Step 3: Send to Teams if requested
      let teamsNotificationId: string | undefined;
      if (config.sendToTeams) {
        console.log('📱 Sending Teams notification...');
        teamsNotificationId = await this.sendToTeams(config, metrics, reportResult.filePath);
      }

      console.log('✅ Comprehensive sprint report completed successfully!');

      return {
        reportPath: reportResult.filePath || '',
        teamsNotificationId,
        metrics
      };

    } catch (error) {
      console.error('❌ Failed to generate comprehensive sprint report:', error);
      throw error;
    }
  }

  /**
   * Extract comprehensive metrics from JIRA and GitHub
   */
  private async extractSprintMetrics(sprintNumber: string): Promise<SprintReportResult['metrics']> {
    try {
      // Get sprint details and date range
      const sprintDetails = await this.jiraService.getSprintDetails(sprintNumber);
      
      // Get JIRA issues
      const jiraIssues = await this.jiraService.fetchIssues(sprintNumber);
      
      // Get GitHub commits for the sprint period
      let commits: any[] = [];
      if (sprintDetails.startDate && sprintDetails.endDate) {
        commits = await this.githubService.fetchCommitsForDateRange(
          sprintDetails.startDate, 
          sprintDetails.endDate
        );
      }

      // Calculate metrics
      const totalIssues = jiraIssues.length;
      const completedIssues = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
      const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
      
      // Calculate story points
      const totalStoryPoints = jiraIssues.reduce((sum, issue) => {
        const points = issue.fields?.customfield_10004 || issue.fields?.storyPoints || 0;
        return sum + (typeof points === 'number' ? points : 0);
      }, 0);
      
      const completedStoryPoints = jiraIssues
        .filter(issue => issue.fields.status.name === 'Done')
        .reduce((sum, issue) => {
          const points = issue.fields?.customfield_10004 || issue.fields?.storyPoints || 0;
          return sum + (typeof points === 'number' ? points : 0);
        }, 0);

      // Get unique contributors
      const contributors = new Set();
      jiraIssues.forEach(issue => {
        if (issue.fields.assignee?.displayName) {
          contributors.add(issue.fields.assignee.displayName);
        }
      });
      commits.forEach(commit => {
        if (commit.author) {
          contributors.add(commit.author);
        }
      });

      // Format sprint dates
      const sprintDates = this.formatSprintDates(sprintDetails);

      return {
        totalIssues,
        completedIssues,
        completionRate,
        storyPoints: `${completedStoryPoints}/${totalStoryPoints}`,
        commits: commits.length,
        contributors: contributors.size,
        sprintDates
      };

    } catch (error) {
      console.error('Failed to extract sprint metrics:', error);
      throw error;
    }
  }

  /**
   * Send comprehensive sprint report to Teams
   */
  private async sendToTeams(
    config: SprintReportConfig, 
    metrics: SprintReportResult['metrics'],
    reportPath?: string
  ): Promise<string> {
    try {
      const teamsData = {
        sprintNumber: config.sprintNumber,
        sprintDates: metrics.sprintDates,
        completionRate: `${metrics.completionRate}%`,
        storyPoints: metrics.storyPoints,
        commits: metrics.commits,
        contributors: metrics.contributors,
        sprintStatus: metrics.completionRate >= 90 ? 'completed' : 'active',
        filePath: reportPath
      };

      const result = await this.teamsIntegrationTool.executeIntegration({
        type: 'sprint_completion',
        data: teamsData,
        urgency: metrics.completionRate < 70 ? 'high' : 'medium',
        interactive: true
      });

      return result.notificationId;

    } catch (error) {
      console.error('Failed to send Teams notification:', error);
      // Fallback to basic Teams notification
      return await this.sendBasicTeamsNotification(config, metrics, reportPath);
    }
  }

  /**
   * Fallback Teams notification using basic sendTeamsReport
   */
  private async sendBasicTeamsNotification(
    config: SprintReportConfig,
    metrics: SprintReportResult['metrics'],
    reportPath?: string
  ): Promise<string> {
    try {
      const summary = `Sprint ${config.sprintNumber} Report - ${metrics.completionRate}% Complete`;
      const message = config.teamsMessage || `
**Sprint ${config.sprintNumber} Summary:**
• **Completion Rate:** ${metrics.completionRate}% (${metrics.completedIssues}/${metrics.totalIssues} issues)
• **Story Points:** ${metrics.storyPoints} points
• **Team Activity:** ${metrics.commits} commits, ${metrics.contributors} contributors
• **Sprint Period:** ${metrics.sprintDates}
${reportPath ? `• **Report File:** ${reportPath}` : ''}
      `.trim();

      await this.teamsIntegrationTool.sendTeamsReport({
        reportType: 'single-sprint',
        sprintNumber: config.sprintNumber,
        title: summary,
        summary: message,
        filePath: reportPath
      });

      return `basic-${Date.now()}`;

    } catch (error) {
      console.error('Failed to send basic Teams notification:', error);
      throw error;
    }
  }

  /**
   * Format sprint dates to readable format
   */
  private formatSprintDates(sprintDetails: any): string {
    if (sprintDetails.startDate && sprintDetails.endDate) {
      const start = new Date(sprintDetails.startDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const end = new Date(sprintDetails.endDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${start} - ${end}`;
    }
    return 'Sprint dates TBD';
  }
}

// Example usage function
export async function generateSprintReportWithTeams(sprintNumber: string): Promise<SprintReportResult> {
  const reporter = new ComprehensiveSprintReporter();
  
  return await reporter.generateSprintReport({
    sprintNumber,
    sendToTeams: true,
    format: 'markdown',
    teamsMessage: `📊 Comprehensive ${sprintNumber} analysis complete with detailed metrics and deliverables.`,
    includeMetrics: true
  });
}

// CLI usage for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const sprintNumber = process.argv[2] || 'SCNT-2025-22';
  
  generateSprintReportWithTeams(sprintNumber)
    .then(result => {
      console.log('🎉 Sprint report generation completed!');
      console.log('📄 Report Path:', result.reportPath);
      console.log('📱 Teams Notification ID:', result.teamsNotificationId);
      console.log('📊 Metrics:', result.metrics);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}
