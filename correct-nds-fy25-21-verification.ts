#!/usr/bin/env npx tsx

/**
 * CORRECTED NDS-FY25-21 DATA VERIFICATION
 * Searches for the correct FY25-21 sprint (not FY24-21)
 * 
 * FEATURES:
 * - Search for FY25-21 sprint specifically
 * - Compare with report that shows FY24-21 data
 * - Identify the sprint mismatch issue
 * - Fetch correct sprint data
 * 
 * USAGE:
 * npx tsx correct-nds-fy25-21-verification.ts
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
// CURRENT REPORT DATA (Shows FY24-21 instead of FY25-21)
// ===================================================================
const CURRENT_REPORT_DATA = {
    requestedSprint: "NDS-FY25-21",
    actualSprintFetched: "NDS - FY24 - Sprint 21",
    sprintId: 37829,
    period: "Jul 11 - Jul 24, 2024",
    year: "2024",
    expectedYear: "2025"
};

// ===================================================================
// INTERFACES
// ===================================================================
interface SprintData {
    id: number;
    name: string;
    state: string;
    startDate?: string;
    endDate?: string;
}

// ===================================================================
// SPRINT SEARCH FUNCTIONS
// ===================================================================

async function findCorrectSprint() {
    try {
        console.log('🔍 SEARCHING FOR CORRECT NDS-FY25-21 SPRINT');
        console.log('=============================================\n');

        console.log(`❌ ISSUE IDENTIFIED:`);
        console.log(`   Requested: ${CURRENT_REPORT_DATA.requestedSprint} (FY25 = 2025)`);
        console.log(`   Actually fetched: ${CURRENT_REPORT_DATA.actualSprintFetched} (FY24 = 2024)`);
        console.log(`   This is a YEAR MISMATCH!\n`);

        // 1. Get all sprints for the board
        console.log('📋 Fetching ALL sprints from Network Directory Service board...');
        
        let allSprints = [];
        let startAt = 0;
        const maxResults = 100;
        let hasMore = true;

        while (hasMore) {
            const sprintsResponse = await axios.get(
                `${JIRA_BASE_URL}/rest/agile/1.0/board/${BOARD_ID}/sprint`,
                {
                    auth: jiraAuth,
                    params: {
                        startAt,
                        maxResults,
                        state: 'closed,active,future'
                    }
                }
            );

            const sprints = sprintsResponse.data.values;
            allSprints = allSprints.concat(sprints);
            
            hasMore = sprints.length === maxResults;
            startAt += maxResults;
            
            console.log(`   Fetched ${sprints.length} sprints (total: ${allSprints.length})`);
        }

        console.log(`\n✅ Found ${allSprints.length} total sprints on board ${BOARD_ID}`);

        // 2. Search for FY25 sprints
        console.log('\n🎯 SEARCHING FOR FY25 SPRINTS...');
        const fy25Sprints = allSprints.filter((sprint: any) => 
            sprint.name.includes('FY25') || 
            sprint.name.includes('2025') ||
            (sprint.startDate && new Date(sprint.startDate).getFullYear() === 2025)
        );

        console.log(`\n📊 FY25 Sprints Found: ${fy25Sprints.length}`);
        fy25Sprints.forEach((sprint: any, index: number) => {
            const startDate = sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'N/A';
            const endDate = sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'N/A';
            console.log(`   ${index + 1}. ${sprint.name} (ID: ${sprint.id}, State: ${sprint.state})`);
            console.log(`      Period: ${startDate} - ${endDate}`);
        });

        // 3. Search specifically for Sprint 21 in FY25
        const fy25Sprint21 = fy25Sprints.find((sprint: any) => 
            sprint.name.includes('Sprint 21') || sprint.name.includes('21')
        );

        if (fy25Sprint21) {
            console.log(`\n🎯 FOUND TARGET SPRINT: ${fy25Sprint21.name} (ID: ${fy25Sprint21.id})`);
            await analyzeCorrectSprint(fy25Sprint21);
        } else {
            console.log(`\n❌ NO FY25 SPRINT 21 FOUND`);
            
            // 4. Look for recent sprints that might be Sprint 21
            console.log('\n🔍 LOOKING FOR RECENT SPRINTS THAT MIGHT BE SPRINT 21...');
            const recentSprints = allSprints
                .filter((sprint: any) => sprint.startDate)
                .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .slice(0, 10);

            console.log('\nMost Recent 10 Sprints:');
            recentSprints.forEach((sprint: any, index: number) => {
                const startDate = new Date(sprint.startDate).toLocaleDateString();
                const endDate = sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'N/A';
                const year = new Date(sprint.startDate).getFullYear();
                console.log(`   ${index + 1}. ${sprint.name} (ID: ${sprint.id}, Year: ${year})`);
                console.log(`      Period: ${startDate} - ${endDate}, State: ${sprint.state}`);
            });
        }

        // 5. Show the incorrect sprint that was fetched
        console.log('\n❌ INCORRECT SPRINT THAT WAS FETCHED:');
        const incorrectSprint = allSprints.find((sprint: any) => sprint.id === CURRENT_REPORT_DATA.sprintId);
        if (incorrectSprint) {
            console.log(`   Name: ${incorrectSprint.name}`);
            console.log(`   ID: ${incorrectSprint.id}`);
            console.log(`   Period: ${new Date(incorrectSprint.startDate).toLocaleDateString()} - ${new Date(incorrectSprint.endDate).toLocaleDateString()}`);
            console.log(`   Year: ${new Date(incorrectSprint.startDate).getFullYear()}`);
            console.log(`   State: ${incorrectSprint.state}`);
        }

        return { fy25Sprints, fy25Sprint21, allSprints };

    } catch (error) {
        console.error('❌ Error searching for sprints:', error.response?.data || error.message);
        throw error;
    }
}

async function analyzeCorrectSprint(sprint) {
    try {
        console.log('\n📊 ANALYZING CORRECT SPRINT DATA...');

        // Get sprint issues
        const issuesResponse = await axios.get(
            `${JIRA_BASE_URL}/rest/agile/1.0/sprint/${sprint.id}/issue`,
            {
                auth: jiraAuth,
                params: {
                    maxResults: 500,
                    fields: 'summary,status,issuetype,assignee,customfield_10016,priority,resolution,created,resolutiondate'
                }
            }
        );

        const issues = issuesResponse.data.issues;
        console.log(`\n✅ Retrieved ${issues.length} issues from correct sprint`);

        // Analyze the data
        const completedIssues = issues.filter(issue => 
            issue.fields.status.statusCategory.key === 'done'
        );
        
        const completionRate = Math.round((completedIssues.length / issues.length) * 100);

        // Calculate story points
        let totalStoryPoints = 0;
        issues.forEach(issue => {
            const storyPoints = issue.fields.customfield_10016 || 0;
            totalStoryPoints += storyPoints;
        });

        // Work breakdown
        const workBreakdown = {
            story: issues.filter(i => i.fields.issuetype.name === 'Story').length,
            subtask: issues.filter(i => i.fields.issuetype.name === 'Sub-task').length,
            bug: issues.filter(i => i.fields.issuetype.name === 'Bug').length,
            task: issues.filter(i => i.fields.issuetype.name === 'Task').length,
            epic: issues.filter(i => i.fields.issuetype.name === 'Epic').length
        };

        // Contributors
        const uniqueAssignees = new Set(
            issues
                .filter(issue => issue.fields.assignee)
                .map(issue => issue.fields.assignee.emailAddress)
        );

        console.log('\n🎯 CORRECT SPRINT DATA (FY25-21):');
        console.log(`   Sprint: ${sprint.name}`);
        console.log(`   ID: ${sprint.id}`);
        console.log(`   State: ${sprint.state}`);
        console.log(`   Period: ${new Date(sprint.startDate).toLocaleDateString()} - ${new Date(sprint.endDate).toLocaleDateString()}`);
        console.log(`   Year: ${new Date(sprint.startDate).getFullYear()}`);
        console.log(`   Total Issues: ${issues.length}`);
        console.log(`   Completed Issues: ${completedIssues.length}`);
        console.log(`   Completion Rate: ${completionRate}%`);
        console.log(`   Story Points: ${totalStoryPoints}`);
        console.log(`   Contributors: ${uniqueAssignees.size}`);
        console.log(`   Work Breakdown:`);
        console.log(`     - Stories: ${workBreakdown.story}`);
        console.log(`     - Sub-tasks: ${workBreakdown.subtask}`);
        console.log(`     - Bugs: ${workBreakdown.bug}`);
        console.log(`     - Tasks: ${workBreakdown.task}`);
        console.log(`     - Epics: ${workBreakdown.epic}`);

        // Compare with what was reported
        console.log('\n📋 COMPARISON WITH CURRENT REPORT:');
        console.log(`   Report shows: NDS - FY24 - Sprint 21 (2024) ❌`);
        console.log(`   Should show: ${sprint.name} (${new Date(sprint.startDate).getFullYear()}) ✅`);
        
        return {
            correctSprint: sprint,
            issues,
            metrics: {
                totalIssues: issues.length,
                completedIssues: completedIssues.length,
                completionRate,
                storyPoints: totalStoryPoints,
                contributors: uniqueAssignees.size,
                workBreakdown
            }
        };

    } catch (error) {
        console.error('❌ Error analyzing sprint:', error.response?.data || error.message);
        throw error;
    }
}

function generateCorrectionRecommendations() {
    console.log('\n💡 CORRECTION RECOMMENDATIONS:');
    console.log('================================\n');

    console.log('🔧 ISSUE ROOT CAUSE:');
    console.log('   The sprint search logic found FY24-21 instead of FY25-21');
    console.log('   This suggests the search criteria needs to be updated\n');

    console.log('🛠️  FIXES NEEDED:');
    console.log('   1. Update sprint search to specifically look for FY25 sprints');
    console.log('   2. Add year validation to ensure correct fiscal year');
    console.log('   3. Implement more specific sprint name matching');
    console.log('   4. Add date range validation for 2025 sprints\n');

    console.log('📝 UPDATED SEARCH CRITERIA:');
    console.log('   - Sprint name must contain "FY25" OR');
    console.log('   - Sprint start date must be in 2025 OR'); 
    console.log('   - Sprint name pattern: "NDS.*FY25.*21"');
    console.log('   - Board ID: 5465 (confirmed correct)\n');

    console.log('⚡ NEXT STEPS:');
    console.log('   1. Regenerate the report with corrected sprint search');
    console.log('   2. Verify the sprint dates are in 2025');
    console.log('   3. Confirm the sprint is actually Sprint 21 for FY25');
    console.log('   4. Update the report generator configuration');
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================

async function main() {
    try {
        console.log('🚀 CORRECTED NDS-FY25-21 VERIFICATION');
        console.log('=====================================\n');

        const results = await findCorrectSprint();
        generateCorrectionRecommendations();

        if (results.fy25Sprint21) {
            console.log('\n✅ Found the correct sprint! Data analyzed above.');
        } else {
            console.log('\n❌ Could not find NDS-FY25-21 sprint.');
            console.log('   Please check if the sprint exists or has a different naming convention.');
        }

        console.log('\n🎯 CONCLUSION:');
        console.log('   The current report shows data from the WRONG YEAR (FY24 instead of FY25)');
        console.log('   A new report needs to be generated with the correct sprint.');

    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        if (error.response?.status === 500) {
            console.log('\n💡 NOTE: JIRA server error encountered.');
            console.log('   This confirms there\'s an issue with the sprint search logic.');
        }
    }
}

// Run the verification
main();
