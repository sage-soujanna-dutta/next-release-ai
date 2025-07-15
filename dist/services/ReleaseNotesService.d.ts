export interface ReleaseNotesOptions {
    sprintNumber?: string;
    date?: string;
    format?: "html" | "markdown";
    theme?: "default" | "modern" | "minimal";
}
export interface WorkflowOptions {
    sprintNumber?: string;
    date?: string;
    output?: "confluence" | "file" | "both";
    notifyTeams?: boolean;
}
export interface ReleaseNotesResult {
    content: string;
    format: string;
    theme?: string;
    filePath?: string;
    stats: {
        jiraIssues: number;
        commits: number;
    };
}
export interface WorkflowResult {
    summary: string;
    steps: string[];
    stats: {
        jiraIssues: number;
        commits: number;
    };
}
export declare class ReleaseNotesService {
    private jiraService;
    private githubService;
    private confluenceService;
    private teamsService;
    private fileService;
    constructor();
    generateReleaseNotes(options: ReleaseNotesOptions): Promise<ReleaseNotesResult>;
    previewReleaseNotes(options: ReleaseNotesOptions): Promise<ReleaseNotesResult>;
    createCompleteWorkflow(options: WorkflowOptions): Promise<WorkflowResult>;
}
