import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export class JiraService {
    domain;
    token;
    boardId;
    constructor() {
        this.domain = process.env.JIRA_DOMAIN;
        this.token = process.env.JIRA_TOKEN;
        this.boardId = process.env.JIRA_BOARD_ID;
        if (!this.domain || !this.token || !this.boardId) {
            throw new Error("Missing required JIRA environment variables");
        }
    }
    async fetchIssues(sprintNumber) {
        try {
            // First, get the sprint by number
            const sprintsRes = await axios.get(`https://${this.domain}/rest/agile/1.0/board/${this.boardId}/sprint`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: "application/json",
                }
            });
            const matchedSprint = sprintsRes.data.values.find((s) => s.name.includes(sprintNumber));
            if (!matchedSprint) {
                throw new Error(`Sprint with number ${sprintNumber} not found`);
            }
            // Then fetch issues for the sprint
            const response = await axios.get(`https://${this.domain}/rest/agile/1.0/sprint/${matchedSprint.id}/issue`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: "application/json",
                },
            });
            return response.data.issues;
        }
        catch (error) {
            console.error("Error fetching JIRA issues:", error);
            throw new Error(`Failed to fetch JIRA issues: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getSprintDetails(sprintNumber) {
        try {
            const sprintsRes = await axios.get(`https://${this.domain}/rest/agile/1.0/board/${this.boardId}/sprint`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Accept: "application/json",
                }
            });
            const matchedSprint = sprintsRes.data.values.find((s) => s.name.includes(sprintNumber));
            if (!matchedSprint) {
                throw new Error(`Sprint with number ${sprintNumber} not found`);
            }
            return {
                id: matchedSprint.id,
                name: matchedSprint.name,
                state: matchedSprint.state,
                startDate: matchedSprint.startDate,
                endDate: matchedSprint.endDate,
                completeDate: matchedSprint.completeDate,
            };
        }
        catch (error) {
            console.error("Error fetching sprint details:", error);
            throw new Error(`Failed to fetch sprint details: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
