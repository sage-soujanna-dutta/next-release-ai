#!/usr/bin/env npx tsx

/**
 * SCNT-2025-21 Professional Sprint Report using ProfessionalTeamsTemplateService
 * Uses the actual professional template with correct interface structure
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { ProfessionalTeamsTemplateService, SprintData, WorkBreakdown, PriorityBreakdown, TeamNotificationData } from './src/services/ProfessionalTeamsTemplateService.js';

dotenv.config();

interface ContributorData {
    name: string;
    email: string;
    pointsCompleted: number;
    issuesResolved: number;
    commits: number;
    pullRequests: number;
    codeReviews: number;
    contributionScore: number;
    sprintImpact: 'High' | 'Medium' | 'Low';
}

// Sprint 21 contributor data
const getSprintContributors = (): ContributorData[] => {
    return [
        {
            name: 'Alex Morgan',
            email: 'alex.morgan@company.com',
            pointsCompleted: 78,
            issuesResolved: 22,
            commits: 64,
            pullRequests: 11,
            codeReviews: 15,
            contributionScore: 445,
            sprintImpact: 'High'
        },
        {
            name: 'Jessica Liu',
            email: 'jessica.liu@company.com',
            pointsCompleted: 72,
            issuesResolved: 19,
            commits: 58,
            pullRequests: 9,
            codeReviews: 13,
            contributionScore: 412,
            sprintImpact: 'High'
        },
        {
            name: 'Marcus Johnson',
            email: 'marcus.johnson@company.com',
            pointsCompleted: 61,
            issuesResolved: 17,
            commits: 49,
            pullRequests: 8,
            codeReviews: 11,
            contributionScore: 348,
            sprintImpact: 'High'
        },
        {
            name: 'Sofia Petrov',
            email: 'sofia.petrov@company.com',
            pointsCompleted: 54,
            issuesResolved: 15,
            commits: 43,
            pullRequests: 7,
            codeReviews: 9,
            contributionScore: 315,
            sprintImpact: 'Medium'
        },
        {
            name: 'Ryan O\'Connor',
            email: 'ryan.oconnor@company.com',
            pointsCompleted: 48,
            issuesResolved: 13,
            commits: 38,
            pullRequests: 6,
            codeReviews: 8,
            contributionScore: 278,
            sprintImpact: 'Medium'
        },
        {
            name: 'Maya Patel',
            email: 'maya.patel@company.com',
            pointsCompleted: 42,
            issuesResolved: 11,
            commits: 32,
            pullRequests: 5,
            codeReviews: 7,
            contributionScore: 245,
            sprintImpact: 'Medium'
        }
    ];
};

// Sprint 21 contributor data

async function generateExecutiveSCNT202521Report() {
    console.log('🚀 Generating Executive-Style SCNT-2025-21 Professional Report');
    console.log('=' .repeat(70));
    
    try {
        console.log('\n📊 Step 1: Building Executive Summary Data Structure');
        console.log('-'.repeat(55));
        
        const contributors = getSprintContributors();
        
        // Calculate professional metrics
        const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);
        const totalStoryPoints = contributors.reduce((sum, c) => sum + c.pointsCompleted, 0);
        const totalIssues = contributors.reduce((sum, c) => sum + c.issuesResolved, 0);
        
        // Professional Sprint Data using correct interface
        const sprintData: SprintData = {
            sprintId: 'SCNT-2025-21',
            period: 'Jul 29 - Aug 11, 2025',
            completionRate: 97,
            totalIssues: 204,
            completedIssues: 198,
            storyPoints: 345,
            commits: totalCommits,
            contributors: 9, // Total team size for executive view
            status: 'Completed',
            startDate: '2025-07-29',
            endDate: '2025-08-11',
            duration: '2 weeks',
            reportDate: new Date().toISOString(),
            velocity: 345,
            previousSprintComparison: {
                completionRate: 95,
                velocity: 298,
                trend: 'increasing'
            },
            topContributors: contributors.slice(0, 5).map(c => ({
                name: c.name,
                commits: c.commits,
                pointsCompleted: c.pointsCompleted,
                issuesResolved: c.issuesResolved
            })),
            riskAssessment: {
                level: 'low',
                issues: [
                    'High dependency on top 2 contributors',
                    'Technical debt in legacy modules'
                ],
                mitigation: [
                    'Cross-train team members on critical components',
                    'Allocate 20% Sprint 22 capacity to technical debt'
                ]
            },
            performanceInsights: {
                strengths: [
                    'Exceptional contributor engagement',
                    'Outstanding code quality metrics',
                    'Excellent sprint planning accuracy'
                ],
                improvements: [
                    'Increase junior developer participation',
                    'Optimize code review bottlenecks'
                ],
                trends: [
                    'Upward velocity trend over 3 sprints',
                    'Improving story point estimation accuracy'
                ]
            }
        };

        // Work breakdown with exact percentages from screenshot
        const workBreakdown: WorkBreakdown = {
            userStories: { count: 125, percentage: 61 },
            bugFixes: { count: 48, percentage: 24 },
            tasks: { count: 18, percentage: 9 },
            epics: { count: 8, percentage: 4 },
            improvements: { count: 5, percentage: 2 }
        };

        // Priority resolution matching screenshot data and interface
        const priorityData: PriorityBreakdown = {
            critical: { total: 5, resolved: 5 },
            high: { total: 19, resolved: 18 },  // Changed from 'major' to 'high' to match interface
            medium: { total: 98, resolved: 95 }, // Changed from 'minor' to 'medium' to match interface
            low: { total: 77, resolved: 75 },
            blockers: { total: 5, resolved: 5 }
        };

        console.log(`✅ Executive data structure prepared: ${sprintData.completionRate}% completion`);
        console.log(`📊 ${sprintData.storyPoints} story points delivered, ${sprintData.commits} commits`);
        console.log(`📈 ${(sprintData.velocity || 0) - (sprintData.previousSprintComparison?.velocity || 0)} point velocity improvement`);
        console.log(`🎯 ${priorityData.critical.resolved}/${priorityData.critical.total} critical, ${priorityData.blockers.resolved}/${priorityData.blockers.total} blockers resolved`);
        
        console.log('\n📋 Step 2: Using Professional Teams Template Service');
        console.log('-'.repeat(55));
        
        // Initialize Professional Teams Template Service
        const templateService = new ProfessionalTeamsTemplateService();
        
        // Send professional sprint report using the service
        await templateService.sendSprintReport(
            sprintData,
            workBreakdown,
            priorityData,
            {
                actionItems: [
                    {
                        role: 'Team Lead',
                        action: 'Celebrate success & plan Sprint 22 capacity',
                        timeline: 'August 1, 2025'
                    },
                    {
                        role: 'Scrum Master',
                        action: 'Conduct retrospective & velocity planning',
                        timeline: 'August 3, 2025'
                    },
                    {
                        role: 'Tech Lead',
                        action: 'Technical debt & code review optimization',
                        timeline: 'August 8, 2025'
                    }
                ],
                resources: [
                    {
                        type: 'Sprint Board',
                        description: 'JIRA Sprint 21 Dashboard',
                        access: 'All Team Members',
                        url: 'https://yourcompany.atlassian.net/secure/RapidBoard.jspa?rapidView=SCNT-21'
                    },
                    {
                        type: 'Sprint Retrospective',
                        description: 'Confluence Retrospective Page',
                        access: 'All Team Members',
                        url: 'https://yourcompany.atlassian.net/wiki/spaces/TEAM/pages/sprint-21-retro'
                    }
                ],
                achievements: [
                    'Outstanding Sprint Performance - 97% completion rate with 345 story points',
                    'Accelerated Development Velocity - 284 commits with 16% improvement',
                    'Enhanced Quality Standards - 100% critical and blocker resolution',
                    'Exceptional Team Collaboration - 9 active contributors with balanced workload'
                ],
                priority: 'normal'
            }
        );
        
        // Executive preview
        console.log('📋 Executive Report Preview:');
        console.log('━'.repeat(65));
        console.log(`🚀 ${sprintData.sprintId} - Professional Sprint Report`);
        console.log(`📅 ${sprintData.period} | ✅ ${sprintData.status} | ${sprintData.completionRate}% Complete`);
        console.log('');
        console.log('📊 Executive Summary:');
        console.log(`   Completion Rate: ${sprintData.completionRate}% (${sprintData.completedIssues}/${sprintData.totalIssues})  Status: ⭐ Exceptional`);
        console.log(`   Story Points: ${sprintData.storyPoints} points                         Status: 🎯 Delivered`);
        console.log(`   Team Size: ${sprintData.contributors} contributors                     Status: 👥 Active`);
        console.log(`   Development Activity: ${sprintData.commits} commits            Status: ⚡ High`);
        console.log(`   Sprint Duration: ${sprintData.duration}                            Status: ⏰ On Time`);
        console.log(`   Sprint Velocity: ${sprintData.velocity} points/sprint          Status: 🚀 Improving`);
        console.log('');
        console.log('📊 Priority Resolution Status:');
        console.log(`   🔴 Critical: ${priorityData.critical.resolved}/${priorityData.critical.total} (${Math.round((priorityData.critical.resolved/priorityData.critical.total)*100)}%) - ✅ Complete`);
        console.log(`   🚫 Blockers: ${priorityData.blockers.resolved}/${priorityData.blockers.total} (${Math.round((priorityData.blockers.resolved/priorityData.blockers.total)*100)}%) - ✅ Complete`);
        console.log(`   🟠 Major: ${priorityData.high.resolved}/${priorityData.high.total} (${Math.round((priorityData.high.resolved/priorityData.high.total)*100)}%) - ⚠️ In Progress`);
        
        console.log('\n📊 Step 3: Professional Sprint Report Sent via Service');
        console.log('-'.repeat(55));
        
        console.log('✅ Professional sprint report sent using ProfessionalTeamsTemplateService!');
        console.log('📊 Executive summary with structured tables delivered');
        console.log('📈 Sprint comparison and work breakdown analysis included');
        console.log('🎯 Priority resolution status with success rates displayed');
        console.log('⭐ Professional template format exactly matching requirements');
        
        console.log('\n🎉 EXECUTIVE SCNT-2025-21 PROFESSIONAL REPORT COMPLETE');
        console.log('=' .repeat(70));
        console.log('✅ Executive summary table with key metrics and status indicators');
        console.log('✅ Sprint comparison analysis with performance trends');
        console.log('✅ Work breakdown analysis by type and focus area');
        console.log('✅ Priority resolution tracking with success percentages');
        console.log('✅ Key achievements with quantified impact metrics');
        console.log('✅ Strategic action items with clear ownership and timelines');
        console.log('✅ Professional Teams MessageCard matching screenshot format');
        
        return {
            success: true,
            sprintId: sprintData.sprintId,
            completionRate: sprintData.completionRate,
            executiveFormat: true,
            structuredTables: true,
            professionalTemplate: true
        };
        
    } catch (error) {
        console.error('❌ Executive professional report generation failed:', error);
        return { 
            success: false, 
            error: (error as Error).message 
        };
    }
}

// Execute executive professional report generation
generateExecutiveSCNT202521Report()
    .then(result => {
        if (result.success) {
            console.log(`\n🚀 Executive professional report for ${result.sprintId} completed successfully!`);
            console.log(`📊 ${result.completionRate}% completion with executive-style formatting`);
            console.log('📋 Professional tables and structured summary delivered to Teams');
            console.log('⭐ Executive template format exactly matching professional standard');
            process.exit(0);
        } else {
            console.error('\n💥 Executive professional report generation failed:', result.error);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    });

export { generateExecutiveSCNT202521Report };
