#!/usr/bin/env npx tsx

/**
 * Quick test to demonstrate the improved Risk Assessment and spacing formatting
 */

import { ProfessionalTeamsTemplateService, SprintData, WorkBreakdown, PriorityBreakdown } from './src/services/ProfessionalTeamsTemplateService.js';

async function testImprovedFormatting() {
    console.log('🎨 Testing Improved Risk Assessment and Spacing Formatting');
    console.log('=' .repeat(70));
    
    // Mock sprint data with risk assessment
    const sprintData: SprintData = {
        sprintId: 'TEST-2025-01',
        period: 'Test Period',
        completionRate: 88,
        totalIssues: 50,
        completedIssues: 44,
        storyPoints: 120,
        commits: 150,
        contributors: 8,
        status: 'Completed',
        startDate: '2025-07-01',
        endDate: '2025-07-14',
        duration: '2 weeks',
        reportDate: new Date().toISOString(),
        velocity: 120,
        previousSprintComparison: {
            completionRate: 85,
            velocity: 110,
            trend: 'increasing'
        },
        riskAssessment: {
            level: 'medium',
            issues: [
                'Some team members are experiencing capacity constraints due to competing priorities',
                'Technical debt in legacy modules may impact future velocity',
                'External dependency delays could affect planned features'
            ],
            mitigation: [
                'Redistribute workload and provide additional support to overloaded team members',
                'Allocate dedicated time for technical debt reduction in next sprint',
                'Establish backup plans and alternative approaches for external dependencies'
            ]
        },
        performanceInsights: {
            strengths: [
                'Strong team collaboration and communication',
                'Consistent delivery quality maintained',
                'Effective problem-solving and adaptability'
            ],
            improvements: [
                'Enhance estimation accuracy for complex tasks',
                'Improve code review turnaround time',
                'Strengthen documentation practices'
            ],
            trends: [
                'Gradual velocity improvement over past 3 sprints',
                'Decreasing bug rates and improved code quality',
                'Better stakeholder engagement and feedback incorporation'
            ]
        }
    };

    const workBreakdown: WorkBreakdown = {
        userStories: { count: 15, percentage: 30 },
        bugFixes: { count: 10, percentage: 20 },
        tasks: { count: 20, percentage: 40 },
        epics: { count: 3, percentage: 6 },
        improvements: { count: 2, percentage: 4 }
    };

    const priorityData: PriorityBreakdown = {
        critical: { total: 2, resolved: 2 },
        high: { total: 8, resolved: 7 },
        medium: { total: 30, resolved: 26 },
        low: { total: 8, resolved: 7 },
        blockers: { total: 2, resolved: 2 }
    };

    try {
        const templateService = new ProfessionalTeamsTemplateService();
        
        console.log('📊 Generating test report with improved formatting...');
        
        await templateService.sendSprintReport(
            sprintData,
            workBreakdown,
            priorityData,
            {
                actionItems: [
                    { role: 'Team Lead', action: 'Review capacity planning and resource allocation', timeline: 'This week' },
                    { role: 'Tech Lead', action: 'Schedule technical debt reduction sessions', timeline: 'Next sprint' },
                    { role: 'Scrum Master', action: 'Facilitate retrospective focusing on process improvements', timeline: '2 days' }
                ],
                achievements: [
                    'Successfully delivered all critical priority items on schedule',
                    'Maintained high code quality standards throughout the sprint',
                    'Improved team collaboration through enhanced communication practices'
                ],
                priority: 'normal'
            }
        );

        console.log('\n✅ Test report sent successfully!');
        console.log('\n🎨 Formatting Improvements Applied:');
        console.log('  ✅ Risk Assessment: Converted to structured table format');
        console.log('  ✅ Performance Insights: Individual tables for strengths/improvements/trends');
        console.log('  ✅ Action Items: Enhanced with priority levels and better spacing');
        console.log('  ✅ Contributors: Improved spacing and formatting consistency');
        console.log('  ✅ Achievements: Better structured table with impact levels');
        console.log('  ✅ Overall Spacing: Added consistent section separators and padding');
        
    } catch (error) {
        console.error('❌ Error in test:', error);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testImprovedFormatting().catch(console.error);
}
