import { JiraIssue } from "../services/JiraService.js";
import { GitHubCommit } from "../services/GitHubService.js";
export declare class MarkdownFormatter {
    format(jiraIssues: JiraIssue[], commits: GitHubCommit[]): string;
    private generateSummary;
    private formatJiraIssues;
    private formatCommits;
    private groupIssuesByType;
    private getIssueTypeCounts;
    private getIssueTypeIcon;
    private getStatusBadge;
    private getPriorityIcon;
}
