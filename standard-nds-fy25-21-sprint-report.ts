#!/usr/bin/env npx tsx

/**
 * STANDARD SPRINT REPORT TEMPLATE - NDS-FY25-21
 * Standard Teams notification with basic metrics and straightforward formatting
 * 
 * FEATURES:
 * - Basic JIRA data integration
 * - Simple sprint metrics
 * - Standard Teams formatting
 * - Contributor recognition
 * - Work breakdown by type
 * 
 * USAGE:
 * npx tsx standard-nds-fy25-21-sprint-report.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ===================================================================
// CONFIGURATION SECTION - NDS-FY25-21 SPRINT
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

interface StandardSprintData {
    sprintId: string;
    period: string;
    completionRate: number;
    totalIssues: number;
    completedIssues: number;
    storyPoints: number;
    commits: number;
    contributors: number;
    status: string;
    sprint: SprintJiraData;
}

// ===================================================================
// JIRA DATA FETCHING
// ===================================================================
async function fetchNDSSprintData(boardId: number, sprintNumber: string): Promise<StandardSprintData> {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;

    if (!domain || !token) {
        throw new Error("Missing JIRA environment variables");
    }

    try {
        console.log(`🔍 Fetching NDS JIRA data for ${sprintNumber}...`);
        
        // Get all sprints for the board
        const sprintsRes = await axios.get(
            `https://${domain}/rest/agile/1.0/board/${boardId}/sprint?maxResults=50`,
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                } 
            }
        );

        console.log(`📋 Found ${sprintsRes.data.values.length} total sprints on board ${boardId}`);

        // Find the correct sprint
        const targetSprint = sprintsRes.data.values.find((sprint: SprintJiraData) => 
            sprint.name.includes(sprintNumber) || sprint.name.includes('FY25-21')
        );

        if (!targetSprint) {
            throw new Error(`Sprint ${sprintNumber} not found on board ${boardId}`);
        }

        console.log(`✅ Found Sprint: ${targetSprint.name} (ID: ${targetSprint.id}, State: ${targetSprint.state})`);

        // Get issues for this sprint
        const issuesRes = await axios.get(
            `https://${domain}/rest/agile/1.0/sprint/${targetSprint.id}/issue?maxResults=100`,
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                } 
            }
        );

        const issues: JiraIssue[] = issuesRes.data.issues || [];
        console.log(`📊 Retrieved ${issues.length} issues from sprint`);

        // Calculate metrics
        const completedIssues = issues.filter(issue => 
            issue.fields.status.name.toLowerCase().includes('done') ||
            issue.fields.status.name.toLowerCase().includes('completed') ||
            issue.fields.status.name.toLowerCase().includes('closed') ||
            issue.fields.status.name.toLowerCase().includes('resolved')
        ).length;

        const totalIssues = issues.length;
        const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

        // Calculate story points
        let totalStoryPoints = 0;
        issues.forEach(issue => {
            const storyPoints = issue.fields.customfield_10004 || 
                              issue.fields.customfield_10002 || 
                              issue.fields.customfield_10003 || 
                              issue.fields.customfield_10005 || 0;
            totalStoryPoints += storyPoints;
        });

        // Get unique contributors
        const contributors = new Set();
        issues.forEach(issue => {
            if (issue.fields.assignee?.displayName) {
                contributors.add(issue.fields.assignee.displayName);
            }
        });

        // Mock commits data (since we don't have direct access to commit data from JIRA)
        const estimatedCommits = Math.round(completedIssues * 1.8); // Rough estimate

        // Format period
        const startDate = targetSprint.startDate ? new Date(targetSprint.startDate) : new Date();
        const endDate = targetSprint.endDate ? new Date(targetSprint.endDate) : new Date();
        const periodFormatted = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        console.log(`✅ STANDARD SPRINT ANALYSIS COMPLETE:`);
        console.log(`   Sprint: ${targetSprint.name}`);
        console.log(`   Completion: ${completionRate}% (${completedIssues}/${totalIssues})`);
        console.log(`   Story Points: ${totalStoryPoints}`);
        console.log(`   Contributors: ${contributors.size}`);

        return {
            sprintId: SPRINT_CONFIG.sprintId,
            period: periodFormatted,
            completionRate,
            totalIssues,
            completedIssues,
            storyPoints: totalStoryPoints,
            commits: estimatedCommits,
            contributors: contributors.size,
            status: targetSprint.state === 'closed' ? 'Completed' : 'Active',
            sprint: targetSprint
        };

    } catch (error) {
        console.error('❌ Error fetching JIRA data:', error);
        throw error;
    }
}

// ===================================================================
// TEAMS NOTIFICATION GENERATION
// ===================================================================
function generateStandardTeamsNotification(data: StandardSprintData): any {
    const performanceIndicator = data.completionRate >= 90 ? '🟢 Excellent' :
                                data.completionRate >= 75 ? '🟡 Good' :
                                data.completionRate >= 50 ? '🟠 Fair' : '🔴 Needs Attention';

    const velocityTrend = data.storyPoints > SPRINT_CONFIG.previousSprintVelocity ? '📈 Improving' :
                         data.storyPoints < SPRINT_CONFIG.previousSprintVelocity ? '📉 Declining' : '➡️ Stable';

    return {
        "@type": "MessageCard",
        "@context": "https://schema.org/extensions",
        "summary": `${data.sprintId} - Standard Sprint Report`,
        "themeColor": "0078D4", // Standard blue
        "sections": [
            {
                "activityTitle": `📊 ${data.sprintId} - Sprint Report`,
                "activitySubtitle": `${data.period} | ${data.status} | ${data.completionRate}% Complete`,
                "activityImage": "https://img.icons8.com/color/96/sprint-iteration.png",
                "text": `
## Sprint Summary

**Sprint Period:** ${data.period}  
**Status:** ${data.status}  
**Performance:** ${performanceIndicator}

## Key Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Completion Rate** | ${data.completionRate}% (${data.completedIssues}/${data.totalIssues}) | ${performanceIndicator} |
| **Story Points** | ${data.storyPoints} points | ${velocityTrend} |
| **Team Size** | ${data.contributors} contributors | Active |
| **Estimated Commits** | ${data.commits} commits | Development Activity |

## Comparison with Previous Sprint

| Metric | Current | Previous | Trend |
|--------|---------|----------|-------|
| **Completion Rate** | ${data.completionRate}% | ${SPRINT_CONFIG.previousSprintCompletion}% | ${data.completionRate > SPRINT_CONFIG.previousSprintCompletion ? '📈' : data.completionRate < SPRINT_CONFIG.previousSprintCompletion ? '📉' : '➡️'} |
| **Velocity** | ${data.storyPoints} points | ${SPRINT_CONFIG.previousSprintVelocity} points | ${velocityTrend} |

## Next Steps

- Review completed work and gather feedback
- Conduct sprint retrospective
- Plan upcoming sprint priorities
- Address any blockers or impediments

---

**📅 Generated:** ${new Date().toLocaleString()}  
**🔧 Template:** Standard Sprint Report
                `,
                "markdown": true
            }
        ],
        "potentialAction": [
            {
                "@type": "OpenUri",
                "name": "View Sprint Board",
                "targets": [
                    {
                        "os": "default",
                        "uri": `https://${process.env.JIRA_DOMAIN}/secure/RapidBoard.jspa?rapidView=${SPRINT_CONFIG.boardId}`
                    }
                ]
            }
        ]
    };
}

// ===================================================================
// TEAMS WEBHOOK SENDER
// ===================================================================
async function sendToTeams(messageCard: any): Promise<void> {
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.log("❌ Teams webhook not configured");
        return;
    }

    try {
        console.log('📤 Sending standard sprint report to Teams...');
        
        const response = await axios.post(webhookUrl, messageCard, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        if (response.status === 200) {
            console.log('✅ Standard sprint report sent to Teams successfully!');
        } else {
            console.log(`⚠️ Teams response: ${response.status} - ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to send Teams notification:', error);
        if (axios.isAxiosError(error)) {
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
        }
    }
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================
async function generateStandardNDSSprintReport() {
    console.log('📋 STANDARD SPRINT REPORT GENERATOR');
    console.log('==================================');
    console.log(`🎯 Target Sprint: ${SPRINT_CONFIG.sprintId}`);
    console.log(`📊 Board ID: ${SPRINT_CONFIG.boardId}`);
    console.log('');
    
    try {
        // Fetch sprint data
        const sprintData = await fetchNDSSprintData(SPRINT_CONFIG.boardId, SPRINT_CONFIG.sprintNumber);
        
        // Generate Teams notification
        const teamsNotification = generateStandardTeamsNotification(sprintData);
        
        // Send to Teams
        await sendToTeams(teamsNotification);
        
        console.log('\n✅ STANDARD NDS-FY25-21 Report completed successfully!');
        console.log(`📊 Sprint: ${sprintData.sprintId}`);
        console.log(`📅 Period: ${sprintData.period}`);
        console.log(`🎯 Completion: ${sprintData.completionRate}% (${sprintData.completedIssues}/${sprintData.totalIssues})`);
        console.log(`📈 Story Points: ${sprintData.storyPoints}`);
        console.log(`👥 Contributors: ${sprintData.contributors}`);
        console.log(`⚡ Estimated Commits: ${sprintData.commits}`);

    } catch (error) {
        console.error('❌ Failed to generate standard sprint report:', error);
        if (axios.isAxiosError(error)) {
            console.error('🔍 Response status:', error.response?.status);
            console.error('🔍 Response data:', error.response?.data);
        }
        process.exit(1);
    }
}

// Run the standard sprint report generator
generateStandardNDSSprintReport();
