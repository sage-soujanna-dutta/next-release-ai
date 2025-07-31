#!/usr/bin/env npx tsx

/**
 * STANDARD SPRINT REVIEW REPORT - SCNT-2025-21 WITH MARKDOWN OUTPUT
 * Generate sprint review with JIRA tickets and save as markdown file
 * 
 * FEATURES:
 * - Complete JIRA tickets list with status
 * - Sprint review format with ticket details
 * - Standard template formatting
 * - Issue type breakdown
 * - Assignee information
 * - Priority tracking
 * - Markdown file output
 * 
 * USAGE:
 * npx tsx standard-scnt-2025-21-sprint-review-markdown.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// ===================================================================
// CONFIGURATION SECTION - SCNT-2025-21 SPRINT
// ===================================================================
const SPRINT_CONFIG = {
  sprintId: 'SCNT-2025-21',
  sprintNumber: '2025-21',
  previousSprintVelocity: 220,
  previousSprintCompletion: 95,
  // Sprint dates from Jul 29 - Aug 11, 2025
  expectedStartDate: '2025-07-29',
  expectedEndDate: '2025-08-11'
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

interface TicketBreakdown {
    completed: JiraIssue[];
    inProgress: JiraIssue[];
    todo: JiraIssue[];
    byType: {
        story: JiraIssue[];
        bug: JiraIssue[];
        task: JiraIssue[];
        epic: JiraIssue[];
        improvement: JiraIssue[];
        other: JiraIssue[];
    };
    byPriority: {
        critical: JiraIssue[];
        high: JiraIssue[];
        medium: JiraIssue[];
        low: JiraIssue[];
        unknown: JiraIssue[];
    };
}

interface StandardSprintReviewData {
    sprintId: string;
    period: string;
    completionRate: number;
    totalIssues: number;
    completedIssues: number;
    storyPoints: number;
    contributors: number;
    status: string;
    sprint: SprintJiraData;
    tickets: TicketBreakdown;
}

// ===================================================================
// JIRA DATA FETCHING WITH TICKET DETAILS
// ===================================================================
async function fetchSCNTSprintWithTickets(): Promise<StandardSprintReviewData> {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;
    const boardId = process.env.JIRA_BOARD_ID;

    if (!domain || !token || !boardId) {
        throw new Error("Missing JIRA environment variables");
    }

    try {
        console.log(`🔍 Fetching SCNT sprint review data for ${SPRINT_CONFIG.sprintNumber}...`);
        console.log(`📋 Board ID: ${boardId}`);
        
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

        // Find the correct sprint with multiple strategies
        let targetSprint = sprintsRes.data.values.find((sprint: SprintJiraData) => 
            sprint.name === SPRINT_CONFIG.sprintId ||
            sprint.name.includes(SPRINT_CONFIG.sprintNumber) ||
            sprint.name.includes('2025-21') ||
            sprint.name.includes('SCNT-2025-21')
        );

        if (!targetSprint) {
            console.log('Available sprints:');
            sprintsRes.data.values.forEach((sprint: SprintJiraData) => {
                console.log(`  - ${sprint.name} (ID: ${sprint.id}, State: ${sprint.state})`);
            });
            throw new Error(`Sprint ${SPRINT_CONFIG.sprintId} not found on board ${boardId}`);
        }

        console.log(`✅ Found Sprint: ${targetSprint.name} (ID: ${targetSprint.id}, State: ${targetSprint.state})`);

        // Get ALL issues for this sprint with expanded fields
        const issuesRes = await axios.get(
            `https://${domain}/rest/agile/1.0/sprint/${targetSprint.id}/issue?maxResults=200&expand=names`,
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                } 
            }
        );

        const issues: JiraIssue[] = issuesRes.data.issues || [];
        console.log(`📊 Retrieved ${issues.length} issues from sprint`);

        // Categorize tickets by status
        const completed: JiraIssue[] = [];
        const inProgress: JiraIssue[] = [];
        const todo: JiraIssue[] = [];

        // Categorize by type
        const byType = {
            story: [] as JiraIssue[],
            bug: [] as JiraIssue[],
            task: [] as JiraIssue[],
            epic: [] as JiraIssue[],
            improvement: [] as JiraIssue[],
            other: [] as JiraIssue[]
        };

        // Categorize by priority
        const byPriority = {
            critical: [] as JiraIssue[],
            high: [] as JiraIssue[],
            medium: [] as JiraIssue[],
            low: [] as JiraIssue[],
            unknown: [] as JiraIssue[]
        };

        issues.forEach(issue => {
            const status = issue.fields.status.name.toLowerCase();
            const issueType = issue.fields.issuetype.name.toLowerCase();
            const priority = issue.fields.priority?.name.toLowerCase() || 'unknown';

            // Status categorization
            if (status.includes('done') || status.includes('completed') || 
                status.includes('closed') || status.includes('resolved')) {
                completed.push(issue);
            } else if (status.includes('progress') || status.includes('review') || 
                      status.includes('testing') || status.includes('development')) {
                inProgress.push(issue);
            } else {
                todo.push(issue);
            }

            // Type categorization
            if (issueType.includes('story')) {
                byType.story.push(issue);
            } else if (issueType.includes('bug')) {
                byType.bug.push(issue);
            } else if (issueType.includes('task')) {
                byType.task.push(issue);
            } else if (issueType.includes('epic')) {
                byType.epic.push(issue);
            } else if (issueType.includes('improvement') || issueType.includes('enhancement')) {
                byType.improvement.push(issue);
            } else {
                byType.other.push(issue);
            }

            // Priority categorization
            if (priority.includes('critical') || priority.includes('blocker')) {
                byPriority.critical.push(issue);
            } else if (priority.includes('high') || priority.includes('major')) {
                byPriority.high.push(issue);
            } else if (priority.includes('medium') || priority.includes('normal')) {
                byPriority.medium.push(issue);
            } else if (priority.includes('low') || priority.includes('minor')) {
                byPriority.low.push(issue);
            } else {
                byPriority.unknown.push(issue);
            }
        });

        // Calculate metrics
        const totalIssues = issues.length;
        const completedIssues = completed.length;
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

        // Format period
        const startDate = targetSprint.startDate ? new Date(targetSprint.startDate) : new Date(SPRINT_CONFIG.expectedStartDate);
        const endDate = targetSprint.endDate ? new Date(targetSprint.endDate) : new Date(SPRINT_CONFIG.expectedEndDate);
        const periodFormatted = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        console.log(`✅ SPRINT REVIEW ANALYSIS COMPLETE:`);
        console.log(`   Completed: ${completed.length} tickets`);
        console.log(`   In Progress: ${inProgress.length} tickets`);
        console.log(`   To Do: ${todo.length} tickets`);
        console.log(`   Story Points: ${totalStoryPoints}`);
        console.log(`   Contributors: ${contributors.size}`);

        return {
            sprintId: SPRINT_CONFIG.sprintId,
            period: periodFormatted,
            completionRate,
            totalIssues,
            completedIssues,
            storyPoints: totalStoryPoints,
            contributors: contributors.size,
            status: targetSprint.state === 'closed' ? 'Completed' : targetSprint.state === 'active' ? 'Active' : 'Future',
            sprint: targetSprint,
            tickets: {
                completed,
                inProgress,
                todo,
                byType,
                byPriority
            }
        };

    } catch (error) {
        console.error('❌ Error fetching JIRA data:', error);
        throw error;
    }
}

// ===================================================================
// MARKDOWN GENERATION
// ===================================================================
function generateMarkdownReport(data: StandardSprintReviewData): string {
    const performanceIndicator = data.completionRate >= 90 ? '🟢 Excellent' :
                                data.completionRate >= 75 ? '🟡 Good' :
                                data.completionRate >= 50 ? '🟠 Fair' : '🔴 Needs Attention';

    const velocityTrend = data.storyPoints > SPRINT_CONFIG.previousSprintVelocity ? '📈 Improving' :
                         data.storyPoints < SPRINT_CONFIG.previousSprintVelocity ? '📉 Declining' : '➡️ Stable';

    return `# 📋 ${data.sprintId} - Sprint Review Report

**Generated:** ${new Date().toLocaleString()}  
**Template:** Standard Sprint Review with JIRA Tickets  
**Project:** SCNT (Smart City & Network Technologies)

---

## 📊 Sprint Review Summary

| Attribute | Value |
|-----------|-------|
| **Sprint Period** | ${data.period} |
| **Status** | ${data.status} |
| **Performance** | ${performanceIndicator} |

## 📈 Overview Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Total Issues** | ${data.totalIssues} tickets | 📊 |
| **Completed** | ${data.tickets.completed.length} tickets | ✅ |
| **In Progress** | ${data.tickets.inProgress.length} tickets | 🔄 |
| **To Do** | ${data.tickets.todo.length} tickets | 📝 |
| **Completion Rate** | ${data.completionRate}% | ${performanceIndicator} |
| **Story Points** | ${data.storyPoints} points | 📈 |
| **Contributors** | ${data.contributors} team members | 👥 |

## 📊 Comparison with Previous Sprint

| Metric | Current | Previous | Trend |
|--------|---------|----------|-------|
| **Completion Rate** | ${data.completionRate}% | ${SPRINT_CONFIG.previousSprintCompletion}% | ${data.completionRate > SPRINT_CONFIG.previousSprintCompletion ? '📈' : data.completionRate < SPRINT_CONFIG.previousSprintCompletion ? '📉' : '➡️'} |
| **Velocity** | ${data.storyPoints} points | ${SPRINT_CONFIG.previousSprintVelocity} points | ${velocityTrend} |

## 🏷️ Issue Type Breakdown

| Type | Count | Percentage |
|------|-------|------------|
| **📚 Stories** | ${data.tickets.byType.story.length} | ${Math.round((data.tickets.byType.story.length / data.totalIssues) * 100)}% |
| **🐛 Bugs** | ${data.tickets.byType.bug.length} | ${Math.round((data.tickets.byType.bug.length / data.totalIssues) * 100)}% |
| **⚙️ Tasks** | ${data.tickets.byType.task.length} | ${Math.round((data.tickets.byType.task.length / data.totalIssues) * 100)}% |
| **🎯 Epics** | ${data.tickets.byType.epic.length} | ${Math.round((data.tickets.byType.epic.length / data.totalIssues) * 100)}% |
| **🔧 Improvements** | ${data.tickets.byType.improvement.length} | ${Math.round((data.tickets.byType.improvement.length / data.totalIssues) * 100)}% |
| **📋 Other** | ${data.tickets.byType.other.length} | ${Math.round((data.tickets.byType.other.length / data.totalIssues) * 100)}% |

## 🎯 Priority Distribution

| Priority | Count | Status |
|----------|-------|--------|
| **🔴 Critical** | ${data.tickets.byPriority.critical.length} | ${data.tickets.byPriority.critical.length === 0 ? '✅ None' : '⚠️ Needs Attention'} |
| **🟠 High** | ${data.tickets.byPriority.high.length} | ${data.tickets.byPriority.high.length <= 3 ? '✅ Manageable' : '⚠️ High Load'} |
| **🟡 Medium** | ${data.tickets.byPriority.medium.length} | 📊 Standard |
| **🟢 Low** | ${data.tickets.byPriority.low.length} | 📊 Standard |

---

## ✅ Completed Tickets (${data.tickets.completed.length})

| Ticket Key | Summary | Assignee | Type | Priority | Status |
|------------|---------|----------|------|----------|--------|
${data.tickets.completed.map(ticket => 
    `| **${ticket.key}** | ${ticket.fields.summary.length > 80 ? ticket.fields.summary.substring(0, 80) + '...' : ticket.fields.summary} | ${ticket.fields.assignee?.displayName || 'Unassigned'} | ${ticket.fields.issuetype.name} | ${ticket.fields.priority?.name || 'N/A'} | ✅ ${ticket.fields.status.name} |`
).join('\n')}

---

## 🔄 In Progress Tickets (${data.tickets.inProgress.length})

${data.tickets.inProgress.length > 0 ? `| Ticket Key | Summary | Assignee | Type | Priority | Status |
|------------|---------|----------|------|----------|--------|
${data.tickets.inProgress.map(ticket => 
    `| **${ticket.key}** | ${ticket.fields.summary.length > 80 ? ticket.fields.summary.substring(0, 80) + '...' : ticket.fields.summary} | ${ticket.fields.assignee?.displayName || 'Unassigned'} | ${ticket.fields.issuetype.name} | ${ticket.fields.priority?.name || 'N/A'} | 🔄 ${ticket.fields.status.name} |`
).join('\n')}` : '_No in-progress tickets_'}

---

## 📝 To Do Tickets (${data.tickets.todo.length})

${data.tickets.todo.length > 0 ? `| Ticket Key | Summary | Assignee | Type | Priority | Status |
|------------|---------|----------|------|----------|--------|
${data.tickets.todo.map(ticket => 
    `| **${ticket.key}** | ${ticket.fields.summary.length > 80 ? ticket.fields.summary.substring(0, 80) + '...' : ticket.fields.summary} | ${ticket.fields.assignee?.displayName || 'Unassigned'} | ${ticket.fields.issuetype.name} | ${ticket.fields.priority?.name || 'N/A'} | 📝 ${ticket.fields.status.name} |`
).join('\n')}` : '_No remaining tickets_'}

---

## 📋 Sprint Review Actions

- **✅ Demo completed work** to stakeholders
- **📋 Review sprint goals** achievement against SCNT targets
- **🔄 Discuss in-progress items** and blockers
- **📝 Plan remaining work** for next sprint cycle
- **🤝 Gather feedback** from product owners and users
- **📊 Update velocity** and capacity planning for SCNT-2025-22

---

## 📊 Summary Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| ✅ **Completed** | ${data.tickets.completed.length} | ${Math.round((data.tickets.completed.length / data.totalIssues) * 100)}% |
| 🔄 **In Progress** | ${data.tickets.inProgress.length} | ${Math.round((data.tickets.inProgress.length / data.totalIssues) * 100)}% |
| 📝 **To Do** | ${data.tickets.todo.length} | ${Math.round((data.tickets.todo.length / data.totalIssues) * 100)}% |
| **Total** | ${data.totalIssues} | 100% |

---

**📅 Report Generated:** ${new Date().toLocaleString()}  
**🎯 Project:** SCNT (Smart City & Network Technologies)  
**📋 Sprint:** ${data.sprintId}  
**🔧 Template:** Standard Sprint Review with JIRA Tickets List
`;
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================
async function generateSCNTSprintReviewMarkdown() {
    console.log('📋 STANDARD SPRINT REVIEW REPORT WITH TICKETS - MARKDOWN');
    console.log('======================================================');
    console.log(`🎯 Target Sprint: ${SPRINT_CONFIG.sprintId}`);
    console.log(`📅 Expected Period: ${SPRINT_CONFIG.expectedStartDate} to ${SPRINT_CONFIG.expectedEndDate}`);
    console.log(`📊 Board ID: ${process.env.JIRA_BOARD_ID}`);
    console.log('');
    
    try {
        // Fetch sprint data with tickets
        const sprintData = await fetchSCNTSprintWithTickets();
        
        // Generate markdown report
        const markdownContent = generateMarkdownReport(sprintData);
        
        // Save to file
        const outputDir = path.join(process.cwd(), 'reports');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filename = `SCNT-2025-21-Sprint-Review-${new Date().toISOString().split('T')[0]}.md`;
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, markdownContent, 'utf8');
        
        console.log('\n✅ STANDARD SCNT-2025-21 Sprint Review Markdown generated!');
        console.log(`📊 Sprint: ${sprintData.sprintId}`);
        console.log(`📅 Period: ${sprintData.period}`);
        console.log(`🎯 Completion: ${sprintData.completionRate}% (${sprintData.completedIssues}/${sprintData.totalIssues})`);
        console.log(`✅ Completed: ${sprintData.tickets.completed.length} tickets`);
        console.log(`🔄 In Progress: ${sprintData.tickets.inProgress.length} tickets`);
        console.log(`📝 To Do: ${sprintData.tickets.todo.length} tickets`);
        console.log(`📈 Story Points: ${sprintData.storyPoints}`);
        console.log(`👥 Contributors: ${sprintData.contributors}`);
        console.log(`📄 File saved: ${filepath}`);

    } catch (error) {
        console.error('❌ Failed to generate SCNT sprint review markdown:', error);
        if (axios.isAxiosError(error)) {
            console.error('🔍 Response status:', error.response?.status);
            console.error('🔍 Response data:', error.response?.data);
        }
        process.exit(1);
    }
}

// Run the SCNT sprint review markdown generator
generateSCNTSprintReviewMarkdown();
