import { JiraService } from "./JiraService.js";
import { GitHubService } from "./GitHubService.js";
import { ConfluenceService } from "./ConfluenceService.js";
import { TeamsService } from "./TeamsService.js";
import { AzureDevOpsService } from "./AzureDevOpsService.js";
import { HtmlFormatter } from "../utils/HtmlFormatter.js";
import { MarkdownFormatter } from "../utils/MarkdownFormatter.js";
import { FileService } from "./FileService.js";
export class ReleaseNotesService {
    jiraService;
    githubService;
    confluenceService;
    teamsService;
    azureDevOpsService;
    fileService;
    constructor() {
        this.jiraService = new JiraService();
        this.githubService = new GitHubService();
        this.confluenceService = new ConfluenceService();
        this.teamsService = new TeamsService();
        this.azureDevOpsService = new AzureDevOpsService();
        this.fileService = new FileService();
    }
    async generateReleaseNotes(options) {
        const { sprintNumber, date, format = "html", theme = "modern" } = options;
        console.log(`🚀 Starting release notes generation for sprint: ${sprintNumber}`);
        let jiraIssues = [];
        let commits = [];
        let buildPipelineData = [];
        let sprintName = sprintNumber; // Default to sprint number
        if (sprintNumber) {
            // Fetch sprint details first to get the date range
            console.log(`� Fetching sprint details for ${sprintNumber}...`);
            const sprintDetails = await this.jiraService.getSprintDetails(sprintNumber);
            console.log(`✅ Found sprint: ${sprintDetails.name}`);
            sprintName = sprintDetails.name; // Use the full sprint name
            if (sprintDetails.startDate && sprintDetails.endDate) {
                console.log(`📅 Sprint period: ${sprintDetails.startDate} to ${sprintDetails.endDate} (end date exclusive)`);
                // Fetch commits for the sprint period
                console.log("🔗 Fetching GitHub commits for sprint period...");
                commits = await this.githubService.fetchCommitsForDateRange(sprintDetails.startDate, sprintDetails.endDate);
                console.log(`✅ Found ${commits.length} commits during sprint period`);
            }
            else {
                console.log("⚠️ Sprint dates not available, falling back to last 8 days");
                commits = await this.githubService.fetchCommits(date);
                console.log(`✅ Found ${commits.length} commits from the last 8 days`);
            }
            // Fetch JIRA issues for the sprint
            console.log('📊 Fetching JIRA issues...');
            jiraIssues = await this.jiraService.fetchIssues(sprintNumber);
            console.log(`✅ Found ${jiraIssues.length} JIRA issues`);
            // Fetch build pipeline data for the sprint
            console.log('🔨 Fetching build pipeline data...');
            buildPipelineData = await this.azureDevOpsService.fetchPipelineData(sprintNumber);
            console.log(`✅ Found build data for ${buildPipelineData.length} pipelines`);
        }
        else {
            // No sprint specified, use fallback approach
            console.log('🔗 Fetching GitHub commits (last 8 days)...');
            commits = await this.githubService.fetchCommits(date);
            console.log(`✅ Found ${commits.length} commits from the last 8 days`);
        }
        let content;
        if (format === "html") {
            console.log('🎨 Generating HTML content with modern theme...');
            const htmlFormatter = new HtmlFormatter(theme);
            content = htmlFormatter.format(jiraIssues, commits, sprintName, buildPipelineData);
        }
        else {
            console.log('📝 Generating Markdown content...');
            const markdownFormatter = new MarkdownFormatter();
            content = markdownFormatter.format(jiraIssues, commits);
        }
        // Always save to file
        console.log('💾 Saving to file...');
        const filePath = await this.fileService.saveReleaseNotes(content, sprintNumber);
        console.log(`✅ File saved to: ${filePath}`);
        return {
            content,
            format,
            theme: format === "html" ? theme : undefined,
            filePath,
            stats: {
                jiraIssues: jiraIssues.length,
                commits: commits.length,
            },
        };
    }
    async previewReleaseNotes(options) {
        return this.generateReleaseNotes(options);
    }
    async createCompleteWorkflow(options) {
        const { sprintNumber, date, output = "both", notifyTeams = true } = options;
        const steps = [];
        let jiraIssues = [];
        let commits = [];
        let buildPipelineData = [];
        let sprintDetails = null;
        if (sprintNumber) {
            // Fetch sprint details first to get the date range
            console.log(`📅 Fetching sprint details for ${sprintNumber}...`);
            sprintDetails = await this.jiraService.getSprintDetails(sprintNumber);
            console.log(`✅ Found sprint: ${sprintDetails.name}`);
            if (sprintDetails.startDate && sprintDetails.endDate) {
                console.log(`📅 Sprint period: ${sprintDetails.startDate} to ${sprintDetails.endDate}`);
                // Fetch commits for the sprint period
                console.log("� Fetching GitHub commits for sprint period...");
                commits = await this.githubService.fetchCommitsForDateRange(sprintDetails.startDate, sprintDetails.endDate);
                console.log(`✅ Found ${commits.length} commits during sprint period`);
            }
            else {
                console.log("⚠️ Sprint dates not available, falling back to last 8 days");
                commits = await this.githubService.fetchCommits();
                console.log(`✅ Found ${commits.length} commits from the last 8 days`);
            }
            // Fetch JIRA issues for the sprint
            console.log("📊 Fetching JIRA issues...");
            jiraIssues = await this.jiraService.fetchIssues(sprintNumber);
            console.log(`✅ Found ${jiraIssues.length} JIRA issues`);
            // Fetch build pipeline data for the sprint
            console.log('🔨 Fetching build pipeline data...');
            buildPipelineData = await this.azureDevOpsService.fetchPipelineData(sprintNumber);
            console.log(`✅ Found build data for ${buildPipelineData.length} pipelines`);
        }
        else {
            // No sprint specified, use fallback approach
            console.log("🔗 Fetching GitHub commits (last 8 days)...");
            commits = await this.githubService.fetchCommits();
            console.log(`✅ Found ${commits.length} commits from the last 8 days`);
        }
        // Generate release notes
        const releaseNotes = await this.generateReleaseNotes({
            sprintNumber,
            date,
            format: "html",
            theme: "modern",
        });
        steps.push("Generated release notes");
        // Save to file if requested
        if (output === "file" || output === "both") {
            await this.fileService.saveReleaseNotes(releaseNotes.content, sprintNumber);
            steps.push("Saved to file");
        }
        // Publish to Confluence if requested
        if (output === "confluence" || output === "both") {
            // Generate Confluence-specific content
            const htmlFormatter = new HtmlFormatter("modern");
            const confluenceContent = htmlFormatter.formatForConfluence(jiraIssues, commits, sprintNumber, buildPipelineData);
            await this.confluenceService.publishPage(confluenceContent, sprintNumber);
            steps.push("Published to Confluence");
        }
        // Send Teams notification if requested
        if (notifyTeams) {
            const markdownContent = await this.generateReleaseNotes({
                sprintNumber,
                date,
                format: "markdown",
            });
            await this.teamsService.sendNotification("🚀 New release notes published", markdownContent.content);
            steps.push("Sent Teams notification");
        }
        return {
            summary: `Release notes workflow completed for ${sprintNumber ? `sprint ${sprintNumber}` : "latest changes"}`,
            steps,
            stats: releaseNotes.stats,
        };
    }
}
