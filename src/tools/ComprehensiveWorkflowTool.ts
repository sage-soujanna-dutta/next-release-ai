import { ReleaseNotesService } from '../services/ReleaseNotesService.js';
import { JiraService } from '../services/JiraService.js';
import { TeamsService } from '../services/TeamsService.js';
import { ConfluenceService } from '../services/ConfluenceService.js';
import { FileService } from '../services/FileService.js';
import { StoryPointsAnalysisTool } from './StoryPointsAnalysisTool.js';
import { VelocityAnalysisTool } from './VelocityAnalysisTool.js';
import { SprintReviewTool } from './SprintReviewTool.js';

export interface WorkflowConfig {
  sprintNumber: string;
  includeReleaseNotes?: boolean;
  includeStoryPointsAnalysis?: boolean;
  includeVelocityAnalysis?: boolean;
  includeSprintReview?: boolean;
  publishToConfluence?: boolean;
  sendToTeams?: boolean;
  generateAllReports?: boolean;
  outputFormat?: 'html' | 'markdown' | 'both';
}

export interface WorkflowResult {
  sprintNumber: string;
  executedSteps: WorkflowStep[];
  generatedFiles: string[];
  notifications: NotificationResult[];
  summary: WorkflowSummary;
  errors: WorkflowError[];
}

export interface WorkflowStep {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  duration: number;
  output?: string;
  error?: string;
}

export interface NotificationResult {
  type: 'teams' | 'confluence';
  status: 'success' | 'failed';
  message: string;
}

export interface WorkflowSummary {
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalDuration: number;
  overallStatus: 'success' | 'partial' | 'failed';
}

export interface WorkflowError {
  step: string;
  error: string;
  timestamp: Date;
}

export class ComprehensiveWorkflowTool {
  private releaseNotesService: ReleaseNotesService;
  private jiraService: JiraService;
  private teamsService: TeamsService;
  private confluenceService: ConfluenceService;
  private fileService: FileService;
  private storyPointsAnalysisTool: StoryPointsAnalysisTool;
  private velocityAnalysisTool: VelocityAnalysisTool;
  private sprintReviewTool: SprintReviewTool;

  constructor() {
    this.releaseNotesService = new ReleaseNotesService();
    this.jiraService = new JiraService();
    this.teamsService = new TeamsService();
    this.confluenceService = new ConfluenceService();
    this.fileService = new FileService();
    this.storyPointsAnalysisTool = new StoryPointsAnalysisTool();
    this.velocityAnalysisTool = new VelocityAnalysisTool();
    this.sprintReviewTool = new SprintReviewTool();
  }

  async executeComprehensiveWorkflow(config: WorkflowConfig): Promise<WorkflowResult> {
    console.log('🚀 Starting Comprehensive Release Workflow');
    console.log('='.repeat(60));
    console.log(`📋 Sprint: ${config.sprintNumber}`);
    console.log(`⚙️  Configuration: ${JSON.stringify(config, null, 2)}`);

    const startTime = Date.now();
    const executedSteps: WorkflowStep[] = [];
    const generatedFiles: string[] = [];
    const notifications: NotificationResult[] = [];
    const errors: WorkflowError[] = [];

    // Step 1: Generate Release Notes
    if (config.includeReleaseNotes !== false) {
      const step = await this.executeStep('Generate Release Notes', async () => {
        const result = await this.releaseNotesService.generateReleaseNotes({
          sprintNumber: config.sprintNumber,
          format: config.outputFormat === 'markdown' ? 'markdown' : 'html'
        });
        
        if (result.filePath) {
          generatedFiles.push(result.filePath);
        }
        
        return `Generated release notes with ${result.stats.jiraIssues} JIRA issues and ${result.stats.commits} commits`;
      });
      executedSteps.push(step);
    }

    // Step 2: Story Points Analysis
    if (config.includeStoryPointsAnalysis !== false) {
      const step = await this.executeStep('Story Points Analysis', async () => {
        const result = await this.storyPointsAnalysisTool.analyzeStoryPoints({
          sprintNumbers: [config.sprintNumber],
          generateHtmlReport: config.generateAllReports !== false,
          includeTeamsNotification: false // We'll handle notifications separately
        });
        
        return `Analyzed ${result.totalPoints} story points with ${result.overallCompletionRate}% completion rate`;
      });
      executedSteps.push(step);
    }

    // Step 3: Velocity Analysis
    if (config.includeVelocityAnalysis !== false) {
      const step = await this.executeStep('Velocity Analysis', async () => {
        const result = await this.velocityAnalysisTool.analyzeVelocity({
          numberOfSprints: 6,
          generateHtmlReport: config.generateAllReports !== false,
          includePredictiveAnalysis: true,
          includeTeamsNotification: false
        });
        
        return `Analyzed velocity trends: ${result.trends.averageVelocity} avg points, ${result.trends.velocityTrend} trend`;
      });
      executedSteps.push(step);
    }

    // Step 4: Sprint Review
    if (config.includeSprintReview !== false) {
      const step = await this.executeStep('Sprint Review Generation', async () => {
        const result = await this.sprintReviewTool.generateSprintReview([config.sprintNumber]);
        return `Generated comprehensive sprint review with velocity analysis`;
      });
      executedSteps.push(step);
    }

    // Step 5: Publish to Confluence (if requested)
    if (config.publishToConfluence) {
      const step = await this.executeStep('Publish to Confluence', async () => {
        // Get the latest generated HTML file
        const htmlFiles = generatedFiles.filter(f => f.endsWith('.html'));
        if (htmlFiles.length === 0) {
          throw new Error('No HTML files available for Confluence publishing');
        }

        const htmlContent = await this.fileService.readFile(htmlFiles[0]);
        const result = await this.confluenceService.publishPage(htmlContent, config.sprintNumber);
        
        return `Published to Confluence: ${result}`;
      });
      executedSteps.push(step);
      
      if (step.status === 'success') {
        notifications.push({
          type: 'confluence',
          status: 'success',
          message: 'Successfully published to Confluence'
        });
      }
    }

    // Step 6: Send Teams Notifications (if requested)
    if (config.sendToTeams !== false) {
      const step = await this.executeStep('Send Teams Notification', async () => {
        const summary = await this.generateWorkflowSummary(executedSteps, config.sprintNumber);
        const content = await this.generateTeamsContent(executedSteps, generatedFiles, config.sprintNumber);
        
        await this.teamsService.sendNotification({
          title: summary,
          message: content
        });
        return 'Teams notification sent successfully';
      });
      executedSteps.push(step);
      
      if (step.status === 'success') {
        notifications.push({
          type: 'teams',
          status: 'success',
          message: 'Teams notification sent successfully'
        });
      }
    }

    // Generate final workflow report
    if (config.generateAllReports !== false) {
      const step = await this.executeStep('Generate Workflow Report', async () => {
        const reportContent = await this.generateWorkflowReport(executedSteps, generatedFiles, notifications, config);
        const reportPath = await this.fileService.saveReleaseNotes(reportContent, `workflow-report-${config.sprintNumber}`);
        generatedFiles.push(reportPath);
        return `Workflow report saved to ${reportPath}`;
      });
      executedSteps.push(step);
    }

    const totalDuration = Date.now() - startTime;
    const summary = this.calculateWorkflowSummary(executedSteps, totalDuration);

    console.log('\n✅ Comprehensive Workflow Complete!');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${summary.overallStatus.toUpperCase()}`);
    console.log(`⏱️  Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`📊 Steps: ${summary.successfulSteps}/${summary.totalSteps} successful`);
    console.log(`📄 Generated Files: ${generatedFiles.length}`);
    console.log(`📱 Notifications: ${notifications.length}`);

    return {
      sprintNumber: config.sprintNumber,
      executedSteps,
      generatedFiles,
      notifications,
      summary,
      errors
    };
  }

  private async executeStep(stepName: string, operation: () => Promise<string>): Promise<WorkflowStep> {
    console.log(`\n🔄 Executing: ${stepName}`);
    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${stepName} completed in ${Math.round(duration / 1000)}s`);
      console.log(`   📝 ${result}`);

      return {
        name: stepName,
        status: 'success',
        duration,
        output: result
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ ${stepName} failed after ${Math.round(duration / 1000)}s`);
      console.error(`   🚨 Error: ${errorMessage}`);

      return {
        name: stepName,
        status: 'failed',
        duration,
        error: errorMessage
      };
    }
  }

  private calculateWorkflowSummary(steps: WorkflowStep[], totalDuration: number): WorkflowSummary {
    const totalSteps = steps.length;
    const successfulSteps = steps.filter(s => s.status === 'success').length;
    const failedSteps = steps.filter(s => s.status === 'failed').length;
    const skippedSteps = steps.filter(s => s.status === 'skipped').length;

    let overallStatus: 'success' | 'partial' | 'failed';
    if (failedSteps === 0) {
      overallStatus = 'success';
    } else if (successfulSteps > 0) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'failed';
    }

    return {
      totalSteps,
      successfulSteps,
      failedSteps,
      skippedSteps,
      totalDuration,
      overallStatus
    };
  }

  private async generateWorkflowSummary(steps: WorkflowStep[], sprintNumber: string): Promise<string> {
    const successful = steps.filter(s => s.status === 'success').length;
    const total = steps.length;
    return `Comprehensive Release Workflow Complete - Sprint ${sprintNumber} (${successful}/${total} steps successful)`;
  }

  private async generateTeamsContent(steps: WorkflowStep[], files: string[], sprintNumber: string): Promise<string> {
    const content = [
      `🚀 **Comprehensive Release Workflow - Sprint ${sprintNumber}**`,
      '',
      '## 📊 Execution Summary',
      `- **Total Steps**: ${steps.length}`,
      `- **Successful**: ${steps.filter(s => s.status === 'success').length}`,
      `- **Failed**: ${steps.filter(s => s.status === 'failed').length}`,
      `- **Generated Files**: ${files.length}`,
      '',
      '## ✅ Completed Steps',
      ...steps.filter(s => s.status === 'success').map(step => `- **${step.name}**: ${step.output || 'Completed successfully'}`),
      ''
    ];

    if (steps.some(s => s.status === 'failed')) {
      content.push('## ❌ Failed Steps');
      content.push(...steps.filter(s => s.status === 'failed').map(step => `- **${step.name}**: ${step.error}`));
      content.push('');
    }

    if (files.length > 0) {
      content.push('## 📄 Generated Reports');
      content.push(...files.map(file => `- ${file.split('/').pop()}`));
    }

    return content.join('\n');
  }

  private async generateWorkflowReport(steps: WorkflowStep[], files: string[], notifications: NotificationResult[], config: WorkflowConfig): Promise<string> {
    const successfulSteps = steps.filter(s => s.status === 'success').length;
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Workflow Report - ${config.sprintNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
        .metrics { display: flex; gap: 20px; margin: 20px 0; }
        .metric { flex: 1; background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .steps { margin: 20px 0; }
        .step { padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #28a745; background: #f8f9fa; }
        .step.failed { border-left-color: #dc3545; background: #f8d7da; }
        .files { background: #e3f2fd; padding: 20px; border-radius: 8px; }
        .config { background: #fff3e0; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Comprehensive Workflow Report</h1>
            <h2>Sprint ${config.sprintNumber}</h2>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <h3>Steps Executed</h3>
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">${successfulSteps}/${steps.length}</div>
            </div>
            <div class="metric">
                <h3>Total Duration</h3>
                <div style="font-size: 24px; font-weight: bold; color: #6c757d;">${Math.round(totalDuration / 1000)}s</div>
            </div>
            <div class="metric">
                <h3>Files Generated</h3>
                <div style="font-size: 24px; font-weight: bold; color: #17a2b8;">${files.length}</div>
            </div>
            <div class="metric">
                <h3>Notifications</h3>
                <div style="font-size: 24px; font-weight: bold; color: #fd7e14;">${notifications.length}</div>
            </div>
        </div>

        <div class="config">
            <h2>⚙️ Workflow Configuration</h2>
            <pre>${JSON.stringify(config, null, 2)}</pre>
        </div>

        <div class="steps">
            <h2>📋 Execution Steps</h2>
            ${steps.map(step => `
            <div class="step ${step.status === 'failed' ? 'failed' : ''}">
                <h3>${step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : '⏭️'} ${step.name}</h3>
                <p><strong>Status:</strong> ${step.status}</p>
                <p><strong>Duration:</strong> ${Math.round(step.duration / 1000)}s</p>
                ${step.output ? `<p><strong>Output:</strong> ${step.output}</p>` : ''}
                ${step.error ? `<p><strong>Error:</strong> ${step.error}</p>` : ''}
            </div>
            `).join('')}
        </div>

        ${files.length > 0 ? `
        <div class="files">
            <h2>📄 Generated Files</h2>
            <ul>
                ${files.map(file => `<li>${file}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${notifications.length > 0 ? `
        <div class="notifications">
            <h2>📱 Notifications</h2>
            <ul>
                ${notifications.map(notif => `<li><strong>${notif.type.toUpperCase()}:</strong> ${notif.message} (${notif.status})</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }
}
