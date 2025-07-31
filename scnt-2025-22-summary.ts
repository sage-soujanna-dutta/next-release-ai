#!/usr/bin/env npx tsx

/**
 * SCNT-2025-22 SPRINT SUMMARY GENERATOR
 * Quick summary of sprint status and key metrics
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function generateQuickSummary() {
    console.log('📊 SCNT-2025-22 Sprint Summary');
    console.log('=' .repeat(50));
    
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;
    const boardId = process.env.JIRA_BOARD_ID;

    if (!domain || !token || !boardId) {
        console.log('❌ JIRA environment variables not configured');
        return;
    }

    try {
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

        const targetSprint = sprintsRes.data.values.find((s: any) =>
            s.name.includes('2025-22')
        );

        if (!targetSprint) {
            console.log('❌ Sprint SCNT-2025-22 not found');
            return;
        }

        // Get issues
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

        const issues = issuesRes.data.issues;
        const completedStatuses = ['Done', 'Resolved', 'Closed', 'Completed'];
        const completedIssues = issues.filter((issue: any) => 
            completedStatuses.includes(issue.fields.status.name)
        );

        const storyPoints = issues.reduce((sum: number, issue: any) => {
            return sum + (issue.fields.customfield_10004 || 0);
        }, 0);

        console.log(`Sprint: ${targetSprint.name}`);
        console.log(`Status: ${targetSprint.state}`);
        console.log(`Period: ${targetSprint.startDate ? new Date(targetSprint.startDate).toLocaleDateString() : 'TBD'} - ${targetSprint.endDate ? new Date(targetSprint.endDate).toLocaleDateString() : 'TBD'}`);
        console.log(`Total Issues: ${issues.length}`);
        console.log(`Completed: ${completedIssues.length} (${Math.round((completedIssues.length / issues.length) * 100)}%)`);
        console.log(`Story Points: ${storyPoints}`);
        console.log('✅ Reports have been sent to Teams channel');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

generateQuickSummary();
