import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export class ConfluenceService {
    host;
    username;
    token;
    spaceKey;
    constructor() {
        this.host = process.env.JIRA_CONFLUENCE_DOMAIN;
        this.username = process.env.CONFLUENCE_USERNAME;
        this.token = process.env.CONFLUENCE_PAT;
        this.spaceKey = process.env.CONFLUENCE_SPACE;
        if (!this.host || !this.username || !this.token || !this.spaceKey) {
            throw new Error("Missing required Confluence environment variables");
        }
    }
    getAuthHeaders() {
        return {
            Authorization: "Basic " + Buffer.from(`${this.username}:${this.token}`).toString("base64"),
            "Content-Type": "application/json",
        };
    }
    async publishPage(htmlContent, sprintNumber) {
        try {
            const pageTitle = `Release Notes${sprintNumber ? ` - Sprint ${sprintNumber}` : ` - ${new Date().toISOString().split('T')[0]}`}`;
            // First, search for existing pages with the same title
            const existingPages = await this.searchPages(pageTitle);
            if (existingPages.length > 0) {
                // Update the existing page
                console.log(`📝 Updating existing Confluence page: ${pageTitle}`);
                const pageId = existingPages[0].id;
                return await this.updatePage(pageId, htmlContent, sprintNumber);
            }
            else {
                // Create a new page
                console.log(`📄 Creating new Confluence page: ${pageTitle}`);
                const payload = {
                    type: "page",
                    title: pageTitle,
                    space: { key: this.spaceKey },
                    body: {
                        storage: {
                            value: htmlContent,
                            representation: "storage",
                        },
                    },
                };
                const response = await axios.post(`https://${this.host}/wiki/rest/api/content`, payload, { headers: this.getAuthHeaders() });
                return response.data._links.webui;
            }
        }
        catch (error) {
            console.error("Error publishing to Confluence:", error);
            throw new Error(`Failed to publish to Confluence: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async updatePage(pageId, htmlContent, sprintNumber) {
        try {
            // First get the current page to get the version
            const pageResponse = await axios.get(`https://${this.host}/wiki/rest/api/content/${pageId}`, { headers: this.getAuthHeaders() });
            const currentVersion = pageResponse.data.version.number;
            const pageTitle = `Release Notes${sprintNumber ? ` - Sprint ${sprintNumber}` : ` - ${new Date().toISOString().split('T')[0]}`}`;
            const payload = {
                id: pageId,
                type: "page",
                title: pageTitle,
                space: { key: this.spaceKey },
                body: {
                    storage: {
                        value: htmlContent,
                        representation: "storage",
                    },
                },
                version: {
                    number: currentVersion + 1,
                },
            };
            const response = await axios.put(`https://${this.host}/wiki/rest/api/content/${pageId}`, payload, { headers: this.getAuthHeaders() });
            return response.data._links.webui;
        }
        catch (error) {
            console.error("Error updating Confluence page:", error);
            throw new Error(`Failed to update Confluence page: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async searchPages(query) {
        try {
            // Use exact title match for better accuracy
            const response = await axios.get(`https://${this.host}/wiki/rest/api/content/search?cql=space="${this.spaceKey}" AND title="${query}"`, { headers: this.getAuthHeaders() });
            return response.data.results;
        }
        catch (error) {
            console.error("Error searching Confluence pages:", error);
            throw new Error(`Failed to search Confluence pages: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
