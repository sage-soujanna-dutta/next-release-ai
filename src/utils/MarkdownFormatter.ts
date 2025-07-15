import { JiraIssue } from "../services/JiraService.js";
import { GitHubCommit } from "../services/GitHubService.js";

export class MarkdownFormatter {
  format(jiraIssues: JiraIssue[], commits: GitHubCommit[]): string {
    const summary = this.generateSummary(jiraIssues, commits);
    const jiraContent = this.formatJiraIssues(jiraIssues);
    const commitsContent = this.formatCommits(commits);

    return [
      "# 🚀 Release Notes",
      "",
      `*Generated on ${new Date().toLocaleString()}*`,
      "",
      summary,
      jiraContent,
      commitsContent,
      "",
      "---",
      "*Generated automatically by Release MCP Server*"
    ].join("\n");
  }

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
