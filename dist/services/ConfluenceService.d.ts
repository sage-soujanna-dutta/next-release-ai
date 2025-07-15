export declare class ConfluenceService {
    private host;
    private username;
    private token;
    private spaceKey;
    constructor();
    private getAuthHeaders;
    publishPage(htmlContent: string, sprintNumber?: string): Promise<string>;
    updatePage(pageId: string, htmlContent: string, sprintNumber?: string): Promise<string>;
    searchPages(query: string): Promise<any[]>;
}
