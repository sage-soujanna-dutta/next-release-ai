import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export class TeamsService {
    webhookUrl;
    constructor() {
        this.webhookUrl = process.env.TEAMS_WEBHOOK_URL;
        if (!this.webhookUrl) {
            console.warn("TEAMS_WEBHOOK_URL not configured. Teams notifications will be disabled.");
        }
    }
    async sendNotification(summary, content) {
        if (!this.webhookUrl) {
            console.log("Teams webhook not configured, skipping notification");
            return;
        }
        try {
            const payload = {
                "@type": "MessageCard",
                "@context": "https://schema.org/extensions",
                summary: summary,
                themeColor: "0076D7",
                title: "🚀 Release Notes Update",
                text: content,
                sections: [
                    {
                        activityTitle: summary,
                        activitySubtitle: `Generated on ${new Date().toLocaleString()}`,
                        facts: [
                            {
                                name: "Status",
                                value: "Published"
                            },
                            {
                                name: "Timestamp",
                                value: new Date().toISOString()
                            }
                        ]
                    }
                ]
            };
            await axios.post(this.webhookUrl, payload, {
                headers: { "Content-Type": "application/json" },
            });
            console.log("Teams notification sent successfully");
        }
        catch (error) {
            console.error("Error sending Teams notification:", error);
            throw new Error(`Failed to send Teams notification: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async sendRichNotification(options) {
        if (!this.webhookUrl) {
            console.log("Teams webhook not configured, skipping notification");
            return;
        }
        try {
            const payload = {
                "@type": "MessageCard",
                "@context": "https://schema.org/extensions",
                summary: options.summary,
                themeColor: "0076D7",
                title: options.title,
                sections: [
                    {
                        facts: options.facts
                    }
                ],
                potentialAction: options.actions?.map(action => ({
                    "@type": "OpenUri",
                    name: action.name,
                    targets: [
                        {
                            os: "default",
                            uri: action.url
                        }
                    ]
                }))
            };
            await axios.post(this.webhookUrl, payload, {
                headers: { "Content-Type": "application/json" },
            });
            console.log("Rich Teams notification sent successfully");
        }
        catch (error) {
            console.error("Error sending rich Teams notification:", error);
            throw new Error(`Failed to send rich Teams notification: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
