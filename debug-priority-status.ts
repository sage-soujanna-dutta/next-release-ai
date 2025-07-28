#!/usr/bin/env tsx

import { JiraService } from './src/services/JiraService.js';
import { ProfessionalTeamsTemplateService } from './src/services/ProfessionalTeamsTemplateService.js';

async function debugPriorityResolutionStatus() {
  console.log('🔍 Debug: Priority Resolution Status Information');
  console.log('=' .repeat(70));
  
  try {
    const jiraService = new JiraService();
    const sprintNumber = 'SCNT-2025-21';
    
    console.log(`📋 Analyzing priority data for Sprint: ${sprintNumber}`);
    
    // Fetch issues
    const issues = await jiraService.fetchIssues(sprintNumber);
    console.log(`✅ Fetched ${issues.length} total issues`);
    
    // Debug priority breakdown
    console.log('\n📊 Priority Breakdown Analysis:');
    
    const priorityNames = ['Critical', 'High', 'Medium', 'Low', 'Blocker'];
    const priorityData = {
      critical: { 
        total: issues.filter(i => i.fields.priority?.name === 'Critical').length,
        resolved: issues.filter(i => i.fields.priority?.name === 'Critical' && i.fields.status.name === 'Done').length
      },
      high: { 
        total: issues.filter(i => i.fields.priority?.name === 'High').length,
        resolved: issues.filter(i => i.fields.priority?.name === 'High' && i.fields.status.name === 'Done').length
      },
      medium: { 
        total: issues.filter(i => i.fields.priority?.name === 'Medium').length,
        resolved: issues.filter(i => i.fields.priority?.name === 'Medium' && i.fields.status.name === 'Done').length
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
    
    // Display detailed priority information
    console.log(`🔴 Critical: ${priorityData.critical.resolved}/${priorityData.critical.total} resolved (${priorityData.critical.total > 0 ? Math.round((priorityData.critical.resolved/priorityData.critical.total)*100) : 0}%)`);
    console.log(`🟠 High: ${priorityData.high.resolved}/${priorityData.high.total} resolved (${priorityData.high.total > 0 ? Math.round((priorityData.high.resolved/priorityData.high.total)*100) : 0}%)`);
    console.log(`🟡 Medium: ${priorityData.medium.resolved}/${priorityData.medium.total} resolved (${priorityData.medium.total > 0 ? Math.round((priorityData.medium.resolved/priorityData.medium.total)*100) : 0}%)`);
    console.log(`🟢 Low: ${priorityData.low.resolved}/${priorityData.low.total} resolved (${priorityData.low.total > 0 ? Math.round((priorityData.low.resolved/priorityData.low.total)*100) : 0}%)`);
    console.log(`🚫 Blockers: ${priorityData.blockers.resolved}/${priorityData.blockers.total} resolved (${priorityData.blockers.total > 0 ? Math.round((priorityData.blockers.resolved/priorityData.blockers.total)*100) : 0}%)`);
    
    // Check what priority values actually exist
    console.log('\n🔍 Actual Priority Values Found in Issues:');
    const uniquePriorities = [...new Set(issues.map(i => i.fields.priority?.name).filter(p => p))];
    uniquePriorities.forEach(priority => {
      const count = issues.filter(i => i.fields.priority?.name === priority).length;
      const resolved = issues.filter(i => i.fields.priority?.name === priority && i.fields.status.name === 'Done').length;
      console.log(`   • ${priority}: ${resolved}/${count} resolved`);
    });
    
    // Test with Teams template
    console.log('\n📱 Testing with Professional Teams Template...');
    
    const professionalTemplateService = new ProfessionalTeamsTemplateService();
    const stats = jiraService.calculateStoryPointsStats(issues);
    
    const sprintData = {
      sprintId: sprintNumber,
      period: '2-week Sprint Cycle',
      completionRate: stats.completionRate,
      totalIssues: issues.length,
      completedIssues: issues.filter(i => i.fields.status.name === 'Done').length,
      storyPoints: stats.completedStoryPoints,
      commits: 32,
      contributors: 5,
      status: 'COMPLETED SUCCESSFULLY',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      endDate: new Date().toLocaleDateString(),
      duration: '2 weeks',
      reportDate: new Date().toLocaleDateString()
    };

    const workBreakdown = {
      userStories: { count: 15, percentage: 35 },
      tasks: { count: 20, percentage: 30 },
      bugFixes: { count: 8, percentage: 15 },
      epics: { count: 3, percentage: 10 },
      improvements: { count: 4, percentage: 10 }
    };

    await professionalTemplateService.sendSprintReport(
      sprintData,
      workBreakdown,
      priorityData,
      {
        priority: 'high'
      }
    );
    
    console.log('✅ Professional Teams notification sent with priority resolution status!');
    console.log('\n📊 Priority Resolution Status should now be visible in Teams message');
    
  } catch (error) {
    console.error('❌ Error debugging priority resolution status:', error);
    process.exit(1);
  }
}

// Execute
debugPriorityResolutionStatus().catch(console.error);
