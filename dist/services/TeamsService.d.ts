export declare class TeamsService {
    private webhookUrl;
    constructor();
    sendNotification(summary: string, content: string): Promise<void>;
    sendRichNotification(options: {
        title: string;
        summary: string;
        facts: Array<{
            name: string;
            value: string;
        }>;
        actions?: Array<{
            name: string;
            url: string;
        }>;
    }): Promise<void>;
}
