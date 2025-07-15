#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { ReleaseNotesService } from "./services/ReleaseNotesService.js";
import { JiraService } from "./services/JiraService.js";
import { GitHubService } from "./services/GitHubService.js";
import { ConfluenceService } from "./services/ConfluenceService.js";
import { TeamsService } from "./services/TeamsService.js";
import { HtmlFormatter } from "./utils/HtmlFormatter.js";
import dotenv from "dotenv";

dotenv.config();

interface RequestParams {
  sprintNumber?: string;
  date?: string;
  includeCommits?: boolean;
  includeJiraIssues?: boolean;
  format?: "html" | "markdown";
  output?: "confluence" | "file" | "both";
  theme?: "default" | "modern" | "minimal";
  notifyTeams?: boolean;
  content?: string;
  summary?: string;
}

export class ReleaseMCPServer {
  private server: Server;
  private releaseNotesService: ReleaseNotesService;

  constructor() {
    this.server = new Server(
      {
        name: "release-mcp-server",
        version: "1.0.0",
      }
    );

    this.releaseNotesService = new ReleaseNotesService();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      try {
        return await this.handleToolCall(request.params.name, request.params.arguments as RequestParams);
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      {
        name: "generate_release_notes",
        description: "Generate comprehensive release notes combining JIRA issues and GitHub commits",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumber: {
              type: "string",
              description: "Sprint number for JIRA issues (optional)",
            },
            date: {
              type: "string",
              description: "Date to fetch commits from (ISO format, optional, defaults to last Friday)",
            },
            format: {
              type: "string",
              enum: ["html", "markdown"],
              description: "Output format (default: html)",
            },
            theme: {
              type: "string",
              enum: ["default", "modern", "minimal"],
              description: "HTML theme for styling (default: modern)",
            },
          },
        },
      },
      {
        name: "fetch_jira_issues",
        description: "Fetch JIRA issues for a specific sprint",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumber: {
              type: "string",
              description: "Sprint number to fetch issues for",
            },
          },
          required: ["sprintNumber"],
        },
      },
      {
        name: "fetch_github_commits",
        description: "Fetch GitHub commits since a specific date",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Date to fetch commits from (ISO format, defaults to last Friday)",
            },
          },
        },
      },
      {
        name: "publish_to_confluence",
        description: "Publish release notes to Confluence",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "HTML content to publish",
            },
            sprintNumber: {
              type: "string",
              description: "Sprint number for the page title",
            },
          },
          required: ["content"],
        },
      },
      {
        name: "send_teams_notification",
        description: "Send a Teams notification about the release",
        inputSchema: {
          type: "object",
          properties: {
            summary: {
              type: "string",
              description: "Summary of the notification",
            },
            content: {
              type: "string",
              description: "Content of the notification",
            },
          },
          required: ["summary", "content"],
        },
      },
      {
        name: "create_release_workflow",
        description: "Create a complete automated release workflow",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumber: {
              type: "string",
              description: "Sprint number",
            },
            date: {
              type: "string",
              description: "Date to fetch commits from",
            },
            output: {
              type: "string",
              enum: ["confluence", "file", "both"],
              description: "Where to output the release notes (default: both)",
            },
            notifyTeams: {
              type: "boolean",
              description: "Whether to send Teams notification (default: true)",
            },
          },
        },
      },
      {
        name: "preview_release_notes",
        description: "Preview release notes without publishing",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumber: {
              type: "string",
              description: "Sprint number",
            },
            date: {
              type: "string",
              description: "Date to fetch commits from",
            },
            format: {
              type: "string",
              enum: ["html", "markdown"],
              description: "Preview format (default: markdown)",
            },
          },
        },
      },
      {
        name: "validate_configuration",
        description: "Validate all required environment variables and configurations",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_sprint_status",
        description: "Get status and statistics for a specific sprint",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumber: {
              type: "string",
              description: "Sprint number to get status for",
            },
          },
          required: ["sprintNumber"],
        },
      },
    ];
  }

  private async handleToolCall(name: string, args: RequestParams) {
    switch (name) {
      case "generate_release_notes":
        return await this.generateReleaseNotes(args);
      
      case "fetch_jira_issues":
        return await this.fetchJiraIssues(args);
      
      case "fetch_github_commits":
        return await this.fetchGitHubCommits(args);
      
      case "publish_to_confluence":
        return await this.publishToConfluence(args);
      
      case "send_teams_notification":
        return await this.sendTeamsNotification(args);
      
      case "create_release_workflow":
        return await this.createReleaseWorkflow(args);
      
      case "preview_release_notes":
        return await this.previewReleaseNotes(args);
      
      case "validate_configuration":
        return await this.validateConfiguration();
      
      case "get_sprint_status":
        return await this.getSprintStatus(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // Public methods for CLI access
  async generateReleaseNotesPublic(options: any) {
    const result = await this.releaseNotesService.generateReleaseNotes(options);
    return result;
  }

  async createCompleteWorkflowPublic(options: any) {
    const result = await this.releaseNotesService.createCompleteWorkflow(options);
    return result;
  }

  async previewReleaseNotesPublic(options: any) {
    const result = await this.releaseNotesService.previewReleaseNotes(options);
    return result;
  }

  async validateConfigurationPublic() {
    const requiredVars = [
      "JIRA_DOMAIN",
      "JIRA_TOKEN", 
      "JIRA_BOARD_ID",
      "GITHUB_REPOSITORY",
      "GITHUB_TOKEN",
      "CONFLUENCE_USERNAME",
      "CONFLUENCE_PAT",
      "CONFLUENCE_SPACE",
      "JIRA_CONFLUENCE_DOMAIN",
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
    
    console.log("✅ Configuration is valid!");
    return true;
  }

  private async generateReleaseNotes(args: RequestParams) {
    console.log(`🚀 MCP: Starting release notes generation...`);
    console.log(`Sprint: ${args.sprintNumber}, Format: ${args.format || "html"}, Theme: ${args.theme || "modern"}`);
    
    const result = await this.releaseNotesService.generateReleaseNotes({
      sprintNumber: args.sprintNumber,
      date: args.date,
      format: args.format || "html",
      theme: args.theme || "modern",
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Release notes generated successfully!\n\nFile: ${result.filePath}\nFormat: ${result.format}\nTheme: ${result.theme}\nJIRA Issues: ${result.stats.jiraIssues}\nGitHub Commits: ${result.stats.commits}\n\nContent length: ${result.content.length} characters`,
        },
      ],
    };
  }

  private async fetchJiraIssues(args: RequestParams) {
    const jiraService = new JiraService();
    const issues = await jiraService.fetchIssues(args.sprintNumber!);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Fetched ${issues.length} JIRA issues for sprint ${args.sprintNumber}\n\n${JSON.stringify(issues, null, 2)}`,
        },
      ],
    };
  }

  private async fetchGitHubCommits(args: RequestParams) {
    const githubService = new GitHubService();
    const commits = await githubService.fetchCommits(args.date);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Fetched ${commits.length} GitHub commits\n\n${JSON.stringify(commits, null, 2)}`,
        },
      ],
    };
  }

  private async publishToConfluence(args: any) {
    const confluenceService = new ConfluenceService();
    await confluenceService.publishPage(args.content, args.sprintNumber);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully published to Confluence${args.sprintNumber ? ` for sprint ${args.sprintNumber}` : ""}`,
        },
      ],
    };
  }

  private async sendTeamsNotification(args: any) {
    const teamsService = new TeamsService();
    await teamsService.sendNotification(args.summary, args.content);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Teams notification sent successfully`,
        },
      ],
    };
  }

  private async createReleaseWorkflow(args: RequestParams) {
    const result = await this.releaseNotesService.createCompleteWorkflow({
      sprintNumber: args.sprintNumber,
      date: args.date,
      output: args.output || "both",
      notifyTeams: args.notifyTeams !== false,
    });

    return {
      content: [
        {
          type: "text",
          text: `🚀 Complete release workflow executed successfully!\n\n${result.summary}\n\nSteps completed:\n${result.steps.map((step: string) => `✅ ${step}`).join('\n')}`,
        },
      ],
    };
  }

  private async previewReleaseNotes(args: RequestParams) {
    const result = await this.releaseNotesService.previewReleaseNotes({
      sprintNumber: args.sprintNumber,
      date: args.date,
      format: args.format || "markdown",
    });

    return {
      content: [
        {
          type: "text",
          text: `📋 Release Notes Preview (${result.format})\n\nStats: ${result.stats.jiraIssues} JIRA issues, ${result.stats.commits} commits\n\n${result.content}`,
        },
      ],
    };
  }

  private async validateConfiguration() {
    const requiredVars = [
      "JIRA_DOMAIN",
      "JIRA_TOKEN",
      "JIRA_BOARD_ID",
      "GITHUB_REPOSITORY",
      "GITHUB_TOKEN",
      "CONFLUENCE_USERNAME",
      "CONFLUENCE_PAT",
      "CONFLUENCE_SPACE",
      "JIRA_CONFLUENCE_DOMAIN",
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    const optional = ["TEAMS_WEBHOOK_URL", "JIRA_SPRINT_NUMBER", "JIRA_FETCH_COMMITS_DATE"];
    const optionalMissing = optional.filter(varName => !process.env[varName]);

    let status = "✅ Configuration is valid!";
    if (missing.length > 0) {
      status = `❌ Missing required environment variables: ${missing.join(", ")}`;
    }

    return {
      content: [
        {
          type: "text",
          text: `${status}\n\nRequired variables: ${requiredVars.length - missing.length}/${requiredVars.length} configured\nOptional variables: ${optional.length - optionalMissing.length}/${optional.length} configured\n\n${optionalMissing.length > 0 ? `Optional missing: ${optionalMissing.join(", ")}` : ""}`,
        },
      ],
    };
  }

  private async getSprintStatus(args: RequestParams) {
    const jiraService = new JiraService();
    const issues = await jiraService.fetchIssues(args.sprintNumber!);
    
    const statusCounts = issues.reduce((acc: any, issue: any) => {
      const status = issue.fields.status.name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const typeCounts = issues.reduce((acc: any, issue: any) => {
      const type = issue.fields.issuetype.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      content: [
        {
          type: "text",
          text: `📊 Sprint ${args.sprintNumber} Status:\n\nTotal Issues: ${issues.length}\n\nBy Status:\n${Object.entries(statusCounts).map(([status, count]) => `  ${status}: ${count}`).join('\n')}\n\nBy Type:\n${Object.entries(typeCounts).map(([type, count]) => `  ${type}: ${count}`).join('\n')}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Release MCP Server running on stdio");
  }
}

const server = new ReleaseMCPServer();
server.run().catch(console.error);
