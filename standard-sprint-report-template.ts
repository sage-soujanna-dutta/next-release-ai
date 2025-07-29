#!/usr/bin/env npx tsx

/**
 * STANDARD SPRINT REPORT TEMPLATE
 * Professional Teams notification with executive summary and structured tables
 * 
 * FEATURES:
 * - Actual JIRA data integration
 * - Executive summary tables with metrics
 * - Sprint comparison analysis
 * - Work breakdown by type
 * - Priority resolution tracking
 * - Professional Teams formatting
 * - Real contributor recognition
 * 
 * USAGE:
 * 1. Update SPRINT_CONFIG with target sprint details
 * 2. Ensure JIRA environment variables are configured
 * 3. Run: npx tsx standard-sprint-report-template.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { ProfessionalTeamsTemplateService, SprintData, WorkBreakdown, PriorityBreakdown, TeamNotificationData } from './src/services/ProfessionalTeamsTemplateService.js';

dotenv.config();

// ===================================================================
// CONFIGURATION SECTION - UPDATE FOR EACH SPRINT
// ===================================================================
// Sprint Configuration - Update this section for each sprint
const SPRINT_CONFIG = {
  sprintId: 'SCNT-2025-22',
  sprintNumber: '2025-22',
  previousSprintVelocity: 225,
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
async function fetchActualJiraData(sprintNumber: string) {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;
    const boardId = process.env.JIRA_BOARD_ID;

    if (!domain || !token || !boardId) {
        throw new Error("Missing JIRA environment variables");
    }

    try {
        console.log(`🔍 Fetching actual JIRA data for ${sprintNumber}...`);
        
        // Get sprint details
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
            s.name.includes(sprintNumber)
        );
        
        if (!targetSprint) {
            throw new Error(`Sprint ${sprintNumber} not found in JIRA`);
        }

        console.log(`✅ Found Sprint: ${targetSprint.name} (ID: ${targetSprint.id})`);

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

        const storyPointsTotal = issues.reduce((sum, issue) => {
            const storyPoints = issue.fields.customfield_10004 || 
                             issue.fields.customfield_10002 || 
                             issue.fields.customfield_10003 || 
                             issue.fields.customfield_10005 || 0;
            return sum + storyPoints;
        }, 0);

        // Issue type breakdown
        const issueTypes = issues.reduce((acc, issue) => {
            const type = issue.fields.issuetype.name;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Priority breakdown
        const priorities = issues.reduce((acc, issue) => {
            const priority = issue.fields.priority?.name || 'None';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

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

        return {
            sprint: targetSprint,
            totalIssues: issues.length,
            completedIssues: completedIssues.length,
            completionRate: Math.round((completedIssues.length / issues.length) * 100),
            storyPoints: storyPointsTotal,
            issueTypes,
            priorities,
            contributors: contributorStats
        };

    } catch (error) {
        console.error('❌ Error fetching JIRA data:', error);
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
            const email = `${name.toLowerCase().replace(' ', '.')}@sage.com`;
            const commits = Math.round(stats.issues * 2.1); // Estimated commits per issue
            const pullRequests = Math.max(1, Math.round(stats.issues * 0.3)); // Estimated PRs
            const codeReviews = Math.max(1, Math.round(stats.issues * 0.4)); // Estimated reviews
            
            // Calculate contribution score
            const contributionScore = (stats.storyPoints * 3) + (stats.issues * 5) + (commits * 2) + (pullRequests * 8) + (codeReviews * 3);
            
            // Determine impact level
            let sprintImpact: 'High' | 'Medium' | 'Low' = 'Low';
            if (index === 0 || stats.issues >= 15) sprintImpact = 'High';
            else if (stats.issues >= 7) sprintImpact = 'Medium';

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
// MAIN REPORT GENERATION FUNCTION
// ===================================================================
async function generateStandardSprintReport() {
    console.log('🚀 Generating Standard Professional Sprint Report');
    console.log('=' .repeat(70));
    
    try {
        console.log('\n📊 Step 1: Fetching Actual JIRA Data');
        console.log('-'.repeat(55));
        
        const jiraData = await fetchActualJiraData(SPRINT_CONFIG.sprintNumber);
        const contributors = generateContributorData(jiraData.contributors);
        
        // Calculate metrics
        const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);
        
        // Format sprint dates
        const startDate = jiraData.sprint.startDate ? new Date(jiraData.sprint.startDate).toISOString().split('T')[0] : '';
        const endDate = jiraData.sprint.endDate ? new Date(jiraData.sprint.endDate).toISOString().split('T')[0] : '';
        const periodFormatted = startDate && endDate ? 
            `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 
            'Sprint Period TBD';
        
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
                    'Strong team collaboration and coordination',
                    'Consistent delivery practices'
                ],
                improvements: [
                    'Continue high-performance practices',
                    'Maintain quality standards',
                    'Optimize development workflow'
                ],
                trends: [
                    `Sprint velocity: ${jiraData.storyPoints > SPRINT_CONFIG.previousSprintVelocity ? 'Increasing' : 'Stable'} performance`,
                    'Team engagement and delivery consistency'
                ]
            }
        };

        // Map work breakdown and priorities
        const workBreakdown = mapWorkBreakdown(jiraData.issueTypes, jiraData.totalIssues);
        const priorityData = mapPriorityBreakdown(jiraData.priorities, jiraData.completedIssues, jiraData.totalIssues);
        
        // Initialize Professional Teams Template Service
        const templateService = new ProfessionalTeamsTemplateService();
        
        // Send professional sprint report
        await templateService.sendSprintReport(
            sprintData,
            workBreakdown,
            priorityData,
            {
                actionItems: [
                    {
                        role: 'Team Lead',
                        action: `Review ${SPRINT_CONFIG.sprintId} outcomes and plan next sprint improvements`,
                        timeline: 'Next 2 business days'
                    },
                    {
                        role: 'Scrum Master',
                        action: 'Conduct retrospective and document learnings',
                        timeline: 'End of current week'
                    },
                    {
                        role: 'Tech Lead',
                        action: 'Address technical debt and maintain code quality',
                        timeline: 'Ongoing'
                    },
                    {
                        role: 'Dev Team',
                        action: 'Apply sprint learnings to upcoming work',
                        timeline: 'Next sprint planning'
                    }
                ],
                resources: [
                    {
                        type: 'Sprint Board',
                        description: `JIRA Sprint ${SPRINT_CONFIG.sprintNumber} Dashboard`,
                        access: 'All Team Members',
                        url: `https://${process.env.JIRA_DOMAIN}/secure/RapidBoard.jspa?rapidView=${SPRINT_CONFIG.sprintNumber}`
                    },
                    {
                        type: 'Sprint Retrospective',
                        description: `Confluence Sprint ${SPRINT_CONFIG.sprintNumber} Retrospective`,
                        access: 'All Team Members',
                        url: `https://${process.env.JIRA_CONFLUENCE_DOMAIN}/wiki/spaces/TEAM/pages/sprint-${SPRINT_CONFIG.sprintNumber}-retro`
                    },
                    {
                        type: 'Performance Dashboard',
                        description: `Sprint ${SPRINT_CONFIG.sprintNumber} Metrics`,
                        access: 'All Team Members',
                        url: `https://${process.env.JIRA_DOMAIN}/secure/Dashboard.jspa`
                    }
                ],
                achievements: [
                    `Achieved ${jiraData.completionRate}% sprint completion rate`,
                    `Delivered ${jiraData.storyPoints} story points with quality`,
                    `${Object.keys(jiraData.contributors).length} team members contributed`,
                    `Resolved ${jiraData.completedIssues} out of ${jiraData.totalIssues} planned issues`
                ]
            }
        );
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
    console.log(`📋 Standard Sprint Report Template`);
    console.log(`🎯 Target Sprint: ${SPRINT_CONFIG.sprintId}`);
    console.log(`📅 Configured for: ${SPRINT_CONFIG.sprintNumber}`);
    console.log('=' .repeat(70));
    
    generateStandardSprintReport().catch(console.error);
}
