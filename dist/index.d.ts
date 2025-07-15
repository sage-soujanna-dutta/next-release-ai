#!/usr/bin/env node
export declare class ReleaseMCPServer {
    private server;
    private releaseNotesService;
    constructor();
    private setupToolHandlers;
    private getAvailableTools;
    private handleToolCall;
    generateReleaseNotesPublic(options: any): Promise<import("./services/ReleaseNotesService.js").ReleaseNotesResult>;
    createCompleteWorkflowPublic(options: any): Promise<import("./services/ReleaseNotesService.js").WorkflowResult>;
    previewReleaseNotesPublic(options: any): Promise<import("./services/ReleaseNotesService.js").ReleaseNotesResult>;
    validateConfigurationPublic(): Promise<boolean>;
    private generateReleaseNotes;
    private fetchJiraIssues;
    private fetchGitHubCommits;
    private publishToConfluence;
    private sendTeamsNotification;
    private createReleaseWorkflow;
    private previewReleaseNotes;
    private validateConfiguration;
    private getSprintStatus;
    run(): Promise<void>;
}
