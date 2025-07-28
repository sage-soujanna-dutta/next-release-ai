#!/usr/bin/env tsx

import { ProfessionalTeamsTemplateService } from './src/services/ProfessionalTeamsTemplateService.js';

async function testAchievementsIndentation() {
  console.log('🧪 Testing Key Achievements Indentation Fix');
  console.log('=' .repeat(60));
  
  try {
    const professionalTemplateService = new ProfessionalTeamsTemplateService();

    // Test data
    const sprintData = {
      sprintId: 'SCNT-2025-21',
      period: '2-week Sprint',
      completionRate: 92,
      totalIssues: 66,
      completedIssues: 58,
      storyPoints: 94,
      commits: 32,
      contributors: 5,
      status: 'COMPLETED',
      startDate: '2025-07-13',
      endDate: '2025-07-27',
      duration: '2 weeks',
      reportDate: '2025-07-27'
    };

    const workBreakdown = {
      userStories: { count: 15, percentage: 35 },
      tasks: { count: 20, percentage: 30 },
      bugFixes: { count: 8, percentage: 15 },
      epics: { count: 3, percentage: 10 },
      improvements: { count: 4, percentage: 10 }
    };

    const priorityData = {
      critical: { total: 5, resolved: 5 },
      high: { total: 12, resolved: 11 },
      medium: { total: 25, resolved: 23 },
      low: { total: 15, resolved: 14 },
      blockers: { total: 2, resolved: 2 }
    };

    const actionItems = [
      { role: 'Product Owner', action: 'Review Release Notes', timeline: 'Today' },
      { role: 'Development Team', action: 'Archive Sprint Materials', timeline: '1 day' }
    ];

    const resources = [
      { type: 'Release Notes', description: 'Professional HTML Documentation', access: 'Generated File' },
      { type: 'Sprint Report', description: 'Executive Summary Document', access: 'Teams Message' }
    ];

    const achievements = [
      '92% completion rate - exceeded expectations',
      '94 story points delivered with strong velocity',
      '32 commits with complete development traceability',
      '58 issues completed with quality deliverables',
      'Professional documentation ready for executive presentation',
      'All build pipelines successfully deployed',
      'Quality assurance standards maintained throughout sprint'
    ];

    console.log('📱 Sending test Teams notification with fixed achievements indentation...');

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

    console.log('✅ Test notification sent successfully!');
    console.log('\n🎯 Key Achievements should now have proper 4-space indentation:');
    console.log('    ✅ Achievement item 1');
    console.log('    ✅ Achievement item 2');
    console.log('    ✅ Achievement item 3');
    console.log('\n✅ Indentation fix complete!');

  } catch (error) {
    console.error('❌ Error testing achievements indentation:', error);
    process.exit(1);
  }
}

// Execute
testAchievementsIndentation().catch(console.error);
