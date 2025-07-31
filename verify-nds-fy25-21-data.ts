#!/usr/bin/env npx tsx

/**
 * NDS-FY25-21 DATA VERIFICATION TOOL
 * Fetches current JIRA data and compares with generated report
 * 
 * FEATURES:
 * - Real-time JIRA data fetching
 * - Sprint metrics verification
 * - Issue count validation
 * - Story points comparison
 * - Sprint status confirmation
 * - Detailed discrepancy analysis
 * 
 * USAGE:
 * npx tsx verify-nds-fy25-21-data.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// ===================================================================
// JIRA CONFIGURATION
// ===================================================================
const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_TOKEN = process.env.JIRA_TOKEN;

if (!JIRA_DOMAIN || !JIRA_EMAIL || !JIRA_TOKEN) {
    console.error('❌ Missing JIRA environment variables');
    console.error('Required: JIRA_DOMAIN, JIRA_EMAIL, JIRA_TOKEN');
    process.exit(1);
}

const JIRA_BASE_URL = `https://${JIRA_DOMAIN}`;

const jiraAuth = {
    username: JIRA_EMAIL,
    password: JIRA_TOKEN
};

// ===================================================================
// SPRINT CONFIGURATION
// ===================================================================
const BOARD_ID = 5465; // Network Directory Service

// ===================================================================
// REPORT DATA (From Generated Report)
// ===================================================================
const REPORT_DATA = {
    sprintName: "NDS - FY24 - Sprint 21",
    sprintId: 37829,
    state: "closed",
    startDate: "2024-07-11T14:00:00.000Z",
    endDate: "2024-07-24T14:00:00.000Z",
    completionRate: 94,
    totalIssues: 89,
    completedIssues: 84,
    storyPoints: 79,
    contributors: 8,
    workBreakdown: {
        stories: { count: 18, percentage: 20 },
        subtasks: { count: 67, percentage: 75 },
        bugs: { count: 4, percentage: 4 }
    }
};

// ===================================================================
// JIRA DATA FETCHING
// ===================================================================

async function fetchSprintData() {
    try {
        console.log('🔍 Fetching current JIRA data for verification...\n');

        // 1. Get all sprints for the board
        console.log('📋 Fetching sprints from Network Directory Service board...');
        const sprintsResponse = await axios.get(
            `${JIRA_BASE_URL}/rest/agile/1.0/board/${BOARD_ID}/sprint`,
            {
                auth: jiraAuth,
                params: {
                    maxResults: 100,
                    state: 'closed,active'
                }
            }
        );

        const sprints = sprintsResponse.data.values;
        console.log(`✅ Found ${sprints.length} sprints on board ${BOARD_ID}`);

        // 2. Find the specific sprint
        const targetSprint = sprints.find(sprint => 
            sprint.name.includes('FY24') && 
            sprint.name.includes('Sprint 21') &&
            sprint.name.includes('NDS')
        );

        if (!targetSprint) {
            console.log('🔍 Available sprints:');
            sprints.forEach((sprint, index) => {
                console.log(`   ${index + 1}. ${sprint.name} (ID: ${sprint.id}, State: ${sprint.state})`);
            });
            throw new Error('Sprint not found - please check available sprints above');
        }

        console.log(`\n🎯 Found target sprint: ${targetSprint.name} (ID: ${targetSprint.id})`);

        // 3. Get sprint issues
        console.log('📊 Fetching sprint issues...');
        const issuesResponse = await axios.get(
            `${JIRA_BASE_URL}/rest/agile/1.0/sprint/${targetSprint.id}/issue`,
            {
                auth: jiraAuth,
                params: {
                    maxResults: 500,
                    fields: 'summary,status,issuetype,assignee,customfield_10016,priority,resolution,created,resolutiondate'
                }
            }
        );

        const issues = issuesResponse.data.issues;
        console.log(`✅ Retrieved ${issues.length} issues from sprint`);

        // 4. Analyze the data
        return analyzeSprintData(targetSprint, issues);

    } catch (error) {
        console.error('❌ Error fetching JIRA data:', error.response?.data || error.message);
        throw error;
    }
}

function analyzeSprintData(sprint: any, issues: any[]) {
    console.log('\n📈 ANALYZING SPRINT DATA...\n');

    // Basic sprint info
    const sprintData = {
        name: sprint.name,
        id: sprint.id,
        state: sprint.state,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        totalIssues: issues.length
    };

    // Calculate completion metrics
    const completedIssues = issues.filter(issue => 
        issue.fields.status.statusCategory.key === 'done'
    );
    
    const completionRate = Math.round((completedIssues.length / issues.length) * 100);

    // Calculate story points
    let totalStoryPoints = 0;
    let completedStoryPoints = 0;
    
    issues.forEach(issue => {
        const storyPoints = issue.fields.customfield_10016 || 0;
        totalStoryPoints += storyPoints;
        
        if (issue.fields.status.statusCategory.key === 'done') {
            completedStoryPoints += storyPoints;
        }
    });

    // Work breakdown by issue type
    const workBreakdown = {
        story: issues.filter(i => i.fields.issuetype.name === 'Story').length,
        subtask: issues.filter(i => i.fields.issuetype.name === 'Sub-task').length,
        bug: issues.filter(i => i.fields.issuetype.name === 'Bug').length,
        task: issues.filter(i => i.fields.issuetype.name === 'Task').length,
        epic: issues.filter(i => i.fields.issuetype.name === 'Epic').length
    };

    // Contributors count
    const uniqueAssignees = new Set(
        issues
            .filter(issue => issue.fields.assignee)
            .map(issue => issue.fields.assignee.emailAddress)
    );

    const actualData = {
        sprintName: sprintData.name,
        sprintId: sprintData.id,
        state: sprintData.state,
        startDate: sprintData.startDate,
        endDate: sprintData.endDate,
        completionRate,
        totalIssues: sprintData.totalIssues,
        completedIssues: completedIssues.length,
        storyPoints: totalStoryPoints,
        completedStoryPoints,
        contributors: uniqueAssignees.size,
        workBreakdown
    };

    console.log('🎯 ACTUAL JIRA DATA:');
    console.log(`   Sprint: ${actualData.sprintName}`);
    console.log(`   ID: ${actualData.sprintId}`);
    console.log(`   State: ${actualData.state}`);
    console.log(`   Period: ${new Date(actualData.startDate).toLocaleDateString()} - ${new Date(actualData.endDate).toLocaleDateString()}`);
    console.log(`   Completion: ${actualData.completionRate}% (${actualData.completedIssues}/${actualData.totalIssues})`);
    console.log(`   Story Points: ${actualData.storyPoints} total, ${actualData.completedStoryPoints} completed`);
    console.log(`   Contributors: ${actualData.contributors}`);
    console.log(`   Work Breakdown:`);
    console.log(`     - Stories: ${workBreakdown.story}`);
    console.log(`     - Sub-tasks: ${workBreakdown.subtask}`);
    console.log(`     - Bugs: ${workBreakdown.bug}`);
    console.log(`     - Tasks: ${workBreakdown.task}`);
    console.log(`     - Epics: ${workBreakdown.epic}`);

    console.log('\n📋 REPORT DATA:');
    console.log(`   Sprint: ${REPORT_DATA.sprintName}`);
    console.log(`   ID: ${REPORT_DATA.sprintId}`);
    console.log(`   State: ${REPORT_DATA.state}`);
    console.log(`   Period: ${new Date(REPORT_DATA.startDate).toLocaleDateString()} - ${new Date(REPORT_DATA.endDate).toLocaleDateString()}`);
    console.log(`   Completion: ${REPORT_DATA.completionRate}% (${REPORT_DATA.completedIssues}/${REPORT_DATA.totalIssues})`);
    console.log(`   Story Points: ${REPORT_DATA.storyPoints}`);
    console.log(`   Contributors: ${REPORT_DATA.contributors}`);
    console.log(`   Work Breakdown:`);
    console.log(`     - Stories: ${REPORT_DATA.workBreakdown.stories.count} (${REPORT_DATA.workBreakdown.stories.percentage}%)`);
    console.log(`     - Sub-tasks: ${REPORT_DATA.workBreakdown.subtasks.count} (${REPORT_DATA.workBreakdown.subtasks.percentage}%)`);
    console.log(`     - Bugs: ${REPORT_DATA.workBreakdown.bugs.count} (${REPORT_DATA.workBreakdown.bugs.percentage}%)`);

    // Compare and identify discrepancies
    compareData(actualData, REPORT_DATA);

    return actualData;
}

function compareData(actual: any, reported: any) {
    console.log('\n🔍 DISCREPANCY ANALYSIS:\n');

    const discrepancies: string[] = [];

    // Check basic metrics
    if (actual.sprintId !== reported.sprintId) {
        discrepancies.push(`❌ Sprint ID: Actual=${actual.sprintId}, Report=${reported.sprintId}`);
    } else {
        console.log('✅ Sprint ID matches');
    }

    if (actual.completionRate !== reported.completionRate) {
        discrepancies.push(`❌ Completion Rate: Actual=${actual.completionRate}%, Report=${reported.completionRate}%`);
    } else {
        console.log('✅ Completion Rate matches');
    }

    if (actual.totalIssues !== reported.totalIssues) {
        discrepancies.push(`❌ Total Issues: Actual=${actual.totalIssues}, Report=${reported.totalIssues}`);
    } else {
        console.log('✅ Total Issues matches');
    }

    if (actual.completedIssues !== reported.completedIssues) {
        discrepancies.push(`❌ Completed Issues: Actual=${actual.completedIssues}, Report=${reported.completedIssues}`);
    } else {
        console.log('✅ Completed Issues matches');
    }

    if (actual.storyPoints !== reported.storyPoints) {
        discrepancies.push(`❌ Story Points: Actual=${actual.storyPoints}, Report=${reported.storyPoints}`);
    } else {
        console.log('✅ Story Points matches');
    }

    if (actual.contributors !== reported.contributors) {
        discrepancies.push(`❌ Contributors: Actual=${actual.contributors}, Report=${reported.contributors}`);
    } else {
        console.log('✅ Contributors count matches');
    }

    // Check work breakdown
    if (actual.workBreakdown.story !== reported.workBreakdown.stories.count) {
        discrepancies.push(`❌ Stories Count: Actual=${actual.workBreakdown.story}, Report=${reported.workBreakdown.stories.count}`);
    } else {
        console.log('✅ Stories count matches');
    }

    if (actual.workBreakdown.subtask !== reported.workBreakdown.subtasks.count) {
        discrepancies.push(`❌ Sub-tasks Count: Actual=${actual.workBreakdown.subtask}, Report=${reported.workBreakdown.subtasks.count}`);
    } else {
        console.log('✅ Sub-tasks count matches');
    }

    if (actual.workBreakdown.bug !== reported.workBreakdown.bugs.count) {
        discrepancies.push(`❌ Bugs Count: Actual=${actual.workBreakdown.bug}, Report=${reported.workBreakdown.bugs.count}`);
    } else {
        console.log('✅ Bugs count matches');
    }

    if (discrepancies.length > 0) {
        console.log('\n⚠️  DISCREPANCIES FOUND:');
        discrepancies.forEach(discrepancy => console.log(`   ${discrepancy}`));
        
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('   1. Check if the report was generated with cached/stale data');
        console.log('   2. Verify the sprint ID and board configuration');
        console.log('   3. Confirm the date range for the sprint data');
        console.log('   4. Re-run the report generator to get fresh data');
    } else {
        console.log('\n✅ ALL DATA MATCHES! The report is accurate.');
    }
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================

async function main() {
    try {
        console.log('🚀 NDS-FY25-21 DATA VERIFICATION TOOL');
        console.log('=====================================\n');

        await fetchSprintData();

        console.log('\n✅ Verification completed successfully!');

    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        process.exit(1);
    }
}

// Run if this is the main module
main();

export { main as verifyNDSSprintData };
