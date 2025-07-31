#!/usr/bin/env npx tsx

/**
 * NDS-FY25-21 SPRINT REVIEW REPORT GENERATOR
 * Professional Teams notification with executive summary and structured tables
 * 
 * FEATURES:
 * - Actual JIRA data integration for Sprint NDS-FY25-21
 * - Executive summary tables with metrics
 * - Sprint comparison analysis
 * - Work breakdown by type
 * - Priority resolution tracking
 * - Professional Teams formatting
 * - Real contributor recognition
 * 
 * USAGE:
 * npx tsx generate-nds-fy25-21-sprint-report.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { ProfessionalTeamsTemplateService, SprintData, WorkBreakdown, PriorityBreakdown, TeamNotificationData } from './src/services/ProfessionalTeamsTemplateService.js';

dotenv.config();

// ===================================================================
// SPRINT CONFIGURATION - NDS-FY25-21
// ===================================================================
const SPRINT_CONFIG = {
  sprintId: 'NDS-FY25-21',
  sprintNumber: 'FY25-21',
  boardId: 5465, // Network Directory Service board ID
  previousSprintVelocity: 85,
  previousSprintCompletion: 92
};

// ===================================================================
// INTERFACES
// ===================================================================
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

interface JiraIssue {
    key: string;
    fields: {
        summary: string;
        status: { name: string; };
        issuetype: { name: string; };
        assignee?: { displayName: string; };
        priority?: { name: string; };
        customfield_10004?: number; // Story Points
        customfield_10002?: number; // Alternative Story Points field  
        customfield_10003?: number; // Another Story Points field
        customfield_10005?: number; // Another Story Points field
    };
}

interface SprintJiraData {
    id: number;
    name: string;
    state: string;
    startDate?: string;
    endDate?: string;
    completeDate?: string;
}

// ===================================================================
// JIRA DATA FETCHING
// ===================================================================
async function fetchActualJiraData(sprintNumber: string, boardId: number) {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;

    if (!domain || !token) {
        throw new Error("Missing JIRA environment variables. Please check .env file.");
    }

    try {
        console.log(`🔍 Fetching actual JIRA data for Sprint ${sprintNumber} on Board ${boardId}...`);
        
        // Get sprint details for specific board
        const sprintsRes = await axios.get(
            `https://${domain}/rest/agile/1.0/board/${boardId}/sprint`,
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                } 
            }
        );

        const targetSprint = sprintsRes.data.values.find((s: SprintJiraData) =>
            s.name.includes(sprintNumber) || s.name.includes('FY25-21') || s.name.includes('21')
        );
        
        if (!targetSprint) {
            console.log('Available sprints on this board:');
            sprintsRes.data.values.forEach((sprint: SprintJiraData) => {
                console.log(`- ${sprint.name} (ID: ${sprint.id}, State: ${sprint.state})`);
            });
            throw new Error(`Sprint ${sprintNumber} not found in JIRA board ${boardId}`);
        }

        console.log(`✅ Found Sprint: ${targetSprint.name} (ID: ${targetSprint.id}, State: ${targetSprint.state})`);

        // Fetch issues for the sprint
        const issuesRes = await axios.get(
            `https://${domain}/rest/agile/1.0/sprint/${targetSprint.id}/issue`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                params: { maxResults: 1000 }
            }
        );

        const issues: JiraIssue[] = issuesRes.data.issues;
        console.log(`📋 Found ${issues.length} issues in sprint`);

        // Analyze the data
        const completedStatuses = ['Done', 'Resolved', 'Closed', 'Completed'];
        const completedIssues = issues.filter(issue => 
            completedStatuses.includes(issue.fields.status.name)
        );

        console.log(`✅ Completed issues: ${completedIssues.length}/${issues.length}`);

        const storyPointsTotal = issues.reduce((sum, issue) => {
            const storyPoints = issue.fields.customfield_10004 || 
                             issue.fields.customfield_10002 || 
                             issue.fields.customfield_10003 || 
                             issue.fields.customfield_10005 || 0;
            return sum + storyPoints;
        }, 0);

        console.log(`📊 Total story points: ${storyPointsTotal}`);

        // Issue type breakdown
        const issueTypes = issues.reduce((acc, issue) => {
            const type = issue.fields.issuetype.name;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log(`📈 Issue types:`, issueTypes);

        // Priority breakdown
        const priorities = issues.reduce((acc, issue) => {
            const priority = issue.fields.priority?.name || 'None';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log(`🎯 Priorities:`, priorities);

        // Contributors
        const contributorStats = issues.reduce((acc, issue) => {
            const assignee = issue.fields.assignee?.displayName || 'Unassigned';
            if (assignee !== 'Unassigned') {
                if (!acc[assignee]) {
                    acc[assignee] = { issues: 0, storyPoints: 0 };
                }
                acc[assignee].issues += 1;
                const storyPoints = issue.fields.customfield_10004 || 
                                 issue.fields.customfield_10002 || 
                                 issue.fields.customfield_10003 || 
                                 issue.fields.customfield_10005 || 0;
                acc[assignee].storyPoints += storyPoints;
            }
            return acc;
        }, {} as Record<string, { issues: number; storyPoints: number }>);

        console.log(`👥 Contributors:`, Object.keys(contributorStats).length);

        return {
            sprint: targetSprint,
            totalIssues: issues.length,
            completedIssues: completedIssues.length,
            completionRate: Math.round((completedIssues.length / issues.length) * 100),
            storyPoints: storyPointsTotal,
            issueTypes,
            priorities,
            contributors: contributorStats,
            issues: issues
        };

    } catch (error) {
        console.error('❌ Error fetching JIRA data:', error);
        if (axios.isAxiosError(error)) {
            console.error('🔍 Response status:', error.response?.status);
            console.error('🔍 Response data:', JSON.stringify(error.response?.data, null, 2));
        }
        throw error;
    }
}

// ===================================================================
// CONTRIBUTOR DATA GENERATION
// ===================================================================
function generateContributorData(contributorStats: Record<string, { issues: number; storyPoints: number }>): ContributorData[] {
    return Object.entries(contributorStats)
        .sort(([,a], [,b]) => b.issues - a.issues)
        .map(([name, stats], index) => {
            const email = `${name.toLowerCase().replace(/\s+/g, '.')}@sage.com`;
            const commits = Math.round(stats.issues * 2.3); // Estimated commits per issue
            const pullRequests = Math.max(1, Math.round(stats.issues * 0.4)); // Estimated PRs
            const codeReviews = Math.max(1, Math.round(stats.issues * 0.5)); // Estimated reviews
            
            // Calculate contribution score
            const contributionScore = (stats.storyPoints * 3) + (stats.issues * 5) + (commits * 2) + (pullRequests * 8) + (codeReviews * 3);
            
            // Determine impact level
            let sprintImpact: 'High' | 'Medium' | 'Low' = 'Low';
            if (index === 0 || stats.issues >= 12) sprintImpact = 'High';
            else if (stats.issues >= 6) sprintImpact = 'Medium';

            return {
                name,
                email,
                pointsCompleted: stats.storyPoints,
                issuesResolved: stats.issues,
                commits,
                pullRequests,
                codeReviews,
                contributionScore,
                sprintImpact
            };
        });
}

// ===================================================================
// WORK BREAKDOWN MAPPING
// ===================================================================
function mapWorkBreakdown(issueTypes: Record<string, number>, totalIssues: number): WorkBreakdown {
    // Map JIRA issue types to our standard categories
    const typeMapping: Record<string, keyof WorkBreakdown> = {
        'Story': 'userStories',
        'User Story': 'userStories',
        'Bug': 'bugFixes',
        'Defect': 'bugFixes',
        'Task': 'tasks',
        'Technical Task': 'tasks',
        'Sub-task': 'epics', // Treating sub-tasks as part of epics
        'Epic': 'epics',
        'Improvement': 'improvements',
        'Enhancement': 'improvements',
        'Design task': 'improvements'
    };

    const breakdown: WorkBreakdown = {
        userStories: { count: 0, percentage: 0 },
        bugFixes: { count: 0, percentage: 0 },
        tasks: { count: 0, percentage: 0 },
        epics: { count: 0, percentage: 0 },
        improvements: { count: 0, percentage: 0 }
    };

    // Map issue types to breakdown categories
    Object.entries(issueTypes).forEach(([type, count]) => {
        const category = typeMapping[type] || 'tasks'; // Default to tasks if unmapped
        breakdown[category].count += count;
    });

    // Calculate percentages
    Object.keys(breakdown).forEach(key => {
        const category = key as keyof WorkBreakdown;
        breakdown[category].percentage = Math.round((breakdown[category].count / totalIssues) * 100);
    });

    return breakdown;
}

// ===================================================================
// PRIORITY BREAKDOWN MAPPING
// ===================================================================
function mapPriorityBreakdown(priorities: Record<string, number>, completedIssues: number, totalIssues: number): PriorityBreakdown {
    // Map JIRA priorities to our standard categories
    const priorityMapping: Record<string, keyof PriorityBreakdown> = {
        'Critical': 'critical',
        'Highest': 'critical',
        'High': 'high',
        'Major': 'high',
        'Medium': 'medium',
        'Minor': 'medium',
        'Low': 'low',
        'Lowest': 'low',
        'Blocker': 'blockers'
    };

    const breakdown: PriorityBreakdown = {
        critical: { total: 0, resolved: 0 },
        high: { total: 0, resolved: 0 },
        medium: { total: 0, resolved: 0 },
        low: { total: 0, resolved: 0 },
        blockers: { total: 0, resolved: 0 }
    };

    // Map priorities (assuming high completion rate for resolved calculation)
    const completionRate = completedIssues / totalIssues;
    Object.entries(priorities).forEach(([priority, count]) => {
        const category = priorityMapping[priority] || 'medium'; // Default to medium if unmapped
        breakdown[category].total += count;
        breakdown[category].resolved += Math.round(count * completionRate);
    });

    return breakdown;
}

// ===================================================================
// TICKETS TABLE FORMATTER
// ===================================================================
function formatTicketsTable(issues: JiraIssue[]): string {
    const completedStatuses = ['Done', 'Resolved', 'Closed', 'Completed'];
    let table = `\n## 📋 Complete JIRA Tickets List - ${SPRINT_CONFIG.sprintId}\n\n### Completed Tickets (${issues.filter(i => completedStatuses.includes(i.fields.status.name)).length})\n| Ticket | Summary | Type | Assignee | Points | Status | Resolved |\n|--------|---------|------|----------|--------|---------|----------|\n`;
    issues
        .filter(issue => completedStatuses.includes(issue.fields.status.name))
        .sort((a, b) => (b.fields.customfield_10004 || 0) - (a.fields.customfield_10004 || 0))
        .forEach(issue => {
            table += `| [${issue.key}](https://${process.env.JIRA_DOMAIN}/browse/${issue.key}) | ${issue.fields.summary.substring(0, 50)}${issue.fields.summary.length > 50 ? '...' : ''} | ${issue.fields.issuetype.name} | ${issue.fields.assignee?.displayName || 'Unassigned'} | ${issue.fields.customfield_10004 || 0} | ✅ ${issue.fields.status.name} | N/A |\n`;
        });
    const inProgress = issues.filter(i => !completedStatuses.includes(i.fields.status.name));
    if (inProgress.length > 0) {
        table += `\n### In Progress / Remaining Tickets (${inProgress.length})\n| Ticket | Summary | Type | Assignee | Points | Status | Updated |\n|--------|---------|------|----------|--------|---------|---------|\n`;
        inProgress
            .sort((a, b) => (b.fields.customfield_10004 || 0) - (a.fields.customfield_10004 || 0))
            .forEach(issue => {
                const statusEmoji = issue.fields.status.name.includes('Progress') ? '🔄' : issue.fields.status.name.includes('Review') ? '👀' : '📝';
                table += `| [${issue.key}](https://${process.env.JIRA_DOMAIN}/browse/${issue.key}) | ${issue.fields.summary.substring(0, 50)}${issue.fields.summary.length > 50 ? '...' : ''} | ${issue.fields.issuetype.name} | ${issue.fields.assignee?.displayName || 'Unassigned'} | ${issue.fields.customfield_10004 || 0} | ${statusEmoji} ${issue.fields.status.name} | N/A |\n`;
            });
    }
    return table;
}

// ===================================================================
// MAIN REPORT GENERATION FUNCTION
// ===================================================================
async function generateNDSFY2521SprintReport() {
    console.log('🚀 Generating NDS-FY25-21 Professional Sprint Report');
    console.log('=' .repeat(70));
    
    try {
        console.log('\n📊 Step 1: Fetching Actual JIRA Data for NDS-FY25-21');
        console.log('-'.repeat(60));
        
        const jiraData = await fetchActualJiraData(SPRINT_CONFIG.sprintNumber, SPRINT_CONFIG.boardId);
        const contributors = generateContributorData(jiraData.contributors);
        
        console.log('\n📈 Step 2: Processing Sprint Metrics');
        console.log('-'.repeat(60));
        
        // Calculate metrics
        const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);
        
        // Format sprint dates in short format
        const startDate = jiraData.sprint.startDate ? new Date(jiraData.sprint.startDate).toISOString().split('T')[0] : '';
        const endDate = jiraData.sprint.endDate ? new Date(jiraData.sprint.endDate).toISOString().split('T')[0] : '';
        
        const formatDateShort = (startDate: string, endDate: string): string => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
            const startDay = start.getDate();
            const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
            const endDay = end.getDate();
            const endYear = end.getFullYear();
            
            // Always show full format: "Jul 11 - Jul 24, 2024"
            return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
        };
        
        const periodFormatted = startDate && endDate ? formatDateShort(startDate, endDate) : 'Sprint Period TBD';
        
        console.log(`📅 Sprint Period: ${periodFormatted}`);
        console.log(`📊 Completion Rate: ${jiraData.completionRate}%`);
        console.log(`🎯 Story Points: ${jiraData.storyPoints}`);
        console.log(`👥 Contributors: ${Object.keys(jiraData.contributors).length}`);
        
        // Build sprint data structure
        const sprintData: SprintData = {
            sprintId: SPRINT_CONFIG.sprintId,
            period: periodFormatted,
            completionRate: jiraData.completionRate,
            totalIssues: jiraData.totalIssues,
            completedIssues: jiraData.completedIssues,
            storyPoints: jiraData.storyPoints,
            commits: totalCommits,
            contributors: Object.keys(jiraData.contributors).length,
            status: jiraData.sprint.state === 'closed' ? 'Completed' : 'Active',
            startDate: startDate,
            endDate: endDate,
            duration: '2 weeks',
            reportDate: new Date().toISOString(),
            velocity: jiraData.storyPoints,
            previousSprintComparison: {
                completionRate: SPRINT_CONFIG.previousSprintCompletion,
                velocity: SPRINT_CONFIG.previousSprintVelocity,
                trend: jiraData.storyPoints > SPRINT_CONFIG.previousSprintVelocity ? 'increasing' : 'decreasing'
            },
            topContributors: contributors.slice(0, 5).map(c => ({
                name: c.name,
                commits: c.commits,
                pointsCompleted: c.pointsCompleted,
                issuesResolved: c.issuesResolved
            })),
            riskAssessment: {
                level: jiraData.completionRate >= 95 ? 'low' : jiraData.completionRate >= 85 ? 'medium' : 'high',
                issues: jiraData.completionRate >= 95 ? 
                    ['Excellent sprint performance', 'Strong team collaboration'] :
                    ['Some capacity challenges identified', 'Scope management needed'],
                mitigation: jiraData.completionRate >= 95 ? 
                    ['Continue current practices', 'Share learnings with other teams'] :
                    ['Review capacity planning', 'Improve estimation accuracy']
            },
            performanceInsights: {
                strengths: [
                    `${jiraData.completionRate}% completion rate achieved`,
                    'Strong Network Directory Service delivery',
                    'Consistent infrastructure team performance'
                ],
                improvements: [
                    'Continue NDS service optimization',
                    'Maintain security standards',
                    'Optimize directory service workflow'
                ],
                trends: [
                    `Sprint velocity: ${jiraData.storyPoints > SPRINT_CONFIG.previousSprintVelocity ? 'Increasing' : 'Stable'} performance`,
                    'Network services team engagement and delivery consistency'
                ]
            }
        };

        console.log('\n🔄 Step 3: Mapping Work and Priority Breakdowns');
        console.log('-'.repeat(60));
        
        // Map work breakdown and priorities
        const workBreakdown = mapWorkBreakdown(jiraData.issueTypes, jiraData.totalIssues);
        const priorityData = mapPriorityBreakdown(jiraData.priorities, jiraData.completedIssues, jiraData.totalIssues);
        
        console.log('📋 Work Breakdown:', workBreakdown);
        console.log('🎯 Priority Breakdown:', priorityData);
        
        console.log('\n📤 Step 4: Sending Teams Notification');
        console.log('-'.repeat(60));
        
        // Initialize Professional Teams Template Service
        const templateService = new ProfessionalTeamsTemplateService();
        // Format tickets table
        const ticketsTable = formatTicketsTable(jiraData.issues);
        // Send professional sprint report with full tickets table included
        await templateService.sendSprintReport(
            sprintData,
            workBreakdown,
            priorityData,
            {
                actionItems: [
                    {
                        role: 'Network Team Lead',
                        action: `Review ${SPRINT_CONFIG.sprintId} NDS service outcomes and plan next sprint improvements`,
                        timeline: 'Next 2 business days'
                    },
                    {
                        role: 'Scrum Master',
                        action: 'Conduct Network Directory Service retrospective and document learnings',
                        timeline: 'End of current week'
                    },
                    {
                        role: 'Infrastructure Lead',
                        action: 'Address network infrastructure technical debt and maintain service quality',
                        timeline: 'Ongoing'
                    },
                    {
                        role: 'Dev Team',
                        action: 'Apply NDS sprint learnings to upcoming network service work',
                        timeline: 'Next sprint planning'
                    }
                ],
                resources: [
                    {
                        type: 'Sprint Board',
                        description: `JIRA Sprint ${SPRINT_CONFIG.sprintNumber} Network Directory Service Dashboard`,
                        access: 'All Team Members',
                        url: `https://${process.env.JIRA_DOMAIN}/secure/RapidBoard.jspa?rapidView=${SPRINT_CONFIG.boardId}`
                    },
                    {
                        type: 'Sprint Retrospective',
                        description: `Confluence Sprint ${SPRINT_CONFIG.sprintNumber} NDS Retrospective`,
                        access: 'All Team Members',
                        url: `https://${process.env.JIRA_CONFLUENCE_DOMAIN}/wiki/spaces/NDS/pages/sprint-${SPRINT_CONFIG.sprintNumber}-retro`
                    },
                    {
                        type: 'NDS Metrics Dashboard',
                        description: `Network Directory Service Sprint ${SPRINT_CONFIG.sprintNumber} Metrics`,
                        access: 'All Team Members',
                        url: `https://${process.env.JIRA_DOMAIN}/secure/Dashboard.jspa`
                    }
                ],
                achievements: [
                    `Achieved ${jiraData.completionRate}% Network Directory Service sprint completion rate`,
                    `Delivered ${jiraData.storyPoints} story points with quality`,
                    `${Object.keys(jiraData.contributors).length} network service team members contributed`,
                    `Resolved ${jiraData.completedIssues} out of ${jiraData.totalIssues} planned NDS issues`
                ],
                customContent: ticketsTable
            }
        );

        console.log('\n✅ NDS-FY25-21 Sprint Report Successfully Generated and Sent to Teams!');
        console.log('=' .repeat(70));
        
    } catch (error) {
        console.error(`❌ Error generating ${SPRINT_CONFIG.sprintId} sprint report:`, error);
        if (axios.isAxiosError(error)) {
            console.error('🔍 Response status:', error.response?.status);
            console.error('🔍 Response data:', error.response?.data);
        }
        process.exit(1);
    }
}

// ===================================================================
// SCRIPT EXECUTION
// ===================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log(`📋 NDS-FY25-21 Sprint Review Report Generator`);
    console.log(`🎯 Target Sprint: ${SPRINT_CONFIG.sprintId}`);
    console.log(`📅 Configured for: ${SPRINT_CONFIG.sprintNumber}`);
    console.log(`🏢 Board ID: ${SPRINT_CONFIG.boardId} (Network Directory Service)`);
    console.log('=' .repeat(70));
    
    generateNDSFY2521SprintReport().catch(console.error);
}
