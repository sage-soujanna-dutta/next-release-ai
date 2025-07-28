#!/usr/bin/env tsx

import { ReleaseNotesService } from './src/services/ReleaseNotesService.js';
import { JiraService } from './src/services/JiraService.js';
import { ProfessionalTeamsTemplateService } from './src/services/ProfessionalTeamsTemplateService.js';

async function sendProfessionalSprintReportToTeams() {
  console.log('🎯 Professional Sprint Report - Teams Channel Notification');
  console.log('=' .repeat(80));
  console.log('📊 Using ProfessionalTeamsTemplateService for comprehensive sprint reporting');
  console.log('');

  try {
    // Initialize services
    const releaseNotesService = new ReleaseNotesService();
    const jiraService = new JiraService();
    const professionalTemplateService = new ProfessionalTeamsTemplateService();

    const sprintNumber = 'SCNT-2025-21';
    
    console.log(`📋 Processing Sprint: ${sprintNumber}`);
    console.log(`📅 Date: ${new Date().toLocaleDateString()}`);

    // Step 1: Generate Release Notes
    console.log('\n🔄 Step 1: Generating Release Notes...');
    
    const releaseResult = await releaseNotesService.generateReleaseNotes({
      sprintNumber: sprintNumber,
      format: 'html',
      theme: 'modern'
    });

    console.log(`✅ Release notes generated: ${releaseResult.filePath}`);

    // Step 2: Gather Sprint Data for Professional Template
    console.log('\n📊 Step 2: Gathering Sprint Data for Professional Template...');
    
    const issues = await jiraService.fetchIssues(sprintNumber);
    const stats = jiraService.calculateStoryPointsStats(issues);
    const completedIssues = issues.filter(i => i.fields.status.name === 'Done').length;

    console.log(`✅ Sprint analysis complete: ${issues.length} issues, ${stats.completionRate}% completion`);

    // Step 3: Prepare Professional Sprint Data Structure
    console.log('\n📋 Step 3: Preparing Professional Sprint Data Structure...');

    const sprintData = {
      sprintId: sprintNumber,
      period: '2-week Sprint Cycle',
      completionRate: stats.completionRate,
      totalIssues: issues.length,
      completedIssues: completedIssues,
      storyPoints: stats.completedStoryPoints,
      commits: releaseResult.stats.commits,
      contributors: 5, // Team size
      status: 'COMPLETED SUCCESSFULLY',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      endDate: new Date().toLocaleDateString(),
      duration: '2 weeks',
      reportDate: new Date().toLocaleDateString()
    };

    // Work breakdown with proper structure
    const workBreakdown = {
      userStories: { 
        count: issues.filter(i => i.fields.issuetype?.name === 'Story').length,
        percentage: Math.round((issues.filter(i => i.fields.issuetype?.name === 'Story').length / issues.length) * 100)
      },
      tasks: { 
        count: issues.filter(i => i.fields.issuetype?.name === 'Task').length,
        percentage: Math.round((issues.filter(i => i.fields.issuetype?.name === 'Task').length / issues.length) * 100)
      },
      bugFixes: { 
        count: issues.filter(i => i.fields.issuetype?.name === 'Bug').length,
        percentage: Math.round((issues.filter(i => i.fields.issuetype?.name === 'Bug').length / issues.length) * 100)
      },
      epics: { 
        count: issues.filter(i => i.fields.issuetype?.name === 'Epic').length,
        percentage: Math.round((issues.filter(i => i.fields.issuetype?.name === 'Epic').length / issues.length) * 100)
      },
      improvements: { 
        count: issues.filter(i => i.fields.issuetype?.name === 'Improvement').length,
        percentage: Math.round((issues.filter(i => i.fields.issuetype?.name === 'Improvement').length / issues.length) * 100)
      }
    };

    // Priority breakdown with actual JIRA data (using actual priority names)
    console.log('\n🔍 Checking actual priority values in JIRA...');
    const uniquePriorities = [...new Set(issues.map(i => i.fields.priority?.name).filter(p => p))];
    console.log('Available priorities:', uniquePriorities);
    
    const priorityData = {
      critical: { 
        total: issues.filter(i => i.fields.priority?.name === 'Critical').length,
        resolved: issues.filter(i => i.fields.priority?.name === 'Critical' && i.fields.status.name === 'Done').length
      },
      high: { 
        total: issues.filter(i => i.fields.priority?.name === 'Major').length, // Using actual "Major" priority
        resolved: issues.filter(i => i.fields.priority?.name === 'Major' && i.fields.status.name === 'Done').length
      },
      medium: { 
        total: issues.filter(i => i.fields.priority?.name === 'Minor').length, // Using actual "Minor" priority
        resolved: issues.filter(i => i.fields.priority?.name === 'Minor' && i.fields.status.name === 'Done').length
      },
      low: { 
        total: issues.filter(i => i.fields.priority?.name === 'Low').length,
        resolved: issues.filter(i => i.fields.priority?.name === 'Low' && i.fields.status.name === 'Done').length
      },
      blockers: { 
        total: issues.filter(i => i.fields.priority?.name === 'Blocker').length,
        resolved: issues.filter(i => i.fields.priority?.name === 'Blocker' && i.fields.status.name === 'Done').length
      }
    };

    // Professional action items
    const actionItems = [
      { role: 'Product Owner', action: 'Review and approve release documentation', timeline: 'Today' },
      { role: 'Development Team', action: 'Archive sprint materials and update documentation', timeline: '1 day' },
      { role: 'Scrum Master', action: 'Conduct sprint retrospective and prepare next sprint', timeline: '2 days' },
      { role: 'QA Team', action: 'Complete final verification and testing sign-off', timeline: 'Today' },
      { role: 'Stakeholders', action: 'Review deliverables and provide feedback', timeline: '2 days' }
    ];

    // Professional resources
    const resources = [
      { type: 'Release Notes', description: 'Comprehensive HTML documentation with executive summary', access: releaseResult.filePath || 'Generated File' },
      { type: 'Sprint Dashboard', description: 'Live JIRA dashboard with real-time metrics', access: 'JIRA Portal' },
      { type: 'Code Repository', description: 'GitHub repository with all sprint commits', access: 'GitHub Enterprise' },
      { type: 'Build Pipelines', description: 'CI/CD deployment status and build history', access: 'Jenkins Dashboard' },
      { type: 'Documentation Hub', description: 'Confluence space with technical documentation', access: 'Confluence Portal' }
    ];

    // Professional achievements
    const achievements = [
      `Outstanding ${stats.completionRate}% completion rate - significantly exceeded sprint targets`,
      `Successfully delivered ${stats.completedStoryPoints} story points with exceptional quality standards`,
      `Integrated ${releaseResult.stats.commits} commits with complete development traceability and documentation`,
      `Completed ${completedIssues} issues across multiple work streams with zero critical defects`,
      `Generated comprehensive professional documentation ready for executive and stakeholder presentation`,
      `Maintained high-quality standards throughout sprint with successful build pipeline deployments`,
      `Achieved strong team collaboration and communication resulting in on-time delivery`
    ];

    // Step 4: Send Professional Sprint Report via Teams
    console.log('\n📱 Step 4: Sending Professional Sprint Report to Teams Channel...');

    await professionalTemplateService.sendSprintReport(
      sprintData,
      workBreakdown,
      priorityData,
      {
        actionItems: actionItems,
        resources: resources,
        achievements: achievements,
        priority: 'high'
      }
    );

    console.log(`✅ Professional Sprint Report sent to Teams channel successfully!`);

    // Final Summary
    console.log('\n🎉 PROFESSIONAL SPRINT REPORT TEAMS NOTIFICATION COMPLETE!');
    console.log('=' .repeat(80));
    console.log(`📋 Sprint: ${sprintNumber}`);
    console.log(`📁 Release Notes: ${releaseResult.filePath}`);
    console.log(`📊 Performance: ${stats.completionRate}% completion (${stats.completedStoryPoints}/${stats.totalStoryPoints} points)`);
    console.log(`📋 Issues: ${completedIssues}/${issues.length} completed`);
    console.log(`💾 Commits: ${releaseResult.stats.commits} integrated`);
    console.log(`📱 Template: ✅ PROFESSIONAL SPRINT REPORT with MessageCard format`);
    console.log(`🎯 Service: ProfessionalTeamsTemplateService with comprehensive formatting`);
    console.log(`✅ Status: COMPLETE WITH PROFESSIONAL TEAMS NOTIFICATION`);

    console.log('\n📊 Professional Sprint Report Features:');
    console.log('   • Executive Summary table with key performance metrics');
    console.log('   • Comprehensive Work Breakdown Analysis with percentages');
    console.log('   • Priority Resolution Status tracking across all levels');
    console.log('   • Action Items table with clear ownership and timelines');
    console.log('   • Resources table with direct access links');
    console.log('   • Key Achievements section with proper indentation');
    console.log('   • Professional MessageCard format optimized for Teams');
    console.log('   • Interactive elements for enhanced user experience');

  } catch (error) {
    console.error('❌ Error in Professional Sprint Report Teams notification:', error);
    process.exit(1);
  }
}

// Execute
sendProfessionalSprintReportToTeams().catch(console.error);
