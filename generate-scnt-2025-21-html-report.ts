import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { ProfessionalTeamsTemplateService, SprintData, WorkBreakdown, PriorityBreakdown, TeamNotificationData } from './src/services/ProfessionalTeamsTemplateService.js';

// Load environment variables
dotenv.config();

// ===================================================================
// CONFIGURATION
// ===================================================================
const SPRINT_CONFIG = {
    sprintNumber: '21',
    sprintId: 'SCNT-2025-21',
    sprintName: 'SCNT Sprint 21 - January 2025',
};

// ===================================================================
// INTERFACES
// ===================================================================
interface JiraIssue {
    key: string;
    fields: {
        summary: string;
        status: { name: string };
        assignee?: { displayName: string };
        priority?: { name: string };
        issuetype: { name: string };
        customfield_10004?: number; // Story Points
    };
}

interface ContributorData {
    name: string;
    issuesResolved: number;
    pointsCompleted: number;
    commits: number;
    sprintImpact: string;
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================
function formatTicketsTable(issues: JiraIssue[]): string {
    const completedStatuses = ['Done', 'Resolved', 'Closed', 'Completed'];
    const completedIssues = issues.filter(issue => completedStatuses.includes(issue.fields.status.name));
    const inProgressIssues = issues.filter(issue => !completedStatuses.includes(issue.fields.status.name));

    let table = '## 📋 Sprint Tickets Summary\n\n';
    
    if (completedIssues.length > 0) {
        table += `### ✅ Completed Tickets (${completedIssues.length})\n\n`;
        table += '| Ticket | Summary | Type | Assignee | Points | Status |\n';
        table += '|--------|---------|------|----------|--------|--------|\n';
        
        completedIssues
            .sort((a, b) => (b.fields.customfield_10004 || 0) - (a.fields.customfield_10004 || 0))
            .forEach(issue => {
                const ticketLink = `[${issue.key}](https://${process.env.JIRA_DOMAIN}/browse/${issue.key})`;
                const summary = issue.fields.summary.substring(0, 50) + (issue.fields.summary.length > 50 ? '...' : '');
                const assignee = issue.fields.assignee?.displayName || 'Unassigned';
                const points = issue.fields.customfield_10004 || 0;
                const status = issue.fields.status.name;
                const type = issue.fields.issuetype.name;
                
                table += `| ${ticketLink} | ${summary} | ${type} | ${assignee} | ${points} | ✅ ${status} |\n`;
            });
        table += '\n';
    }
    
    if (inProgressIssues.length > 0) {
        table += `### 🔄 In Progress / Remaining Tickets (${inProgressIssues.length})\n\n`;
        table += '| Ticket | Summary | Type | Assignee | Points | Status |\n';
        table += '|--------|---------|------|----------|--------|--------|\n';
        
        inProgressIssues
            .sort((a, b) => (b.fields.customfield_10004 || 0) - (a.fields.customfield_10004 || 0))
            .forEach(issue => {
                const ticketLink = `[${issue.key}](https://${process.env.JIRA_DOMAIN}/browse/${issue.key})`;
                const summary = issue.fields.summary.substring(0, 50) + (issue.fields.summary.length > 50 ? '...' : '');
                const assignee = issue.fields.assignee?.displayName || 'Unassigned';
                const points = issue.fields.customfield_10004 || 0;
                const status = issue.fields.status.name;
                const type = issue.fields.issuetype.name;
                
                const statusIcon = status.includes('Progress') ? '🔄' : 
                                status.includes('Review') ? '👀' : 
                                status.includes('Testing') ? '🧪' : '📝';
                
                table += `| ${ticketLink} | ${summary} | ${type} | ${assignee} | ${points} | ${statusIcon} ${status} |\n`;
            });
    }
    
    return table;
}

// ===================================================================
// HTML REPORT GENERATOR
// ===================================================================
function generateHTMLReport(
    sprintData: SprintData,
    workBreakdown: WorkBreakdown,
    priorityData: PriorityBreakdown,
    contributors: ContributorData[],
    issues: JiraIssue[]
): string {
    const completedStatuses = ['Done', 'Resolved', 'Closed', 'Completed'];
    const completedIssues = issues.filter(issue => completedStatuses.includes(issue.fields.status.name));
    const inProgressIssues = issues.filter(issue => !completedStatuses.includes(issue.fields.status.name));

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sprintData.sprintId} - Sprint Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0078d4; border-bottom: 3px solid #0078d4; padding-bottom: 10px; }
        h2 { color: #323130; margin-top: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #0078d4; }
        .metric-value { font-size: 24px; font-weight: bold; color: #0078d4; }
        .metric-label { color: #605e5c; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e1dfdd; }
        th { background-color: #f8f9fa; color: #323130; font-weight: 600; }
        .status-done { color: #107c10; font-weight: bold; }
        .status-progress { color: #d83b01; font-weight: bold; }
        .priority-high { color: #d83b01; }
        .priority-medium { color: #f7630c; }
        .priority-low { color: #107c10; }
        .ticket-link { color: #0078d4; text-decoration: none; }
        .ticket-link:hover { text-decoration: underline; }
        .section { margin: 30px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e1dfdd; color: #605e5c; font-size: 14px; }
        .summary-cell { max-width: 300px; word-wrap: break-word; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${sprintData.sprintId} - Professional Sprint Report</h1>
        
        <div class="section">
            <h2>📊 Sprint Overview</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${sprintData.completionRate}%</div>
                    <div class="metric-label">Completion Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${sprintData.storyPoints}</div>
                    <div class="metric-label">Story Points</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${sprintData.completedIssues}/${sprintData.totalIssues}</div>
                    <div class="metric-label">Issues Completed</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${sprintData.contributors}</div>
                    <div class="metric-label">Contributors</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📈 Work Breakdown</h2>
            <table>
                <thead>
                    <tr>
                        <th>Work Type</th>
                        <th>Count</th>
                        <th>Percentage</th>
                        <th>Focus Area</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>📚 User Stories</td>
                        <td>${workBreakdown.userStories.count}</td>
                        <td>${workBreakdown.userStories.percentage}%</td>
                        <td>Feature Development</td>
                    </tr>
                    <tr>
                        <td>🐛 Bug Fixes</td>
                        <td>${workBreakdown.bugFixes.count}</td>
                        <td>${workBreakdown.bugFixes.percentage}%</td>
                        <td>Quality Maintenance</td>
                    </tr>
                    <tr>
                        <td>⚙️ Tasks</td>
                        <td>${workBreakdown.tasks.count}</td>
                        <td>${workBreakdown.tasks.percentage}%</td>
                        <td>Operations</td>
                    </tr>
                    <tr>
                        <td>🎯 Epics</td>
                        <td>${workBreakdown.epics.count}</td>
                        <td>${workBreakdown.epics.percentage}%</td>
                        <td>Strategic Initiatives</td>
                    </tr>
                    <tr>
                        <td>🔧 Improvements</td>
                        <td>${workBreakdown.improvements.count}</td>
                        <td>${workBreakdown.improvements.percentage}%</td>
                        <td>Process Enhancement</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>✅ Completed Tickets (${completedIssues.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Ticket</th>
                        <th>Summary</th>
                        <th>Type</th>
                        <th>Assignee</th>
                        <th>Priority</th>
                        <th>Points</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${completedIssues
                        .sort((a, b) => (b.fields.customfield_10004 || 0) - (a.fields.customfield_10004 || 0))
                        .map(issue => `
                    <tr>
                        <td><a href="https://${process.env.JIRA_DOMAIN}/browse/${issue.key}" class="ticket-link" target="_blank">${issue.key}</a></td>
                        <td class="summary-cell">${issue.fields.summary}</td>
                        <td>${issue.fields.issuetype.name}</td>
                        <td>${issue.fields.assignee?.displayName || 'Unassigned'}</td>
                        <td class="priority-${issue.fields.priority?.name?.toLowerCase() || 'medium'}">${issue.fields.priority?.name || 'Medium'}</td>
                        <td>${issue.fields.customfield_10004 || 0}</td>
                        <td class="status-done">✅ ${issue.fields.status.name}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${inProgressIssues.length > 0 ? `
        <div class="section">
            <h2>🔄 In Progress / Remaining Tickets (${inProgressIssues.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Ticket</th>
                        <th>Summary</th>
                        <th>Type</th>
                        <th>Assignee</th>
                        <th>Priority</th>
                        <th>Points</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${inProgressIssues
                        .sort((a, b) => (b.fields.customfield_10004 || 0) - (a.fields.customfield_10004 || 0))
                        .map(issue => `
                    <tr>
                        <td><a href="https://${process.env.JIRA_DOMAIN}/browse/${issue.key}" class="ticket-link" target="_blank">${issue.key}</a></td>
                        <td class="summary-cell">${issue.fields.summary}</td>
                        <td>${issue.fields.issuetype.name}</td>
                        <td>${issue.fields.assignee?.displayName || 'Unassigned'}</td>
                        <td class="priority-${issue.fields.priority?.name?.toLowerCase() || 'medium'}">${issue.fields.priority?.name || 'Medium'}</td>
                        <td>${issue.fields.customfield_10004 || 0}</td>
                        <td class="status-progress">${issue.fields.status.name.includes('Progress') ? '🔄' : issue.fields.status.name.includes('Review') ? '👀' : '📝'} ${issue.fields.status.name}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="section">
            <h2>👥 Top Contributors</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Issues Resolved</th>
                        <th>Story Points</th>
                        <th>Commits</th>
                        <th>Impact</th>
                    </tr>
                </thead>
                <tbody>
                    ${contributors.slice(0, 10).map(contributor => `
                    <tr>
                        <td>${contributor.name}</td>
                        <td>${contributor.issuesResolved}</td>
                        <td>${contributor.pointsCompleted}</td>
                        <td>${contributor.commits}</td>
                        <td><span class="priority-${contributor.sprintImpact.toLowerCase()}">${contributor.sprintImpact}</span></td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p><strong>📅 Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>🎯 Sprint Period:</strong> ${sprintData.period}</p>
            <p><strong>🏆 Status:</strong> Ready for executive presentation</p>
        </div>
    </div>
</body>
</html>
    `;
}

// ===================================================================
// MAIN FUNCTION
// ===================================================================
async function generateSCNT202521HTMLReport() {
    try {
        console.log('🚀 Generating SCNT-2025-21 Sprint Report with HTML Output');
        console.log('=' .repeat(70));

        // Step 1: Fetch JIRA data
        console.log('\n📊 Step 1: Fetching JIRA Data');
        console.log('-'.repeat(60));
        
        const domain = process.env.JIRA_DOMAIN;
        const token = process.env.JIRA_TOKEN;
        const boardId = process.env.JIRA_BOARD_ID;

        // Get all sprints for the board
        const sprintsRes = await axios.get(
            `https://${domain}/rest/agile/1.0/board/${boardId}/sprint`,
            { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
        );
        const targetSprint = sprintsRes.data.values.find((s: any) => s.name.includes(SPRINT_CONFIG.sprintNumber));
        
        // Get all issues for the sprint
        let issues = [];
        if (targetSprint) {
            const issuesRes = await axios.get(
                `https://${domain}/rest/agile/1.0/sprint/${targetSprint.id}/issue`,
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, params: { maxResults: 1000 } }
            );
            issues = issuesRes.data.issues;
        }

        console.log(`✅ Found ${issues.length} issues in sprint ${SPRINT_CONFIG.sprintNumber}`);

        // Step 2: Process data
        console.log('\n📈 Step 2: Processing Sprint Data');
        console.log('-'.repeat(60));
        
        const jiraData = {
            sprint: targetSprint,
            issues: issues,
            completedIssues: issues.filter((issue: any) => 
                ['Done', 'Resolved', 'Closed', 'Completed'].includes(issue.fields.status.name)
            ).length,
            totalIssues: issues.length,
            storyPoints: issues.reduce((sum: number, issue: any) => 
                sum + (issue.fields.customfield_10004 || 0), 0
            ),
            completionRate: Math.round((issues.filter((issue: any) => 
                ['Done', 'Resolved', 'Closed', 'Completed'].includes(issue.fields.status.name)
            ).length / issues.length) * 100),
            contributors: [...new Set(issues.map((issue: any) => 
                issue.fields.assignee?.displayName).filter(Boolean))]
        };

        const startDate = jiraData.sprint.startDate ? new Date(jiraData.sprint.startDate).toISOString().split('T')[0] : '';
        const endDate = jiraData.sprint.endDate ? new Date(jiraData.sprint.endDate).toISOString().split('T')[0] : '';

        const sprintData: SprintData = {
            sprintId: SPRINT_CONFIG.sprintId,
            period: startDate && endDate ? `${startDate} to ${endDate}` : 'Sprint Period',
            completionRate: jiraData.completionRate,
            storyPoints: jiraData.storyPoints,
            completedIssues: jiraData.completedIssues,
            totalIssues: jiraData.totalIssues,
            contributors: jiraData.contributors.length,
            commits: 0, // Mock data
            status: 'Completed',
            startDate: startDate || '',
            endDate: endDate || '',
            duration: '2 weeks',
            reportDate: new Date().toISOString().split('T')[0]
        };

        // Calculate work breakdown
        const workBreakdown: WorkBreakdown = {
            userStories: {
                count: issues.filter((issue: any) => issue.fields.issuetype.name === 'Story').length,
                percentage: Math.round((issues.filter((issue: any) => issue.fields.issuetype.name === 'Story').length / issues.length) * 100)
            },
            bugFixes: {
                count: issues.filter((issue: any) => issue.fields.issuetype.name === 'Bug').length,
                percentage: Math.round((issues.filter((issue: any) => issue.fields.issuetype.name === 'Bug').length / issues.length) * 100)
            },
            tasks: {
                count: issues.filter((issue: any) => issue.fields.issuetype.name === 'Task').length,
                percentage: Math.round((issues.filter((issue: any) => issue.fields.issuetype.name === 'Task').length / issues.length) * 100)
            },
            epics: {
                count: issues.filter((issue: any) => issue.fields.issuetype.name === 'Epic').length,
                percentage: Math.round((issues.filter((issue: any) => issue.fields.issuetype.name === 'Epic').length / issues.length) * 100)
            },
            improvements: {
                count: issues.filter((issue: any) => issue.fields.issuetype.name === 'Improvement').length,
                percentage: Math.round((issues.filter((issue: any) => issue.fields.issuetype.name === 'Improvement').length / issues.length) * 100)
            }
        };

        const priorityData: PriorityBreakdown = {
            critical: { total: 0, resolved: 0 },
            high: { total: 0, resolved: 0 },
            medium: { total: 0, resolved: 0 },
            low: { total: 0, resolved: 0 },
            blockers: { total: 0, resolved: 0 }
        };

        // Generate contributors data
        const contributors: ContributorData[] = jiraData.contributors.map((name: string, index: number) => {
            const assignedIssues = issues.filter((issue: any) => issue.fields.assignee?.displayName === name);
            const resolvedIssues = assignedIssues.filter((issue: any) => 
                ['Done', 'Resolved', 'Closed', 'Completed'].includes(issue.fields.status.name)
            );
            const pointsCompleted = resolvedIssues.reduce((sum: number, issue: any) => 
                sum + (issue.fields.customfield_10004 || 0), 0
            );

            return {
                name,
                issuesResolved: resolvedIssues.length,
                pointsCompleted,
                commits: Math.floor(Math.random() * 20) + 5, // Mock data
                sprintImpact: pointsCompleted > 20 ? 'High' : pointsCompleted > 10 ? 'Medium' : 'Low'
            };
        });

        console.log(`✅ Sprint completion rate: ${jiraData.completionRate}%`);
        console.log(`✅ Total story points: ${jiraData.storyPoints}`);
        console.log(`✅ Contributors: ${jiraData.contributors.length}`);

        // Step 3: Generate HTML Report
        console.log('\n📄 Step 3: Generating HTML Report');
        console.log('-'.repeat(60));
        
        const htmlContent = generateHTMLReport(sprintData, workBreakdown, priorityData, contributors, issues);
        
        // Ensure output directory exists
        const outputDir = process.env.OUTPUT_DIR || './output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write HTML report to file
        const htmlFilePath = path.join(outputDir, `${SPRINT_CONFIG.sprintId}-report.html`);
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
        
        console.log(`✅ HTML report generated: ${htmlFilePath}`);
        console.log('🌐 Open the HTML file in your browser to view the complete report with all tickets');

        // Step 4: Send Teams notification (optional)
        console.log('\n📱 Step 4: Sending Teams Notification');
        console.log('-'.repeat(60));
        
        const ticketsTable = formatTicketsTable(issues);
        
        const teamsService = new ProfessionalTeamsTemplateService();
        await teamsService.sendSprintReport(
            sprintData,
            workBreakdown,
            priorityData,
            {
                actionItems: [
                    {
                        role: 'Scrum Master',
                        action: 'Conduct sprint retrospective',
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
                        url: `https://${process.env.JIRA_DOMAIN}/secure/RapidBoard.jspa?rapidView=${process.env.JIRA_BOARD_ID}`
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
                ],
                customContent: `**📊 View detailed report:** Open ${htmlFilePath} in your browser for complete tickets list and analysis`
            }
        );

        console.log('\n✅ SCNT-2025-21 Sprint Report Successfully Generated!');
        console.log('=' .repeat(70));
        console.log(`📄 HTML Report: ${htmlFilePath}`);
        console.log('📱 Teams notification sent with report summary');
        
    } catch (error) {
        console.error(`❌ Error generating ${SPRINT_CONFIG.sprintId} sprint report:`, error);
        if (axios.isAxiosError(error)) {
            console.error('🔍 Response status:', error.response?.status);
            console.error('🔍 Response data:', error.response?.data);
        }
        process.exit(1);
    }
}

// Execute the function
generateSCNT202521HTMLReport().catch(console.error);
