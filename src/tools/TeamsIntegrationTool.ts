import { TeamsService } from '../services/TeamsService.js';
import { FileService } from '../services/FileService.js';
import { JiraService } from '../services/JiraService.js';
import { ReleaseNotesService } from '../services/ReleaseNotesService.js';

export interface TeamsReportConfig {
  reportType: 'html-attachment' | 'html-extract' | 'html-report' | 'release-notes' | 'detailed-sprint' | 'single-sprint';
  sprintNumber?: string;
  filePath?: string;
  title?: string;
  summary?: string;
  includeAttachment?: boolean;
  extractContent?: boolean;
}

export class TeamsIntegrationTool {
  private teamsService: TeamsService;
  private fileService: FileService;
  private jiraService: JiraService;
  private releaseNotesService: ReleaseNotesService;

  constructor() {
    this.teamsService = new TeamsService();
    this.fileService = new FileService();
    this.jiraService = new JiraService();
    this.releaseNotesService = new ReleaseNotesService();
  }

  async sendTeamsReport(config: TeamsReportConfig): Promise<string> {
    try {
      console.log(`📱 Sending Teams report: ${config.reportType}`);

      switch (config.reportType) {
        case 'html-attachment':
          return await this.sendHtmlAttachment(config);
        case 'html-extract':
          return await this.sendHtmlExtract(config);
        case 'html-report':
          return await this.sendHtmlReport(config);
        case 'release-notes':
          return await this.sendReleaseNotes(config);
        case 'detailed-sprint':
          return await this.sendDetailedSprintReview(config);
        case 'single-sprint':
          return await this.sendSingleSprintReview(config);
        default:
          throw new Error(`Unknown report type: ${config.reportType}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send Teams report:`, error);
      throw error;
    }
  }

  private async sendHtmlAttachment(config: TeamsReportConfig): Promise<string> {
    if (!config.filePath) {
      throw new Error('File path is required for HTML attachment');
    }

    const content = await this.fileService.readFile(config.filePath);
    const summary = config.summary || 'HTML report has been generated';
    const formattedContent = `📄 **HTML Report Attachment**\n\nGenerated from: ${config.filePath}\n\nReport Type: HTML Attachment\nFile Size: ${Math.round(content.length / 1024)} KB\nGenerated At: ${new Date().toLocaleString()}\n\n${content.substring(0, 2000)}...`;

    await this.teamsService.sendNotification(summary, formattedContent);
    return `✅ HTML attachment sent to Teams successfully`;
  }

  private async sendHtmlExtract(config: TeamsReportConfig): Promise<string> {
    if (!config.filePath) {
      throw new Error('File path is required for HTML extract');
    }

    const content = await this.fileService.readFile(config.filePath);
    const extractedContent = this.extractKeyContent(content);
    const summary = config.summary || 'Key content extracted from HTML report';
    const formattedContent = `🔍 **Extracted HTML Content**\n\nExtracted from: ${config.filePath}\n\nExtract Type: Key Content\nOriginal Size: ${Math.round(content.length / 1024)} KB\nExtracted Size: ${Math.round(extractedContent.length / 1024)} KB\n\n${extractedContent}`;

    await this.teamsService.sendNotification(summary, formattedContent);
    return `✅ HTML extract sent to Teams successfully`;
  }

  private async sendHtmlReport(config: TeamsReportConfig): Promise<string> {
    if (!config.filePath) {
      throw new Error('File path is required for HTML report');
    }

    const content = await this.fileService.readFile(config.filePath);
    const summary = config.summary || 'Comprehensive HTML report ready';
    const formattedContent = `📈 **HTML Report**\n\nReport from: ${config.filePath}\n\nReport Format: Enhanced HTML\nContent Size: ${Math.round(content.length / 1024)} KB\nTeams Optimized: Yes\n\n${content.substring(0, 3000)}...`;

    await this.teamsService.sendNotification(summary, formattedContent);
    return `✅ HTML report sent to Teams successfully`;
  }

  private async sendReleaseNotes(config: TeamsReportConfig): Promise<string> {
    if (!config.sprintNumber) {
      throw new Error('Sprint number is required for release notes');
    }

    const releaseNotes = await this.releaseNotesService.generateReleaseNotes({
      sprintNumber: config.sprintNumber,
      format: 'markdown'
    });

    const summary = config.summary || `Release notes for sprint ${config.sprintNumber}`;
    const formattedContent = `🚀 **Release Notes - ${config.sprintNumber}**\n\nSprint: ${config.sprintNumber}\nGenerated At: ${new Date().toLocaleString()}\nIncludes: JIRA Issues & Git Commits\n\n${releaseNotes.content}`;

    await this.teamsService.sendNotification(summary, formattedContent);
    return `✅ Release notes for ${config.sprintNumber} sent to Teams successfully`;
  }

  private async sendDetailedSprintReview(config: TeamsReportConfig): Promise<string> {
    if (!config.sprintNumber) {
      throw new Error('Sprint number is required for detailed sprint review');
    }

    const issues = await this.jiraService.fetchIssues(config.sprintNumber);
    const stats = this.jiraService.calculateStoryPointsStats(issues);
    const detailedAnalysis = await this.generateDetailedAnalysis(issues, config.sprintNumber);

    const summary = config.summary || `Comprehensive analysis of sprint ${config.sprintNumber}`;
    const formattedContent = `🔍 **Detailed Sprint Review - ${config.sprintNumber}**\n\nTotal Issues: ${issues.length}\nStory Points: ${stats.totalStoryPoints}\nCompletion Rate: ${stats.completionRate}%\nAnalysis Depth: Comprehensive\n\n${detailedAnalysis}`;

    await this.teamsService.sendNotification(summary, formattedContent);
    return `✅ Detailed sprint review for ${config.sprintNumber} sent to Teams successfully`;
  }

  private async sendSingleSprintReview(config: TeamsReportConfig): Promise<string> {
    if (!config.sprintNumber) {
      throw new Error('Sprint number is required for single sprint review');
    }

    const issues = await this.jiraService.fetchIssues(config.sprintNumber);
    const stats = this.jiraService.calculateStoryPointsStats(issues);
    const sprintSummary = this.generateSprintSummary(issues, stats, config.sprintNumber);

    const summary = config.summary || `Quick review of sprint ${config.sprintNumber}`;
    const formattedContent = `📋 **Sprint Review - ${config.sprintNumber}**\n\nIssues Completed: ${stats.completedStoryPoints}/${stats.totalStoryPoints} points\nCompletion Rate: ${stats.completionRate}%\nTotal Issues: ${issues.length}\n\n${sprintSummary}`;

    await this.teamsService.sendNotification(summary, formattedContent);
    return `✅ Single sprint review for ${config.sprintNumber} sent to Teams successfully`;
  }

  private extractKeyContent(content: string): string {
    // Extract key sections from HTML content
    const keyWords = ['summary', 'completed', 'issues', 'story points', 'velocity', 'metrics'];
    const lines = content.split('\n');
    const keyLines = lines.filter(line => 
      keyWords.some(keyword => line.toLowerCase().includes(keyword))
    );
    
    return keyLines.slice(0, 50).join('\n'); // Limit to first 50 key lines
  }

  private async generateDetailedAnalysis(issues: any[], sprintNumber: string): Promise<string> {
    const analysis = [
      `# 🔍 Detailed Sprint Analysis - ${sprintNumber}`,
      '',
      '## 📊 Issue Breakdown',
      ...issues.slice(0, 10).map(issue => `- **${issue.key}**: ${issue.fields.summary} (${issue.fields.status.name})`),
      '',
      '## 📈 Performance Metrics',
      `- Total Issues: ${issues.length}`,
      `- Completed Issues: ${issues.filter(i => i.fields.status.name === 'Done').length}`,
      '',
      '## 🎯 Key Insights',
      '- Sprint execution analysis',
      '- Team collaboration patterns',
      '- Risk assessment and recommendations'
    ];

    return analysis.join('\n');
  }

  private generateSprintSummary(issues: any[], stats: any, sprintNumber: string): string {
    const completedIssues = issues.filter(i => i.fields.status.name === 'Done');
    
    return [
      `# 📋 Sprint ${sprintNumber} Summary`,
      '',
      `**Completion Rate**: ${stats.completionRate}%`,
      `**Story Points**: ${stats.completedStoryPoints}/${stats.totalStoryPoints}`,
      `**Issues**: ${completedIssues.length}/${issues.length} completed`,
      '',
      '## ✅ Completed Issues',
      ...completedIssues.slice(0, 5).map(issue => `- ${issue.key}: ${issue.fields.summary}`)
    ].join('\n');
  }

  async validateTeamsConnection(): Promise<string> {
    try {
      const summary = 'Teams Integration Validation';
      const content = '🔧 **Teams Integration Validation**\n\nTesting Teams webhook connection\n\nTest Time: ' + new Date().toLocaleString() + '\nStatus: Connected\nIntegration: Active';

      await this.teamsService.sendNotification(summary, content);
      return '✅ Teams integration validation successful';
    } catch (error) {
      return `❌ Teams integration validation failed: ${(error as Error).message}`;
    }
  }
}
