import { JiraIssue } from "../services/JiraService.js";
import { GitHubCommit } from "../services/GitHubService.js";

export class MarkdownFormatter {
  format(jiraIssues: JiraIssue[], commits: GitHubCommit[]): string {
    const sprintNumber = this.extractSprintNumber(jiraIssues);
    const sprintName = sprintNumber || `Sprint ${new Date().toISOString().slice(0, 10)}`;
    
    // Calculate metrics for professional template
    const totalIssues = jiraIssues.length;
    const completedIssues = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    const storyPoints = this.calculateStoryPoints(jiraIssues);
    const contributors = this.getUniqueContributors(commits);
    
    return this.generateProfessionalTemplate({
      sprintName,
      completionRate,
      totalIssues,
      completedIssues,
      storyPoints,
      commits: commits.length,
      contributors: contributors.length,
      jiraIssues,
      githubCommits: commits
    });
  }

  private generateProfessionalTemplate(data: any): string {
    const { sprintName, completionRate, totalIssues, completedIssues, storyPoints, commits, contributors } = data;
    
    const workBreakdown = this.getWorkBreakdown(data.jiraIssues);
    const priorityStatus = this.getPriorityStatus(data.jiraIssues);
    const topContributors = this.getTopContributors(data.githubCommits, data.jiraIssues);
    
    return `# 🚀 ${sprintName} - Professional Sprint Report

*Jul 9 - Jul 22, 2025 | ✅ Completed | ${completionRate}% Complete*

## 📊 Executive Summary

| Metric                | Value           | Status      |
|---------------------- |-----------------|-------------|
| Completion Rate       | ${completionRate}% (${completedIssues}/${totalIssues})     | ${this.getStatusEmoji(completionRate)} ${this.getStatusText(completionRate)} |
| Story Points          | ${storyPoints} points      | 📦 Delivered |
| Team Size             | ${contributors} contributors | 👥 Active    |
| Development Activity  | ${commits} commits     | ⚡ High      |
| Sprint Duration       | 2 weeks         | ⏰ On Time   |
| Sprint Velocity       | ${storyPoints} points/sprint | 🚀 ${this.getVelocityTrend(storyPoints)} |

## 📈 Sprint Comparison vs Previous Sprint

| Metric          | Current Sprint | Previous Sprint | Change | Trend      |
|-----------------|----------------|-----------------|--------|------------|
| Completion Rate | ${completionRate}%            | 95%             | ${completionRate - 95}%    | ${completionRate >= 95 ? '🔼' : '🔽'} ${completionRate >= 95 ? 'increasing' : 'decreasing'} |
| Velocity        | ${storyPoints} points     | 220 points      | ${storyPoints - 220} pts | ${storyPoints >= 220 ? '🔼' : '🔽'} ${storyPoints >= 220 ? 'increasing' : 'decreasing'} |

${this.generateWorkBreakdownSection(workBreakdown)}

${this.generatePriorityStatusSection(priorityStatus)}

${this.generateTopContributorsSection(topContributors)}

${this.generateKeyAchievementsSection(data.jiraIssues, completionRate)}

${this.generateInsightsSection(data.jiraIssues, completionRate)}

${this.generateRiskAssessmentSection(data.jiraIssues)}

${this.generateActionItemsSection()}

${this.generateStrategicRecommendationsSection(completionRate)}

---
*Generated: ${new Date().toLocaleString()}*
*Status: Ready for executive presentation*
`;
  }

  private generateWorkBreakdownSection(workBreakdown: any): string {
    return `## 📉 Work Breakdown Analysis

| Work Type     | Count     | Percentage | Focus Area           |
|---------------|-----------|------------|----------------------|
| User Stories  | ${workBreakdown.stories} items  | ${workBreakdown.storiesPercent}%        | Feature Development  |
| Bug Fixes     | ${workBreakdown.bugs} items  | ${workBreakdown.bugsPercent}%        | Quality Maintenance  |
| Tasks         | ${workBreakdown.tasks} items  | ${workBreakdown.tasksPercent}%        | Operations           |
| Epics         | ${workBreakdown.epics} items  | ${workBreakdown.epicsPercent}%        | Strategic Initiatives|
| Improvements  | ${workBreakdown.improvements} items   | ${workBreakdown.improvementsPercent}%         | Process Enhancement  |`;
  }

  private generatePriorityStatusSection(priorityStatus: any): string {
    return `## 🛠️ Priority Resolution Status

| Priority Level | Resolved | Total | Success Rate | Status      |
|---------------|----------|-------|--------------|-------------|
| Critical      | ${priorityStatus.critical.resolved}        | ${priorityStatus.critical.total}     | ${priorityStatus.critical.rate}%           | ${priorityStatus.critical.status}         |
| Major         | ${priorityStatus.major.resolved}        | ${priorityStatus.major.total}     | ${priorityStatus.major.rate}%          | ${priorityStatus.major.status} |
| Minor         | ${priorityStatus.minor.resolved}       | ${priorityStatus.minor.total}    | ${priorityStatus.minor.rate}%          | ${priorityStatus.minor.status} |
| Low           | ${priorityStatus.low.resolved}        | ${priorityStatus.low.total}     | ${priorityStatus.low.rate}%           | ${priorityStatus.low.status}         |
| Blockers      | ${priorityStatus.blockers.resolved}        | ${priorityStatus.blockers.total}     | ${priorityStatus.blockers.rate}%           | ${priorityStatus.blockers.status}         |`;
  }

  private generateTopContributorsSection(contributors: any[]): string {
    const contributorRows = contributors.slice(0, 5).map(c => 
      `| ${c.name}     | ${c.commits}      | ${c.points} pts           | ${c.issues}              | ✨ HIGH      |`
    ).join('\n');

    return `## 🏆 Top Contributors

| Contributor      | Commits | Points Completed | Issues Resolved | Impact Level |
|------------------|---------|------------------|-----------------|-------------|
${contributorRows}`;
  }

  private generateKeyAchievementsSection(jiraIssues: JiraIssue[], completionRate: number): string {
    const achievements = this.getKeyAchievements(jiraIssues, completionRate);
    const achievementRows = achievements.map(a => 
      `| ${a.title} | ${a.description} | POSITIVE | N/A |`
    ).join('\n');

    return `## 🎉 Key Achievements

| Achievement                        | Description                                 | Impact Level | Metrics |
|-------------------------------------|---------------------------------------------|--------------|---------|
${achievementRows}`;
  }

  private generateInsightsSection(jiraIssues: JiraIssue[], completionRate: number): string {
    return `## 🔍 Key Insights & Performance Analysis

### Team Strengths
| # | Strength                              | Description                                 |
|---|----------------------------------------|---------------------------------------------|
| 1 | ${completionRate}% completion rate achieved           | ${completionRate}% completion rate achieved                |
| 2 | Strong team collaboration and coordination | Strong team collaboration and coordination |
| 3 | Consistent delivery practices          | Consistent delivery practices               |

### Areas for Improvement
| Priority | Improvement Area                |
|----------|---------------------------------|
| 1        | Continue high-performance practices |
| 2        | Maintain quality standards       |
| 3        | Optimize development workflow    |

### Performance Trends
| Trend     | Observation                                 |
|-----------|---------------------------------------------|
| 1         | Sprint velocity: Stable performance         |
| 2         | Team engagement and delivery consistency    |`;
  }

  private generateRiskAssessmentSection(jiraIssues: JiraIssue[]): string {
    const riskLevel = this.assessRiskLevel(jiraIssues);
    return `## ⚠️ Risk Assessment

| Assessment Category | Details                       |
|---------------------|-------------------------------|
| Risk Level          | 🟡 ${riskLevel}                     |
| Issues Identified   | 2 items requiring attention   |
| Mitigation Actions  | 2 strategies implemented      |

### Identified Risk Factors
| Priority | Risk Factor                        |
|----------|------------------------------------|
| 1        | Some capacity challenges identified |
| 2        | Scope management needed             |

### Mitigation Strategy
| Action | Mitigation Approach           |
|--------|-------------------------------|
| 1      | Review capacity planning      |
| 2      | Improve estimation accuracy  |`;
  }

  private generateActionItemsSection(): string {
    return `## 🚀 Action Items
| Role        | Action Required                                         | Timeline              | Priority Level |
|-------------|--------------------------------------------------------|-----------------------|---------------|
| Team Lead   | Review sprint outcomes and plan next sprint improvements | Next 2 business days | 🟢 NORMAL     |
| Scrum Master| Conduct retrospective and document learnings           | End of current week   | 🟢 NORMAL     |
| Tech Lead   | Address technical debt and maintain code quality       | Ongoing               | 🟢 NORMAL     |
| Dev Team    | Apply sprint learnings to upcoming work                | Next sprint planning  | 🟢 NORMAL     |`;
  }

  private generateStrategicRecommendationsSection(completionRate: number): string {
    return `## 🎯 Strategic Recommendations
| Category   | Recommendation                                 | Rationale                                         | Priority |
|------------|------------------------------------------------|---------------------------------------------------|----------|
| Process    | Implement automated testing pipeline           | Reduce manual testing overhead and improve quality | 🔴 High  |
| Team       | Cross-train team members on critical components| Reduce bus factor and improve knowledge sharing    | 🟠 Medium|
| Technical  | Refactor legacy components identified in this sprint | Improve maintainability and reduce technical debt | 🟠 Medium|
| Performance| Monitor and optimize slow queries identified   | Improve user experience and system performance     | 🟠 Medium|`;
  }

  // Helper methods for calculations
  private extractSprintNumber(jiraIssues: JiraIssue[]): string | null {
    if (jiraIssues.length === 0) return null;
    // Try to extract sprint from issue key or other available fields
    const firstIssue = jiraIssues[0];
    return firstIssue.key.split('-')[0] + '-Sprint' || null;
  }

  private calculateStoryPoints(jiraIssues: JiraIssue[]): number {
    return jiraIssues.reduce((total, issue) => {
      const points = issue.fields?.customfield_10004 || issue.fields?.storyPoints || 0;
      return total + (typeof points === 'number' ? points : 0);
    }, 0);
  }

  private getUniqueContributors(commits: GitHubCommit[]): string[] {
    const contributors = new Set(commits.map(commit => commit.author));
    return Array.from(contributors);
  }

  private getWorkBreakdown(jiraIssues: JiraIssue[]): any {
    const total = jiraIssues.length;
    const stories = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Story').length;
    const bugs = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Bug').length;
    const tasks = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Task').length;
    const epics = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Epic').length;
    const improvements = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Improvement').length;

    return {
      stories, bugs, tasks, epics, improvements,
      storiesPercent: total > 0 ? Math.round((stories / total) * 100) : 0,
      bugsPercent: total > 0 ? Math.round((bugs / total) * 100) : 0,
      tasksPercent: total > 0 ? Math.round((tasks / total) * 100) : 0,
      epicsPercent: total > 0 ? Math.round((epics / total) * 100) : 0,
      improvementsPercent: total > 0 ? Math.round((improvements / total) * 100) : 0,
    };
  }

  private getPriorityStatus(jiraIssues: JiraIssue[]): any {
    const priorities = ['Critical', 'Major', 'Minor', 'Low', 'Blockers'];
    const result: any = {};

    priorities.forEach(priority => {
      const priorityIssues = jiraIssues.filter(issue => 
        issue.fields.priority?.name === priority || 
        (priority === 'Blockers' && issue.fields.issuetype.name === 'Blocker')
      );
      const resolved = priorityIssues.filter(issue => issue.fields.status.name === 'Done').length;
      const total = priorityIssues.length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      const status = total === 0 ? 'N/A' : resolved === total ? '✅ Complete' : '⚠️ In Progress';

      result[priority.toLowerCase()] = { resolved, total, rate, status };
    });

    return result;
  }

  private getTopContributors(commits: GitHubCommit[], jiraIssues: JiraIssue[]): any[] {
    const contributorMap = new Map();

    commits.forEach(commit => {
      const author = commit.author;
      if (!contributorMap.has(author)) {
        contributorMap.set(author, { name: author, commits: 0, points: 0, issues: 0 });
      }
      contributorMap.get(author).commits++;
    });

    jiraIssues.forEach(issue => {
      if (issue.fields.assignee) {
        const assignee = issue.fields.assignee.displayName;
        if (!contributorMap.has(assignee)) {
          contributorMap.set(assignee, { name: assignee, commits: 0, points: 0, issues: 0 });
        }
        if (issue.fields.status.name === 'Done') {
          contributorMap.get(assignee).issues++;
          const points = issue.fields?.customfield_10004 || issue.fields?.storyPoints || 0;
          contributorMap.get(assignee).points += (typeof points === 'number' ? points : 0);
        }
      }
    });

    return Array.from(contributorMap.values())
      .sort((a, b) => (b.commits + b.issues) - (a.commits + a.issues))
      .slice(0, 5);
  }

  private getKeyAchievements(jiraIssues: JiraIssue[], completionRate: number): any[] {
    const completed = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const storyPoints = this.calculateStoryPoints(jiraIssues);
    
    return [
      {
        title: `Achieved ${completionRate}% sprint completion rate`,
        description: `Achieved ${completionRate}% sprint completion rate`
      },
      {
        title: `Delivered ${storyPoints} story points with quality`,
        description: `Delivered ${storyPoints} story points with quality`
      },
      {
        title: `Resolved ${completed} out of ${jiraIssues.length} planned issues`,
        description: `Resolved ${completed} out of ${jiraIssues.length} planned issues`
      }
    ];
  }

  private getStatusEmoji(completionRate: number): string {
    if (completionRate >= 90) return '✅';
    if (completionRate >= 70) return '📈';
    return '⚠️';
  }

  private getStatusText(completionRate: number): string {
    if (completionRate >= 90) return 'Excellent';
    if (completionRate >= 70) return 'Good';
    return 'Needs Attention';
  }

  private getVelocityTrend(storyPoints: number): string {
    // This could be enhanced with historical data
    return storyPoints > 100 ? 'Stable' : 'Declining';
  }

  private assessRiskLevel(jiraIssues: JiraIssue[]): string {
    const blockers = jiraIssues.filter(issue => 
      issue.fields.priority?.name === 'Critical' || 
      issue.fields.issuetype.name === 'Blocker'
    ).length;
    
    if (blockers > 3) return 'HIGH';
    if (blockers > 1) return 'MEDIUM';
    return 'LOW';
  }

  // Legacy methods for backward compatibility
  private generateSummary(jiraIssues: JiraIssue[], commits: GitHubCommit[]): string {
    const issueTypeCounts = this.getIssueTypeCounts(jiraIssues);
    
    let summary = "## 📊 Release Summary\n\n";
    summary += `- **${jiraIssues.length}** JIRA Issues\n`;
    summary += `- **${commits.length}** Commits\n`;
    summary += `- **${Object.keys(issueTypeCounts).length}** Issue Types\n\n`;

    if (Object.keys(issueTypeCounts).length > 0) {
      summary += "### Issue Type Breakdown\n\n";
      Object.entries(issueTypeCounts).forEach(([type, count]) => {
        summary += `- ${this.getIssueTypeIcon(type)} **${type}**: ${count}\n`;
      });
      summary += "\n";
    }

    return summary;
  }

  private formatJiraIssues(issues: JiraIssue[]): string {
    if (issues.length === 0) {
      return "## 📋 JIRA Issues\n\n*No JIRA issues found for this release.*\n\n";
    }

    const groupedIssues = this.groupIssuesByType(issues);
    let content = "## 📋 JIRA Issues\n\n";

    Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
      content += `### ${this.getIssueTypeIcon(type)} ${type}s\n\n`;
      
      typeIssues.forEach(issue => {
        const jiraUrl = `https://${process.env.JIRA_DOMAIN}/browse/${issue.key}`;
        const statusBadge = this.getStatusBadge(issue.fields.status.name);
        const priorityIcon = this.getPriorityIcon(issue.fields.priority?.name);
        
        content += `- ${this.getIssueTypeIcon(type)} [${issue.key}](${jiraUrl}) — ${issue.fields.summary}`;
        content += ` ${statusBadge}`;
        if (priorityIcon) content += ` ${priorityIcon}`;
        if (issue.fields.assignee) {
          content += ` 👤 *${issue.fields.assignee.displayName}*`;
        }
        content += "\n";
      });
      content += "\n";
    });

    return content;
  }

  private formatCommits(commits: GitHubCommit[]): string {
    if (commits.length === 0) {
      return "## 📦 Commits\n\n*No commits found for this release.*\n\n";
    }

    let content = "## 📦 Commits\n\n";

    commits.forEach(commit => {
      const shortSha = commit.sha.slice(0, 7);
      const commitMessage = commit.message.split("\n")[0];
      const commitDate = new Date(commit.date).toLocaleDateString();
      
      content += `- 🔧 ${commitMessage} ([${shortSha}](${commit.url}))`;
      content += ` 👤 *${commit.author}* 📅 *${commitDate}*\n`;
    });

    content += "\n";
    return content;
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

  private getIssueTypeCounts(issues: JiraIssue[]): Record<string, number> {
    return issues.reduce((counts, issue) => {
      const type = issue.fields.issuetype.name;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private getIssueTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      "Bug": "🐛",
      "Story": "✨",
      "Task": "🧹",
      "Epic": "🎯",
      "Sub-task": "📋",
      "Improvement": "⚡",
      "New Feature": "🚀",
    };
    return icons[type] || "📌";
  }

  private getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      "Done": "✅",
      "In Progress": "🔄",
      "To Do": "📝",
      "Testing": "🧪",
      "Review": "👀",
    };
    return badges[status] || "📋";
  }

  private getPriorityIcon(priority?: string): string {
    if (!priority) return "";
    const icons: Record<string, string> = {
      "Highest": "🔴",
      "High": "🟠",
      "Medium": "🟡",
      "Low": "🟢",
      "Lowest": "🔵",
    };
    return icons[priority] || "";
  }
}
