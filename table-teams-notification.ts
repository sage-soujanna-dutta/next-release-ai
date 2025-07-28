#!/usr/bin/env tsx

import { ReleaseNotesService } from './src/services/ReleaseNotesService.js';
import { TeamsService } from './src/services/TeamsService.js';
import { JiraService } from './src/services/JiraService.js';

async function generateSprintReleaseWithTableFormat() {
  console.log('🎯 Sprint Release Generation with TABLE-FORMATTED Teams Notification');
  console.log('=' .repeat(80));
  console.log('📋 This script uses professional table formatting in Teams notifications');
  console.log('');

  try {
    // Initialize services
    const releaseNotesService = new ReleaseNotesService();
    const teamsService = new TeamsService();
    const jiraService = new JiraService();

    const sprintNumber = 'SCNT-2025-21';
    
    console.log(`📋 Processing Sprint: ${sprintNumber}`);
    console.log(`📅 Date: ${new Date().toLocaleDateString()}`);

    // Step 1: Generate Release Notes Documentation
    console.log('\n🔄 Step 1: Generating Release Notes Documentation...');
    
    const releaseResult = await releaseNotesService.generateReleaseNotes({
      sprintNumber: sprintNumber,
      format: 'html',
      theme: 'modern'
    });

    console.log(`✅ Release notes file generated: ${releaseResult.filePath}`);

    // Step 2: Fetch Sprint Data for Tables
    console.log('\n📊 Step 2: Gathering Sprint Analytics for Table Display...');
    
    const issues = await jiraService.fetchIssues(sprintNumber);
    const stats = jiraService.calculateStoryPointsStats(issues);
    const completedIssues = issues.filter(i => i.fields.status.name === 'Done').length;

    // Calculate additional metrics for tables
    const workBreakdown = {
      tasks: issues.filter(i => i.fields.issuetype?.name === 'Task').length,
      stories: issues.filter(i => i.fields.issuetype?.name === 'Story').length,
      bugs: issues.filter(i => i.fields.issuetype?.name === 'Bug').length,
      subtasks: issues.filter(i => i.fields.issuetype?.name === 'Sub-task').length
    };

    const totalWorkItems = workBreakdown.tasks + workBreakdown.stories + workBreakdown.bugs + workBreakdown.subtasks;

    console.log(`✅ Sprint analysis complete: ${issues.length} issues, ${stats.completionRate}% completion`);

    // Step 3: Create TABLE-FORMATTED Teams Message
    console.log('\n📱 Step 3: Creating TABLE-FORMATTED Teams Notification...');
    
    // Executive Summary Table
    const executiveSummaryTable = `
## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Sprint ID | ${sprintNumber} | ✅ COMPLETED |
| Completion Rate | ${stats.completionRate}% | 🎯 Outstanding |
| Story Points Delivered | ${stats.completedStoryPoints}/${stats.totalStoryPoints} | 💪 Strong Velocity |
| Issues Completed | ${completedIssues}/${issues.length} | ✅ On Target |
| Git Commits | ${releaseResult.stats.commits} | 🚀 Active Development |
| Release Date | ${new Date().toLocaleDateString()} | ⏰ On Time |
`;

    // Work Breakdown Analysis Table
    const workBreakdownTable = `
## 🏗️ Work Breakdown Analysis

| Work Type | Count | Percentage | Focus Area |
|-----------|-------|------------|------------|
| User Stories | ${workBreakdown.stories} | ${((workBreakdown.stories / totalWorkItems) * 100).toFixed(1)}% | Feature Development |
| Tasks | ${workBreakdown.tasks} | ${((workBreakdown.tasks / totalWorkItems) * 100).toFixed(1)}% | Implementation Work |
| Bug Fixes | ${workBreakdown.bugs} | ${((workBreakdown.bugs / totalWorkItems) * 100).toFixed(1)}% | Quality Assurance |
| Sub-tasks | ${workBreakdown.subtasks} | ${((workBreakdown.subtasks / totalWorkItems) * 100).toFixed(1)}% | Component Work |
| **Total** | **${totalWorkItems}** | **100%** | **Complete Sprint** |
`;

    // Priority Resolution Status Table
    const priorityResolutionTable = `
## 🎯 Priority Resolution Status

| Priority Level | Resolved | Total | Success Rate | Status |
|----------------|----------|-------|--------------|--------|
| Critical | ${issues.filter(i => i.fields.priority?.name === 'Critical' && i.fields.status.name === 'Done').length} | ${issues.filter(i => i.fields.priority?.name === 'Critical').length} | ${((issues.filter(i => i.fields.priority?.name === 'Critical' && i.fields.status.name === 'Done').length / Math.max(issues.filter(i => i.fields.priority?.name === 'Critical').length, 1)) * 100).toFixed(0)}% | ✅ Complete |
| High | ${issues.filter(i => i.fields.priority?.name === 'High' && i.fields.status.name === 'Done').length} | ${issues.filter(i => i.fields.priority?.name === 'High').length} | ${((issues.filter(i => i.fields.priority?.name === 'High' && i.fields.status.name === 'Done').length / Math.max(issues.filter(i => i.fields.priority?.name === 'High').length, 1)) * 100).toFixed(0)}% | ✅ Complete |
| Medium | ${issues.filter(i => i.fields.priority?.name === 'Medium' && i.fields.status.name === 'Done').length} | ${issues.filter(i => i.fields.priority?.name === 'Medium').length} | ${((issues.filter(i => i.fields.priority?.name === 'Medium' && i.fields.status.name === 'Done').length / Math.max(issues.filter(i => i.fields.priority?.name === 'Medium').length, 1)) * 100).toFixed(0)}% | 🎯 Strong |
| Low | ${issues.filter(i => i.fields.priority?.name === 'Low' && i.fields.status.name === 'Done').length} | ${issues.filter(i => i.fields.priority?.name === 'Low').length} | ${((issues.filter(i => i.fields.priority?.name === 'Low' && i.fields.status.name === 'Done').length / Math.max(issues.filter(i => i.fields.priority?.name === 'Low').length, 1)) * 100).toFixed(0)}% | ✅ Good |
`;

    // Action Items Table
    const actionItemsTable = `
## 🚀 Action Items

| Role | Action Required | Timeline |
|------|----------------|----------|
| Product Owner | Review Release Notes | Today |
| Stakeholders | Validate Documentation | 2 days |
| Development Team | Archive Sprint Materials | 1 day |
| Scrum Master | Prepare Next Sprint | 3 days |
| QA Team | Final Testing Verification | Today |
`;

    // Resources Table
    const resourcesTable = `
## 📄 Available Resources

| Resource Type | Description | Access |
|---------------|-------------|--------|
| Release Notes | Professional HTML Documentation | ${releaseResult.filePath} |
| Sprint Report | Executive Summary Document | Generated File |
| JIRA Dashboard | Live Sprint Tracking | JIRA Portal |
| GitHub Repository | Source Code & Commits | GitHub Enterprise |
| Build Pipelines | Deployment Status | CI/CD Dashboard |
`;

    // Combine all tables into comprehensive Teams message
    const tableFormattedTeamsMessage = `🎯 **Sprint-21 Release Complete - Professional Table Report**

${executiveSummaryTable}

---

${workBreakdownTable}

---

${priorityResolutionTable}

---

${actionItemsTable}

---

${resourcesTable}

---

## 🌟 Sprint Success Summary

**OUTSTANDING SPRINT COMPLETION ACHIEVED!**

Sprint-21 has been successfully delivered with **${stats.completionRate}% efficiency**, achieving **${stats.completedStoryPoints} story points** and maintaining our commitment to quality, timeline adherence, and stakeholder satisfaction.

### 🎯 Key Success Factors:
    ✅ Strong team collaboration and communication  
    ✅ Effective sprint planning and execution  
    ✅ Quality-focused development practices  
    ✅ Comprehensive documentation and reporting  

**🚀 Team is ready for next sprint cycle with strong momentum!**

---
📅 **Generated:** ${new Date().toLocaleString()}  
🏢 **System:** Sprint Management & Release Automation  
📋 **Sprint:** ${sprintNumber} | 🎯 **Status:** Complete`;

    // Send TABLE-FORMATTED Teams notification
    await teamsService.sendNotification({
      title: `📊 Sprint-21 Complete - ${stats.completionRate}% Success (Table Format)`,
      message: tableFormattedTeamsMessage,
      isImportant: true,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ TABLE-FORMATTED Teams notification sent successfully!`);

    // Final Summary
    console.log('\n🎉 SPRINT RELEASE WITH TABLE-FORMATTED TEAMS NOTIFICATION COMPLETE!');
    console.log('=' .repeat(80));
    console.log(`📋 Sprint: ${sprintNumber}`);
    console.log(`📁 Release Notes: ${releaseResult.filePath}`);
    console.log(`📊 Performance: ${stats.completionRate}% completion (${stats.completedStoryPoints}/${stats.totalStoryPoints} points)`);
    console.log(`📋 Issues: ${completedIssues}/${issues.length} completed`);
    console.log(`💾 Commits: ${releaseResult.stats.commits} integrated`);
    console.log(`📱 Teams Format: ✅ PROFESSIONAL TABLE LAYOUT`);
    console.log(`📊 Tables Included: Executive Summary, Work Breakdown, Priority Status, Action Items, Resources`);
    console.log(`✅ Status: COMPLETE WITH TABLE-FORMATTED TEAMS UPDATE`);

    console.log('\n📊 Table Format Features:');
    console.log('   • Executive Summary with key metrics');
    console.log('   • Work breakdown analysis with percentages');
    console.log('   • Priority resolution status tracking');
    console.log('   • Action items with assigned roles and timelines');
    console.log('   • Available resources with access information');
    console.log('   • Professional formatting for Teams display');

  } catch (error) {
    console.error('❌ Error in table-formatted sprint release generation:', error);
    process.exit(1);
  }
}

// Execute
generateSprintReleaseWithTableFormat().catch(console.error);
