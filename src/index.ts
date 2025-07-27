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
import { FileService } from "./services/FileService.js";
import { EnhancedJiraService } from "./services/EnhancedJiraService.js";
import { HtmlFormatter } from "./utils/HtmlFormatter.js";
import { SprintReviewTool } from "./tools/SprintReviewTool.js";
import { ShareableReportTool } from "./tools/ShareableReportTool.js";
import { TeamsValidationTool } from "./tools/TeamsValidationTool.js";
import dotenv from "dotenv";

dotenv.config();

interface RequestParams {
  sprintNumber?: string;
  sprintNumbers?: string[];
  confluencePage?: string;
  teamName?: string;
  environment?: string;
  startDate?: string;
  endDate?: string;
  includeJiraIssues?: boolean;
  includeGitCommits?: boolean;
  sendToTeams?: boolean;
  includeCurrentSprint?: boolean;
  includeTeamMetrics?: boolean;
  date?: string;
  format?: string;
  theme?: string;
  output?: string;
  notifyTeams?: boolean;
  // Enhanced JIRA analysis parameters
  ticketKey?: string;
  ticketKeys?: string[];
  jql?: string;
  analysisDepth?: 'basic' | 'standard' | 'comprehensive';
  includeInsights?: boolean;
  reportType?: 'individual' | 'bulk' | 'comparison';
  groupBy?: 'status' | 'assignee' | 'priority' | 'epic' | 'sprint' | 'risk';
  metrics?: Array<'cycleTime' | 'activity' | 'collaboration' | 'quality' | 'velocity'>;
  riskFilter?: Array<'low' | 'medium' | 'high'>;
  maxResults?: number;
  riskThreshold?: 'low' | 'medium' | 'high';
  includeActivityPatterns?: boolean;
  // New parameters for enhanced MCP tools
  includeVelocityTrends?: boolean;
  customFileName?: string;
  executionStatus?: 'success' | 'warning' | 'error';
  includeMetrics?: boolean;
  includeRecommendations?: boolean;
  htmlFile?: string;
  distributionMethods?: Array<'teams-files' | 'email-attachment' | 'cloud-storage' | 'direct-link'>;
  createDataUrl?: boolean;
  shareableReportType?: 'latest' | 'sprint-review' | 'release-notes';
}

export class ReleaseMCPServer {
  private server: Server;
  private releaseNotesService: ReleaseNotesService;
  private jiraService: JiraService;
  private teamsService: TeamsService;
  private fileService: FileService;
  private confluenceService: ConfluenceService;
  private enhancedJiraService: EnhancedJiraService;
  private sprintReviewTool: SprintReviewTool;
  private shareableReportTool: ShareableReportTool;
  private teamsValidationTool: TeamsValidationTool;

  constructor() {
    this.server = new Server(
      {
        name: "release-mcp-server",
        version: "1.0.0",
      }
    );

    this.releaseNotesService = new ReleaseNotesService();
    this.jiraService = new JiraService();
    this.teamsService = new TeamsService();
    this.fileService = new FileService();
    this.confluenceService = new ConfluenceService();
    this.enhancedJiraService = new EnhancedJiraService({
      domain: process.env.JIRA_DOMAIN || '',
      token: process.env.JIRA_TOKEN || '',
      email: process.env.JIRA_EMAIL
    });
    
    // Initialize new tool classes
    this.sprintReviewTool = new SprintReviewTool();
    this.shareableReportTool = new ShareableReportTool();
    this.teamsValidationTool = new TeamsValidationTool();
    
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
        name: "analyze_story_points",
        description: "Analyze story points completion for one or more sprints",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumbers: {
              type: "array",
              items: { type: "string" },
              description: "Array of sprint numbers to analyze (default: recent sprints)",
            },
            sendToTeams: {
              type: "boolean",
              description: "Whether to send results to Teams (default: true)",
            },
          },
        },
      },
      {
        name: "generate_velocity_report",
        description: "Generate comprehensive velocity report for multiple sprints with trend analysis",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumbers: {
              type: "array",
              items: { type: "string" },
              description: "Array of sprint numbers for velocity analysis (default: last 6 months)",
            },
            sendToTeams: {
              type: "boolean",
              description: "Whether to send report to Teams (default: true)",
            },
            includeCurrentSprint: {
              type: "boolean",
              description: "Whether to include current sprint analysis (default: true)",
            },
          },
        },
      },
      {
        name: "sprint_summary_report",
        description: "Generate detailed summary report for a specific sprint",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumber: {
              type: "string",
              description: "Sprint number to analyze",
            },
            sendToTeams: {
              type: "boolean",
              description: "Whether to send report to Teams (default: true)",
            },
            includeTeamMetrics: {
              type: "boolean",
              description: "Whether to include individual team member metrics (default: true)",
            },
          },
          required: ["sprintNumber"],
        },
      },
      {
        name: "analyze_jira_ticket",
        description: "Deep analysis of individual JIRA ticket with insights and recommendations",
        inputSchema: {
          type: "object",
          properties: {
            ticketKey: { type: "string", description: "JIRA ticket key (e.g., PROJ-123)" },
            analysisDepth: { 
              type: "string", 
              enum: ["basic", "standard", "comprehensive"],
              description: "Depth of analysis to perform (default: standard)"
            },
            sendToTeams: { type: "boolean", description: "Whether to send results to Teams (default: false)" }
          },
          required: ["ticketKey"]
        }
      },
      {
        name: "bulk_analyze_tickets",
        description: "Analyze multiple JIRA tickets with insights and filtering",
        inputSchema: {
          type: "object",
          properties: {
            ticketKeys: {
              type: "array",
              items: { type: "string" },
              description: "Array of JIRA ticket keys to analyze"
            },
            jql: { type: "string", description: "JQL query to search tickets (alternative to ticketKeys)" },
            includeInsights: { type: "boolean", description: "Include detailed insights analysis (default: true)" },
            riskFilter: {
              type: "array",
              items: { type: "string", enum: ["low", "medium", "high"] },
              description: "Filter by risk levels"
            },
            maxResults: { type: "number", description: "Maximum number of tickets to analyze (default: 50)" },
            sendToTeams: { type: "boolean", description: "Whether to send results to Teams (default: false)" }
          }
        }
      },
      {
        name: "generate_jira_report",
        description: "Generate comprehensive JIRA report with grouping and metrics",
        inputSchema: {
          type: "object",
          properties: {
            ticketKeys: {
              type: "array",
              items: { type: "string" },
              description: "Array of JIRA ticket keys to include in report"
            },
            jql: { type: "string", description: "JQL query to search tickets for report" },
            groupBy: {
              type: "string",
              enum: ["status", "assignee", "priority", "epic", "sprint", "risk"],
              description: "How to group tickets in the report (default: status)"
            },
            metrics: {
              type: "array",
              items: { type: "string", enum: ["cycleTime", "activity", "collaboration", "quality", "velocity"] },
              description: "Metrics to include in the report (default: cycleTime, quality)"
            },
            sendToTeams: { type: "boolean", description: "Whether to send report to Teams (default: true)" }
          }
        }
      },
      {
        name: "ticket_risk_assessment",
        description: "Assess risk factors for JIRA tickets and provide mitigation recommendations",
        inputSchema: {
          type: "object",
          properties: {
            ticketKeys: {
              type: "array",
              items: { type: "string" },
              description: "Array of JIRA ticket keys to assess"
            },
            jql: { type: "string", description: "JQL query to search tickets for risk assessment" },
            riskThreshold: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Minimum risk level to include in results (default: medium)"
            },
            sendToTeams: { type: "boolean", description: "Whether to send assessment to Teams (default: true)" }
          }
        }
      },
      {
        name: "ticket_collaboration_analysis",
        description: "Analyze collaboration patterns and stakeholder engagement for tickets",
        inputSchema: {
          type: "object",
          properties: {
            ticketKeys: {
              type: "array",
              items: { type: "string" },
              description: "Array of JIRA ticket keys to analyze"
            },
            jql: { type: "string", description: "JQL query to search tickets" },
            includeActivityPatterns: { type: "boolean", description: "Include activity pattern analysis (default: true)" },
            sendToTeams: { type: "boolean", description: "Whether to send analysis to Teams (default: false)" }
          }
        }
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
      {
        name: "generate_sprint_review",
        description: "Generate comprehensive sprint review report comparing multiple sprints with velocity trends and performance analysis",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumbers: {
              type: "array",
              items: { type: "string" },
              description: "Array of sprint numbers to analyze and compare",
            },
            includeVelocityTrends: {
              type: "boolean",
              description: "Include historical velocity trend analysis (default: true)",
            },
            sendToTeams: {
              type: "boolean", 
              description: "Send comprehensive report to Teams channel (default: true)",
            },
            format: {
              type: "string",
              enum: ["html", "markdown"],
              description: "Output format for the report (default: html)",
            }
          },
          required: ["sprintNumbers"],
        },
      },
      {
        name: "create_shareable_report",
        description: "Create shareable version of generated HTML reports with enhanced portability and sharing instructions",
        inputSchema: {
          type: "object",
          properties: {
            shareableReportType: {
              type: "string",
              enum: ["latest", "sprint-review", "release-notes"],
              description: "Type of report to make shareable (default: latest)",
            },
            customFileName: {
              type: "string",
              description: "Custom filename for the shareable version (optional)",
            },
            sendToTeams: {
              type: "boolean",
              description: "Send sharing instructions to Teams (default: true)",
            }
          }
        },
      },
      {
        name: "send_workflow_report",
        description: "Send comprehensive workflow execution results and analysis to Teams channel",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumber: {
              type: "string",
              description: "Sprint number for the workflow report",
            },
            executionStatus: {
              type: "string",
              enum: ["success", "warning", "error"],
              description: "Overall execution status (default: success)",
            },
            includeMetrics: {
              type: "boolean",
              description: "Include detailed sprint metrics (default: true)",
            },
            includeRecommendations: {
              type: "boolean",
              description: "Include actionable recommendations (default: true)", 
            }
          },
          required: ["sprintNumber"],
        },
      },
      {
        name: "html_to_teams_attachment",
        description: "Convert HTML reports to Teams-shareable format with multiple distribution methods",
        inputSchema: {
          type: "object",
          properties: {
            htmlFile: {
              type: "string",
              description: "Path to HTML file to share (optional, defaults to latest)",
            },
            distributionMethods: {
              type: "array",
              items: { 
                type: "string",
                enum: ["teams-files", "email-attachment", "cloud-storage", "direct-link"]
              },
              description: "Preferred distribution methods to include in Teams message",
            },
            createDataUrl: {
              type: "boolean",
              description: "Create base64 data URL for browser access (default: false)",
            }
          }
        },
      },
      {
        name: "generate_sprint_review",
        description: "Generate comprehensive sprint review report with metrics and velocity trends",
        inputSchema: {
          type: "object",
          properties: {
            sprintNumbers: {
              type: "array",
              items: { type: "string" },
              description: "Array of sprint numbers to analyze"
            },
            includeVelocityTrends: {
              type: "boolean",
              description: "Include velocity trend analysis (default: true)"
            },
            sendToTeams: {
              type: "boolean", 
              description: "Send report to Teams (default: true)"
            },
            format: {
              type: "string",
              enum: ["html", "markdown"],
              description: "Output format (default: html)"
            }
          },
          required: ["sprintNumbers"]
        }
      },
      {
        name: "create_shareable_report",
        description: "Create and share HTML reports with multiple distribution options",
        inputSchema: {
          type: "object",
          properties: {
            htmlFile: {
              type: "string",
              description: "Path to HTML file to share"
            },
            distributionMethods: {
              type: "array",
              items: {
                type: "string",
                enum: ["teams-files", "email-attachment", "cloud-storage", "direct-link"]
              },
              description: "Distribution methods to use"
            },
            createDataUrl: {
              type: "boolean",
              description: "Create base64 data URL (default: false)"
            },
            shareableReportType: {
              type: "string",
              enum: ["latest", "sprint-review", "release-notes"],
              description: "Type of report being shared (default: latest)"
            }
          },
          required: ["htmlFile"]
        }
      },
      {
        name: "validate_teams_integration",
        description: "Validate Teams webhook and integration functionality",
        inputSchema: {
          type: "object",
          properties: {
            includeMetrics: {
              type: "boolean",
              description: "Include performance metrics in validation (default: true)"
            },
            includeRecommendations: {
              type: "boolean", 
              description: "Include optimization recommendations (default: true)"
            }
          }
        }
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
      
      case "analyze_story_points":
        return await this.analyzeStoryPoints(args);
      
      case "generate_velocity_report":
        return await this.generateVelocityReport(args);
      
      case "sprint_summary_report":
        return await this.sprintSummaryReport(args);
      
      case "analyze_jira_ticket":
        return await this.analyzeJiraTicket(args);
      
      case "bulk_analyze_tickets":
        return await this.bulkAnalyzeTickets(args);
      
      case "generate_jira_report":
        return await this.generateJiraReport(args);
      
      case "ticket_risk_assessment":
        return await this.ticketRiskAssessment(args);
      
      case "ticket_collaboration_analysis":
        return await this.ticketCollaborationAnalysis(args);
      
      case "generate_sprint_review":
        return await this.generateSprintReview(args);
      
      case "create_shareable_report":
        return await this.createShareableReport(args);
      
      case "send_workflow_report":
        return await this.sendWorkflowReport(args);
      
      case "html_to_teams_attachment":
        return await this.htmlToTeamsAttachment(args);
      
      case "validate_teams_integration":
        return await this.validateTeamsIntegration(args);
      
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
      "GH_REPOSITORY",
      "GH_TOKEN",
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
      format: (args.format as "html" | "markdown") || "html",
      theme: (args.theme as "default" | "modern" | "minimal") || "modern",
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
      output: (args.output as "confluence" | "file" | "both") || "both",
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
      format: (args.format as "html" | "markdown") || "markdown",
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
      "GH_REPOSITORY",
      "GH_TOKEN",
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

  private async analyzeStoryPoints(args: RequestParams) {
    const sprintNumbers = args.sprintNumbers || ['SCNT-2025-20', 'SCNT-2025-21'];
    const sendToTeams = args.sendToTeams !== false;

    let totalPoints = 0;
    let totalCompletedPoints = 0;
    let sprintDetails: any[] = [];

    for (const sprintNumber of sprintNumbers) {
      try {
        const issues = await this.jiraService.fetchIssues(sprintNumber);
        const stats = this.jiraService.calculateStoryPointsStats(issues);
        
        sprintDetails.push({
          sprint: sprintNumber,
          issues: issues.length,
          totalPoints: stats.totalStoryPoints,
          completedPoints: stats.completedStoryPoints,
          completionRate: stats.completionRate,
        });

        totalPoints += stats.totalStoryPoints;
        totalCompletedPoints += stats.completedStoryPoints;
      } catch (error: any) {
        console.log(`Skipping ${sprintNumber}: ${error.message}`);
      }
    }

    const overallCompletion = totalPoints > 0 ? Math.round((totalCompletedPoints / totalPoints) * 100) : 0;

    if (sendToTeams) {
      await this.teamsService.sendRichNotification({
        title: '📊 Story Points Analysis Report',
        summary: `Story points analysis: ${totalCompletedPoints}/${totalPoints} points (${overallCompletion}%) across ${sprintDetails.length} sprints`,
        facts: [
          { name: '🎯 Overall Completion', value: `${overallCompletion}%` },
          { name: '📊 Total Story Points', value: `${totalCompletedPoints}/${totalPoints}` },
          { name: '🚀 Total Sprints', value: `${sprintDetails.length}` },
          { name: '📈 Average Velocity', value: `${Math.round(totalCompletedPoints / sprintDetails.length)} points/sprint` },
          { name: '🏆 Performance', value: overallCompletion >= 95 ? '🌟 Exceptional' : overallCompletion >= 85 ? '✨ Excellent' : '👍 Good' }
        ]
      });
    }

    return {
      content: [
        {
          type: "text",
          text: `📊 Story Points Analysis\n\n${sprintDetails.map(s => `${s.sprint}: ${s.completedPoints}/${s.totalPoints} points (${s.completionRate}%)`).join('\n')}\n\nOverall: ${totalCompletedPoints}/${totalPoints} points (${overallCompletion}%)\n${sendToTeams ? '\n✅ Report sent to Teams' : ''}`,
        },
      ],
    };
  }

  private async generateVelocityReport(args: RequestParams) {
    const sprintNumbers = args.sprintNumbers || [
      'SCNT-2025-15', 'SCNT-2025-16', 'SCNT-2025-17', 'SCNT-2025-18', 
      'SCNT-2025-19', 'SCNT-2025-20', 'SCNT-2025-21'
    ];
    const sendToTeams = args.sendToTeams !== false;
    const includeCurrentSprint = args.includeCurrentSprint !== false;

    const velocityData: any[] = [];
    let totalVelocityPoints = 0;

    for (const sprintNumber of sprintNumbers) {
      try {
        const sprintDetails = await this.jiraService.getSprintDetails(sprintNumber);
        const issues = await this.jiraService.fetchIssues(sprintNumber);
        const stats = this.jiraService.calculateStoryPointsStats(issues);
        
        velocityData.push({
          sprintNumber,
          sprintName: sprintDetails.name,
          totalIssues: issues.length,
          velocity: stats.completedStoryPoints,
          completionRate: stats.completionRate,
        });

        totalVelocityPoints += stats.completedStoryPoints;
      } catch (error: any) {
        console.log(`Skipping ${sprintNumber}: ${error.message}`);
      }
    }

    const avgVelocity = velocityData.length > 0 ? Math.round(totalVelocityPoints / velocityData.length) : 0;
    const avgCompletionRate = velocityData.length > 0 
      ? Math.round(velocityData.reduce((sum, s) => sum + s.completionRate, 0) / velocityData.length)
      : 0;

    if (sendToTeams) {
      await this.teamsService.sendRichNotification({
        title: '📊 Velocity Report - 6 Month Analysis',
        summary: `Velocity analysis: ${avgVelocity} avg points/sprint, ${avgCompletionRate}% completion across ${velocityData.length} sprints`,
        facts: [
          { name: '📈 Average Velocity', value: `${avgVelocity} story points` },
          { name: '🎯 Completion Rate', value: `${avgCompletionRate}%` },
          { name: '📊 Total Points', value: `${totalVelocityPoints} points` },
          { name: '🚀 Sprints Analyzed', value: `${velocityData.length}` },
          { name: '🏆 Best Sprint', value: `${Math.max(...velocityData.map(s => s.velocity))} points` },
          { name: '📉 Lowest Sprint', value: `${Math.min(...velocityData.map(s => s.velocity))} points` }
        ]
      });
    }

    return {
      content: [
        {
          type: "text",
          text: `📊 Velocity Report\n\nAverage Velocity: ${avgVelocity} story points/sprint\nCompletion Rate: ${avgCompletionRate}%\nTotal Points: ${totalVelocityPoints}\n\nSprint Details:\n${velocityData.map(s => `${s.sprintNumber}: ${s.velocity} points (${s.completionRate}%)`).join('\n')}\n${sendToTeams ? '\n✅ Report sent to Teams' : ''}`,
        },
      ],
    };
  }

  private async sprintSummaryReport(args: RequestParams) {
    const sprintNumber = args.sprintNumber!;
    const sendToTeams = args.sendToTeams !== false;
    const includeTeamMetrics = args.includeTeamMetrics !== false;

    try {
      const sprintDetails = await this.jiraService.getSprintDetails(sprintNumber);
      const issues = await this.jiraService.fetchIssues(sprintNumber);
      const stats = this.jiraService.calculateStoryPointsStats(issues);

      const issuesByType = issues.reduce((acc, issue) => {
        const type = issue.fields.issuetype.name;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const assigneeStats = includeTeamMetrics ? issues.reduce((acc, issue) => {
        const assignee = issue.fields.assignee?.displayName || 'Unassigned';
        const points = issue.fields.storyPoints || 0;
        if (!acc[assignee]) {
          acc[assignee] = { issues: 0, points: 0 };
        }
        acc[assignee].issues++;
        acc[assignee].points += points;
        return acc;
      }, {} as Record<string, { issues: number; points: number }>) : {};

      if (sendToTeams) {
        await this.teamsService.sendRichNotification({
          title: `📋 Sprint ${sprintNumber} - Summary Report`,
          summary: `Sprint summary: ${stats.completedStoryPoints}/${stats.totalStoryPoints} points (${stats.completionRate}%)`,
          facts: [
            { name: '📊 Completion Rate', value: `${stats.completionRate}%` },
            { name: '🚀 Story Points', value: `${stats.completedStoryPoints}/${stats.totalStoryPoints}` },
            { name: '📋 Total Issues', value: `${issues.length}` },
            { name: '🎯 Sprint Status', value: sprintDetails.state },
            { name: '📈 Performance', value: stats.completionRate >= 90 ? '🌟 Exceptional' : '✨ Good' }
          ]
        });
      }

      return {
        content: [
          {
            type: "text",
            text: `📋 Sprint ${sprintNumber} Summary\n\nCompletion: ${stats.completedStoryPoints}/${stats.totalStoryPoints} points (${stats.completionRate}%)\nIssues: ${issues.length}\nStatus: ${sprintDetails.state}\n\nIssue Types:\n${Object.entries(issuesByType).map(([type, count]) => `  ${type}: ${count}`).join('\n')}\n${includeTeamMetrics ? `\nTop Contributors:\n${Object.entries(assigneeStats).slice(0, 5).map(([name, stats]) => `  ${name}: ${stats.points} points, ${stats.issues} issues`).join('\n')}` : ''}\n${sendToTeams ? '\n✅ Report sent to Teams' : ''}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to generate sprint summary: ${error.message}`);
    }
  }

  private async analyzeJiraTicket(args: RequestParams) {
    const ticketKey = args.ticketKey!;
    const analysisDepth = args.analysisDepth || 'standard';
    const sendToTeams = args.sendToTeams !== false;

    try {
      const analysis = await this.enhancedJiraService.analyzeTicket({
        ticketKey,
        analysisDepth,
        includeChangelog: true,
        includeComments: true,
        includeWorklogs: true
      });

      const { details, insights } = analysis;
      
      // Format for display
      const summary = `🎫 **${details.metadata.key}**: ${details.metadata.summary}

📊 **Status**: ${details.metadata.status.name} (${details.metadata.status.category})
👤 **Assignee**: ${details.metadata.assignee?.displayName || 'Unassigned'}
📅 **Created**: ${new Date(details.metadata.created).toLocaleDateString()}
⏱️ **Last Updated**: ${new Date(details.metadata.updated).toLocaleDateString()}

🔍 **Analysis Results**:
• **Risk Level**: ${insights.risks.overallRisk.toUpperCase()} ${insights.risks.overallRisk === 'high' ? '🚨' : insights.risks.overallRisk === 'medium' ? '⚠️' : '✅'}
• **Activity Score**: ${insights.activityPattern.activityScore}/100
• **Collaboration Score**: ${insights.collaboration.stakeholderEngagement}/100
• **Quality Score**: ${insights.quality.descriptionQuality}/100

${insights.risks.isBlocked ? '🛑 **BLOCKED TICKET**\n' : ''}${insights.risks.overdueRisk === 'high' ? '⏰ **OVERDUE**\n' : ''}
📈 **Cycle Time**: ${insights.cycleTime.leadTime ? `${Math.round(insights.cycleTime.leadTime / (1000 * 60 * 60 * 24))} days` : 'Not completed'}

💡 **Recommendations**:
${insights.recommendations.map(rec => `• ${rec}`).join('\n')}

🏷️ **Insight Tags**: ${insights.tags.join(', ')}`;

      if (sendToTeams) {
        await this.teamsService.sendRichNotification({
          title: `🎫 Ticket Analysis: ${details.metadata.key}`,
          summary: `Analysis completed for ${details.metadata.key} - Risk: ${insights.risks.overallRisk}`,
          facts: [
            { name: '🎫 Ticket', value: `${details.metadata.key}: ${details.metadata.summary}` },
            { name: '📊 Status', value: details.metadata.status.name },
            { name: '🚨 Risk Level', value: insights.risks.overallRisk.toUpperCase() },
            { name: '📈 Activity Score', value: `${insights.activityPattern.activityScore}/100` },
            { name: '🤝 Collaboration', value: `${insights.collaboration.stakeholderEngagement}/100` },
            { name: '📝 Quality Score', value: `${insights.quality.descriptionQuality}/100` },
            { name: '⏱️ Cycle Time', value: insights.cycleTime.leadTime ? `${Math.round(insights.cycleTime.leadTime / (1000 * 60 * 60 * 24))} days` : 'In progress' }
          ]
        });
      }

      return {
        content: [
          {
            type: "text",
            text: summary + (sendToTeams ? '\n\n✅ Analysis sent to Teams' : ''),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze ticket ${ticketKey}: ${error.message}`);
    }
  }

  private async bulkAnalyzeTickets(args: RequestParams) {
    const ticketKeys = args.ticketKeys;
    const jql = args.jql;
    const includeInsights = args.includeInsights !== false;
    const riskFilter = args.riskFilter;
    const maxResults = args.maxResults || 50;
    const sendToTeams = args.sendToTeams !== false;

    try {
      let analysisResults: Map<string, any>;

      if (jql) {
        analysisResults = await this.enhancedJiraService.searchAndAnalyze(jql, {
          maxResults,
          includeInsights
        });
      } else if (ticketKeys && ticketKeys.length > 0) {
        analysisResults = await this.enhancedJiraService.bulkAnalyzeTickets({
          tickets: ticketKeys,
          includeInsights,
          filterCriteria: riskFilter ? { riskLevels: riskFilter } : undefined
        });
      } else {
        throw new Error('Either ticketKeys or jql must be provided');
      }

      const results = Array.from(analysisResults.entries()).map(([key, analysis]) => ({
        key,
        summary: analysis.details.metadata.summary,
        status: analysis.details.metadata.status.name,
        assignee: analysis.details.metadata.assignee?.displayName || 'Unassigned',
        storyPoints: analysis.details.storyPoints,
        riskLevel: analysis.insights?.risks.overallRisk,
        activityScore: analysis.insights?.activityPattern.activityScore,
        recommendations: analysis.insights?.recommendations?.slice(0, 2) // Top 2 recommendations
      }));

      // Summary statistics
      const riskCounts = results.reduce((acc, ticket) => {
        const risk = ticket.riskLevel || 'unknown';
        acc[risk] = (acc[risk] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalStoryPoints = results.reduce((sum, ticket) => sum + (ticket.storyPoints || 0), 0);
      const avgActivityScore = results.reduce((sum, ticket) => sum + (ticket.activityScore || 0), 0) / results.length;

      const summaryText = `📊 **Bulk Ticket Analysis Results**

📈 **Summary**:
• Total Tickets: ${results.length}
• Total Story Points: ${totalStoryPoints}
• Average Activity Score: ${Math.round(avgActivityScore)}/100

🚨 **Risk Distribution**:
• High Risk: ${riskCounts.high || 0} tickets
• Medium Risk: ${riskCounts.medium || 0} tickets  
• Low Risk: ${riskCounts.low || 0} tickets

📋 **Top Issues**:
${results.filter(t => t.riskLevel === 'high').slice(0, 5).map(ticket => 
  `• ${ticket.key}: ${ticket.summary} (${ticket.riskLevel} risk)`
).join('\n') || 'No high-risk tickets found'}

💡 **Common Recommendations**:
${Array.from(new Set(results.flatMap(t => t.recommendations || []))).slice(0, 5).map(rec => `• ${rec}`).join('\n')}`;

      if (sendToTeams) {
        await this.teamsService.sendRichNotification({
          title: '📊 Bulk Ticket Analysis Report',
          summary: `Analyzed ${results.length} tickets - ${riskCounts.high || 0} high risk found`,
          facts: [
            { name: '📊 Total Tickets', value: results.length.toString() },
            { name: '🎯 Story Points', value: totalStoryPoints.toString() },
            { name: '🚨 High Risk', value: (riskCounts.high || 0).toString() },
            { name: '⚠️ Medium Risk', value: (riskCounts.medium || 0).toString() },
            { name: '✅ Low Risk', value: (riskCounts.low || 0).toString() },
            { name: '📈 Avg Activity', value: `${Math.round(avgActivityScore)}/100` }
          ]
        });
      }

      return {
        content: [
          {
            type: "text",
            text: summaryText + (sendToTeams ? '\n\n✅ Report sent to Teams' : ''),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to bulk analyze tickets: ${error.message}`);
    }
  }

  private async generateJiraReport(args: RequestParams) {
    const ticketKeys = args.ticketKeys;
    const jql = args.jql;
    const groupBy = args.groupBy || 'status';
    const metrics = args.metrics || ['cycleTime', 'quality'];
    const sendToTeams = args.sendToTeams !== false;

    try {
      let tickets: string[] = [];
      
      if (jql) {
        const searchResults = await this.enhancedJiraService.searchTickets(jql, { maxResults: 100 });
        tickets = searchResults.issues.map((issue: any) => issue.key);
      } else if (ticketKeys) {
        tickets = ticketKeys;
      } else {
        throw new Error('Either ticketKeys or jql must be provided');
      }

      const report = await this.enhancedJiraService.generateReport(tickets, {
        groupBy: groupBy as any,
        metrics: metrics as any
      });

      // Format report for display
      let reportText = `📊 **JIRA Analysis Report**

📈 **Summary**:
• Total Tickets: ${report.summary.totalTickets}
• Grouped By: ${report.summary.groupBy}
• Generated: ${new Date(report.summary.analyzedAt).toLocaleString()}

📋 **Group Analysis**:
`;

      Array.from(report.groups.entries()).forEach((entry: any) => {
        const [groupName, groupData] = entry;
        reportText += `\n**${groupName}** (${groupData.ticketCount} tickets):
`;
        if (groupData.metrics.cycleTime) {
          reportText += `  • Average Cycle Time: ${Math.round(groupData.metrics.cycleTime.average)} days\n`;
        }
        if (groupData.metrics.quality) {
          reportText += `  • Quality Score: ${Math.round(groupData.metrics.quality.averageDescriptionQuality)}/100\n`;
        }
        if (groupData.metrics.velocity) {
          reportText += `  • Story Points: ${groupData.metrics.velocity.totalStoryPoints}\n`;
        }
        if (groupData.insights.length > 0) {
          reportText += `  • Insights: ${groupData.insights[0]}\n`;
        }
      });

      if (report.recommendations.length > 0) {
        reportText += `\n💡 **Recommendations**:
${report.recommendations.map((rec: string) => `• ${rec}`).join('\n')}`;
      }

      if (sendToTeams) {
        const topGroups = Array.from(report.groups.entries()).slice(0, 6);
        await this.teamsService.sendRichNotification({
          title: '📊 JIRA Analysis Report',
          summary: `Report generated for ${report.summary.totalTickets} tickets grouped by ${groupBy}`,
          facts: topGroups.map((entry: any) => {
            const [groupName, groupData] = entry;
            return {
              name: `📋 ${groupName}`,
              value: `${groupData.ticketCount} tickets`
            };
          })
        });
      }

      return {
        content: [
          {
            type: "text",
            text: reportText + (sendToTeams ? '\n\n✅ Report sent to Teams' : ''),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to generate JIRA report: ${error.message}`);
    }
  }

  private async ticketRiskAssessment(args: RequestParams) {
    const ticketKeys = args.ticketKeys;
    const jql = args.jql;
    const riskThreshold = args.riskThreshold || 'medium';
    const sendToTeams = args.sendToTeams !== false;

    try {
      let tickets: string[] = [];
      
      if (jql) {
        const searchResults = await this.enhancedJiraService.searchTickets(jql, { maxResults: 100 });
        tickets = searchResults.issues.map((issue: any) => issue.key);
      } else if (ticketKeys) {
        tickets = ticketKeys;
      } else {
        throw new Error('Either ticketKeys or jql must be provided');
      }

      const analysisResults = await this.enhancedJiraService.bulkAnalyzeTickets({
        tickets,
        includeInsights: true,
        filterCriteria: {
          riskLevels: riskThreshold === 'low' ? ['low', 'medium', 'high'] 
                     : riskThreshold === 'medium' ? ['medium', 'high']
                     : ['high']
        }
      });

      const riskAssessment = Array.from(analysisResults.entries()).map(([key, analysis]) => ({
        key,
        summary: analysis.details.metadata.summary,
        riskLevel: analysis.insights?.risks.overallRisk,
        riskFactors: {
          blocked: analysis.insights?.risks.isBlocked,
          overdue: analysis.insights?.risks.overdueRisk !== 'low',
          complex: analysis.insights?.risks.complexityRisk !== 'low',
          stale: (analysis.insights?.activityPattern?.activityScore || 0) < 30
        },
        recommendations: analysis.insights?.recommendations || []
      })).filter(ticket => ticket.riskLevel && 
        (riskThreshold === 'low' || 
         (riskThreshold === 'medium' && ['medium', 'high'].includes(ticket.riskLevel)) ||
         (riskThreshold === 'high' && ticket.riskLevel === 'high')));

      const riskSummary = `🚨 **Risk Assessment Report**

📊 **Summary**:
• Total Tickets Assessed: ${tickets.length}
• Tickets Meeting Risk Threshold: ${riskAssessment.length}
• Risk Threshold: ${riskThreshold.toUpperCase()}

🎯 **High Priority Risks**:
${riskAssessment.filter(t => t.riskLevel === 'high').slice(0, 10).map(ticket => 
  `• **${ticket.key}**: ${ticket.summary}
    - Risk Factors: ${Object.entries(ticket.riskFactors).filter(([_, value]) => value).map(([key]) => key).join(', ') || 'complexity'}
    - Top Recommendation: ${ticket.recommendations[0] || 'Review and monitor'}
`).join('\n')}

⚠️ **Medium Priority Risks**:
${riskAssessment.filter(t => t.riskLevel === 'medium').slice(0, 5).map(ticket => 
  `• **${ticket.key}**: ${ticket.summary}`
).join('\n')}

💡 **Key Mitigation Actions**:
${Array.from(new Set(riskAssessment.flatMap(t => t.recommendations))).slice(0, 8).map(rec => `• ${rec}`).join('\n')}`;

      if (sendToTeams) {
        const highRiskCount = riskAssessment.filter(t => t.riskLevel === 'high').length;
        const mediumRiskCount = riskAssessment.filter(t => t.riskLevel === 'medium').length;
        
        await this.teamsService.sendRichNotification({
          title: '🚨 Ticket Risk Assessment',
          summary: `Risk assessment completed: ${highRiskCount} high risk, ${mediumRiskCount} medium risk tickets found`,
          facts: [
            { name: '📊 Total Assessed', value: tickets.length.toString() },
            { name: '🚨 High Risk', value: highRiskCount.toString() },
            { name: '⚠️ Medium Risk', value: mediumRiskCount.toString() },
            { name: '🛑 Blocked', value: riskAssessment.filter(t => t.riskFactors.blocked).length.toString() },
            { name: '⏰ Overdue', value: riskAssessment.filter(t => t.riskFactors.overdue).length.toString() },
            { name: '📊 Stale', value: riskAssessment.filter(t => t.riskFactors.stale).length.toString() }
          ]
        });
      }

      return {
        content: [
          {
            type: "text",
            text: riskSummary + (sendToTeams ? '\n\n✅ Assessment sent to Teams' : ''),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to perform risk assessment: ${error.message}`);
    }
  }

  private async ticketCollaborationAnalysis(args: RequestParams) {
    const ticketKeys = args.ticketKeys;
    const jql = args.jql;
    const includeActivityPatterns = args.includeActivityPatterns !== false;
    const sendToTeams = args.sendToTeams !== false;

    try {
      let tickets: string[] = [];
      
      if (jql) {
        const searchResults = await this.enhancedJiraService.searchTickets(jql, { maxResults: 50 });
        tickets = searchResults.issues.map((issue: any) => issue.key);
      } else if (ticketKeys) {
        tickets = ticketKeys;
      } else {
        throw new Error('Either ticketKeys or jql must be provided');
      }

      const analysisResults = await this.enhancedJiraService.bulkAnalyzeTickets({
        tickets,
        includeInsights: true
      });

      // Aggregate collaboration metrics
      const collaborationData = Array.from(analysisResults.entries()).map(([key, analysis]) => ({
        key,
        summary: analysis.details.metadata.summary,
        assignee: analysis.details.metadata.assignee?.displayName || 'Unassigned',
        collaboration: analysis.insights?.collaboration,
        activity: analysis.insights?.activityPattern,
        commentsCount: analysis.details.comments.length,
        worklogCount: analysis.details.worklogs.length,
        uniqueContributors: new Set([
          ...analysis.details.comments.map(c => c.author.accountId),
          ...analysis.details.worklogs.map(w => w.author.accountId)
        ]).size
      }));

      // Calculate aggregated insights
      const totalCollaborationScore = collaborationData.reduce((sum, t) => sum + (t.collaboration?.stakeholderEngagement || 0), 0) / collaborationData.length;
      const totalActivityScore = collaborationData.reduce((sum, t) => sum + (t.activity?.activityScore || 0), 0) / collaborationData.length;
      const totalComments = collaborationData.reduce((sum, t) => sum + t.commentsCount, 0);
      const totalWorklogs = collaborationData.reduce((sum, t) => sum + t.worklogCount, 0);
      const allContributors = new Set(collaborationData.flatMap(t => 
        [...Array.from({ length: t.uniqueContributors }, (_, i) => `${t.key}-contributor-${i}`)]
      )).size;

      // Identify collaboration patterns
      const highCollaborationTickets = collaborationData.filter(t => (t.collaboration?.stakeholderEngagement || 0) > 70);
      const lowCollaborationTickets = collaborationData.filter(t => (t.collaboration?.stakeholderEngagement || 0) < 30);
      const activeTickets = collaborationData.filter(t => (t.activity?.activityScore || 0) > 50);

      const analysisText = `🤝 **Collaboration Analysis Report**

📊 **Overall Metrics**:
• Total Tickets: ${collaborationData.length}
• Average Collaboration Score: ${Math.round(totalCollaborationScore)}/100
• Average Activity Score: ${Math.round(totalActivityScore)}/100
• Total Comments: ${totalComments}
• Total Work Logs: ${totalWorklogs}

🏆 **High Collaboration Tickets** (${highCollaborationTickets.length}):
${highCollaborationTickets.slice(0, 5).map(ticket => 
  `• **${ticket.key}**: ${ticket.summary}
    - Engagement: ${ticket.collaboration?.stakeholderEngagement || 0}/100
    - Contributors: ${ticket.uniqueContributors}
    - Comments: ${ticket.commentsCount}
`).join('\n')}

⚠️ **Low Collaboration Tickets** (${lowCollaborationTickets.length}):
${lowCollaborationTickets.slice(0, 5).map(ticket => 
  `• **${ticket.key}**: ${ticket.summary} (Score: ${ticket.collaboration?.stakeholderEngagement || 0}/100)`
).join('\n')}

${includeActivityPatterns ? `
📈 **Activity Patterns**:
• Highly Active: ${activeTickets.length} tickets
• Average Comments per Ticket: ${Math.round(totalComments / collaborationData.length)}
• Average Worklogs per Ticket: ${Math.round(totalWorklogs / collaborationData.length)}

📅 **Most Active Times**:
${collaborationData.filter(t => t.activity?.mostActiveDay).slice(0, 3).map(ticket => 
  `• ${ticket.key}: ${ticket.activity?.mostActiveDay} at ${ticket.activity?.mostActiveHour}:00`
).join('\n')}
` : ''}

💡 **Recommendations**:
• ${lowCollaborationTickets.length > 0 ? `${lowCollaborationTickets.length} tickets need stakeholder engagement` : 'Good collaboration levels overall'}
• ${collaborationData.filter(t => t.commentsCount === 0).length} tickets have no comments - consider adding context
• ${collaborationData.filter(t => t.assignee === 'Unassigned').length} tickets are unassigned - assign owners for better accountability`;

      if (sendToTeams) {
        await this.teamsService.sendRichNotification({
          title: '🤝 Collaboration Analysis Report',
          summary: `Collaboration analysis: ${Math.round(totalCollaborationScore)}/100 avg score across ${collaborationData.length} tickets`,
          facts: [
            { name: '📊 Tickets Analyzed', value: collaborationData.length.toString() },
            { name: '🤝 Avg Collaboration', value: `${Math.round(totalCollaborationScore)}/100` },
            { name: '📈 Avg Activity', value: `${Math.round(totalActivityScore)}/100` },
            { name: '🏆 High Engagement', value: highCollaborationTickets.length.toString() },
            { name: '⚠️ Low Engagement', value: lowCollaborationTickets.length.toString() },
            { name: '💬 Total Comments', value: totalComments.toString() }
          ]
        });
      }

      return {
        content: [
          {
            type: "text",
            text: analysisText + (sendToTeams ? '\n\n✅ Analysis sent to Teams' : ''),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to perform collaboration analysis: ${error.message}`);
    }
  }

  // New MCP Tools Implementation

  private async generateSprintReview(args: RequestParams) {
    try {
      const { sprintNumbers = [], includeVelocityTrends = true, sendToTeams = true, format = 'html' } = args;
      
      if (sprintNumbers.length === 0) {
        throw new Error('At least one sprint number is required');
      }

      // Use the consolidated Sprint Review Tool
      const result = await this.sprintReviewTool.generateSprintReview(sprintNumbers, {
        includeVelocityTrends,
        sendToTeams,
        format
      });
      
      const analysisText = `✅ Sprint Review Generated Successfully!

📊 **Analysis Completed for:**
${sprintNumbers.map(sprint => `• ${sprint}`).join('\n')}

📋 **Sprint Metrics:**
${result.metrics.map(metric => `• ${metric.sprintName}: ${metric.completedStoryPoints}/${metric.totalStoryPoints} story points (${metric.completionRate.toFixed(1)}%)`).join('\n')}

📈 **Velocity Trends:**
${result.velocityTrends.map(trend => `• ${trend.sprintName}: ${trend.velocity} velocity (${trend.trend})`).join('\n')}

📁 **Generated Files:**
• HTML Report: ${result.reportPath}
• Teams Notification: ${sendToTeams ? 'Sent successfully' : 'Skipped'}

🎯 **Key Insights:**
• Cross-sprint velocity comparison
• Completion rate analysis
• Risk factors and recommendations
• Actionable insights for improvement

The comprehensive sprint review is ready for team analysis and strategic planning.`;

      return {
        content: [
          {
            type: "text",
            text: analysisText,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to generate sprint review: ${error.message}`);
    }
  }

  private async createShareableReport(args: RequestParams) {
    try {
      const { shareableReportType = 'latest', distributionMethods, createDataUrl = false } = args;
      
      // Use the consolidated Shareable Report Tool
      const result = await this.shareableReportTool.createShareableReport({
        reportType: shareableReportType,
        sendToTeams: true
      });
      
      const analysisText = `✅ Shareable Report Created Successfully!

📄 **File Details:**
• Original: ${result.originalFile}
• Enhanced: ${result.shareableFile}
• Size: ${result.fileSize}

📤 **Distribution Methods:**
• Teams Files tab (recommended)
• Email attachment  
• Cloud storage (SharePoint/OneDrive)
• Direct browser access

✨ **Features:**
• Self-contained HTML with embedded resources
• Cross-platform compatibility
• Professional formatting maintained
• Built-in sharing instructions

The enhanced report is ready for team distribution and stakeholder sharing.`;

      return {
        content: [
          {
            type: "text",
            text: analysisText,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to create shareable report: ${error.message}`);
    }
  }

  private async sendWorkflowReport(args: RequestParams) {
    try {
      const { 
        sprintNumber = '', 
        executionStatus = 'success', 
        includeMetrics = true, 
        includeRecommendations = true 
      } = args;
      
      if (!sprintNumber) {
        throw new Error('Sprint number is required');
      }

      // Generate comprehensive workflow report
      const timestamp = new Date().toLocaleString();
      const statusEmoji = executionStatus === 'success' ? '✅' : executionStatus === 'warning' ? '⚠️' : '❌';
      
      let content = `## 🚀 Release Workflow Execution Summary

**Sprint:** ${sprintNumber}  
**Status:** ${statusEmoji} **${executionStatus.toUpperCase()}** - Workflow completed  
**Execution Time:** ${timestamp}  
**Results:** Comprehensive analysis completed

---`;

      if (includeMetrics) {
        // Fetch actual sprint data for metrics
        const issues = await this.jiraService.fetchIssues(sprintNumber);
        const completedIssues = issues.filter(issue => 
          ['Done', 'Resolved', 'Closed'].includes(issue.fields.status.name)
        );
        
        const completionRate = issues.length > 0 ? Math.round((completedIssues.length / issues.length) * 100) : 0;
        
        content += `

## 📊 Sprint Analysis Results

### 🎯 **Sprint Completion Metrics**
- **Completion Rate:** ${completionRate}% (${completedIssues.length}/${issues.length} issues completed)
- **Overall Status:** ${completionRate >= 90 ? 'Excellent' : completionRate >= 70 ? 'Good' : 'Needs Attention'} sprint execution

### 📋 **Issue Breakdown**
- **Total Issues:** ${issues.length}
- **Completed:** ${completedIssues.length}
- **In Progress:** ${issues.filter(i => i.fields.status.name === 'In Progress').length}
- **To Do:** ${issues.filter(i => i.fields.status.name === 'To Do').length}

---`;
      }

      if (includeRecommendations) {
        content += `

## 🎯 **Key Recommendations**

### **✅ Strengths**
- Automated workflow execution successful
- Comprehensive data analysis completed
- Documentation generated and distributed

### **🚀 Action Items**
- Review sprint completion metrics
- Address any remaining open issues
- Plan upcoming sprint based on insights
- Share results with stakeholders

---`;
      }

      content += `

## 📋 **Generated Documentation**
- **Release Notes:** Professional HTML format
- **Sprint Analysis:** Detailed metrics and insights
- **Teams Integration:** Automated notifications sent

**System:** Next Release AI - Complete Workflow Automation

---

*This automated report provides comprehensive workflow execution results for sprint planning and retrospectives.*`;

      await this.teamsService.sendNotification(
        `🎉 Complete Release Workflow Successfully Executed - Sprint ${sprintNumber}`,
        content
      );

      const analysisText = `✅ Workflow Report Sent Successfully!

📢 **Teams Notification:**
• Comprehensive execution summary sent
• Sprint ${sprintNumber} results delivered
• Status: ${statusEmoji} ${executionStatus.toUpperCase()}

📊 **Report Contents:**
• ${includeMetrics ? '✅' : '❌'} Sprint completion metrics
• ${includeRecommendations ? '✅' : '❌'} Strategic recommendations
• ✅ Workflow execution details
• ✅ Next steps and action items

The detailed workflow results have been delivered to your Teams channel for team review.`;

      return {
        content: [
          {
            type: "text",
            text: analysisText,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to send workflow report: ${error.message}`);
    }
  }

  private async htmlToTeamsAttachment(args: RequestParams) {
    try {
      const { 
        htmlFile, 
        distributionMethods = ['teams-files', 'email-attachment', 'cloud-storage'], 
        createDataUrl = false 
      } = args;
      
      const fs = await import('fs');
      const path = await import('path');
      
      // Find HTML file
      let filePath: string;
      if (htmlFile) {
        filePath = htmlFile;
      } else {
        // Find the most recent HTML file
        const outputDir = 'output';
        const files = fs.readdirSync(outputDir);
        const htmlFiles = files.filter(file => file.endsWith('.html'))
                               .sort((a, b) => {
                                 const statA = fs.statSync(path.join(outputDir, a));
                                 const statB = fs.statSync(path.join(outputDir, b));
                                 return statB.mtime.getTime() - statA.mtime.getTime();
                               });
        
        if (htmlFiles.length === 0) {
          throw new Error('No HTML files found in output directory');
        }
        
        filePath = path.join(outputDir, htmlFiles[0]);
      }
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`HTML file not found: ${filePath}`);
      }
      
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      const fileStats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      const fileSize = (fileStats.size / 1024).toFixed(1);
      
      // Create comprehensive Teams message with distribution options
      let content = `## 📎 HTML Report File - Distribution Options

**File:** \`${fileName}\`  
**Size:** ${fileSize}KB  
**Generated:** ${new Date(fileStats.mtime).toLocaleString()}  
**Format:** Professional HTML document with CSS styling

---

## ⚠️ **Teams Webhook Limitation Notice**

Microsoft Teams webhooks don't support direct file attachments. Here are the recommended distribution methods:

---`;

      if (distributionMethods.includes('teams-files')) {
        content += `

## 🥇 **Method 1: Teams Files Tab (Recommended)**
1. Go to your Teams channel
2. Click **Files** tab at the top
3. Click **Upload** and select: \`${fileName}\`
4. Team members can then download and view the HTML file

---`;
      }

      if (distributionMethods.includes('cloud-storage')) {
        content += `

## 🥈 **Method 2: Cloud Storage**
**SharePoint/OneDrive:**
1. Upload \`${fileName}\` to your team's SharePoint site
2. Right-click → **Share** → Copy link
3. Paste the share link in Teams chat

**Google Drive:**
1. Upload the HTML file to Google Drive
2. Right-click → **Get link** → **Anyone with link can view**
3. Share the link with your team

---`;
      }

      if (distributionMethods.includes('email-attachment')) {
        content += `

## 🥉 **Method 3: Email Distribution**
1. Attach \`${fileName}\` to an email
2. Send to team members and stakeholders
3. Recipients can open directly in their browser

---`;
      }

      content += `

## 📊 **File Contains:**
✅ Interactive charts and visualizations  
✅ Professional CSS styling for presentations  
✅ Complete data analysis and metrics  
✅ Print-optimized formatting  
✅ Cross-platform browser compatibility  

## 🔗 **Direct Access Path:**
\`${path.resolve(filePath)}\`

*Copy this path and open in any web browser for immediate access.*

---

**The HTML report is ready for distribution using your preferred method!** 📤✨`;

      if (createDataUrl) {
        const base64Html = Buffer.from(htmlContent).toString('base64');
        content += `

## 🔧 **Base64 Data URL** (for developers):
\`data:text/html;base64,${base64Html.substring(0, 100)}...\`
*Full data URL available in console output*`;
        
        console.log(`Data URL: data:text/html;base64,${base64Html}`);
      }

      await this.teamsService.sendNotification(
        "📎 HTML Report - File Attachment Alternative",
        content
      );

      // Also send a quick access card
      await this.teamsService.sendRichNotification({
        title: '📎 HTML Report - Quick Access',
        summary: `HTML report ready for sharing: ${fileName}`,
        facts: [
          { name: '📄 File Name', value: fileName },
          { name: '💾 File Size', value: `${fileSize}KB` },
          { name: '📅 Generated', value: new Date(fileStats.mtime).toLocaleString() },
          { name: '🔗 Methods Available', value: distributionMethods.length.toString() },
          { name: '🌐 Compatibility', value: 'All browsers, all platforms' }
        ]
      });

      const analysisText = `✅ HTML Report Distribution Guide Sent!

📎 **File Details:**
• Name: ${fileName}
• Size: ${fileSize}KB
• Methods: ${distributionMethods.length} distribution options provided

📱 **Teams Messages Sent:**
• Comprehensive distribution guide
• Quick access information card
• Step-by-step sharing instructions

🎯 **Recommended Action:**
Upload to Teams Files tab for immediate team access

The HTML report sharing instructions have been delivered to your Teams channel.`;

      return {
        content: [
          {
            type: "text",
            text: analysisText,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to process HTML attachment: ${error.message}`);
    }
  }

  private async validateTeamsIntegration(args: RequestParams) {
    try {
      const result = await this.teamsValidationTool.validateTeamsIntegration();

      return {
        content: [
          {
            type: "text",
            text: `Teams Integration Validation Complete:\n\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to validate Teams integration: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Release MCP Server running on stdio");
  }
}

const server = new ReleaseMCPServer();
server.run().catch(console.error);
