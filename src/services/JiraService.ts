import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

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
    customfield_10004?: number; // Story Points (common JIRA field)
    customfield_10002?: number; // Alternative Story Points field  
    customfield_10003?: number; // Another Story Points field
    customfield_10005?: number; // Another Story Points field
    storyPoints?: number; // Normalized story points field
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

export class JiraService {
  private domain: string;
  private token: string;
  private boardId: string;

  constructor() {
    this.domain = process.env.JIRA_DOMAIN!;
    this.token = process.env.JIRA_TOKEN!;
    this.boardId = process.env.JIRA_BOARD_ID!;

    if (!this.domain || !this.token || !this.boardId) {
      throw new Error("Missing required JIRA environment variables");
    }
  }

  async fetchIssues(sprintNumber: string): Promise<JiraIssue[]> {
    try {
      // First, get the sprint by number
      const sprintsRes = await axios.get(
        `https://${this.domain}/rest/agile/1.0/board/${this.boardId}/sprint`,
        { 
          headers: { 
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
          } 
        }
      );

      const matchedSprint = sprintsRes.data.values.find((s: any) =>
        s.name.includes(sprintNumber)
      );
      
      if (!matchedSprint) {
        throw new Error(`Sprint with number ${sprintNumber} not found`);
      }

      // Then fetch issues for the sprint with pagination
      let allIssues: JiraIssue[] = [];
      let startAt = 0;
      const maxResults = 100; // JIRA API maximum
      let total = 0;

      do {
        const response = await axios.get(
          `https://${this.domain}/rest/agile/1.0/sprint/${matchedSprint.id}/issue`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              Accept: "application/json",
            },
            params: {
              startAt,
              maxResults,
            },
          }
        );
        
        allIssues.push(...response.data.issues);
        total = response.data.total;
        startAt += maxResults;
        
        console.log(`Fetched ${allIssues.length} of ${total} issues for sprint ${sprintNumber}...`);
      } while (allIssues.length < total);

      console.log(`✅ Successfully fetched all ${allIssues.length} issues for sprint ${sprintNumber}`);
      
      // Process story points - normalize the field
      const processedIssues = allIssues.map(issue => {
        // Common story points field names in JIRA
        const storyPoints = issue.fields.customfield_10004 || 
                           issue.fields.customfield_10002 || 
                           issue.fields.customfield_10005 || 
                           issue.fields.customfield_10003 || 
                           0;
        
        return {
          ...issue,
          fields: {
            ...issue.fields,
            storyPoints: storyPoints
          }
        };
      });
      
      return processedIssues;
    } catch (error) {
      console.error("Error fetching JIRA issues:", error);
      throw new Error(`Failed to fetch JIRA issues: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getSprintDetails(sprintNumber: string): Promise<SprintDetails> {
    try {
      const sprintsRes = await axios.get(
        `https://${this.domain}/rest/agile/1.0/board/${this.boardId}/sprint`,
        { 
          headers: { 
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json",
          } 
        }
      );

      const matchedSprint = sprintsRes.data.values.find((s: any) =>
        s.name.includes(sprintNumber)
      );
      
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
    } catch (error) {
      console.error("Error fetching sprint details:", error);
      throw new Error(`Failed to fetch sprint details: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Calculate story points statistics for a sprint
  calculateStoryPointsStats(issues: JiraIssue[]): {
    totalStoryPoints: number;
    completedStoryPoints: number;
    completionRate: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  } {
    const totalStoryPoints = issues.reduce((sum, issue) => sum + (issue.fields.storyPoints || 0), 0);
    const completedIssues = issues.filter(issue => issue.fields.status.name === 'Done');
    const completedStoryPoints = completedIssues.reduce((sum, issue) => sum + (issue.fields.storyPoints || 0), 0);
    
    const byStatus = issues.reduce((acc, issue) => {
      const status = issue.fields.status.name;
      const points = issue.fields.storyPoints || 0;
      acc[status] = (acc[status] || 0) + points;
      return acc;
    }, {} as Record<string, number>);

    const byType = issues.reduce((acc, issue) => {
      const type = issue.fields.issuetype.name;
      const points = issue.fields.storyPoints || 0;
      acc[type] = (acc[type] || 0) + points;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStoryPoints,
      completedStoryPoints,
      completionRate: totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0,
      byStatus,
      byType
    };
  }
}
