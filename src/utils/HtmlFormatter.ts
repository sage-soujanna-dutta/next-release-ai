import { JiraIssue } from "../services/JiraService.js";
import { GitHubCommit } from "../services/GitHubService.js";

export class HtmlFormatter {
  private theme: string;

  constructor(theme: string = "modern") {
    this.theme = theme;
  }

  format(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName?: string, buildPipelineData?: any[]): string {
    const css = this.getThemeCSS();
    const sprintTitle = sprintName || `Sprint ${new Date().toISOString().split('T')[0]}`;
    const jiraContent = this.formatJiraIssues(jiraIssues);
    const commitsContent = this.formatCommits(commits);
    const summary = this.generateSummary(jiraIssues, commits, sprintTitle);
    const detailedStats = this.generateDetailedStats(jiraIssues, commits);
    const aiSummary = this.generateAISummary(jiraIssues, commits, sprintTitle);
    const conclusion = this.generateConclusion(jiraIssues, commits, sprintTitle);
    const buildPipelineContent = this.formatBuildPipelines(buildPipelineData || [], sprintTitle);

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
        
        ${aiSummary}
        ${summary}
        ${detailedStats}
        ${conclusion}
        ${buildPipelineContent}
        ${jiraContent}
        ${commitsContent}
        
        <footer class="footer">
            <div class="footer-content">
                <p><i class="fas fa-cog"></i> Generated automatically by Release MCP Server</p>
                <p><i class="fas fa-code-branch"></i> Repository: Sage/sage-connect</p>
                <p><i class="fas fa-jira"></i> JIRA Board: ${process.env.JIRA_BOARD_ID || '6306'}</p>
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
            
            // Animate stat numbers
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const finalValue = parseInt(stat.textContent);
                let currentValue = 0;
                const increment = finalValue / 30;
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        currentValue = finalValue;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(currentValue);
                }, 50);
            });
        });
    </script>
</body>
</html>
    `.trim();
  }

  formatForConfluence(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName?: string, buildPipelineData?: any[]): string {
    const sprintTitle = sprintName || `Sprint ${new Date().toISOString().split('T')[0]}`;
    const jiraContent = this.formatJiraIssuesForConfluence(jiraIssues);
    const commitsContent = this.formatCommitsForConfluence(commits);
    const summary = this.generateSummaryForConfluence(jiraIssues, commits, sprintTitle);
    const aiSummary = this.generateAISummaryForConfluence(jiraIssues, commits, sprintTitle);
    const conclusion = this.generateConclusionForConfluence(jiraIssues, commits, sprintTitle);
    const buildPipelineContent = this.formatBuildPipelinesForConfluence(buildPipelineData || [], sprintTitle);

    return `
<div class="release-notes-confluence">
<h1>🚀 ${sprintTitle} - Release Notes</h1>

<div class="header-info">
<p><strong>📅 Generated on:</strong> ${new Date().toLocaleString()}</p>
<p><strong>🎯 Project:</strong> Sage Connect</p>
<p><strong>📊 Sprint Summary:</strong> ${jiraIssues.length} issues • ${commits.length} commits • ${jiraIssues.filter(i => i.fields.status.name === 'Done').length} completed</p>
</div>

<ac:structured-macro ac:name="panel" ac:schema-version="1">
<ac:parameter ac:name="bgColor">#E8F5FF</ac:parameter>
<ac:parameter ac:name="titleBGColor">#3C86F4</ac:parameter>
<ac:parameter ac:name="titleColor">#FFFFFF</ac:parameter>
<ac:parameter ac:name="title">🤖 AI-Generated Sprint Insights</ac:parameter>
<ac:rich-text-body>
${aiSummary}
</ac:rich-text-body>
</ac:structured-macro>

<hr/>

${summary}

<hr/>

${jiraContent}

<hr/>

${commitsContent}

<hr/>

<ac:structured-macro ac:name="panel" ac:schema-version="1">
<ac:parameter ac:name="bgColor">#F0F0FF</ac:parameter>
<ac:parameter ac:name="titleBGColor">#7D4CFF</ac:parameter>
<ac:parameter ac:name="titleColor">#FFFFFF</ac:parameter>
<ac:parameter ac:name="title">🎯 Sprint Conclusion & Next Steps</ac:parameter>
<ac:rich-text-body>
${conclusion}
</ac:rich-text-body>
</ac:structured-macro>

<hr/>

${buildPipelineContent}

<div class="footer-info">
<p><em>🤖 Generated automatically by Release MCP Server</em></p>
<p><em>📊 Repository: Sage/sage-connect • 📋 JIRA Board: ${process.env.JIRA_BOARD_ID || '6306'}</em></p>
</div>
</div>
`;
  }

  private generateSummary(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintTitle: string): string {
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
                    ${Object.entries(issueTypeCounts).map(([type, count]) => 
                        `<div class="breakdown-item">
                            <span class="breakdown-icon">${this.getIssueTypeIcon(type)}</span>
                            <span class="breakdown-text"><strong>${type}</strong>: ${count} ${count === 1 ? 'item' : 'items'}</span>
                            <span class="breakdown-percentage">${Math.round((count / jiraIssues.length) * 100)}%</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
        </section>
    `;
  }

  private generateSummaryForConfluence(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintTitle: string): string {
    const totalIssues = jiraIssues.length;
    const totalCommits = commits.length;
    const completedIssues = jiraIssues.filter(i => i.fields.status.name === 'Done').length;
    
    const issuesByType = jiraIssues.reduce((acc, issue) => {
      const type = issue.fields.issuetype.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByStatus = jiraIssues.reduce((acc, issue) => {
      const status = issue.fields.status.name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate contributors from commits
    const contributors = [...new Set(commits.map(c => c.author))];

    let summary = `
<h2>📊 Release Summary</h2>

<table>
  <tr>
    <th style="width: 60%; text-align: left;">📋 Metric</th>
    <th style="width: 25%; text-align: center;">📈 Count</th>
    <th style="width: 15%; text-align: center;">📊 %</th>
  </tr>
  <tr>
    <td>🎯 <strong>Total JIRA Issues</strong></td>
    <td style="text-align: center; font-weight: bold; color: #2684FF;">${totalIssues}</td>
    <td style="text-align: center;">100%</td>
  </tr>
  <tr>
    <td>✅ <strong>Completed Issues</strong></td>
    <td style="text-align: center; font-weight: bold; color: #00875A;">${completedIssues}</td>
    <td style="text-align: center;">${totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0}%</td>
  </tr>
  <tr>
    <td>💻 <strong>Total Commits</strong></td>
    <td style="text-align: center; font-weight: bold; color: #6554C0;">${totalCommits}</td>
    <td style="text-align: center;">-</td>
  </tr>
  <tr>
    <td>👥 <strong>Contributors</strong></td>
    <td style="text-align: center; font-weight: bold; color: #FF5630;">${contributors.length}</td>
    <td style="text-align: center;">-</td>
  </tr>
</table>

<h3>🏷️ Issues by Type</h3>
<table>
  <tr>
    <th style="width: 60%; text-align: left;">📝 Issue Type</th>
    <th style="width: 25%; text-align: center;">📊 Count</th>
    <th style="width: 15%; text-align: center;">📈 Percentage</th>
  </tr>`;

    for (const [type, count] of Object.entries(issuesByType)) {
      const percentage = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
      const typeIcon = this.getIssueTypeIconForConfluence(type);
      summary += `
  <tr>
    <td>${typeIcon} <strong>${type}</strong></td>
    <td style="text-align: center; font-weight: bold;">${count}</td>
    <td style="text-align: center;">${percentage}%</td>
  </tr>`;
    }

    summary += `
</table>

<h3>🚦 Issues by Status</h3>
<table>
  <tr>
    <th style="width: 60%; text-align: left;">🏃 Status</th>
    <th style="width: 25%; text-align: center;">📊 Count</th>
    <th style="width: 15%; text-align: center;">📈 Percentage</th>
  </tr>`;

    for (const [status, count] of Object.entries(issuesByStatus)) {
      const percentage = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
      const statusIcon = this.getStatusIconForConfluence(status);
      summary += `
  <tr>
    <td>${statusIcon} <strong>${status}</strong></td>
    <td style="text-align: center; font-weight: bold;">${count}</td>
    <td style="text-align: center;">${percentage}%</td>
  </tr>`;
    }

    summary += `
</table>`;

    return summary;
  }

  private formatJiraIssues(issues: JiraIssue[]): string {
    if (issues.length === 0) {
      return '<section class="section"><h2>📋 JIRA Issues</h2><p class="no-items">No JIRA issues found for this release.</p></section>';
    }

    const groupedByComponent = this.groupIssuesByComponent(issues);
    
    let content = `
    <section class="section">
        <h2>📋 JIRA Issues</h2>
        <div class="issues-overview">
            <p class="section-subtitle">Issues organized by component and type for better visibility</p>
        </div>
    `;
    
    Object.entries(groupedByComponent).forEach(([component, componentIssues]) => {
      const issuesByType = this.groupIssuesByType(componentIssues);
      
      content += `
        <div class="component-section">
            <div class="component-header">
                <h3><i class="fas fa-cube"></i> ${component}</h3>
                <span class="component-count">${componentIssues.length} issue${componentIssues.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div class="issues-by-type">
                ${Object.entries(issuesByType).map(([type, typeIssues]) => `
                    <div class="issue-type-group">
                        <div class="type-header">
                            <span class="type-icon">${this.getIssueTypeIcon(type)}</span>
                            <span class="type-name">${type}s</span>
                            <span class="type-count">${typeIssues.length}</span>
                        </div>
                        
                        <div class="issues-list">
                            ${typeIssues.map(issue => this.formatJiraIssueCard(issue)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
      `;
    });
    
    content += '</section>';
    return content;
  }

  private formatJiraIssuesForConfluence(issues: JiraIssue[]): string {
    if (issues.length === 0) {
      return `
<h2>📋 JIRA Issues</h2>
<p><em>No JIRA issues found for this release.</em></p>`;
    }

    // Group by component first, then by type
    const groupedByComponent = this.groupIssuesByComponent(issues);

    let content = `<h2>📋 JIRA Issues (${issues.length} total)</h2>`;
    content += `<p><em>Issues organized by component and type for better visibility</em></p>`;

    // Process each component
    for (const [component, componentIssues] of Object.entries(groupedByComponent)) {
      content += `
<h3>🏗️ ${component} Component (${componentIssues.length} issues)</h3>`;

      // Group by issue type within the component
      const issuesByType = componentIssues.reduce((acc, issue) => {
        const type = issue.fields.issuetype.name;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(issue);
        return acc;
      }, {} as Record<string, JiraIssue[]>);

      // Create a table for each issue type within the component
      for (const [type, typeIssues] of Object.entries(issuesByType)) {
        content += `
<h4>${this.getIssueTypeIconForConfluence(type)} ${type} Issues (${typeIssues.length})</h4>

<table>
  <tr>
    <th style="width: 15%; text-align: left;">🔑 Key</th>
    <th style="width: 40%; text-align: left;">📝 Summary</th>
    <th style="width: 15%; text-align: center;">🚦 Status</th>
    <th style="width: 15%; text-align: center;">👤 Assignee</th>
    <th style="width: 15%; text-align: center;">⚡ Priority</th>
  </tr>`;

        for (const issue of typeIssues) {
          const status = issue.fields.status.name;
          const priority = issue.fields.priority?.name || 'Not Set';
          const assignee = issue.fields.assignee?.displayName || 'Unassigned';
          const statusIcon = this.getStatusIconForConfluence(status);
          const priorityIcon = this.getPriorityIconForConfluence(priority);
          const issueUrl = `https://${process.env.JIRA_DOMAIN}/browse/${issue.key}`;
          
          content += `
  <tr>
    <td><strong><a href="${issueUrl}">${issue.key}</a></strong></td>
    <td>${issue.fields.summary}</td>
    <td style="text-align: center;">${statusIcon} <strong>${status}</strong></td>
    <td style="text-align: center;">👤 ${assignee}</td>
    <td style="text-align: center;">${priorityIcon} <strong>${priority}</strong></td>
  </tr>`;
        }

        content += `</table><br/>`;
      }

      content += `<hr/>`; // Separator between components
    }

    return content;
  }

  private generateDetailedStats(jiraIssues: JiraIssue[], commits: GitHubCommit[]): string {
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
                        ${Object.entries(authorCounts)
                            .sort(([,a], [,b]) => (b as number) - (a as number))
                            .slice(0, 5)
                            .map(([author, count]) => `
                            <div class="contributor-item">
                                <div class="contributor-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="contributor-info">
                                    <span class="contributor-name">${author}</span>
                                    <span class="contributor-commits">${count} ${count === 1 ? 'commit' : 'commits'}</span>
                                </div>
                                <div class="contributor-bar">
                                    <div class="contributor-fill" style="width: ${((count as number) / Math.max(...Object.values(authorCounts) as number[])) * 100}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </section>
    `;
  }

  private formatCommits(commits: GitHubCommit[]): string {
    if (commits.length === 0) {
      return '<section class="section"><h2>📦 Commits</h2><p class="no-items">No commits found for this release.</p></section>';
    }

    return `
        <section class="section">
            <h2>📦 Commits</h2>
            <div class="commits-overview">
                <p class="section-subtitle">Recent development activity and code changes</p>
                <div class="commits-stats">
                    <span class="commit-stat">
                        <i class="fas fa-code-branch"></i>
                        ${commits.length} total commits
                    </span>
                    <span class="commit-stat">
                        <i class="fas fa-users"></i>
                        ${new Set(commits.map(c => c.author).filter(author => author && author !== 'Unknown')).size} contributors
                    </span>
                </div>
            </div>
            
            <div class="commits-list">
                ${commits.map(commit => this.formatCommitCard(commit)).join('')}
            </div>
        </section>
    `;
  }

  private formatCommitCard(commit: GitHubCommit): string {
    const commitDate = new Date(commit.date);
    const timeAgo = this.getTimeAgo(commitDate);
    
    return `
        <div class="commit-card">
            <div class="commit-card-header">
                <div class="commit-meta">
                    <a href="${commit.url}" class="commit-sha" target="_blank">
                        <i class="fas fa-code"></i>
                        ${commit.sha.substring(0, 8)}
                    </a>
                    <span class="commit-date">
                        <i class="fas fa-clock"></i>
                        ${timeAgo}
                    </span>
                    <span class="commit-author">
                        <i class="fas fa-user-circle"></i>
                        ${commit.author}
                    </span>
                </div>
            </div>
            
            <div class="commit-card-body">
                <p class="commit-message">${this.formatCommitMessage(commit.message)}</p>
            </div>
        </div>
    `;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  private formatCommitMessage(message: string): string {
    // Truncate long commit messages and add ellipsis
    const maxLength = 120;
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + '...';
    }
    return message;
  }

  private formatCommitsForConfluence(commits: GitHubCommit[]): string {
    if (commits.length === 0) {
      return `
<h2>💻 Recent Commits</h2>
<p><em>No recent commits found for this release.</em></p>`;
    }

    // Group commits by author for better organization
    const commitsByAuthor = commits.reduce((acc, commit) => {
      if (!acc[commit.author]) {
        acc[commit.author] = [];
      }
      acc[commit.author].push(commit);
      return acc;
    }, {} as Record<string, GitHubCommit[]>);

    const authors = Object.keys(commitsByAuthor);
    const displayCommits = commits; // Show ALL commits

    let content = `
<h2>💻 All Commits (${commits.length} total, ${authors.length} contributors)</h2>

<h3>👥 Contributor Summary</h3>
<table>
  <tr>
    <th style="width: 60%; text-align: left;">👤 Developer</th>
    <th style="width: 25%; text-align: center;">📊 Commits</th>
    <th style="width: 15%; text-align: center;">📈 %</th>
  </tr>`;

    for (const [author, authorCommits] of Object.entries(commitsByAuthor)) {
      const percentage = Math.round((authorCommits.length / commits.length) * 100);
      content += `
  <tr>
    <td>👨‍💻 <strong>${author}</strong></td>
    <td style="text-align: center; font-weight: bold;">${authorCommits.length}</td>
    <td style="text-align: center;">${percentage}%</td>
  </tr>`;
    }

    content += `
</table>

<h3>📝 Commit Details</h3>
<table>
  <tr>
    <th style="width: 15%; text-align: left;">🔗 SHA</th>
    <th style="width: 45%; text-align: left;">💬 Message</th>
    <th style="width: 25%; text-align: center;">👤 Author</th>
    <th style="width: 15%; text-align: center;">📅 Date</th>
  </tr>`;

    for (const commit of displayCommits) {
      const shortSha = commit.sha.substring(0, 8);
      const date = new Date(commit.date).toLocaleDateString();
      const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${commit.sha}`;
      
      content += `
  <tr>
    <td><strong><a href="${repoUrl}">${shortSha}</a></strong></td>
    <td>${commit.message}</td>
    <td style="text-align: center;">👨‍💻 ${commit.author}</td>
    <td style="text-align: center;">📅 ${date}</td>
  </tr>`;
    }

    content += `</table>`;

    // Show all commits now - no need for limitation message
    
    return content;
  }

  private formatJiraIssue(issue: JiraIssue): string {
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

  private formatJiraIssueCard(issue: JiraIssue): string {
    const statusClass = this.getStatusClass(issue.fields.status.name);
    const priorityIcon = this.getPriorityIcon(issue.fields.priority?.name);
    
    return `
        <div class="issue-card">
            <div class="issue-card-header">
                <div class="issue-key-group">
                    <a href="https://${process.env.JIRA_DOMAIN}/browse/${issue.key}" 
                       class="issue-key-link" target="_blank">
                        ${issue.key}
                    </a>
                    ${priorityIcon ? `<span class="priority-badge">${priorityIcon}</span>` : ''}
                </div>
                <span class="issue-status-badge ${statusClass}">${issue.fields.status.name}</span>
            </div>
            
            <div class="issue-card-body">
                <h4 class="issue-title">${issue.fields.summary}</h4>
                ${issue.fields.assignee ? `
                    <div class="issue-assignee">
                        <i class="fas fa-user"></i>
                        <span>${issue.fields.assignee.displayName}</span>
                    </div>
                ` : `
                    <div class="issue-assignee unassigned">
                        <i class="fas fa-user-slash"></i>
                        <span>Unassigned</span>
                    </div>
                `}
            </div>
        </div>
    `;
  }

  private groupIssuesByType(issues: JiraIssue[]): Record<string, JiraIssue[]> {
    return issues.reduce((groups, issue) => {
      const type = issue.fields.issuetype.name;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(issue);
      return groups;
    }, {} as Record<string, JiraIssue[]>);
  }

  private groupIssuesByComponent(issues: JiraIssue[]): Record<string, JiraIssue[]> {
    return issues.reduce((groups, issue) => {
      const component = issue.fields.components && issue.fields.components.length > 0 
        ? issue.fields.components[0].name 
        : 'No Component';
      
      if (!groups[component]) {
        groups[component] = [];
      }
      groups[component].push(issue);
      return groups;
    }, {} as Record<string, JiraIssue[]>);
  }

  private getIssueTypeCounts(issues: JiraIssue[]): Record<string, number> {
    return issues.reduce((counts, issue) => {
      const type = issue.fields.issuetype.name;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private getStatusCounts(issues: JiraIssue[]): Record<string, number> {
    return issues.reduce((counts, issue) => {
      const status = issue.fields.status.name;
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private getPriorityCounts(issues: JiraIssue[]): Record<string, number> {
    return issues.reduce((counts, issue) => {
      const priority = issue.fields.priority?.name || "No Priority";
      counts[priority] = (counts[priority] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private getAuthorCounts(commits: GitHubCommit[]): Record<string, number> {
    return commits.reduce((counts, commit) => {
      const author = commit.author || "Unknown";
      counts[author] = (counts[author] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private getIssueTypeIcon(type: string): string {
    const typeMap: Record<string, string> = {
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

  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
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

  private getPriorityIcon(priority?: string): string {
    if (!priority) return "";
    const priorityMap: Record<string, string> = {
      'Highest': '<i class="fas fa-exclamation-triangle" style="color: #e53e3e;"></i>',
      'High': '<i class="fas fa-arrow-up" style="color: #f56565;"></i>',
      'Medium': '<i class="fas fa-minus" style="color: #ed8936;"></i>',
      'Low': '<i class="fas fa-arrow-down" style="color: #38b2ac;"></i>',
      'Lowest': '<i class="fas fa-angle-double-down" style="color: #4299e1;"></i>'
    };
    return priorityMap[priority] || "";
  }

  private getThemeCSS(): string {
    const baseCSS = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #FFFFFF;
            background: linear-gradient(135deg, #0A0A0A 0%, #000000 100%);
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
            background: linear-gradient(135deg, #00DC64 0%, #7D4CFF 100%);
            color: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,220,100,0.3);
            position: relative;
            overflow: hidden;
            border: 2px solid #00DC64;
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
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 900;
            text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
            background: linear-gradient(45deg, #FFFFFF, #00DC64);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header-meta {
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }
        
        .header-meta p {
            background: rgba(0,220,100,0.3);
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            backdrop-filter: blur(15px);
            margin: 0;
            border: 1px solid rgba(0,220,100,0.5);
        }
        
        .date, .project {
            opacity: 0.95;
            font-size: 1rem;
            font-weight: 500;
        }
        
        .section {
            background: linear-gradient(145deg, #1a1a1a, #0A0A0A);
            margin-bottom: 2rem;
            padding: 2.5rem;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            border: 1px solid #333333;
            position: relative;
            overflow: hidden;
        }
        
        .section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #00DC64, #7D4CFF);
        }
        
        .section h2 {
            font-size: 2rem;
            margin-bottom: 2rem;
            color: #FFFFFF;
            border-bottom: 3px solid #00DC64;
            padding-bottom: 0.75rem;
            font-weight: 700;
        }
        
        .summary {
            background: linear-gradient(135deg, #000000 0%, #00DC64 50%, #7D4CFF 100%);
            color: white;
            margin-bottom: 2rem;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0,220,100,0.4);
            border: 2px solid #00DC64;
            position: relative;
            overflow: hidden;
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
            background: linear-gradient(145deg, #333333, #0A0A0A);
            padding: 2.5rem;
            border-radius: 20px;
            text-align: center;
            border: 2px solid #00DC64;
            box-shadow: 0 10px 40px rgba(0,220,100,0.2);
            transition: all 0.4s ease;
            display: flex;
            align-items: center;
            gap: 2rem;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0,220,100,0.2), transparent);
            transition: left 0.6s ease;
        }
        
        .stat-card:hover::before {
            left: 100%;
        }
        
        .stat-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 60px rgba(0,220,100,0.4);
            border-color: #7D4CFF;
        }
        
        .stat-card.primary { 
            border-left: 6px solid #00DC64;
            background: linear-gradient(145deg, #2a4a3a, #0A2A1A);
        }
        .stat-card.secondary { 
            border-left: 6px solid #3C86F4;
            background: linear-gradient(145deg, #2a3a4a, #0A1A2A);
        }
        .stat-card.success { 
            border-left: 6px solid #00DC64;
            background: linear-gradient(145deg, #3a4a2a, #0A2A1A);
        }
        .stat-card.info { 
            border-left: 6px solid #3C86F4;
            background: linear-gradient(145deg, #2a3a4a, #0A1A2A);
        }
        
        .stat-icon {
            font-size: 3rem;
            color: #00DC64;
            min-width: 80px;
            text-shadow: 0 0 20px rgba(0,220,100,0.5);
            animation: iconGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes iconGlow {
            from { text-shadow: 0 0 20px rgba(0,220,100,0.5); }
            to { text-shadow: 0 0 30px rgba(0,220,100,0.8), 0 0 40px rgba(0,220,100,0.3); }
        }
        
        .stat-content {
            text-align: left;
            flex: 1;
        }
        
        .stat-number {
            font-size: 3rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            color: #FFFFFF;
            line-height: 1;
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
        
        .stat-label {
            font-size: 1.2rem;
            font-weight: 700;
            color: #00DC64;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-sublabel {
            font-size: 0.9rem;
            color: #CCCCCC;
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
        
        .status-done { background: #00DC64; color: #FFFFFF; }
        .status-progress { background: #3C86F4; color: #FFFFFF; }
        .status-todo { background: #CCCCCC; color: #000000; }
        .status-testing { background: #7D4CFF; color: #FFFFFF; }
        .status-review { background: #00DC64; color: #000000; }
        .status-default { background: #CCCCCC; color: #000000; }
        
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
            color: #CCCCCC;
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

        /* AI Summary and Analysis Styles */
        .ai-summary {
            background: linear-gradient(135deg, #0A1A0A, #1A2A1A);
            border: 2px solid #3C86F4;
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(60,134,244,0.2);
        }
        
        .ai-summary h3 {
            color: #3C86F4;
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .ai-insights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .insight-card {
            background: linear-gradient(145deg, #333333, #0A0A0A);
            border: 1px solid #3C86F4;
            border-radius: 15px;
            padding: 1.5rem;
            transition: all 0.3s ease;
        }
        
        .insight-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,126,69,0.3);
        }
        
        .insight-card h4 {
            color: #3C86F4;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #3C86F4;
            padding-bottom: 0.5rem;
        }
        
        .insight-card p {
            color: #e2e8f0;
            line-height: 1.6;
        }
        
        .sprint-conclusion {
            background: linear-gradient(135deg, #1A0A2A, #2A1A3A);
            border: 2px solid #7D4CFF;
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(125,76,255,0.2);
        }
        
        .sprint-conclusion h3 {
            color: #7D4CFF;
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .key-achievements, .next-steps {
            background: linear-gradient(145deg, #333333, #0A0A0A);
            border: 1px solid #7D4CFF;
            border-radius: 15px;
            padding: 1.5rem;
            margin: 1rem 0;
        }
        
        .key-achievements h4, .next-steps h4 {
            color: #7D4CFF;
            font-size: 1.3rem;
            margin-bottom: 1rem;
        }
        
        .key-achievements ul, .next-steps ul {
            list-style: none;
            padding: 0;
        }
        
        .key-achievements li, .next-steps li {
            color: #e2e8f0;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(0,126,69,0.2);
        }
        
        .key-achievements li:last-child, .next-steps li:last-child {
            border-bottom: none;
        }

        /* Enhanced JIRA Issues Styles */
        .issues-overview {
            margin-bottom: 2rem;
        }

        .section-subtitle {
            color: #CCCCCC;
            font-size: 1rem;
            margin: 0;
            opacity: 0.8;
        }

        .component-section {
            background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid #333;
        }

        .component-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #00DC64;
        }

        .component-header h3 {
            color: #00DC64;
            margin: 0;
            font-size: 1.4rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .component-count {
            background: rgba(0,220,100,0.2);
            color: #00DC64;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .issues-by-type {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .issue-type-group {
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            padding: 1rem;
        }

        .type-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #333;
        }

        .type-icon {
            font-size: 1.2rem;
        }

        .type-name {
            color: #FFFFFF;
            font-weight: 600;
            flex: 1;
        }

        .type-count {
            background: rgba(255,255,255,0.1);
            color: #CCCCCC;
            padding: 0.25rem 0.5rem;
            border-radius: 8px;
            font-size: 0.8rem;
        }

        .issues-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1rem;
        }

        .issue-card {
            background: linear-gradient(145deg, #333333, #2a2a2a);
            border: 1px solid #444;
            border-radius: 12px;
            padding: 1rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .issue-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,220,100,0.15);
            border-color: #00DC64;
        }

        .issue-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
        }

        .issue-key-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .issue-key-link {
            color: #3C86F4;
            text-decoration: none;
            font-weight: 600;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            padding: 0.25rem 0.5rem;
            background: rgba(60,134,244,0.1);
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .issue-key-link:hover {
            background: rgba(60,134,244,0.2);
            color: #FFFFFF;
        }

        .priority-badge {
            font-size: 0.8rem;
        }

        .issue-status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .issue-card-body {
            margin-top: 0.75rem;
        }

        .issue-title {
            color: #FFFFFF;
            font-size: 0.95rem;
            line-height: 1.4;
            margin: 0 0 0.75rem 0;
            font-weight: 500;
        }

        .issue-assignee {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #CCCCCC;
            font-size: 0.85rem;
        }

        .issue-assignee.unassigned {
            color: #999;
            opacity: 0.7;
        }

        .issue-assignee i {
            color: #00DC64;
            font-size: 0.9rem;
        }

        .issue-assignee.unassigned i {
            color: #999;
        }

        /* Enhanced Commits Styles */
        .commits-overview {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
            border-radius: 12px;
            border: 1px solid #333;
        }

        .commits-stats {
            display: flex;
            gap: 2rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }

        .commit-stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #CCCCCC;
            font-size: 0.9rem;
        }

        .commit-stat i {
            color: #00DC64;
        }

        .commits-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .commit-card {
            background: linear-gradient(145deg, #333333, #2a2a2a);
            border: 1px solid #444;
            border-radius: 12px;
            padding: 1rem;
            transition: all 0.3s ease;
        }

        .commit-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0,220,100,0.1);
            border-color: #00DC64;
        }

        .commit-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .commit-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .commit-sha {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #3C86F4;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            background: rgba(60,134,244,0.1);
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .commit-sha:hover {
            background: rgba(60,134,244,0.2);
            color: #FFFFFF;
            transform: translateY(-1px);
        }

        .commit-date {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #CCCCCC;
            font-size: 0.8rem;
        }

        .commit-author {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #00DC64;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .commit-card-body {
            margin-top: 0.75rem;
        }

        .commit-message {
            color: #FFFFFF;
            line-height: 1.4;
            margin: 0;
            font-size: 0.9rem;
        }

        /* Build Pipeline Styles */
        .builds-overview {
            margin-bottom: 2rem;
        }

        .build-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }

        .pipelines-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .pipeline-latest-builds {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid rgba(255,255,255,0.1);
            margin-top: 1.5rem;
        }

        .pipeline-latest-builds h3 {
            color: #FFFFFF;
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .pipeline-name {
            font-weight: 600;
            color: #FFFFFF;
        }

        .pipeline-title {
            font-size: 0.9rem;
            color: #E0E7FF;
        }

        .build-count {
            background: rgba(60,134,244,0.2);
            color: #3C86F4;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .builds-table {
            overflow-x: auto;
        }

        .builds-table-content {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .builds-table-content th {
            color: #CCCCCC;
            text-align: left;
            padding: 0.75rem 0.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            font-weight: 500;
        }

        .builds-table-content td {
            padding: 0.75rem 0.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            color: #FFFFFF;
        }

        .build-row:hover {
            background: rgba(255,255,255,0.05);
        }

        .build-number {
            font-family: 'Courier New', monospace;
            font-weight: 600;
        }

        .build-id {
            color: #3C86F4;
        }

        .build-date {
            color: #CCCCCC;
            font-size: 0.85rem;
        }

        .branch-name {
            background: rgba(0,220,100,0.1);
            color: #00DC64;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .status-success {
            background: rgba(0,135,90,0.2);
            color: #00875A;
        }

        .status-failed {
            background: rgba(222,53,11,0.2);
            color: #DE350B;
        }

        .status-warning {
            background: rgba(255,139,0,0.2);
            color: #FF8B00;
        }

        .status-canceled {
            background: rgba(107,119,140,0.2);
            color: #6B778C;
        }

        .status-progress {
            background: rgba(0,82,204,0.2);
            color: #0052CC;
        }

        .status-pending {
            background: rgba(107,119,140,0.2);
            color: #6B778C;
        }

        .status-unknown {
            background: rgba(107,119,140,0.2);
            color: #6B778C;
        }

        .build-url {
            color: #3C86F4;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .build-url:hover {
            background: rgba(60,134,244,0.1);
            color: #FFFFFF;
        }
    `;
    
    return baseCSS;
  }

  private getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'Done': '#00DC64',
      'In Progress': '#3C86F4',
      'To Do': '#CCCCCC',
      'Testing': '#7D4CFF',
      'Code Review': '#00DC64',
      'default': '#CCCCCC'
    };
    return statusColors[status] || statusColors['default'];
  }

  private getPriorityIconForConfluence(priority: string): string {
    const priorityIcons: Record<string, string> = {
      'Highest': '🔴',
      'High': '🟠',
      'Medium': '🟡',
      'Low': '🟢',
      'Lowest': '🔵'
    };
    return priorityIcons[priority] || '⚪';
  }

  private getIssueTypeIconForConfluence(type: string): string {
    const typeIcons: Record<string, string> = {
      'Bug': '🐛',
      'Story': '📖',
      'Task': '📋',
      'Epic': '🏆',
      'Improvement': '⚡',
      'Sub-task': '📝'
    };
    return typeIcons[type] || '📄';
  }

  private getStatusColorForConfluence(status: string): string {
    const statusColors: Record<string, string> = {
      'Done': '#00DC64',
      'In Progress': '#3C86F4',
      'To Do': '#CCCCCC',
      'Testing': '#7D4CFF',
      'Code Review': '#00DC64',
      'default': '#CCCCCC'
    };
    return statusColors[status] || statusColors['default'];
  }

  private getStatusIconForConfluence(status: string): string {
    const statusIcons: Record<string, string> = {
      'Done': '✅',
      'In Progress': '🔄',
      'To Do': '📋',
      'Testing': '🧪',
      'Code Review': '👀',
      'Closed': '🔒',
      'Resolved': '✅',
      'Open': '📂',
      'Backlog': '📦',
      'Selected for Development': '🎯',
      'In Review': '👁️',
      'Ready for Testing': '🚀'
    };
    return statusIcons[status] || '📄';
  }

  private generateAISummary(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName: string): string {
    const totalIssues = jiraIssues.length;
    const totalCommits = commits.length;
    const completedIssues = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    
    const issueTypes = this.getIssueTypeCounts(jiraIssues);
    const topIssueType = Object.entries(issueTypes).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    const authorCounts = this.getAuthorCounts(commits);
    const topContributor = Object.entries(authorCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    const priorities = this.getPriorityCounts(jiraIssues);
    const criticalIssues = priorities['Critical'] || 0;
    
    return `
<div class="ai-summary">
    <h3><i class="fas fa-robot"></i> AI-Generated Sprint Analysis</h3>
    <div class="ai-insights">
        <div class="insight-card">
            <h4>🎯 Sprint Performance</h4>
            <p>This sprint achieved a <strong>${completionRate}%</strong> completion rate with ${completedIssues} out of ${totalIssues} issues resolved. 
            ${completionRate >= 80 ? '✅ <strong>Excellent delivery performance!</strong>' : completionRate >= 60 ? '📈 <strong>Good progress with room for improvement.</strong>' : '⚠️ <strong>Focus needed on sprint planning and execution.</strong>'}</p>
        </div>
        
        <div class="insight-card">
            <h4>📊 Work Composition</h4>
            <p>The sprint focused primarily on <strong>${topIssueType ? topIssueType[0] : 'various tasks'}</strong> 
            ${topIssueType ? `(${topIssueType[1]} items, ${Math.round((topIssueType[1] as number / totalIssues) * 100)}% of total work)` : ''}. 
            ${criticalIssues > 0 ? `⚠️ <strong>${criticalIssues} critical issue${criticalIssues > 1 ? 's' : ''} ${criticalIssues === 1 ? 'was' : 'were'} addressed.</strong>` : '✅ <strong>No critical issues reported.</strong>'}</p>
        </div>
        
        <div class="insight-card">
            <h4>👥 Team Dynamics</h4>
            <p>Development activity shows <strong>${totalCommits} commits</strong> across the sprint period. 
            ${topContributor ? `<strong>${topContributor[0]}</strong> led contributions with ${topContributor[1]} commits.` : 'Balanced contribution across team members.'} 
            ${totalCommits / totalIssues > 2 ? 'High code churn suggests complex implementations.' : 'Efficient development patterns observed.'}</p>
        </div>
        
        <div class="insight-card">
            <h4>🔮 Key Insights</h4>
            <p>${this.generateSprintInsights(jiraIssues, commits, completionRate)}</p>
        </div>
    </div>
</div>`;
  }

  private generateSprintInsights(jiraIssues: JiraIssue[], commits: GitHubCommit[], completionRate: number): string {
    const bugCount = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Bug').length;
    const storyCount = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Story').length;
    const taskCount = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Task').length;
    
    const insights = [];
    
    if (bugCount > storyCount + taskCount) {
      insights.push("🔧 High bug focus indicates maintenance mode or quality improvement phase.");
    } else if (storyCount > taskCount + bugCount) {
      insights.push("🚀 Story-heavy sprint suggests feature development and user value delivery.");
    } else if (taskCount > storyCount + bugCount) {
      insights.push("⚙️ Task-oriented sprint indicates infrastructure or technical debt work.");
    }
    
    if (completionRate >= 90) {
      insights.push("🎯 Exceptional sprint execution with near-perfect completion rate.");
    } else if (completionRate >= 70) {
      insights.push("📈 Solid sprint performance with good predictability.");
    } else if (completionRate >= 50) {
      insights.push("⚠️ Sprint scope may need adjustment for better predictability.");
    } else {
      insights.push("🚨 Consider sprint planning review and capacity assessment.");
    }
    
    if (commits.length > jiraIssues.length * 3) {
      insights.push("🔄 High commit-to-issue ratio suggests complex or iterative development.");
    } else if (commits.length < jiraIssues.length) {
      insights.push("📝 Low commit activity relative to issues - possible documentation or planning work.");
    }
    
    return insights.join(' ');
  }

  private generateConclusion(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName: string): string {
    const completedIssues = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const completionRate = jiraIssues.length > 0 ? Math.round((completedIssues / jiraIssues.length) * 100) : 0;
    
    return `
<div class="sprint-conclusion">
    <h3><i class="fas fa-flag-checkered"></i> Sprint Conclusion</h3>
    <div class="conclusion-content">
        <p><strong>${sprintName}</strong> concluded with <strong>${completedIssues}/${jiraIssues.length}</strong> issues completed (${completionRate}% success rate) 
        and <strong>${commits.length}</strong> code commits delivered.</p>
        
        <div class="key-achievements">
            <h4>🏆 Key Achievements:</h4>
            <ul>
                <li>✅ Successfully delivered ${completedIssues} planned items</li>
                <li>🔄 Maintained development velocity with ${commits.length} commits</li>
                <li>📊 Achieved ${completionRate}% sprint goal completion</li>
                ${this.getTopAchievements(jiraIssues).map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
        </div>
        
        <div class="next-steps">
            <h4>🎯 Recommendations for Next Sprint:</h4>
            <ul>
                ${this.getRecommendations(jiraIssues, commits, completionRate).map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</div>`;
  }

  private generateAISummaryForConfluence(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName: string): string {
    const totalIssues = jiraIssues.length;
    const totalCommits = commits.length;
    const completedIssues = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    
    const issueTypes = this.getIssueTypeCounts(jiraIssues);
    const topIssueType = Object.entries(issueTypes).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    const authorCounts = this.getAuthorCounts(commits);
    const topContributor = Object.entries(authorCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    const priorities = this.getPriorityCounts(jiraIssues);
    const criticalIssues = priorities['Critical'] || 0;
    
    return `
<h3>🎯 Sprint Performance Analysis</h3>
<p>This sprint achieved a <strong>${completionRate}%</strong> completion rate with ${completedIssues} out of ${totalIssues} issues resolved. 
${completionRate >= 80 ? '✅ <strong>Excellent delivery performance!</strong>' : completionRate >= 60 ? '📈 <strong>Good progress with room for improvement.</strong>' : '⚠️ <strong>Focus needed on sprint planning and execution.</strong>'}</p>

<h3>📊 Work Composition</h3>
<p>The sprint focused primarily on <strong>${topIssueType ? topIssueType[0] : 'various tasks'}</strong> 
${topIssueType ? `(${topIssueType[1]} items, ${Math.round((topIssueType[1] as number / totalIssues) * 100)}% of total work)` : ''}. 
${criticalIssues > 0 ? `⚠️ <strong>${criticalIssues} critical issue${criticalIssues > 1 ? 's' : ''} ${criticalIssues === 1 ? 'was' : 'were'} addressed.</strong>` : '✅ <strong>No critical issues reported.</strong>'}</p>

<h3>👥 Team Dynamics</h3>
<p>Development activity shows <strong>${totalCommits} commits</strong> across the sprint period. 
${topContributor ? `<strong>${topContributor[0]}</strong> led contributions with ${topContributor[1]} commits.` : 'Balanced contribution across team members.'} 
${totalCommits / totalIssues > 2 ? 'High code churn suggests complex implementations.' : 'Efficient development patterns observed.'}</p>

<h3>🔮 Key Insights</h3>
<p>${this.generateSprintInsights(jiraIssues, commits, completionRate)}</p>
`;
  }

  private generateConclusionForConfluence(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName: string): string {
    const completedIssues = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const completionRate = jiraIssues.length > 0 ? Math.round((completedIssues / jiraIssues.length) * 100) : 0;
    
    return `
<h3>📋 Sprint Summary</h3>
<p><strong>${sprintName}</strong> concluded with <strong>${completedIssues}/${jiraIssues.length}</strong> issues completed (${completionRate}% success rate) 
and <strong>${commits.length}</strong> code commits delivered.</p>

<h4>🏆 Key Achievements:</h4>
<ul>
<li>✅ Successfully delivered ${completedIssues} planned items</li>
<li>🔄 Maintained development velocity with ${commits.length} commits</li>
<li>📊 Achieved ${completionRate}% sprint goal completion</li>
${this.getTopAchievements(jiraIssues).map(achievement => `<li>${achievement}</li>`).join('')}
</ul>

<h4>🎯 Recommendations for Next Sprint:</h4>
<ul>
${this.getRecommendations(jiraIssues, commits, completionRate).map(rec => `<li>${rec}</li>`).join('')}
</ul>

<h4>📈 Sprint Metrics Dashboard</h4>
<table>
<tr><th>Metric</th><th>Value</th><th>Target</th><th>Status</th></tr>
<tr><td>Completion Rate</td><td>${completionRate}%</td><td>80%</td><td>${completionRate >= 80 ? '🟢 Excellent' : completionRate >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}</td></tr>
<tr><td>Code Activity</td><td>${commits.length} commits</td><td>-</td><td>${commits.length > 50 ? '🟢 High' : commits.length > 20 ? '🟡 Moderate' : '🔴 Low'}</td></tr>
<tr><td>Issue Resolution</td><td>${completedIssues}/${jiraIssues.length}</td><td>${jiraIssues.length}</td><td>${completedIssues === jiraIssues.length ? '🟢 Complete' : '🟡 Partial'}</td></tr>
</table>
`;
  }

  private getTopAchievements(jiraIssues: JiraIssue[]): string[] {
    const achievements = [];
    const bugCount = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Bug' && issue.fields.status.name === 'Done').length;
    const storyCount = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Story' && issue.fields.status.name === 'Done').length;
    
    if (bugCount > 0) {
      achievements.push(`🐛 Resolved ${bugCount} bug${bugCount > 1 ? 's' : ''} improving system stability`);
    }
    if (storyCount > 0) {
      achievements.push(`📚 Delivered ${storyCount} user stor${storyCount > 1 ? 'ies' : 'y'} enhancing user experience`);
    }
    
    return achievements.slice(0, 3);
  }

  private getRecommendations(jiraIssues: JiraIssue[], commits: GitHubCommit[], completionRate: number): string[] {
    const recommendations = [];
    
    if (completionRate < 70) {
      recommendations.push("📊 Review sprint planning process to improve estimation accuracy");
      recommendations.push("⏱️ Consider reducing sprint scope or extending timeline for complex items");
    } else if (completionRate >= 90) {
      recommendations.push("🎯 Excellent execution! Consider taking on additional stretch goals");
      recommendations.push("📈 Share best practices with other teams for continuous improvement");
    }
    
    const bugCount = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Bug').length;
    if (bugCount > jiraIssues.length * 0.3) {
      recommendations.push("🔧 High bug count detected - focus on code quality and testing processes");
    }
    
    return recommendations.slice(0, 3);
  }

  // Build Pipeline Methods
  formatBuildPipelines(pipelineData: any[], sprintName?: string): string {
    if (!pipelineData || pipelineData.length === 0) {
      return `
        <section class="section">
            <h2><i class="fas fa-hammer"></i> Build Pipelines</h2>
            <p class="no-items">No build pipeline data available for this release.</p>
        </section>`;
    }

    // Get latest build for each pipeline
    const latestBuilds = pipelineData.map(pipeline => {
      const latestBuild = pipeline.builds.length > 0 ? pipeline.builds[0] : null;
      return {
        pipelineName: pipeline.name,
        build: latestBuild
      };
    }).filter(item => item.build !== null);

    // If we have pipelines but no builds, show a different message
    if (latestBuilds.length === 0) {
      return `
        <section class="section">
            <h2><i class="fas fa-hammer"></i> Build Pipelines</h2>
            <p class="no-items">Found ${pipelineData.length} pipeline(s) but no recent builds matching the sprint criteria.</p>
            <div class="pipeline-names">
                <h4>Monitored Pipelines:</h4>
                <ul>
                    ${pipelineData.map(p => `<li>${p.name}</li>`).join('')}
                </ul>
            </div>
        </section>`;
    }

    const successfulBuilds = latestBuilds.filter(item => item.build.result === 'succeeded').length;
    const failedBuilds = latestBuilds.filter(item => item.build.result === 'failed').length;
    const inProgressBuilds = latestBuilds.filter(item => item.build.status === 'inProgress').length;

    return `
        <section class="section">
            <h2><i class="fas fa-hammer"></i> Build Pipelines</h2>
            <div class="builds-overview">
                <p class="section-subtitle">Latest deployment pipeline status for ${sprintName || 'this sprint'}</p>
                
                <div class="build-stats-grid">
                    <div class="stat-card success">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-number">${successfulBuilds}</div>
                            <div class="stat-label">Successful</div>
                        </div>
                    </div>
                    <div class="stat-card danger">
                        <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-number">${failedBuilds}</div>
                            <div class="stat-label">Failed</div>
                        </div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-icon"><i class="fas fa-spinner"></i></div>
                        <div class="stat-content">
                            <div class="stat-number">${inProgressBuilds}</div>
                            <div class="stat-label">In Progress</div>
                        </div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-icon"><i class="fas fa-cogs"></i></div>
                        <div class="stat-content">
                            <div class="stat-number">${pipelineData.length}</div>
                            <div class="stat-label">Total Pipelines</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pipeline-latest-builds">
                <h3><i class="fas fa-clock"></i> Latest Builds Summary</h3>
                <div class="builds-table">
                    <table class="builds-table-content">
                        <thead>
                            <tr>
                                <th><i class="fas fa-project-diagram"></i> Pipeline</th>
                                <th><i class="fas fa-hashtag"></i> Build #</th>
                                <th><i class="fas fa-calendar"></i> Date</th>
                                <th><i class="fas fa-code-branch"></i> Branch</th>
                                <th><i class="fas fa-traffic-light"></i> Status</th>
                                <th><i class="fas fa-external-link-alt"></i> Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${latestBuilds.map(item => this.formatLatestBuildRow(item)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>`;
  }

  private formatLatestBuildRow(item: any): string {
    const build = item.build;
    const statusIcon = this.getBuildStatusIcon(build.result || build.status);
    const statusClass = this.getBuildStatusClass(build.result || build.status);
    const date = new Date(build.queueTime).toLocaleDateString();
    const branchName = build.sourceBranch ? build.sourceBranch.replace('refs/heads/', '') : 'Unknown';
    
    return `
        <tr class="build-row">
            <td class="pipeline-name">
                <span class="pipeline-title">${item.pipelineName}</span>
            </td>
            <td class="build-number">
                <span class="build-id">#${build.buildNumber}</span>
            </td>
            <td class="build-date">${date}</td>
            <td class="build-branch">
                <span class="branch-name">${branchName}</span>
            </td>
            <td class="build-status">
                <span class="status-badge ${statusClass}">
                    ${statusIcon} ${build.result || build.status}
                </span>
            </td>
            <td class="build-link">
                ${build.webUrl ? `<a href="${build.webUrl}" target="_blank" class="build-url">
                    <i class="fas fa-external-link-alt"></i> View
                </a>` : 'N/A'}
            </td>
        </tr>`;
  }

  formatBuildPipelinesForConfluence(pipelineData: any[], sprintName?: string): string {
    if (!pipelineData || pipelineData.length === 0) {
      return `
<h2>🔨 Build Pipelines</h2>
<p><em>No build pipeline data available for this release.</em></p>`;
    }

    // Get latest build for each pipeline
    const latestBuilds = pipelineData.map(pipeline => {
      const latestBuild = pipeline.builds.length > 0 ? pipeline.builds[0] : null;
      return {
        pipelineName: pipeline.name,
        build: latestBuild
      };
    }).filter(item => item.build !== null);

    // If we have pipelines but no builds, show a different message
    if (latestBuilds.length === 0) {
      return `
<h2>🔨 Build Pipelines</h2>
<p><em>Found ${pipelineData.length} pipeline(s) but no recent builds matching the sprint criteria.</em></p>
<p><strong>Monitored Pipelines:</strong></p>
<ul>
${pipelineData.map(p => `  <li>${p.name}</li>`).join('')}
</ul>`;
    }

    const successfulBuilds = latestBuilds.filter(item => item.build.result === 'succeeded').length;
    const failedBuilds = latestBuilds.filter(item => item.build.result === 'failed').length;
    const inProgressBuilds = latestBuilds.filter(item => item.build.status === 'inProgress').length;
    const totalPipelines = pipelineData.length;

    let content = `
<h2>🔨 Build Pipelines</h2>
<p><em>Latest deployment pipeline status for ${sprintName || 'this sprint'}</em></p>

<h3>📊 Pipeline Status Summary</h3>
<table>
  <tr>
    <th style="width: 50%; text-align: left;">🏗️ Status</th>
    <th style="width: 25%; text-align: center;">📈 Count</th>
    <th style="width: 25%; text-align: center;">📊 Percentage</th>
  </tr>
  <tr>
    <td>✅ <strong>Successful</strong></td>
    <td style="text-align: center; font-weight: bold; color: #00875A;">${successfulBuilds}</td>
    <td style="text-align: center;">${totalPipelines > 0 ? Math.round((successfulBuilds / totalPipelines) * 100) : 0}%</td>
  </tr>
  <tr>
    <td>❌ <strong>Failed</strong></td>
    <td style="text-align: center; font-weight: bold; color: #DE350B;">${failedBuilds}</td>
    <td style="text-align: center;">${totalPipelines > 0 ? Math.round((failedBuilds / totalPipelines) * 100) : 0}%</td>
  </tr>
  <tr>
    <td>🔄 <strong>In Progress</strong></td>
    <td style="text-align: center; font-weight: bold; color: #FF8B00;">${inProgressBuilds}</td>
    <td style="text-align: center;">${totalPipelines > 0 ? Math.round((inProgressBuilds / totalPipelines) * 100) : 0}%</td>
  </tr>
  <tr>
    <td>🔧 <strong>Total Pipelines</strong></td>
    <td style="text-align: center; font-weight: bold; color: #6554C0;">${totalPipelines}</td>
    <td style="text-align: center;">100%</td>
  </tr>
</table>

<h3>🕐 Latest Builds Details</h3>
<table>
  <tr>
    <th style="width: 25%; text-align: left;">🏗️ Pipeline</th>
    <th style="width: 12%; text-align: center;">🔢 Build #</th>
    <th style="width: 15%; text-align: center;">📅 Date</th>
    <th style="width: 23%; text-align: left;">🌿 Branch</th>
    <th style="width: 15%; text-align: center;">🚦 Status</th>
    <th style="width: 10%; text-align: center;">🔗 Link</th>
  </tr>`;

    for (const item of latestBuilds) {
      const build = item.build;
      const statusIcon = this.getBuildStatusIconForConfluence(build.result || build.status);
      const date = new Date(build.queueTime).toLocaleDateString();
      const branchName = build.sourceBranch ? build.sourceBranch.replace('refs/heads/', '') : 'Unknown';
      
      content += `
  <tr>
    <td><strong>${item.pipelineName}</strong></td>
    <td style="text-align: center;"><strong>#${build.buildNumber}</strong></td>
    <td style="text-align: center;">📅 ${date}</td>
    <td>🌿 ${branchName}</td>
    <td style="text-align: center;">${statusIcon} <strong>${build.result || build.status}</strong></td>
    <td style="text-align: center;">${build.webUrl ? `<a href="${build.webUrl}">🔗 View</a>` : 'N/A'}</td>
  </tr>`;
    }

    content += `</table>`;

    return content;
  }

  private getBuildStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'succeeded': '<i class="fas fa-check-circle" style="color: #00875A;"></i>',
      'failed': '<i class="fas fa-times-circle" style="color: #DE350B;"></i>',
      'partiallySucceeded': '<i class="fas fa-exclamation-triangle" style="color: #FF8B00;"></i>',
      'canceled': '<i class="fas fa-ban" style="color: #6B778C;"></i>',
      'inProgress': '<i class="fas fa-spinner fa-spin" style="color: #0052CC;"></i>',
      'notStarted': '<i class="fas fa-clock" style="color: #6B778C;"></i>'
    };
    return statusIcons[status] || '<i class="fas fa-question-circle" style="color: #6B778C;"></i>';
  }

  private getBuildStatusIconForConfluence(status: string): string {
    const statusIcons: Record<string, string> = {
      'succeeded': '✅',
      'failed': '❌',
      'partiallySucceeded': '⚠️',
      'canceled': '🚫',
      'inProgress': '🔄',
      'notStarted': '⏳'
    };
    return statusIcons[status] || '❓';
  }

  private getBuildStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'succeeded': 'status-success',
      'failed': 'status-failed',
      'partiallySucceeded': 'status-warning',
      'canceled': 'status-canceled',
      'inProgress': 'status-progress',
      'notStarted': 'status-pending'
    };
    return statusClasses[status] || 'status-unknown';
  }
}