#!/usr/bin/env node

/**
 * Simple Enhanced JIRA Tools Demo
 * Demonstrates the utilities without requiring compilation
 */

console.log('🚀 Enhanced JIRA Tools - Demonstration\n');
console.log('This script shows what the enhanced JIRA integration can do.\n');
console.log('=' .repeat(60));

console.log('\n🔧 Direct Utility Example (No JIRA API Required)\n');

// Mock JIRA issue data for demonstration
const mockJiraIssue = {
  key: 'DEMO-123',
  id: '12345',
  fields: {
    summary: 'Implement user authentication feature',
    description: `
    As a user, I want to be able to log in securely so that I can access my account.
    
    Acceptance Criteria:
    - User can enter username and password
    - System validates credentials against database
    - User is redirected to dashboard on successful login
    - Error message shown for invalid credentials
    
    Test Cases:
    - Verify login with valid credentials
    - Verify error handling with invalid credentials
    - Verify password field is masked
    `,
    status: { 
      name: 'In Progress', 
      statusCategory: { name: 'In Progress' }, 
      id: '3' 
    },
    issuetype: { 
      name: 'Story', 
      subtask: false 
    },
    priority: { 
      name: 'High', 
      id: '2' 
    },
    assignee: { 
      displayName: 'Alice Johnson', 
      accountId: 'alice123',
      emailAddress: 'alice@company.com'
    },
    reporter: { 
      displayName: 'Bob Smith', 
      accountId: 'bob456',
      emailAddress: 'bob@company.com'
    },
    created: '2025-01-01T10:00:00.000Z',
    updated: '2025-01-20T14:30:00.000Z',
    resolutiondate: null,
    project: { 
      key: 'DEMO', 
      name: 'Demo Project', 
      id: '10001' 
    },
    labels: ['authentication', 'security', 'user-story'],
    components: [
      { name: 'Frontend', id: '1001' },
      { name: 'Backend', id: '1002' }
    ],
    fixVersions: [
      { name: 'v2.1.0', id: '2001', released: false }
    ],
    versions: [],
    comment: { 
      comments: [
        {
          id: '1',
          author: { displayName: 'Charlie Dev', accountId: 'charlie789' },
          body: 'Working on the UI mockups. Should have them ready by tomorrow.',
          created: '2025-01-02T09:00:00.000Z',
          updated: '2025-01-02T09:00:00.000Z'
        },
        {
          id: '2', 
          author: { displayName: 'Alice Johnson', accountId: 'alice123' },
          body: 'Great! I\'ll start on the backend API once the mockups are ready.',
          created: '2025-01-02T10:30:00.000Z',
          updated: '2025-01-02T10:30:00.000Z'
        },
        {
          id: '3',
          author: { displayName: 'Bob Smith', accountId: 'bob456' },
          body: 'Please make sure to include rate limiting for login attempts.',
          created: '2025-01-03T14:15:00.000Z',
          updated: '2025-01-03T14:15:00.000Z'
        }
      ]
    },
    worklog: { 
      worklogs: [
        {
          id: '1',
          author: { displayName: 'Charlie Dev', accountId: 'charlie789' },
          comment: 'UI mockup design',
          timeSpent: '4h',
          timeSpentSeconds: 14400,
          started: '2025-01-02T09:00:00.000Z',
          created: '2025-01-02T13:00:00.000Z',
          updated: '2025-01-02T13:00:00.000Z'
        },
        {
          id: '2',
          author: { displayName: 'Alice Johnson', accountId: 'alice123' },
          comment: 'Backend API development',
          timeSpent: '6h',
          timeSpentSeconds: 21600,
          started: '2025-01-03T08:00:00.000Z',
          created: '2025-01-03T14:00:00.000Z',
          updated: '2025-01-03T14:00:00.000Z'
        }
      ]
    },
    issuelinks: [
      {
        type: { name: 'Blocks', inward: 'is blocked by', outward: 'blocks' },
        outwardIssue: {
          key: 'DEMO-124',
          fields: {
            summary: 'Setup user database schema',
            status: { name: 'Done' },
            issuetype: { name: 'Task' },
            priority: { name: 'Medium' }
          }
        }
      }
    ],
    customfield_10004: 8, // Story points
    customfield_10020: ['com.atlassian.greenhopper.service.sprint.Sprint@1a2b3c[id=100,name=Sprint 21,state=ACTIVE]'],
    customfield_10014: 'DEMO-100', // Epic link
    duedate: '2025-01-25'
  }
};

console.log('📊 Simulating ticket analysis on sample data...\n');

// Simulate extraction
console.log('✅ Ticket Metadata Extracted:');
console.log(`   Key: ${mockJiraIssue.key}`);
console.log(`   Summary: ${mockJiraIssue.fields.summary}`);
console.log(`   Status: ${mockJiraIssue.fields.status.name}`);
console.log(`   Priority: ${mockJiraIssue.fields.priority.name}`);
console.log(`   Assignee: ${mockJiraIssue.fields.assignee.displayName}`);
console.log(`   Story Points: ${mockJiraIssue.fields.customfield_10004}`);

console.log('\n✅ Activity Data Extracted:');
console.log(`   Comments: ${mockJiraIssue.fields.comment.comments.length}`);
console.log(`   Worklogs: ${mockJiraIssue.fields.worklog.worklogs.length}`);
console.log(`   Linked Issues: ${mockJiraIssue.fields.issuelinks.length}`);
console.log(`   Components: ${mockJiraIssue.fields.components.length}`);

// Simulate analysis
console.log('\n✅ Quality Analysis:');
const hasAcceptanceCriteria = mockJiraIssue.fields.description.includes('Acceptance Criteria');
const hasTestCases = mockJiraIssue.fields.description.includes('Test Cases');
const descriptionLength = mockJiraIssue.fields.description.length;

console.log(`   Has Acceptance Criteria: ${hasAcceptanceCriteria ? '✅ Yes' : '❌ No'}`);
console.log(`   Has Test Cases: ${hasTestCases ? '✅ Yes' : '❌ No'}`);
console.log(`   Description Quality: ${descriptionLength > 200 ? 'High' : descriptionLength > 100 ? 'Medium' : 'Low'} (${descriptionLength} chars)`);

console.log('\n✅ Collaboration Analysis:');
const uniqueCommentators = new Set(mockJiraIssue.fields.comment.comments.map(c => c.author.accountId)).size;
const uniqueWorkloggers = new Set(mockJiraIssue.fields.worklog.worklogs.map(w => w.author.accountId)).size;
const totalTimeSpent = mockJiraIssue.fields.worklog.worklogs.reduce((sum, w) => sum + w.timeSpentSeconds, 0);

console.log(`   Unique Commentators: ${uniqueCommentators}`);
console.log(`   Unique Contributors: ${uniqueWorkloggers}`);
console.log(`   Total Time Logged: ${Math.round(totalTimeSpent / 3600)}h`);
console.log(`   Engagement Level: ${uniqueCommentators > 2 ? 'High' : uniqueCommentators > 1 ? 'Medium' : 'Low'}`);

console.log('\n✅ Risk Assessment:');
const isOverdue = new Date(mockJiraIssue.fields.duedate) < new Date();
const isHighStoryPoints = mockJiraIssue.fields.customfield_10004 > 5;
const hasBlockers = mockJiraIssue.fields.issuelinks.some(link => 
  link.type.name.toLowerCase().includes('block')
);

console.log(`   Due Date Risk: ${isOverdue ? '🚨 Overdue' : '✅ On Track'}`);
console.log(`   Complexity Risk: ${isHighStoryPoints ? '⚠️ High (8 SP)' : '✅ Manageable'}`);
console.log(`   Dependency Risk: ${hasBlockers ? '⚠️ Has Dependencies' : '✅ Independent'}`);

const riskFactors = [isOverdue, isHighStoryPoints, hasBlockers].filter(Boolean).length;
const overallRisk = riskFactors >= 2 ? 'High' : riskFactors === 1 ? 'Medium' : 'Low';
console.log(`   Overall Risk: ${overallRisk === 'High' ? '🚨' : overallRisk === 'Medium' ? '⚠️' : '✅'} ${overallRisk}`);

console.log('\n✅ Recommendations Generated:');
const recommendations = [];
if (!hasAcceptanceCriteria) recommendations.push('Add clear acceptance criteria');
if (!hasTestCases) recommendations.push('Define test cases for validation');
if (isHighStoryPoints) recommendations.push('Consider breaking down into smaller tasks');
if (uniqueCommentators < 2) recommendations.push('Increase stakeholder engagement');
if (isOverdue) recommendations.push('Review timeline and prioritize completion');

if (recommendations.length > 0) {
  recommendations.forEach(rec => console.log(`   • ${rec}`));
} else {
  console.log('   • Ticket appears to be well-structured and on track');
}

console.log('\n✅ Insight Tags:');
const tags = [];
if (hasAcceptanceCriteria && hasTestCases) tags.push('well-documented');
if (uniqueCommentators > 2) tags.push('collaborative');
if (isHighStoryPoints) tags.push('complex');
if (overallRisk === 'High') tags.push('high-risk');
if (mockJiraIssue.fields.labels.includes('security')) tags.push('security-related');

console.log(`   Tags: ${tags.length > 0 ? tags.join(', ') : 'standard-ticket'}`);

console.log('\n' + '=' .repeat(60));
console.log('📊 ANALYSIS COMPLETE\n');

console.log('🎯 What the Enhanced JIRA Tools Provide:');
console.log('  ✅ Comprehensive ticket metadata extraction');
console.log('  ✅ Advanced collaboration and activity analysis');  
console.log('  ✅ Quality assessment with scoring');
console.log('  ✅ Multi-factor risk evaluation');
console.log('  ✅ Actionable recommendations');
console.log('  ✅ Automated insight tagging');
console.log('  ✅ Bulk processing capabilities');
console.log('  ✅ Custom reporting and grouping');
console.log('  ✅ Teams integration for notifications');

console.log('\n🚀 Available MCP Tools:');
console.log('  • analyze_jira_ticket - Individual ticket deep analysis');
console.log('  • bulk_analyze_tickets - Multi-ticket analysis with filtering');
console.log('  • generate_jira_report - Comprehensive reports with metrics');
console.log('  • ticket_risk_assessment - Risk evaluation and mitigation');
console.log('  • ticket_collaboration_analysis - Team engagement insights');

console.log('\n📋 Next Steps:');
console.log('  1. Configure JIRA credentials in .env file');
console.log('  2. Run: npm run mcp-server');
console.log('  3. Use tools through VS Code Copilot');
console.log('  4. Test with your actual JIRA tickets');
console.log('  5. Set up automated reporting workflows');

console.log('\n📖 Documentation:');
console.log('  • ENHANCED_JIRA_TOOLS.md - Complete tool documentation');
console.log('  • MCP_TOOLS_INTEGRATION.md - Sprint analysis tools');
console.log('  • README.md - General setup and usage');

console.log('\n🎉 Enhanced JIRA integration is ready for use!');
