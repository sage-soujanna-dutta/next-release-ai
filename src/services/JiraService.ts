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

  /**
   * Generic method to make JIRA API requests
   */
  async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    try {
      const url = `https://${this.domain}${endpoint}`;
      const response = await axios({
        url,
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`JIRA API Error: ${error.response.status} - ${error.response.data?.errorMessages?.join(', ') || error.response.statusText}`);
      }
      throw new Error(`JIRA Request Failed: ${error.message}`);
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

  // Build JQL query from criteria object
  buildJQLQuery(options: {
    criteria: Record<string, any>;
    orderBy?: string;
    maxResults?: number;
  }): string {
    const { criteria, orderBy = 'created' } = options;
    const jqlParts: string[] = [];

    // Handle different criteria types
    for (const [key, value] of Object.entries(criteria)) {
      if (value === null || value === undefined) continue;

      switch (key.toLowerCase()) {
        case 'project':
          jqlParts.push(`project = ${value}`);
          break;
        case 'sprint':
          // Handle both sprint name and sprint number
          if (typeof value === 'string' && value.includes('SCNT-')) {
            jqlParts.push(`sprint = "${value}"`);
          } else {
            jqlParts.push(`sprint = ${value}`);
          }
          break;
        case 'status':
          if (Array.isArray(value)) {
            jqlParts.push(`status IN (${value.map(s => `"${s}"`).join(', ')})`);
          } else {
            jqlParts.push(`status = "${value}"`);
          }
          break;
        case 'assignee':
          if (Array.isArray(value)) {
            jqlParts.push(`assignee IN (${value.map(a => `"${a}"`).join(', ')})`);
          } else {
            jqlParts.push(`assignee = "${value}"`);
          }
          break;
        case 'issuetype':
        case 'type':
          if (Array.isArray(value)) {
            jqlParts.push(`issuetype IN (${value.map(t => `"${t}"`).join(', ')})`);
          } else {
            jqlParts.push(`issuetype = "${value}"`);
          }
          break;
        case 'priority':
          if (Array.isArray(value)) {
            jqlParts.push(`priority IN (${value.map(p => `"${p}"`).join(', ')})`);
          } else {
            jqlParts.push(`priority = "${value}"`);
          }
          break;
        case 'component':
        case 'components':
          if (Array.isArray(value)) {
            jqlParts.push(`component IN (${value.map(c => `"${c}"`).join(', ')})`);
          } else {
            jqlParts.push(`component = "${value}"`);
          }
          break;
        case 'created':
          if (typeof value === 'object' && value.after) {
            jqlParts.push(`created >= "${value.after}"`);
          }
          if (typeof value === 'object' && value.before) {
            jqlParts.push(`created <= "${value.before}"`);
          }
          break;
        case 'updated':
          if (typeof value === 'object' && value.after) {
            jqlParts.push(`updated >= "${value.after}"`);
          }
          if (typeof value === 'object' && value.before) {
            jqlParts.push(`updated <= "${value.before}"`);
          }
          break;
        default:
          // For custom fields or unknown fields, try basic equality
          if (typeof value === 'string') {
            jqlParts.push(`${key} = "${value}"`);
          } else if (typeof value === 'number') {
            jqlParts.push(`${key} = ${value}`);
          }
          break;
      }
    }

    let jql = jqlParts.join(' AND ');
    
    if (orderBy) {
      jql += ` ORDER BY ${orderBy}`;
    }

    return jql;
  }

  // Fetch issues using JQL query
  async fetchIssuesByJQL(jqlQuery: string): Promise<JiraIssue[]> {
    try {
      console.log(`🔍 Executing JQL Query: ${jqlQuery}`);
      
      const response = await axios.get(
        `https://${this.domain}/rest/api/3/search`,
        {
          headers: {
            Authorization: `Basic ${this.token}`,
            Accept: "application/json",
          },
          params: {
            jql: jqlQuery,
            fields: "key,summary,status,issuetype,assignee,priority,components,customfield_10004,customfield_10002,customfield_10003,customfield_10005",
            maxResults: 100
          }
        }
      );

      const issues: JiraIssue[] = response.data.issues.map((issue: any) => ({
        key: issue.key,
        fields: {
          summary: issue.fields.summary,
          status: issue.fields.status,
          issuetype: issue.fields.issuetype,
          assignee: issue.fields.assignee,
          priority: issue.fields.priority,
          components: issue.fields.components,
          customfield_10004: issue.fields.customfield_10004,
          customfield_10002: issue.fields.customfield_10002,
          customfield_10003: issue.fields.customfield_10003,
          customfield_10005: issue.fields.customfield_10005,
          storyPoints: issue.fields.customfield_10004 || issue.fields.customfield_10002 || issue.fields.customfield_10003 || issue.fields.customfield_10005 || 0
        }
      }));

      console.log(`✅ Found ${issues.length} issues matching the query`);
      return issues;
    } catch (error) {
      console.error("Error executing JQL query:", error);
      throw new Error(`Failed to execute JQL query: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
