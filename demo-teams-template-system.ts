/**
 * Professional Teams Template System Demo
 * Shows how to use the new integrated template system
 */

import ProfessionalTeamsTemplateService from './src/services/ProfessionalTeamsTemplateService.js';
import { TeamsService } from './src/services/TeamsService.js';
import type { SprintData, WorkBreakdown, PriorityBreakdown, TeamNotificationData } from './src/services/ProfessionalTeamsTemplateService.js';

async function demonstrateTemplateSystem() {
    console.log('🎨 Professional Teams Template System Demo');
    console.log('==========================================\n');

    // Initialize services
    const teamsService = new TeamsService();
    const templateService = new ProfessionalTeamsTemplateService();

    // Sample sprint data
    const sprintData: SprintData = {
        sprintId: 'SCNT-sprint-21',
        period: 'July 28 - August 11, 2025',
        completionRate: 96.8,
        totalIssues: 127,
        completedIssues: 123,
        storyPoints: 174,
        commits: 89,
        contributors: 14,
        status: 'COMPLETED',
        startDate: 'July 28, 2025',
        endDate: 'August 11, 2025',
        duration: '14 Days',
        reportDate: 'July 27, 2025'
    };

    const workBreakdown: WorkBreakdown = {
        userStories: { count: 78, percentage: 61.4 },
        bugFixes: { count: 31, percentage: 24.4 },
        tasks: { count: 12, percentage: 9.4 },
        epics: { count: 4, percentage: 3.1 },
        improvements: { count: 2, percentage: 1.6 }
    };

    const priorityData: PriorityBreakdown = {
        critical: { total: 5, resolved: 5 },
        high: { total: 42, resolved: 41 },
        medium: { total: 58, resolved: 56 },
        low: { total: 18, resolved: 18 },
        blockers: { total: 4, resolved: 3 }
    };

    // Demo 1: Sprint Report Template
    console.log('📊 Demo 1: Sprint Report Template');
    console.log('----------------------------------');
    
    try {
        await templateService.sendSprintReport(sprintData, workBreakdown, priorityData, {
            priority: 'high',
            actionItems: [
                { role: '👔 **Executives**', action: 'Strategic overview & ROI analysis', timeline: 'This Week' },
                { role: '📋 **Project Managers**', action: 'Resource optimization & capacity planning', timeline: 'This Week' },
                { role: '💻 **Technical Leaders**', action: 'Code quality review & pipeline optimization', timeline: 'This Week' },
                { role: '🎉 **All Teams**', action: 'Sprint retrospective & recognition', timeline: '48 Hours' }
            ],
            resources: [
                { type: '📊 **HTML Report**', description: 'Executive presentation with charts', access: 'Available', url: 'file:///Users/snehaldangroshiya/next-release-ai/output/' },
                { type: '📱 **Teams Integration**', description: 'Structured notifications', access: 'Active' },
                { type: '📞 **Support**', description: 'Escalation paths & guidance', access: 'Available' },
                { type: '📚 **Documentation**', description: 'Complete project docs', access: 'Available', url: 'https://github.com/sage-soujanna-dutta/next-release-ai' }
            ],
            achievements: [
                '**96.8% Completion Rate** - Exceeds industry benchmarks',
                '**174 Story Points** - Outstanding team velocity',
                '**100% Critical Issues** - All resolved successfully',
                '**14 Active Contributors** - Excellent collaboration'
            ]
        });
        console.log('✅ Sprint report sent successfully');
    } catch (error) {
        console.log('❌ Sprint report failed:', error);
    }

    // Demo 2: Release Notes Template
    console.log('\n📋 Demo 2: Release Notes Template');
    console.log('----------------------------------');
    
    const releaseNotesData: TeamNotificationData = {
        type: 'release-notes',
        title: 'Release v2.1.0 - Major Feature Update',
        subtitle: 'New features, bug fixes, and performance improvements',
        priority: 'normal',
        customContent: `
## 🚀 What's New

| Feature | Description | Impact |
|---------|-------------|--------|
| **Enhanced Dashboard** | Real-time analytics and metrics | 📈 Better insights |
| **API v2.0** | Improved performance and reliability | ⚡ Faster responses |
| **Security Updates** | Latest security patches applied | 🔒 Enhanced protection |
| **Mobile Support** | Responsive design improvements | 📱 Better mobile experience |

## 🐛 Bug Fixes

- Fixed data synchronization issues
- Resolved authentication timeout problems  
- Improved error handling and user feedback
- Enhanced performance on large datasets
        `,
        resources: [
            { type: '📚 **Release Notes**', description: 'Detailed changelog', access: 'Available', url: 'https://github.com/releases' },
            { type: '🔧 **Migration Guide**', description: 'Upgrade instructions', access: 'Available' }
        ],
        achievements: [
            '**25% Performance Improvement** - Faster load times',
            '**3 Critical Security Fixes** - Enhanced protection',
            '**Mobile Responsive Design** - Better user experience'
        ]
    };

    try {
        await teamsService.sendProfessionalNotification(releaseNotesData);
        console.log('✅ Release notes sent successfully');
    } catch (error) {
        console.log('❌ Release notes failed:', error);
    }

    // Demo 3: Status Update Template  
    console.log('\n📊 Demo 3: Status Update Template');
    console.log('----------------------------------');
    
    const statusUpdateData: TeamNotificationData = {
        type: 'status-update',
        title: 'Weekly Project Status Update',
        subtitle: 'Progress report and upcoming milestones',
        priority: 'normal',
        customContent: `
## 📈 Progress Overview

| Area | Status | Progress | Notes |
|------|--------|----------|-------|
| **Development** | ✅ On Track | 85% | Feature development completed |
| **Testing** | ⚠️ In Progress | 70% | UAT in progress |
| **Documentation** | ✅ Complete | 100% | All docs updated |
| **Deployment** | 🔄 Pending | 0% | Scheduled for next week |

## 🎯 This Week's Highlights

- Completed user authentication module
- Fixed 12 critical bugs
- Updated API documentation
- Conducted performance testing
        `,
        actionItems: [
            { role: '🧪 **QA Team**', action: 'Complete user acceptance testing', timeline: 'End of Week' },
            { role: '🚀 **DevOps Team**', action: 'Prepare production deployment', timeline: 'Next Monday' },
            { role: '📢 **Product Team**', action: 'Prepare release communications', timeline: 'This Friday' }
        ]
    };

    try {
        await templateService.sendNotification(statusUpdateData);
        console.log('✅ Status update sent successfully');
    } catch (error) {
        console.log('❌ Status update failed:', error);
    }

    // Demo 4: Custom Template
    console.log('\n🎨 Demo 4: Custom Template');
    console.log('---------------------------');
    
    const customData: TeamNotificationData = {
        type: 'custom',
        title: '🎉 Team Achievement Recognition',
        subtitle: 'Outstanding performance deserves recognition!',
        priority: 'high',
        customContent: `
## 🏆 Team Excellence Award

Congratulations to the entire development team for exceptional performance this quarter!

### 📊 Outstanding Metrics

| Achievement | Result | Benchmark |
|-------------|--------|-----------|
| **Sprint Velocity** | 174 points | +25% above target |
| **Quality Score** | 96.8% | Industry leading |
| **Customer Satisfaction** | 4.9/5.0 | Exceptional |
| **Team Collaboration** | 100% | Perfect score |

### 🎯 Special Recognition

**Top Performers:**
- 🌟 **Development Team** - Exceptional code quality
- 🌟 **QA Team** - Zero critical bugs in production  
- 🌟 **DevOps Team** - 99.9% uptime achievement
- 🌟 **Product Team** - Outstanding stakeholder management

### 🎁 Rewards & Benefits

- Team lunch celebration this Friday
- Extra day off for all team members
- Recognition in company newsletter
- Bonus allocation approved
        `,
        achievements: [
            '**Exceeded all sprint goals** for Q3 2025',
            '**Zero production incidents** this month',
            '**100% team satisfaction** in recent survey',
            '**Industry recognition** for innovation'
        ]
    };

    try {
        await templateService.sendNotification(customData);
        console.log('✅ Custom recognition message sent successfully');
    } catch (error) {
        console.log('❌ Custom message failed:', error);
    }

    console.log('\n🎉 Template System Demo Complete!');
    console.log('==================================');
    console.log('✅ All template types demonstrated');
    console.log('📱 Check your Teams channel for the notifications');
    console.log('🎨 Professional table formatting applied to all messages');
}

// Run the demonstration
demonstrateTemplateSystem().catch(console.error);

export { demonstrateTemplateSystem };
