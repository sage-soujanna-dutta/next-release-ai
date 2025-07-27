#!/usr/bin/env tsx

/**
 * Complete Release Workflow for Sprint SCNT-2025-20
 * 
 * This script orchestrates a full release workflow including:
 * 1. Sprint analysis and validation
 * 2. Release notes generation
 * 3. JIRA ticket analysis and risk assessment
 * 4. Confluence publication
 * 5. Teams notifications
 * 6. Post-release reporting
 */

import { JiraService } from './src/services/JiraService';
import { GitHubService } from './src/services/GitHubService';
import { ReleaseNotesService } from './src/services/ReleaseNotesService';
import { ConfluenceService } from './src/services/ConfluenceService';
import { TeamsService } from './src/services/TeamsService';
import { EnhancedJiraService } from './src/services/EnhancedJiraService';
import { FileService } from './src/services/FileService';
import dotenv from 'dotenv';

dotenv.config();

interface WorkflowResult {
  step: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  data?: any;
  timestamp: string;
}

class ReleaseWorkflow {
  private jiraService: JiraService;
  private githubService: GitHubService;
  private releaseNotesService: ReleaseNotesService;
  private confluenceService: ConfluenceService;
  private teamsService: TeamsService;
  private enhancedJiraService: EnhancedJiraService;
  private fileService: FileService;
  private results: WorkflowResult[] = [];
  private sprintNumber: string;

  constructor(sprintNumber: string) {
    this.sprintNumber = sprintNumber;
    this.jiraService = new JiraService();
    this.githubService = new GitHubService();
    this.releaseNotesService = new ReleaseNotesService();
    this.confluenceService = new ConfluenceService();
    this.teamsService = new TeamsService();
    this.enhancedJiraService = new EnhancedJiraService({
      domain: process.env.JIRA_DOMAIN!,
      token: process.env.JIRA_TOKEN!,
      email: process.env.JIRA_EMAIL!
    });
    this.fileService = new FileService();
  }

  private logResult(step: string, status: 'success' | 'warning' | 'error', message: string, data?: any) {
    const result: WorkflowResult = {
      step,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    const emoji = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${emoji} [${step}] ${message}`);
  }

  async executeCompleteWorkflow(): Promise<void> {
    console.log(`🚀 Starting Complete Release Workflow for Sprint ${this.sprintNumber}`);
    console.log('=' .repeat(80));
    
    try {
      // Step 1: Validate Configuration
      await this.validateConfiguration();
      
      // Step 2: Sprint Analysis and Validation
      await this.analyzeSprintStatus();
      
      // Step 3: Risk Assessment
      await this.performRiskAssessment();
      
      // Step 4: Generate Release Notes
      await this.generateReleaseNotes();
      
      // Step 5: Publish to Confluence
      await this.publishToConfluence();
      
      // Step 6: Send Teams Notifications
      await this.sendNotifications();
      
      // Step 7: Generate Post-Release Reports
      await this.generatePostReleaseReports();
      
      // Step 8: Final Summary
      await this.generateWorkflowSummary();
      
    } catch (error) {
      this.logResult('workflow', 'error', `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { error });
      throw error;
    }
  }

  private async validateConfiguration(): Promise<void> {
    console.log('\n📋 Step 1: Configuration Validation');
    console.log('-'.repeat(40));
    
    try {
      const requiredEnvVars = [
        'JIRA_DOMAIN',
        'JIRA_EMAIL', 
        'JIRA_TOKEN',
        'GH_TOKEN',
        'GH_REPOSITORY',
        'CONFLUENCE_USERNAME',
        'CONFLUENCE_PAT',
        'JIRA_CONFLUENCE_DOMAIN',
        'TEAMS_WEBHOOK_URL'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        this.logResult('validation', 'error', `Missing environment variables: ${missingVars.join(', ')}`);
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      this.logResult('validation', 'success', 'All required environment variables are configured');
      
      // Test service connections
      console.log('   🔗 Testing service connections...');
      
      // Test JIRA connection
      try {
        await this.jiraService.fetchIssues(this.sprintNumber);
        this.logResult('jira-connection', 'success', 'JIRA connection validated');
      } catch (error) {
        this.logResult('jira-connection', 'warning', `JIRA connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test GitHub connection
      try {
        await this.githubService.fetchCommits();
        this.logResult('github-connection', 'success', 'GitHub connection validated');
      } catch (error) {
        this.logResult('github-connection', 'warning', `GitHub connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    } catch (error) {
      this.logResult('validation', 'error', `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async analyzeSprintStatus(): Promise<void> {
    console.log('\n📊 Step 2: Sprint Analysis & Validation');
    console.log('-'.repeat(40));
    
    try {
      // Get sprint issues
      const issues = await this.jiraService.fetchIssues(this.sprintNumber);
      this.logResult('sprint-fetch', 'success', `Fetched ${issues.length} issues from sprint ${this.sprintNumber}`);

      // Analyze sprint metrics
      const totalIssues = issues.length;
      const completedIssues = issues.filter(issue => issue.fields.status.name === 'Done').length;
      const inProgressIssues = issues.filter(issue => ['In Progress', 'Building', 'Testing'].includes(issue.fields.status.name)).length;
      const blockedIssues = issues.filter(issue => issue.fields.status.name === 'Blocked').length;
      
      const completionRate = Math.round((completedIssues / totalIssues) * 100);
      
      const sprintMetrics = {
        totalIssues,
        completedIssues,
        inProgressIssues,
        blockedIssues,
        completionRate,
        issues: issues.map(issue => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          assignee: issue.fields.assignee?.displayName || 'Unassigned',
          storyPoints: issue.fields.storyPoints || issue.fields.customfield_10004 || 0
        }))
      };

      this.logResult('sprint-analysis', 'success', 
        `Sprint Analysis Complete: ${completionRate}% completion rate (${completedIssues}/${totalIssues} issues)`,
        sprintMetrics
      );

      // Check for potential issues
      if (completionRate < 80) {
        this.logResult('sprint-warning', 'warning', 
          `Low completion rate (${completionRate}%) - consider reviewing remaining issues`
        );
      }

      if (blockedIssues > 0) {
        this.logResult('sprint-warning', 'warning', 
          `${blockedIssues} blocked issues found - may need attention before release`
        );
      }

      if (inProgressIssues > 0) {
        this.logResult('sprint-warning', 'warning', 
          `${inProgressIssues} issues still in progress - verify completion status`
        );
      }

    } catch (error) {
      this.logResult('sprint-analysis', 'error', `Sprint analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async performRiskAssessment(): Promise<void> {
    console.log('\n🔍 Step 3: Risk Assessment');
    console.log('-'.repeat(40));
    
    try {
      // Get all sprint issues for risk assessment using the enhanced service
      const jql = `sprint = "${this.sprintNumber}" ORDER BY priority DESC, created ASC`;
      
      // For now, perform basic risk assessment using available JIRA data
      const issues = await this.jiraService.fetchIssues(this.sprintNumber);
      
      // Basic risk assessment logic
      const highPriorityIssues = issues.filter(issue => 
        issue.fields.priority?.name === 'Critical' || issue.fields.priority?.name === 'High'
      );
      
      const unassignedIssues = issues.filter(issue => !issue.fields.assignee);
      const blockedIssues = issues.filter(issue => issue.fields.status.name === 'Blocked');

      let riskLevel = 'low';
      const riskFactors: string[] = [];

      if (highPriorityIssues.length > 5) {
        riskLevel = 'high';
        riskFactors.push(`${highPriorityIssues.length} high priority issues`);
      } else if (highPriorityIssues.length > 2) {
        riskLevel = 'medium';
        riskFactors.push(`${highPriorityIssues.length} high priority issues`);
      }

      if (unassignedIssues.length > 0) {
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
        riskFactors.push(`${unassignedIssues.length} unassigned issues`);
      }

      if (blockedIssues.length > 0) {
        riskLevel = 'high';
        riskFactors.push(`${blockedIssues.length} blocked issues`);
      }

      this.logResult('risk-assessment', 'success', 
        `Risk assessment completed: ${riskLevel} risk level`,
        { riskLevel, riskFactors, highPriorityIssues: highPriorityIssues.length, unassignedIssues: unassignedIssues.length, blockedIssues: blockedIssues.length }
      );

      if (riskLevel === 'high') {
        this.logResult('high-risk-found', 'warning', 
          `High risk factors identified: ${riskFactors.join(', ')} - review before release`,
          { riskFactors }
        );
      } else if (riskLevel === 'medium') {
        this.logResult('medium-risk-found', 'warning', 
          `Medium risk factors identified: ${riskFactors.join(', ')}`,
          { riskFactors }
        );
      } else {
        this.logResult('risk-clear', 'success', 'No significant risk factors identified - safe to proceed with release');
      }

    } catch (error) {
      this.logResult('risk-assessment', 'error', `Risk assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - risk assessment failure shouldn't block release
    }
  }

  private async generateReleaseNotes(): Promise<void> {
    console.log('\n📝 Step 4: Release Notes Generation');
    console.log('-'.repeat(40));
    
    try {
      // Generate release notes with both JIRA and GitHub data
      const releaseNotes = await this.releaseNotesService.generateReleaseNotes({
        sprintNumber: this.sprintNumber,
        format: 'html',
        theme: 'modern'
      });

      this.logResult('release-notes', 'success', 
        `Release notes generated successfully`,
        { 
          format: releaseNotes.format,
          contentLength: releaseNotes.content.length,
          jiraIssues: releaseNotes.stats.jiraIssues,
          commits: releaseNotes.stats.commits,
          preview: releaseNotes.content.substring(0, 200) + '...'
        }
      );

      // Save to file for backup
      const filePath = await this.fileService.saveReleaseNotes(releaseNotes.content, this.sprintNumber);
      
      this.logResult('release-notes-file', 'success', `Release notes saved to ${filePath}`);

      // Store for later use
      (this as any).releaseNotesContent = releaseNotes.content;

    } catch (error) {
      this.logResult('release-notes', 'error', `Release notes generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async publishToConfluence(): Promise<void> {
    console.log('\n📤 Step 5: Confluence Publication');
    console.log('-'.repeat(40));
    
    try {
      if (!(this as any).releaseNotesContent) {
        throw new Error('Release notes content not available');
      }

      const result = await this.confluenceService.publishPage((this as any).releaseNotesContent, this.sprintNumber);

      this.logResult('confluence-publish', 'success', 
        `Release notes published to Confluence`,
        { confluenceUrl: result }
      );

      // Store confluence URL for notifications
      (this as any).confluenceUrl = result;

    } catch (error) {
      this.logResult('confluence-publish', 'error', `Confluence publication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - confluence failure shouldn't block other steps
    }
  }

  private async sendNotifications(): Promise<void> {
    console.log('\n📢 Step 6: Teams Notifications');
    console.log('-'.repeat(40));
    
    try {
      // Prepare notification content
      const successfulSteps = this.results.filter(r => r.status === 'success').length;
      const totalSteps = this.results.length;
      const warnings = this.results.filter(r => r.status === 'warning');
      const errors = this.results.filter(r => r.status === 'error');

      const summary = `🚀 Release Workflow Complete for Sprint ${this.sprintNumber}`;
      
      let content = `### Release Workflow Summary\n\n`;
      content += `**Sprint:** ${this.sprintNumber}\\n`;
      content += `**Status:** ${errors.length === 0 ? '✅ Success' : '⚠️ Completed with issues'}\\n`;
      content += `**Steps Completed:** ${successfulSteps}/${totalSteps}\\n`;
      content += `**Timestamp:** ${new Date().toLocaleString()}\\n\\n`;

      if ((this as any).confluenceUrl) {
        content += `**📄 Release Notes:** [View in Confluence](${(this as any).confluenceUrl})\\n\\n`;
      }

      if (warnings.length > 0) {
        content += `**⚠️ Warnings (${warnings.length}):**\\n`;
        warnings.forEach(w => {
          content += `- ${w.step}: ${w.message}\\n`;
        });
        content += `\\n`;
      }

      if (errors.length > 0) {
        content += `**❌ Errors (${errors.length}):**\\n`;
        errors.forEach(e => {
          content += `- ${e.step}: ${e.message}\\n`;
        });
        content += `\\n`;
      }

      content += `**✅ Successful Steps:**\\n`;
      this.results.filter(r => r.status === 'success').forEach(s => {
        content += `- ${s.step}: ${s.message}\\n`;
      });

      // Send notification
      await this.teamsService.sendNotification(summary, content);

      this.logResult('teams-notification', 'success', 'Teams notification sent successfully');

    } catch (error) {
      this.logResult('teams-notification', 'error', `Teams notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - notification failure shouldn't block workflow
    }
  }

  private async generatePostReleaseReports(): Promise<void> {
    console.log('\n📊 Step 7: Post-Release Reports');
    console.log('-'.repeat(40));
    
    try {
      // Generate basic sprint analysis using available services
      console.log('   📋 Generating sprint summary...');
      const issues = await this.jiraService.fetchIssues(this.sprintNumber);
      const sprintDetails = await this.jiraService.getSprintDetails(this.sprintNumber);

      const sprintSummary = {
        sprint: this.sprintNumber,
        sprintDetails,
        totalIssues: issues.length,
        completedIssues: issues.filter(i => i.fields.status.name === 'Done').length,
        issuesByType: issues.reduce((acc, issue) => {
          const type = issue.fields.issuetype.name;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        issuesByStatus: issues.reduce((acc, issue) => {
          const status = issue.fields.status.name;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      this.logResult('sprint-summary', 'success', 'Sprint summary report generated', sprintSummary);

      // Save consolidated report
      const reportData = {
        sprint: this.sprintNumber,
        generatedAt: new Date().toISOString(),
        sprintSummary,
        workflowResults: this.results
      };

      const reportFilename = `post-release-report-${this.sprintNumber}-${new Date().toISOString().split('T')[0]}.json`;
      const reportPath = await this.fileService.saveReleaseNotes(JSON.stringify(reportData, null, 2), `report-${this.sprintNumber}`);
      
      this.logResult('post-release-report', 'success', `Post-release report saved to ${reportPath}`);

    } catch (error) {
      this.logResult('post-release-reports', 'error', `Post-release reports failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - report generation failure is not critical
    }
  }

  private async generateWorkflowSummary(): Promise<void> {
    console.log('\n📋 Step 8: Workflow Summary');
    console.log('='.repeat(80));
    
    const successCount = this.results.filter(r => r.status === 'success').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    console.log(`\n🎯 RELEASE WORKFLOW SUMMARY FOR SPRINT ${this.sprintNumber}`);
    console.log('='.repeat(80));
    console.log(`📊 Results: ${successCount} Success | ${warningCount} Warnings | ${errorCount} Errors`);
    console.log(`⏱️  Completed: ${new Date().toLocaleString()}`);
    
    if (errorCount === 0) {
      console.log(`✅ STATUS: Release workflow completed successfully!`);
    } else {
      console.log(`⚠️  STATUS: Release workflow completed with ${errorCount} errors`);
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('-'.repeat(80));
    
    this.results.forEach((result, index) => {
      const emoji = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${index + 1}. ${emoji} [${result.step.toUpperCase()}] ${result.message}`);
      if (result.status === 'error' || result.status === 'warning') {
        console.log(`   Time: ${new Date(result.timestamp).toLocaleTimeString()}`);
      }
    });

    if ((this as any).confluenceUrl) {
      console.log(`\n📄 RELEASE NOTES: ${(this as any).confluenceUrl}`);
    }

    console.log('\n🎉 Release workflow completed!');
    console.log('='.repeat(80));

    // Final summary log
    this.logResult('workflow-complete', 'success', 
      `Complete release workflow finished for sprint ${this.sprintNumber}`,
      {
        totalSteps: this.results.length,
        successful: successCount,
        warnings: warningCount,
        errors: errorCount,
        duration: Date.now() - parseInt(this.results[0]?.timestamp ? new Date(this.results[0].timestamp).getTime().toString() : '0')
      }
    );
  }
}

// Main execution
async function main() {
  const sprintNumber = process.argv[2] || 'SCNT-2025-20';
  
  console.log(`🎯 Initializing Release Workflow for Sprint: ${sprintNumber}`);
  
  if (!sprintNumber) {
    console.error('❌ Error: Sprint number is required');
    console.log('Usage: tsx release-workflow.ts <sprint-number>');
    console.log('Example: tsx release-workflow.ts SCNT-2025-20');
    process.exit(1);
  }

  const workflow = new ReleaseWorkflow(sprintNumber);
  
  try {
    await workflow.executeCompleteWorkflow();
    process.exit(0);
  } catch (error) {
    console.error('❌ Release workflow failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ReleaseWorkflow };
