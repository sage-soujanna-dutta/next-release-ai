#!/usr/bin/env npx tsx

/**
 * NDS-FY25-21 Markdown Sprint Report Generator
 * Generates comprehensive markdown sprint report for Network Directory Service
 * Uses board ID 5465 for direct board access
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// ===================================================================
// CONFIGURATION
// ===================================================================
const SPRINT_CONFIG = {
  sprintId: 'NDS-FY25-21',
  sprintNumber: 'FY25-21',
  boardId: 5465, // Network Directory Service board ID
  projectName: 'Network Directory Service'
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
        created?: string;
        updated?: string;
        description?: string;
    };
}

interface SprintJiraData {
    id: number;
    name: string;
    state: string;
    startDate?: string;
    endDate?: string;
    completeDate?: string;
    goal?: string;
}

// ===================================================================
// JIRA DATA FETCHING
// ===================================================================
async function fetchNDSSprintData(boardId: number, sprintNumber: string) {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;

    if (!domain || !token) {
        throw new Error("Missing JIRA environment variables");
    }

    try {
        console.log(`🔍 Fetching NDS JIRA data for ${sprintNumber} from board ${boardId}...`);
        
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

        return {
            sprint: targetSprint,
            issues: issues
        };

    } catch (error) {
        console.error('❌ Error fetching JIRA data:', error);
        throw error;
    }
}

// ===================================================================
// MARKDOWN REPORT GENERATION
// ===================================================================
function generateMarkdownReport(sprintData: any, issues: JiraIssue[]): string {
    const { sprint } = sprintData;
    
    // Calculate metrics
    const completedIssues = issues.filter(issue => 
        issue.fields.status.name.toLowerCase().includes('done') ||
        issue.fields.status.name.toLowerCase().includes('completed') ||
        issue.fields.status.name.toLowerCase().includes('closed') ||
        issue.fields.status.name.toLowerCase().includes('resolved')
    );

    const totalIssues = issues.length;
    const completionRate = totalIssues > 0 ? Math.round((completedIssues.length / totalIssues) * 100) : 0;

    // Calculate story points
    let totalStoryPoints = 0;
    let completedStoryPoints = 0;
    
    issues.forEach(issue => {
        const storyPoints = issue.fields.customfield_10004 || 
                          issue.fields.customfield_10002 || 
                          issue.fields.customfield_10003 || 
                          issue.fields.customfield_10005 || 0;
        totalStoryPoints += storyPoints;
        
        if (completedIssues.includes(issue)) {
            completedStoryPoints += storyPoints;
        }
    });

    // Get unique contributors
    const contributors = new Set();
    issues.forEach(issue => {
        if (issue.fields.assignee?.displayName) {
            contributors.add(issue.fields.assignee.displayName);
        }
    });

    // Work breakdown
    const workBreakdown = {
        stories: issues.filter(i => i.fields.issuetype.name.toLowerCase().includes('story')).length,
        bugs: issues.filter(i => i.fields.issuetype.name.toLowerCase().includes('bug')).length,
        tasks: issues.filter(i => i.fields.issuetype.name.toLowerCase().includes('task')).length,
        subtasks: issues.filter(i => i.fields.issuetype.name.toLowerCase().includes('sub-task')).length
    };

    // Priority breakdown
    const priorityBreakdown = {
        critical: issues.filter(i => i.fields.priority?.name.toLowerCase().includes('critical')).length,
        high: issues.filter(i => i.fields.priority?.name.toLowerCase().includes('high')).length,
        medium: issues.filter(i => i.fields.priority?.name.toLowerCase().includes('medium')).length,
        low: issues.filter(i => i.fields.priority?.name.toLowerCase().includes('low')).length
    };

    // Format dates
    const startDate = sprint.startDate ? new Date(sprint.startDate) : new Date();
    const endDate = sprint.endDate ? new Date(sprint.endDate) : new Date();
    const periodFormatted = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Status assessment
    const statusIcon = completionRate >= 90 ? '🟢' : completionRate >= 75 ? '🟡' : completionRate >= 50 ? '🟠' : '🔴';
    const statusText = completionRate >= 90 ? 'Excellent' : completionRate >= 75 ? 'Good' : completionRate >= 50 ? 'Fair' : 'Needs Attention';

    // Generate top contributors
    const contributorStats = Array.from(contributors).map(name => {
        const contributorIssues = issues.filter(i => i.fields.assignee?.displayName === name);
        const contributorCompleted = contributorIssues.filter(i => completedIssues.includes(i));
        const contributorPoints = contributorIssues.reduce((sum, issue) => {
            return sum + (issue.fields.customfield_10004 || issue.fields.customfield_10002 || issue.fields.customfield_10003 || issue.fields.customfield_10005 || 0);
        }, 0);
        
        return {
            name,
            totalIssues: contributorIssues.length,
            completedIssues: contributorCompleted.length,
            storyPoints: contributorPoints
        };
    }).sort((a, b) => b.completedIssues - a.completedIssues);

    return `# 🚀 ${SPRINT_CONFIG.sprintId} - Sprint Report

*${periodFormatted}* | 📋 ${sprint.state} | ${completionRate}% Complete

## 📊 Executive Summary

| Metric                | Value           | Status      |
|---------------------- |-----------------|-------------|
| Completion Rate       | ${completionRate}% (${completedIssues.length}/${totalIssues})     | ${statusIcon} ${statusText} |
| Story Points          | ${completedStoryPoints}/${totalStoryPoints} points | ${statusIcon} ${statusText} |
| Team Size             | ${contributors.size} contributors | 👥 Active    |
| Sprint Duration       | 2 weeks         | ⏰ Standard |
| Project               | ${SPRINT_CONFIG.projectName} | 🎯 NDS |

## 🎯 Sprint Goals

| Goal | Description | Status | Progress |
|------|-------------|--------|----------|
| Complete planned sprint work | Deliver committed story points and resolve priority issues | ${sprint.state === 'closed' ? 'Completed' : 'In Progress'} | ${sprint.state === 'closed' ? '✅' : '🔄'} |

## 📋 Sprint Objectives

| Objective | Target | Actual | Status |
|-----------|--------|--------|--------|
| Sprint Completion Rate | ≥90% | ${completionRate}% | ${completionRate >= 90 ? '✅' : '⚠️'} |
| Story Points Delivery | ${totalStoryPoints} pts | ${completedStoryPoints} pts | ${completedStoryPoints >= totalStoryPoints * 0.9 ? '✅' : '⚠️'} |
| Quality Maintenance | Zero critical bugs | ${priorityBreakdown.critical} critical | ${priorityBreakdown.critical === 0 ? '✅' : '⚠️'} |
| Team Collaboration | High engagement | ${contributors.size} contributors | ✅ |

## 📦 Sprint Deliverables

| Issue | Summary | Type | Points | Status |
|-------|---------|------|--------|--------|
${completedIssues.map(issue => {
    const storyPoints = issue.fields.customfield_10004 || issue.fields.customfield_10002 || issue.fields.customfield_10003 || issue.fields.customfield_10005 || 0;
    const typeIcon = issue.fields.issuetype.name.toLowerCase().includes('story') ? '✨' :
                    issue.fields.issuetype.name.toLowerCase().includes('bug') ? '🐛' :
                    issue.fields.issuetype.name.toLowerCase().includes('task') ? '🧹' : '📋';
    return `| ${typeIcon} ${issue.key} | ${issue.fields.summary} | ${issue.fields.issuetype.name} | ${storyPoints} pts | ✅ Delivered |`;
}).join('\n')}

## 📉 Work Breakdown Analysis

| Work Type     | Count     | Percentage | Focus Area           |
|---------------|-----------|------------|----------------------|
| User Stories  | ${workBreakdown.stories} items  | ${Math.round((workBreakdown.stories / totalIssues) * 100)}%        | Feature Development  |
| Bug Fixes     | ${workBreakdown.bugs} items  | ${Math.round((workBreakdown.bugs / totalIssues) * 100)}%        | Quality Maintenance  |
| Tasks         | ${workBreakdown.tasks} items  | ${Math.round((workBreakdown.tasks / totalIssues) * 100)}%        | Operations           |
| Sub-tasks     | ${workBreakdown.subtasks} items  | ${Math.round((workBreakdown.subtasks / totalIssues) * 100)}%        | Implementation       |

## 🛠️ Priority Resolution Status

| Priority Level | Resolved | Total | Success Rate | Status      |
|---------------|----------|-------|--------------|-------------|
| Critical      | ${completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('critical')).length}        | ${priorityBreakdown.critical}     | ${priorityBreakdown.critical > 0 ? Math.round((completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('critical')).length / priorityBreakdown.critical) * 100) : 0}%           | ${priorityBreakdown.critical === 0 ? 'N/A' : priorityBreakdown.critical === completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('critical')).length ? '✅ Complete' : '⚠️ In Progress'} |
| Major         | ${completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('high')).length}        | ${priorityBreakdown.high}     | ${priorityBreakdown.high > 0 ? Math.round((completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('high')).length / priorityBreakdown.high) * 100) : 0}%          | ${priorityBreakdown.high === 0 ? 'N/A' : priorityBreakdown.high === completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('high')).length ? '✅ Complete' : '⚠️ In Progress'} |
| Minor         | ${completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('medium')).length}       | ${priorityBreakdown.medium}    | ${priorityBreakdown.medium > 0 ? Math.round((completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('medium')).length / priorityBreakdown.medium) * 100) : 0}%          | ${priorityBreakdown.medium === 0 ? 'N/A' : priorityBreakdown.medium === completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('medium')).length ? '✅ Complete' : '⚠️ In Progress'} |
| Low           | ${completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('low')).length}        | ${priorityBreakdown.low}     | ${priorityBreakdown.low > 0 ? Math.round((completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('low')).length / priorityBreakdown.low) * 100) : 0}%           | ${priorityBreakdown.low === 0 ? 'N/A' : priorityBreakdown.low === completedIssues.filter(i => i.fields.priority?.name.toLowerCase().includes('low')).length ? '✅ Complete' : '⚠️ In Progress'} |

## 🏆 Top Contributors

| Contributor      | Issues Assigned | Issues Completed | Story Points | Impact Level |
|------------------|-----------------|------------------|--------------|-------------|
${contributorStats.slice(0, 10).map(contributor => 
    `| ${contributor.name}     | ${contributor.totalIssues}              | ${contributor.completedIssues}               | ${contributor.storyPoints} pts           | ✨ HIGH      |`
).join('\n')}

## 🔍 Sprint Analysis

### Performance Highlights
- **Completion Rate**: ${completionRate}% of planned work completed
- **Quality Score**: ${statusText}
- **Velocity**: ${completedStoryPoints} story points delivered
- **Team Engagement**: ${contributors.size} active contributors

### Key Insights
| Insight Category | Finding | Recommendation |
|------------------|---------|----------------|
| Velocity | ${Math.round((completedStoryPoints / totalStoryPoints) * 100)}% of planned velocity achieved | ${completedStoryPoints / totalStoryPoints >= 0.9 ? 'Maintain current planning approach' : 'Review sprint planning estimation'} |
| Quality | ${Math.round((workBreakdown.bugs / totalIssues) * 100)}% bug ratio | ${workBreakdown.bugs / totalIssues <= 0.1 ? 'Good quality standards' : 'Increase focus on testing'} |
| Collaboration | Strong team participation | Continue encouraging collaborative practices |

## 📊 Quality Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Issues | ${totalIssues} | - | 📊 |
| Bug Count | ${workBreakdown.bugs} | ≤10% of total | ${workBreakdown.bugs / totalIssues <= 0.1 ? '✅' : '⚠️'} |
| Bug Ratio | ${Math.round((workBreakdown.bugs / totalIssues) * 100)}% | ≤10% | ${workBreakdown.bugs / totalIssues <= 0.1 ? '✅' : '⚠️'} |
| Bug Resolution Rate | ${Math.round((completedIssues.filter(i => i.fields.issuetype.name.toLowerCase().includes('bug')).length / workBreakdown.bugs) * 100)}% | ≥90% | ${completedIssues.filter(i => i.fields.issuetype.name.toLowerCase().includes('bug')).length / workBreakdown.bugs >= 0.9 ? '✅' : '⚠️'} |
| Quality Score | ${statusText} | Good+ | ${statusText === 'Excellent' || statusText === 'Good' ? '✅' : '⚠️'} |

### Quality Assessment
${statusText === 'Excellent' || statusText === 'Good' ? '✅ Good quality standards maintained with manageable defect levels.' : '⚠️ Quality metrics suggest increased focus on testing and defect prevention needed.'}

## 📈 Velocity Analysis

| Velocity Metric | Value | Assessment |
|-----------------|-------|------------|
| Planned Velocity | ${totalStoryPoints} points | 📊 Target |
| Actual Velocity | ${completedStoryPoints} points | 🎯 Delivered |
| Velocity Achievement | ${Math.round((completedStoryPoints / totalStoryPoints) * 100)}% | ${completedStoryPoints / totalStoryPoints >= 0.9 ? '✅ On Target' : '⚠️ Below Target'} |

### Velocity Insights
- **Trend**: ${sprint.state === 'closed' ? 'Sprint completed' : 'In progress'}
- **Consistency**: ${Math.round((completedStoryPoints / totalStoryPoints) * 100)}% delivery pattern
- **Capacity**: ${contributors.size} team members actively contributing

## 📝 Release Notes

### New Features & Improvements
${completedIssues.filter(i => i.fields.issuetype.name.toLowerCase().includes('story')).map(issue => 
    `- ✨ **${issue.fields.summary}** (${issue.key})`
).join('\n')}

### Bug Fixes
${completedIssues.filter(i => i.fields.issuetype.name.toLowerCase().includes('bug')).map(issue => 
    `- 🐛 Fixed: ${issue.fields.summary} (${issue.key})`
).join('\n')}

### Technical Improvements
${completedIssues.filter(i => i.fields.issuetype.name.toLowerCase().includes('task') && !i.fields.issuetype.name.toLowerCase().includes('sub-task')).map(issue => 
    `- 🔧 ${issue.fields.summary} (${issue.key})`
).join('\n')}

## 🚀 Action Items

| Category | Action Required | Assignee | Timeline | Priority |
|----------|----------------|----------|----------|----------|
| Sprint Completion | Review and plan completion of ${totalIssues - completedIssues.length} remaining issues | Scrum Master | Next 2 business days | 🔴 HIGH |
| Process Improvement | Conduct sprint retrospective meeting | Scrum Master | End of current week | 🟠 MEDIUM |
| Documentation | Update documentation for ${completedIssues.length} completed features | Tech Lead | Within 1 week | 🟠 MEDIUM |

## 👥 Next Steps

| Step | Description | Timeline | Impact |
|------|-------------|----------|--------|
| Carry forward incomplete work | ${totalIssues - completedIssues.length} issues to be included in next sprint planning | Next sprint planning | 🟠 MEDIUM |
| Conduct next sprint planning | Plan work for upcoming sprint based on current velocity and priorities | Sprint planning meeting | 🔴 HIGH |
| Implement retrospective improvements | Apply lessons learned from current sprint to improve processes | Ongoing | 🟠 MEDIUM |

## 🎉 Conclusion

The ${SPRINT_CONFIG.sprintId} sprint has been ${sprint.state === 'closed' ? 'completed' : 'substantially progressed'} with a ${completionRate}% completion rate. The team delivered ${completedStoryPoints} story points across ${completedIssues.length} completed issues, demonstrating ${statusText.toLowerCase()} execution and collaboration.

### Key Takeaways
- **Performance**: ${statusText} performance level achieved
- **Quality**: ${statusText === 'Excellent' || statusText === 'Good' ? 'Good' : 'Adequate'} quality standards maintained
- **Team**: Effective collaboration with ${contributors.size} active contributors
- **Delivery**: ${completedStoryPoints / totalStoryPoints >= 0.9 ? 'Strong' : 'Consistent'} progress toward sprint and project goals

The insights and action items from this sprint will inform planning for upcoming iterations, ensuring continuous improvement in team performance and delivery quality.

## 🙏 Acknowledgements

Special thanks to all team members for their dedication and contributions:

${contributorStats.map(contributor => 
    `- **${contributor.name}**: ${contributor.completedIssues} issues completed, ${contributor.storyPoints} story points, ${contributor.totalIssues} issues assigned`
).join('\n')}

The success of this sprint is a result of the collective effort, collaboration, and commitment of the entire team.

---
*Generated: ${new Date().toLocaleString()}*
*Report Status: ${sprint.state === 'closed' ? 'Complete' : 'Requires Action'}*
*Sprint State: ${sprint.state}*
*Board ID: ${SPRINT_CONFIG.boardId}*

`;
}

// ===================================================================
// FILE SAVING
// ===================================================================
function saveMarkdownReport(content: string): string {
    const outputDir = './output';
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate filename with new pattern: <sprint name>-sprint-report-<date time>.md
    const date = new Date().toISOString().split("T")[0];
    const time = new Date().toISOString().split("T")[1].split(".")[0].replace(/:/g, "-");
    const fileName = `${SPRINT_CONFIG.sprintId}-sprint-report-${date}-${time}.md`;
    const filePath = path.join(outputDir, fileName);
    
    // Write file
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✅ Markdown report saved to: ${filePath}`);
    return filePath;
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================
async function generateNDSMarkdownReport() {
    console.log('📋 NDS MARKDOWN SPRINT REPORT GENERATOR');
    console.log('======================================');
    console.log(`🎯 Target Sprint: ${SPRINT_CONFIG.sprintId}`);
    console.log(`📊 Board ID: ${SPRINT_CONFIG.boardId}`);
    console.log(`📁 Project: ${SPRINT_CONFIG.projectName}`);
    console.log('');
    
    try {
        // Fetch sprint data
        const sprintData = await fetchNDSSprintData(SPRINT_CONFIG.boardId, SPRINT_CONFIG.sprintNumber);
        
        // Generate markdown report
        const markdownContent = generateMarkdownReport(sprintData, sprintData.issues);
        
        // Save to file
        const filePath = saveMarkdownReport(markdownContent);
        
        console.log('\n✅ NDS-FY25-21 Markdown Report completed successfully!');
        console.log(`📊 Sprint: ${sprintData.sprint.name}`);
        console.log(`📅 State: ${sprintData.sprint.state}`);
        console.log(`📝 Issues: ${sprintData.issues.length} total`);
        console.log(`📁 File: ${filePath}`);

    } catch (error) {
        console.error('❌ Failed to generate markdown sprint report:', error);
        if (axios.isAxiosError(error)) {
            console.error('🔍 Response status:', error.response?.status);
            console.error('🔍 Response data:', error.response?.data);
        }
        process.exit(1);
    }
}

// Run the markdown report generator
generateNDSMarkdownReport();
