#!/usr/bin/env node

/**
 * Enhanced JIRA Tools - Example Usage
 * Demonstrates how to use the new JIRA analysis capabilities
 */

import { EnhancedJiraService } from './src/services/EnhancedJiraService.js';
import { JiraExtractor } from './src/utils/JiraExtractor.js';
import { JiraAnalyzer } from './src/utils/JiraAnalyzer.js';
import dotenv from 'dotenv';

dotenv.config();

// Example: Individual Ticket Analysis
async function exampleTicketAnalysis() {
  console.log('🎫 Example: Individual Ticket Analysis\n');
  
  const jiraService = new EnhancedJiraService({
    domain: process.env.JIRA_DOMAIN || 'your-domain.atlassian.net',
    token: process.env.JIRA_TOKEN || 'your-token',
    email: process.env.JIRA_EMAIL
  });

  try {
    // Replace with actual ticket key from your JIRA instance
    const ticketKey = 'SCNT-2025-123'; // Example ticket key
    
    console.log(`Analyzing ticket: ${ticketKey}...`);
    
    const analysis = await jiraService.analyzeTicket({
      ticketKey,
      analysisDepth: 'comprehensive',
      includeChangelog: true,
      includeComments: true,
      includeWorklogs: true
    });

    console.log('\n📊 Analysis Results:');
    console.log(`Title: ${analysis.details.metadata.summary}`);
    console.log(`Status: ${analysis.details.metadata.status.name}`);
    console.log(`Assignee: ${analysis.details.metadata.assignee?.displayName || 'Unassigned'}`);
    console.log(`Risk Level: ${analysis.insights.risks.overallRisk.toUpperCase()}`);
    console.log(`Activity Score: ${analysis.insights.activityPattern.activityScore}/100`);
    console.log(`Quality Score: ${analysis.insights.quality.descriptionQuality}/100`);
    
    if (analysis.insights.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.insights.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }

    if (analysis.insights.tags.length > 0) {
      console.log(`\n🏷️ Tags: ${analysis.insights.tags.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Note: Make sure to configure JIRA_DOMAIN, JIRA_TOKEN, and JIRA_EMAIL in your .env file');
    console.log('💡 Replace the example ticket key with a real ticket from your JIRA instance');
  }
}

// Example: Bulk Analysis
async function exampleBulkAnalysis() {
  console.log('\n📊 Example: Bulk Ticket Analysis\n');
  
  const jiraService = new EnhancedJiraService({
    domain: process.env.JIRA_DOMAIN || 'your-domain.atlassian.net',
    token: process.env.JIRA_TOKEN || 'your-token',
    email: process.env.JIRA_EMAIL
  });

  try {
    // Example JQL query - replace with your project key
    const jql = 'project = SCNT AND status = "In Progress" ORDER BY updated DESC';
    
    console.log(`Searching tickets with JQL: ${jql}...`);
    
    const results = await jiraService.searchAndAnalyze(jql, {
      maxResults: 10,
      includeInsights: true
    });

    console.log(`\n📈 Found ${results.size} tickets for analysis:`);
    
    Array.from(results.entries()).forEach(([key, analysis]) => {
      console.log(`\n🎫 ${key}: ${analysis.details.metadata.summary}`);
      console.log(`   Status: ${analysis.details.metadata.status.name}`);
      console.log(`   Risk: ${analysis.insights?.risks.overallRisk || 'N/A'}`);
      console.log(`   Activity: ${analysis.insights?.activityPattern.activityScore || 0}/100`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Note: Update the JQL query to match your project structure');
  }
}

// Example: Direct Utility Usage
async function exampleDirectUtilityUsage() {
  console.log('\n🔧 Example: Direct Utility Usage\n');
  
  // Example of using utilities directly on raw JIRA data
  const mockJiraIssue = {
    key: 'EXAMPLE-123',
    id: '12345',
    fields: {
      summary: 'Example ticket for demonstration',
      description: 'This is a sample ticket with acceptance criteria and test cases defined.',
      status: { name: 'In Progress', statusCategory: { name: 'In Progress' }, id: '3' },
      issuetype: { name: 'Story', subtask: false },
      priority: { name: 'Medium', id: '3' },
      assignee: { displayName: 'John Doe', accountId: 'abc123' },
      reporter: { displayName: 'Jane Smith', accountId: 'def456' },
      created: '2025-01-01T10:00:00.000Z',
      updated: '2025-01-15T14:30:00.000Z',
      project: { key: 'EXAMPLE', name: 'Example Project', id: '10001' },
      labels: ['feature', 'high-priority'],
      components: [],
      fixVersions: [],
      versions: [],
      comment: { comments: [] },
      worklog: { worklogs: [] },
      issuelinks: [],
      customfield_10004: 5 // Story points
    }
  };

  console.log('Extracting ticket metadata...');
  const metadata = JiraExtractor.extractMetadata(mockJiraIssue);
  console.log(`✅ Extracted metadata for: ${metadata.key}`);
  console.log(`   Summary: ${metadata.summary}`);
  console.log(`   Status: ${metadata.status.name}`);
  console.log(`   Priority: ${metadata.priority.name}`);

  console.log('\nExtracting complete ticket details...');
  const details = JiraExtractor.extractComplete(mockJiraIssue);
  console.log(`✅ Complete extraction done`);
  console.log(`   Story Points: ${details.storyPoints}`);
  console.log(`   Comments: ${details.comments.length}`);
  console.log(`   Worklogs: ${details.worklogs.length}`);

  console.log('\nGenerating insights...');
  const insights = JiraAnalyzer.analyzeTicket(details);
  console.log(`✅ Analysis complete`);
  console.log(`   Risk Level: ${insights.risks.overallRisk}`);
  console.log(`   Quality Score: ${insights.quality.descriptionQuality}/100`);
  console.log(`   Recommendations: ${insights.recommendations.length}`);
  
  if (insights.recommendations.length > 0) {
    console.log('   Top recommendation:', insights.recommendations[0]);
  }
}

// Example: Report Generation
async function exampleReportGeneration() {
  console.log('\n📈 Example: Report Generation\n');
  
  const jiraService = new EnhancedJiraService({
    domain: process.env.JIRA_DOMAIN || 'your-domain.atlassian.net',
    token: process.env.JIRA_TOKEN || 'your-token',
    email: process.env.JIRA_EMAIL
  });

  try {
    // Example ticket keys - replace with actual tickets
    const ticketKeys = ['SCNT-2025-120', 'SCNT-2025-121', 'SCNT-2025-122'];
    
    console.log(`Generating report for tickets: ${ticketKeys.join(', ')}...`);
    
    const report = await jiraService.generateReport(ticketKeys, {
      groupBy: 'status',
      metrics: ['cycleTime', 'quality', 'activity']
    });

    console.log(`\n📊 Report Summary:`);
    console.log(`   Total Tickets: ${report.summary.totalTickets}`);
    console.log(`   Grouped By: ${report.summary.groupBy}`);
    console.log(`   Groups Found: ${report.groups.size}`);

    console.log(`\n📋 Groups:`);
    Array.from(report.groups.entries()).forEach(([groupName, groupData]) => {
      console.log(`   ${groupName}: ${groupData.ticketCount} tickets`);
    });

    if (report.recommendations.length > 0) {
      console.log(`\n💡 Report Recommendations:`);
      report.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Note: Replace example ticket keys with real tickets from your JIRA instance');
  }
}

// Main execution
async function main() {
  console.log('🚀 Enhanced JIRA Tools - Example Usage\n');
  console.log('This script demonstrates the capabilities of the enhanced JIRA integration.');
  console.log('For actual usage, configure your JIRA credentials in the .env file.\n');
  console.log('=' .repeat(60));

  // Run direct utility example (works without JIRA connection)
  await exampleDirectUtilityUsage();

  // Check if JIRA is configured before running API examples
  if (process.env.JIRA_DOMAIN && process.env.JIRA_TOKEN) {
    await exampleTicketAnalysis();
    await exampleBulkAnalysis(); 
    await exampleReportGeneration();
    
    console.log('\n🎉 Examples completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Use these tools through VS Code Copilot MCP interface');
    console.log('  2. Integrate with your existing sprint analysis workflows');
    console.log('  3. Set up automated reporting for your team');
    console.log('  4. Customize risk assessment criteria for your project');
  } else {
    console.log('\n⚠️  JIRA API examples skipped - configure credentials to test');
    console.log('\n🔧 Configuration needed:');
    console.log('  • Set JIRA_DOMAIN in .env (e.g., your-company.atlassian.net)');
    console.log('  • Set JIRA_TOKEN in .env (your API token)');
    console.log('  • Set JIRA_EMAIL in .env (your email address)');
    console.log('\n📖 See ENHANCED_JIRA_TOOLS.md for complete documentation');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Example execution failed:', error);
    process.exit(1);
  });
}

export {
  exampleTicketAnalysis,
  exampleBulkAnalysis,
  exampleDirectUtilityUsage,
  exampleReportGeneration
};
