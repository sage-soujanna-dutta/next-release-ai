export interface GitHubCommit {
    sha: string;
    message: string;
    url: string;
    author: string;
    date: string;
}
export declare class GitHubService {
    private repository;
    private token;
    constructor();
    fetchCommits(date?: string): Promise<GitHubCommit[]>;
    fetchCommitsForDateRange(startDate: string, endDate: string): Promise<GitHubCommit[]>;
    fetchPullRequests(date?: string): Promise<any>;
    getRepositoryStats(): Promise<{
        name: any;
        description: any;
        stars: any;
        forks: any;
        language: any;
        updatedAt: any;
    }>;
}
