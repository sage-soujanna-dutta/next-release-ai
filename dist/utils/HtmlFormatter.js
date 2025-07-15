export class HtmlFormatter {
    theme;
    constructor(theme = "modern") {
        this.theme = theme;
    }
    format(jiraIssues, commits, sprintName) {
        const css = this.getThemeCSS();
        const sprintTitle = sprintName || `Sprint ${new Date().toISOString().split('T')[0]}`;
        const jiraContent = this.formatJiraIssues(jiraIssues);
        const commitsContent = this.formatCommits(commits);
        const summary = this.generateSummary(jiraIssues, commits, sprintTitle);
        const detailedStats = this.generateDetailedStats(jiraIssues, commits);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Release Notes - ${sprintTitle}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="header-content">
                <h1><i class="fas fa-rocket"></i> ${sprintTitle} - Release Notes</h1>
                <div class="header-meta">
                    <p class="date"><i class="fas fa-calendar"></i> Generated on ${new Date().toLocaleString()}</p>
                    <p class="project"><i class="fas fa-project-diagram"></i> Sage Connect Project</p>
                </div>
            </div>
        </header>
        
        ${summary}
        ${detailedStats}
        ${jiraContent}
        ${commitsContent}
        
        <footer class="footer">
            <div class="footer-content">
                <p><i class="fas fa-cog"></i> Generated automatically by Release MCP Server</p>
                <p><i class="fas fa-code-branch"></i> Repository: Sage/sage-connect</p>
                <p><i class="fas fa-jira"></i> JIRA Board: 6335</p>
            </div>
        </footer>
    </div>
    
    <script>
        // Add interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Expandable sections
            document.querySelectorAll('.expandable').forEach(section => {
                section.addEventListener('click', function() {
                    this.classList.toggle('expanded');
                });
            });
            
            // Smooth scroll for navigation
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
        });
    </script>
</body>
</html>
    `.trim();
    }
    formatForConfluence(jiraIssues, commits, sprintName) {
        const sprintTitle = sprintName || `Sprint ${new Date().toISOString().split('T')[0]}`;
        const jiraContent = this.formatJiraIssuesForConfluence(jiraIssues);
        const commitsContent = this.formatCommitsForConfluence(commits);
        const summary = this.generateSummaryForConfluence(jiraIssues, commits, sprintTitle);
        return `
<h1>🚀 ${sprintTitle} - Release Notes</h1>

<p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
<p><strong>Project:</strong> Sage Connect Project</p>

<hr/>

${summary}

<hr/>

${jiraContent}

<hr/>

${commitsContent}

<hr/>

<p><em>Generated automatically by Release MCP Server</em></p>
`;
    }
    generateSummary(jiraIssues, commits, sprintTitle) {
        const issueTypeCounts = this.getIssueTypeCounts(jiraIssues);
        const statusCounts = this.getStatusCounts(jiraIssues);
        return `
        <section class="summary">
            <h2><i class="fas fa-chart-pie"></i> Sprint Overview</h2>
            <div class="sprint-header">
                <h3>${sprintTitle}</h3>
                <p class="sprint-description">Comprehensive overview of deliverables, improvements, and technical achievements for this sprint cycle.</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card primary">
                    <div class="stat-icon"><i class="fas fa-tasks"></i></div>
                    <div class="stat-content">
                        <div class="stat-number">${jiraIssues.length}</div>
                        <div class="stat-label">Total Issues</div>
                        <div class="stat-sublabel">JIRA Tickets Processed</div>
                    </div>
                </div>
                <div class="stat-card secondary">
                    <div class="stat-icon"><i class="fas fa-code-branch"></i></div>
                    <div class="stat-content">
                        <div class="stat-number">${commits.length}</div>
                        <div class="stat-label">Code Commits</div>
                        <div class="stat-sublabel">Git Repository Changes</div>
                    </div>
                </div>
                <div class="stat-card success">
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-content">
                        <div class="stat-number">${statusCounts['Done'] || 0}</div>
                        <div class="stat-label">Completed</div>
                        <div class="stat-sublabel">Ready for Production</div>
                    </div>
                </div>
                <div class="stat-card info">
                    <div class="stat-icon"><i class="fas fa-list"></i></div>
                    <div class="stat-content">
                        <div class="stat-number">${Object.keys(issueTypeCounts).length}</div>
                        <div class="stat-label">Issue Types</div>
                        <div class="stat-sublabel">Categories Covered</div>
                    </div>
                </div>
            </div>
            
            ${Object.keys(issueTypeCounts).length > 0 ? `
            <div class="breakdown">
                <h3><i class="fas fa-pie-chart"></i> Issue Type Distribution</h3>
                <p class="breakdown-description">Breakdown of work items by category, showing the scope and focus areas of this sprint.</p>
                <div class="breakdown-items">
                    ${Object.entries(issueTypeCounts).map(([type, count]) => `<div class="breakdown-item">
                            <span class="breakdown-icon">${this.getIssueTypeIcon(type)}</span>
                            <span class="breakdown-text"><strong>${type}</strong>: ${count} ${count === 1 ? 'item' : 'items'}</span>
                            <span class="breakdown-percentage">${Math.round((count / jiraIssues.length) * 100)}%</span>
                        </div>`).join('')}
                </div>
            </div>
            ` : ''}
        </section>
    `;
    }
    generateSummaryForConfluence(jiraIssues, commits, sprintTitle) {
        const totalIssues = jiraIssues.length;
        const totalCommits = commits.length;
        const issuesByType = jiraIssues.reduce((acc, issue) => {
            const type = issue.fields.issuetype.name;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        const issuesByStatus = jiraIssues.reduce((acc, issue) => {
            const status = issue.fields.status.name;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        let summary = `
<h2>📊 Release Summary</h2>

<table>
  <tr>
    <th>Metric</th>
    <th>Count</th>
  </tr>
  <tr>
    <td><strong>Total JIRA Issues</strong></td>
    <td>${totalIssues}</td>
  </tr>
  <tr>
    <td><strong>Total Commits</strong></td>
    <td>${totalCommits}</td>
  </tr>
</table>

<h3>Issues by Type</h3>
<table>
  <tr>
    <th>Type</th>
    <th>Count</th>
  </tr>`;
        for (const [type, count] of Object.entries(issuesByType)) {
            summary += `
  <tr>
    <td>${type}</td>
    <td>${count}</td>
  </tr>`;
        }
        summary += `
</table>

<h3>Issues by Status</h3>
<table>
  <tr>
    <th>Status</th>
    <th>Count</th>
  </tr>`;
        for (const [status, count] of Object.entries(issuesByStatus)) {
            summary += `
  <tr>
    <td>${status}</td>
    <td>${count}</td>
  </tr>`;
        }
        summary += `
</table>`;
        return summary;
    }
    formatJiraIssues(issues) {
        if (issues.length === 0) {
            return '<section class="section"><h2>📋 JIRA Issues</h2><p class="no-items">No JIRA issues found for this release.</p></section>';
        }
        const groupedIssues = this.groupIssuesByType(issues);
        let content = '<section class="section"><h2>📋 JIRA Issues</h2>';
        Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
            content += `
        <div class="issue-type-section">
            <h3>${this.getIssueTypeIcon(type)} ${type}s</h3>
            <div class="issues-list">
                ${typeIssues.map(issue => this.formatJiraIssue(issue)).join('')}
            </div>
        </div>
      `;
        });
        content += '</section>';
        return content;
    }
    formatJiraIssuesForConfluence(issues) {
        if (issues.length === 0) {
            return `
<h2>📋 JIRA Issues</h2>
<p><em>No JIRA issues found for this release.</em></p>`;
        }
        const issuesByType = issues.reduce((acc, issue) => {
            const type = issue.fields.issuetype.name;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(issue);
            return acc;
        }, {});
        let content = `<h2>📋 JIRA Issues (${issues.length} total)</h2>`;
        for (const [type, typeIssues] of Object.entries(issuesByType)) {
            content += `
<h3>${this.getIssueTypeIconForConfluence(type)} ${type} (${typeIssues.length})</h3>

<table>
  <tr>
    <th>Key</th>
    <th>Summary</th>
    <th>Status</th>
    <th>Assignee</th>
    <th>Priority</th>
  </tr>`;
            for (const issue of typeIssues) {
                const status = issue.fields.status.name;
                const priority = issue.fields.priority?.name || 'Not Set';
                const assignee = issue.fields.assignee?.displayName || 'Unassigned';
                const statusColor = this.getStatusColorForConfluence(status);
                const priorityIcon = this.getPriorityIconForConfluence(priority);
                const issueUrl = `https://${process.env.JIRA_DOMAIN}/browse/${issue.key}`;
                content += `
  <tr>
    <td><a href="${issueUrl}">${issue.key}</a></td>
    <td>${issue.fields.summary}</td>
    <td><span style="background-color: ${statusColor}; padding: 2px 6px; border-radius: 4px; color: white; font-size: 12px;">${status}</span></td>
    <td>${assignee}</td>
    <td>${priorityIcon} ${priority}</td>
  </tr>`;
            }
            content += `</table>`;
        }
        return content;
    }
    generateDetailedStats(jiraIssues, commits) {
        const statusCounts = this.getStatusCounts(jiraIssues);
        const priorityCounts = this.getPriorityCounts(jiraIssues);
        const authorCounts = this.getAuthorCounts(commits);
        return `
        <section class="detailed-stats">
            <h2><i class="fas fa-analytics"></i> Detailed Analytics</h2>
            
            <div class="stats-row">
                <div class="stats-column">
                    <h3><i class="fas fa-traffic-light"></i> Status Distribution</h3>
                    <div class="status-chart">
                        ${Object.entries(statusCounts).map(([status, count]) => `
                            <div class="status-item">
                                <div class="status-bar">
                                    <div class="status-fill ${this.getStatusClass(status)}" 
                                         style="width: ${(count / jiraIssues.length) * 100}%"></div>
                                </div>
                                <div class="status-info">
                                    <span class="status-name">${status}</span>
                                    <span class="status-count">${count}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="stats-column">
                    <h3><i class="fas fa-exclamation-triangle"></i> Priority Breakdown</h3>
                    <div class="priority-chart">
                        ${Object.entries(priorityCounts).map(([priority, count]) => `
                            <div class="priority-item">
                                <span class="priority-icon">${this.getPriorityIcon(priority)}</span>
                                <span class="priority-name">${priority}</span>
                                <span class="priority-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="stats-row">
                <div class="stats-column full-width">
                    <h3><i class="fas fa-users"></i> Top Contributors</h3>
                    <div class="contributors-chart">
                        ${Object.entries(authorCounts).slice(0, 5).map(([author, count]) => `
                            <div class="contributor-item">
                                <div class="contributor-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="contributor-info">
                                    <span class="contributor-name">${author}</span>
                                    <span class="contributor-commits">${count} ${count === 1 ? 'commit' : 'commits'}</span>
                                </div>
                                <div class="contributor-bar">
                                    <div class="contributor-fill" style="width: ${(count / Math.max(...Object.values(authorCounts))) * 100}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </section>
    `;
    }
    formatCommits(commits) {
        if (commits.length === 0) {
            return '<section class="section"><h2>📦 Commits</h2><p class="no-items">No commits found for this release.</p></section>';
        }
        return `
        <section class="section">
            <h2>📦 Commits</h2>
            <div class="commits-list">
                ${commits.map(commit => `
                    <div class="commit-item">
                        <div class="commit-header">
                            <span class="commit-sha">${commit.sha.substring(0, 8)}</span>
                            <span class="commit-author">${commit.author}</span>
                            <span class="commit-date">${new Date(commit.date).toLocaleDateString()}</span>
                        </div>
                        <div class="commit-message">${commit.message}</div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
    }
    formatCommitsForConfluence(commits) {
        if (commits.length === 0) {
            return `
<h2>💻 Recent Commits</h2>
<p><em>No recent commits found for this release.</em></p>`;
        }
        let content = `
<h2>💻 Recent Commits (${commits.length} total)</h2>
<p><em>Commits from the last 8 days</em></p>

<table>
  <tr>
    <th>SHA</th>
    <th>Message</th>
    <th>Author</th>
    <th>Date</th>
  </tr>`;
        for (const commit of commits.slice(0, 20)) { // Limit to 20 commits for readability
            const shortSha = commit.sha.substring(0, 8);
            const date = new Date(commit.date).toLocaleDateString();
            content += `
  <tr>
    <td><code>${shortSha}</code></td>
    <td>${commit.message}</td>
    <td>${commit.author}</td>
    <td>${date}</td>
  </tr>`;
        }
        content += `</table>`;
        if (commits.length > 20) {
            content += `<p><em>... and ${commits.length - 20} more commits</em></p>`;
        }
        return content;
    }
    formatJiraIssue(issue) {
        const statusClass = this.getStatusClass(issue.fields.status.name);
        const priorityIcon = this.getPriorityIcon(issue.fields.priority?.name);
        return `
        <div class="issue-item">
            <div class="issue-header">
                <a href="https://${process.env.JIRA_DOMAIN}/browse/${issue.key}" 
                   class="issue-key" target="_blank">${issue.key}</a>
                <span class="issue-status ${statusClass}">${issue.fields.status.name}</span>
                ${priorityIcon ? `<span class="priority-icon">${priorityIcon}</span>` : ''}
            </div>
            <div class="issue-summary">${issue.fields.summary}</div>
            ${issue.fields.assignee ? `<div class="issue-assignee">👤 ${issue.fields.assignee.displayName}</div>` : ''}
        </div>
    `;
    }
    groupIssuesByType(issues) {
        return issues.reduce((groups, issue) => {
            const type = issue.fields.issuetype.name;
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(issue);
            return groups;
        }, {});
    }
    getIssueTypeCounts(issues) {
        return issues.reduce((counts, issue) => {
            const type = issue.fields.issuetype.name;
            counts[type] = (counts[type] || 0) + 1;
            return counts;
        }, {});
    }
    getStatusCounts(issues) {
        return issues.reduce((counts, issue) => {
            const status = issue.fields.status.name;
            counts[status] = (counts[status] || 0) + 1;
            return counts;
        }, {});
    }
    getPriorityCounts(issues) {
        return issues.reduce((counts, issue) => {
            const priority = issue.fields.priority?.name || "No Priority";
            counts[priority] = (counts[priority] || 0) + 1;
            return counts;
        }, {});
    }
    getAuthorCounts(commits) {
        return commits.reduce((counts, commit) => {
            const author = commit.author || "Unknown";
            counts[author] = (counts[author] || 0) + 1;
            return counts;
        }, {});
    }
    getIssueTypeIcon(type) {
        const typeMap = {
            'Bug': '<i class="fas fa-bug" style="color: #e53e3e;"></i>',
            'Story': '<i class="fas fa-book" style="color: #3182ce;"></i>',
            'Task': '<i class="fas fa-tasks" style="color: #38a169;"></i>',
            'Epic': '<i class="fas fa-mountain" style="color: #805ad5;"></i>',
            'Sub-task': '<i class="fas fa-list-ul" style="color: #718096;"></i>',
            'Improvement': '<i class="fas fa-tools" style="color: #f6ad55;"></i>',
            'New Feature': '<i class="fas fa-plus-circle" style="color: #9f7aea;"></i>'
        };
        return typeMap[type] || '<i class="fas fa-circle" style="color: #718096;"></i>';
    }
    getStatusClass(status) {
        const statusMap = {
            'Done': 'success',
            'Completed': 'success',
            'Closed': 'success',
            'In Progress': 'warning',
            'Testing': 'info',
            'Review': 'info',
            'To Do': 'secondary',
            'Open': 'secondary',
            'Blocked': 'danger'
        };
        return statusMap[status] || 'secondary';
    }
    getPriorityIcon(priority) {
        if (!priority)
            return "";
        const priorityMap = {
            'Highest': '<i class="fas fa-exclamation-triangle" style="color: #e53e3e;"></i>',
            'High': '<i class="fas fa-arrow-up" style="color: #f56565;"></i>',
            'Medium': '<i class="fas fa-minus" style="color: #ed8936;"></i>',
            'Low': '<i class="fas fa-arrow-down" style="color: #38b2ac;"></i>',
            'Lowest': '<i class="fas fa-angle-double-down" style="color: #4299e1;"></i>'
        };
        return priorityMap[priority] || "";
    }
    getThemeCSS() {
        const baseCSS = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 3rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.1;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 800;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header-meta {
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }
        
        .header-meta p {
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            margin: 0;
        }
        
        .date, .project {
            opacity: 0.95;
            font-size: 1rem;
            font-weight: 500;
        }
        
        .section {
            background: white;
            margin-bottom: 2rem;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        
        .section h2 {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            color: #2d3748;
            border-bottom: 3px solid #667eea;
            padding-bottom: 0.5rem;
        }
        
        .summary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            margin-bottom: 2rem;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .summary h2 {
            color: white;
            border-bottom: 3px solid rgba(255,255,255,0.3);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .stat-card {
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 48px rgba(0,0,0,0.15);
        }
        
        .stat-card.primary { border-left: 5px solid #667eea; }
        .stat-card.secondary { border-left: 5px solid #764ba2; }
        .stat-card.success { border-left: 5px solid #48bb78; }
        .stat-card.info { border-left: 5px solid #4299e1; }
        
        .stat-icon {
            font-size: 2.5rem;
            color: #667eea;
            min-width: 60px;
        }
        
        .stat-content {
            text-align: left;
            flex: 1;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #2d3748;
            line-height: 1;
        }
        
        .stat-label {
            font-size: 1.1rem;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 0.25rem;
        }
        
        .stat-sublabel {
            font-size: 0.9rem;
            color: #718096;
            opacity: 0.8;
        }
        
        .breakdown {
            margin-top: 1.5rem;
        }
        
        .breakdown h3 {
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }
        
        .breakdown-items {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .breakdown-item {
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
        }
        
        .issue-type-section {
            margin-bottom: 2rem;
        }
        
        .issue-type-section h3 {
            font-size: 1.4rem;
            margin-bottom: 1rem;
            color: #4a5568;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .issues-list, .commits-list {
            display: grid;
            gap: 1rem;
        }
        
        .issue-item, .commit-item {
            padding: 1.5rem;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: all 0.2s ease;
        }
        
        .issue-item:hover, .commit-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .issue-header, .commit-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }
        
        .issue-key, .commit-sha {
            font-weight: bold;
            color: #667eea;
            text-decoration: none;
            font-family: monospace;
            background: #e2e8f0;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }
        
        .issue-key:hover, .commit-sha:hover {
            background: #cbd5e0;
        }
        
        .issue-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-done { background: #c6f6d5; color: #22543d; }
        .status-progress { background: #fed7d7; color: #742a2a; }
        .status-todo { background: #e2e8f0; color: #2d3748; }
        .status-testing { background: #fef5e7; color: #744210; }
        .status-review { background: #e6fffa; color: #234e52; }
        .status-default { background: #e2e8f0; color: #4a5568; }
        
        .issue-summary, .commit-message {
            font-size: 1rem;
            color: #2d3748;
            margin-bottom: 0.5rem;
        }
        
        .issue-assignee, .commit-author, .commit-date {
            font-size: 0.9rem;
            color: #718096;
        }
        
        .priority-icon {
            font-size: 1rem;
        }
        
        .no-items {
            text-align: center;
            color: #718096;
            font-style: italic;
            padding: 2rem;
        }
        
        .footer {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            color: #718096;
            font-size: 0.9rem;
        }
        
        .sprint-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        
        .sprint-header h3 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .sprint-description {
            font-size: 1.1rem;
            opacity: 0.9;
            line-height: 1.6;
        }
        
        .detailed-stats {
            background: white;
            margin-bottom: 2rem;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        
        .stats-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
        }
        
        .stats-row:last-child {
            margin-bottom: 0;
        }
        
        .stats-column {
            background: #f8fafc;
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        
        .stats-column.full-width {
            grid-column: 1 / -1;
        }
        
        .stats-column h3 {
            font-size: 1.4rem;
            margin-bottom: 1.5rem;
            color: #2d3748;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .status-chart, .priority-chart, .contributors-chart {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .status-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .status-bar {
            flex: 1;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .status-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .status-fill.status-done { background: #48bb78; }
        .status-fill.status-progress { background: #ed8936; }
        .status-fill.status-todo { background: #718096; }
        .status-fill.status-testing { background: #4299e1; }
        .status-fill.status-review { background: #9f7aea; }
        .status-fill.status-default { background: #a0aec0; }
        
        .status-info {
            display: flex;
            flex-direction: column;
            min-width: 120px;
            text-align: right;
        }
        
        .status-name {
            font-weight: 600;
            color: #2d3748;
        }
        
        .status-count {
            font-size: 0.9rem;
            color: #718096;
        }
        
        .priority-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .priority-icon {
            font-size: 1.2rem;
            min-width: 24px;
        }
        
        .priority-name {
            flex: 1;
            font-weight: 500;
            color: #2d3748;
        }
        
        .priority-count {
            font-weight: 600;
            color: #667eea;
            background: #edf2f7;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.9rem;
        }
        
        .contributor-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .contributor-avatar {
            width: 40px;
            height: 40px;
            background: #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
        }
        
        .contributor-info {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .contributor-name {
            font-weight: 600;
            color: #2d3748;
        }
        
        .contributor-commits {
            font-size: 0.9rem;
            color: #718096;
        }
        
        .contributor-bar {
            width: 100px;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .contributor-fill {
            height: 100%;
            background: #667eea;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
    `;
        return baseCSS;
    }
    getStatusColor(status) {
        const statusColors = {
            'Done': '#22543d',
            'In Progress': '#742a2a',
            'To Do': '#2d3748',
            'Testing': '#744210',
            'Code Review': '#234e52',
            'default': '#4a5568'
        };
        return statusColors[status] || statusColors['default'];
    }
    getPriorityIconForConfluence(priority) {
        const priorityIcons = {
            'Highest': '🔴',
            'High': '🟠',
            'Medium': '🟡',
            'Low': '🟢',
            'Lowest': '🔵'
        };
        return priorityIcons[priority] || '⚪';
    }
    getIssueTypeIconForConfluence(type) {
        const typeIcons = {
            'Bug': '🐛',
            'Story': '📖',
            'Task': '📋',
            'Epic': '🏆',
            'Improvement': '⚡',
            'Sub-task': '📝'
        };
        return typeIcons[type] || '📄';
    }
    getStatusColorForConfluence(status) {
        const statusColors = {
            'Done': '#22543d',
            'In Progress': '#742a2a',
            'To Do': '#2d3748',
            'Testing': '#744210',
            'Code Review': '#234e52',
            'default': '#4a5568'
        };
        return statusColors[status] || statusColors['default'];
    }
}
