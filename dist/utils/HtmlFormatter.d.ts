import { JiraIssue } from "../services/JiraService.js";
import { GitHubCommit } from "../services/GitHubService.js";
export declare class HtmlFormatter {
    private theme;
    constructor(theme?: string);
    format(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName?: string): string;
    formatForConfluence(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName?: string): string;
    private generateSummary;
    private generateSummaryForConfluence;
    private formatJiraIssues;
    private formatJiraIssuesForConfluence;
    private generateDetailedStats;
    private formatCommits;
    private formatCommitsForConfluence;
    private formatJiraIssue;
    private groupIssuesByType;
    private getIssueTypeCounts;
    private getStatusCounts;
    private getPriorityCounts;
    private getAuthorCounts;
    private getIssueTypeIcon;
    private getStatusClass;
    private getPriorityIcon;
    private getThemeCSS;
    private getStatusColor;
    private getPriorityIconForConfluence;
    private getIssueTypeIconForConfluence;
    private getStatusColorForConfluence;
}
