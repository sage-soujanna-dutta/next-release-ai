export interface JiraIssue {
    key: string;
    fields: {
        summary: string;
        status: {
            name: string;
        };
        issuetype: {
            name: string;
        };
        assignee?: {
            displayName: string;
        };
        priority?: {
            name: string;
        };
        components?: Array<{
            name: string;
        }>;
    };
}
export interface SprintDetails {
    id: number;
    name: string;
    state: string;
    startDate?: string;
    endDate?: string;
    completeDate?: string;
}
export declare class JiraService {
    private domain;
    private token;
    private boardId;
    constructor();
    fetchIssues(sprintNumber: string): Promise<JiraIssue[]>;
    getSprintDetails(sprintNumber: string): Promise<SprintDetails>;
}
