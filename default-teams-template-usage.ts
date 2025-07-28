/**
 * Default Teams Template Usage Example
 * Shows how to use the new template system as the default for Teams notifications
 */

import ProfessionalTeamsTemplateService from './src/services/ProfessionalTeamsTemplateService.js';
import { TeamsService } from './src/services/TeamsService.js';
import type { SprintData, WorkBreakdown, PriorityBreakdown } from './src/services/ProfessionalTeamsTemplateService.js';

// Sample data that would typically come from your JIRA/Azure DevOps integration
const mockSprintData: SprintData = {
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

const mockWorkBreakdown: WorkBreakdown = {
    userStories: { count: 78, percentage: 61.4 },
    bugFixes: { count: 31, percentage: 24.4 },
    tasks: { count: 12, percentage: 9.4 },
    epics: { count: 4, percentage: 3.1 },
    improvements: { count: 2, percentage: 1.6 }
};

const mockPriorityData: PriorityBreakdown = {
    critical: { total: 5, resolved: 5 },
    high: { total: 42, resolved: 41 },
    medium: { total: 58, resolved: 56 },
    low: { total: 18, resolved: 18 },
    blockers: { total: 4, resolved: 3 }
};

async function sendDefaultSprintReport() {
    console.log('🚀 Sending Default Professional Sprint Report...');
    
    // Initialize the template service (this is now the default way)
    const templateService = new ProfessionalTeamsTemplateService();
    
    try {
        // Use the convenient sprint report method with all the professional formatting
        await templateService.sendSprintReport(mockSprintData, mockWorkBreakdown, mockPriorityData, {
            priority: 'high',
            actionItems: [
                { 
                    role: '👔 **Executives**', 
                    action: 'Strategic overview & ROI analysis', 
                    timeline: 'This Week' 
                },
                { 
                    role: '📋 **Project Managers**', 
                    action: 'Resource optimization & capacity planning', 
                    timeline: 'This Week' 
                },
                { 
                    role: '💻 **Technical Leaders**', 
                    action: 'Code quality review & pipeline optimization', 
                    timeline: 'This Week' 
                },
                { 
                    role: '🎉 **All Teams**', 
                    action: 'Sprint retrospective & recognition', 
                    timeline: '48 Hours' 
                }
            ],
            resources: [
                { 
                    type: '📊 **HTML Report**', 
                    description: 'Executive presentation with charts', 
                    access: 'Available',
                    url: 'file:///Users/snehaldangroshiya/next-release-ai/output/' 
                },
                { 
                    type: '📱 **Teams Integration**', 
                    description: 'Structured notifications', 
                    access: 'Active' 
                },
                { 
                    type: '📞 **Support**', 
                    description: 'Escalation paths & guidance', 
                    access: 'Available' 
                },
                { 
                    type: '📚 **Documentation**', 
                    description: 'Complete project docs', 
                    access: 'Available',
                    url: 'https://github.com/sage-soujanna-dutta/next-release-ai' 
                }
            ],
            achievements: [
                '**96.8% Completion Rate** - Exceeds industry benchmarks',
                '**174 Story Points** - Outstanding team velocity',
                '**100% Critical Issues** - All resolved successfully',
                '**14 Active Contributors** - Excellent collaboration'
            ]
        });
        
        console.log('✅ Professional sprint report sent successfully!');
        console.log('📱 Check your Teams channel for the formatted notification');
        console.log('🎨 The message includes professional tables and proper formatting');
        
    } catch (error) {
        console.error('❌ Failed to send sprint report:', error);
    }
}

async function sendQuickStatusUpdate() {
    console.log('\n📊 Sending Quick Status Update...');
    
    // You can also use the TeamsService with the new template system
    const teamsService = new TeamsService();
    
    try {
        await teamsService.sendProfessionalNotification({
            type: 'status-update',
            title: 'Daily Standup Update - July 27, 2025',
            subtitle: 'Quick progress update and blockers',
            priority: 'normal',
            customContent: `
## 📈 Today's Progress

| Team Member | Completed | Working On | Blockers |
|-------------|-----------|------------|----------|
| **Alice** | User authentication | API integration | None |
| **Bob** | Database optimization | Bug fixes | Waiting for client feedback |
| **Carol** | UI components | Testing framework | Environment setup issues |
| **David** | Documentation | Code review | None |

## 🎯 Sprint Progress

- **Completed:** 15 story points
- **Remaining:** 8 story points  
- **Blockers:** 2 items (non-critical)
- **Status:** ✅ On track for sprint goals
            `,
            actionItems: [
                { role: '🔧 **DevOps**', action: 'Resolve environment setup for Carol', timeline: 'Today' },
                { role: '📞 **Product Owner**', action: 'Follow up with client for feedback', timeline: 'Tomorrow' }
            ]
        });
        
        console.log('✅ Status update sent successfully!');
        
    } catch (error) {
        console.error('❌ Failed to send status update:', error);
    }
}

// Execute the examples
async function main() {
    console.log('🎨 Professional Teams Template System - Default Usage');
    console.log('====================================================\n');
    
    await sendDefaultSprintReport();
    await sendQuickStatusUpdate();
    
    console.log('\n🎉 All notifications sent using the professional template system!');
    console.log('💡 This is now the recommended way to send Teams notifications');
    console.log('📋 Benefits:');
    console.log('   • Consistent professional formatting');
    console.log('   • Table-structured data for better readability');
    console.log('   • Executive-ready presentation quality');
    console.log('   • Cross-platform Teams compatibility');
    console.log('   • Standardized templates for common scenarios');
}

main().catch(console.error);

export { sendDefaultSprintReport, sendQuickStatusUpdate };
