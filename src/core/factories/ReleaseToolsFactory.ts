import { MCPTool, MCPToolCategory, BaseMCPTool, MCPToolResult } from "../BaseMCPTool.js";
import { ServiceRegistry } from "../MCPToolFactory.js";
import { MarkdownFormatter } from "../../utils/MarkdownFormatter.js";

export class ReleaseToolsFactory {
  constructor(
    private services: ServiceRegistry,
    private toolInstances: Map<string, any>
  ) {}

  createCategory(): MCPToolCategory {
    return {
      name: "Release Management",
      description: "Tools for generating release notes, managing workflows, and publishing content",
      tools: [
        this.createGenerateReleaseNotesTool(),
        this.createBoardBasedReleaseNotesTool(), // New tool
        this.createCreateReleaseWorkflowTool(),
        this.createComprehensiveSprintReportTool(),
        this.createPreviewReleaseNotesTool(),
        this.createPublishToConfluenceTool(),
        this.createComprehensiveWorkflowTool()
      ]
    };
  }

  private createGenerateReleaseNotesTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "generate_release_notes";
      description = "Generate comprehensive release notes with JIRA issues and GitHub commits";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number (e.g., 'SCNT-2025-20')"
          },
          format: {
            type: "string",
            enum: ["html", "markdown"],
            description: "Output format (default: html)"
          },
          theme: {
            type: "string",
            enum: ["default", "modern", "minimal"],
            description: "Theme for HTML output (default: modern)"
          }
        },
        required: ["sprintNumber"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumber"]);

          const releaseNotesService = this.services.get<any>('releaseNotesService');
          const result = await releaseNotesService.generateReleaseNotes({
            sprintNumber: args.sprintNumber,
            format: args.format || 'html',
            theme: args.theme || 'modern'
          });

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `✅ Release Notes Generated Successfully!\n\n` +
            `📋 Sprint: ${args.sprintNumber}\n` +
            `📄 Format: ${args.format || 'html'}\n` +
            `🎨 Theme: ${args.theme || 'modern'}\n` +
            `📊 JIRA Issues: ${result.stats.jiraIssues}\n` +
            `💾 Commits: ${result.stats.commits}\n` +
            `📁 File: ${result.filePath || 'Generated in memory'}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to generate release notes: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createBoardBasedReleaseNotesTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "generate_board_based_release_notes";
      description = "Generate release notes based on JIRA board ID and sprint number - supports any project";
      inputSchema = {
        type: "object",
        properties: {
          boardId: {
            type: "number",
            description: "JIRA board ID (e.g., 5465 for NDS board)"
          },
          sprintNumber: {
            type: "string", 
            description: "Sprint number or name to search for (e.g., 'FY25-21', 'SCNT-2025-20')"
          },
          format: {
            type: "string",
            enum: ["html", "markdown"],
            description: "Output format (default: markdown)"
          },
          outputDirectory: {
            type: "string",
            description: "Output directory for generated files (default: './output')"
          },
          projectName: {
            type: "string",
            description: "Project name for the report (optional, will be detected from board)"
          },
          includeTeamsNotification: {
            type: "boolean",
            description: "Send notification to Teams channel (default: false)"
          }
        },
        required: ["boardId", "sprintNumber"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["boardId", "sprintNumber"]);

          const domain = process.env.JIRA_DOMAIN;
          const token = process.env.JIRA_TOKEN;

          if (!domain || !token) {
            return this.createErrorResponse("Missing JIRA environment variables (JIRA_DOMAIN, JIRA_TOKEN)");
          }

          console.log(`🔍 Fetching sprint data for ${args.sprintNumber} from board ${args.boardId}...`);

          // Import required modules dynamically
          const axios = await import('axios');
          const fs = await import('fs');
          const path = await import('path');

          // Get all sprints for the board
          const sprintsRes = await axios.default.get(
            `https://${domain}/rest/agile/1.0/board/${args.boardId}/sprint?maxResults=100&state=active,closed`,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              } 
            }
          );

          console.log(`📋 Found ${sprintsRes.data.values.length} sprints on board ${args.boardId}`);

          // Find the target sprint
          const targetSprint = sprintsRes.data.values.find((sprint: any) => 
            sprint.name.includes(args.sprintNumber) || 
            sprint.name.toLowerCase().includes(args.sprintNumber.toLowerCase())
          );

          if (!targetSprint) {
            const availableSprints = sprintsRes.data.values.map((s: any) => s.name).join(', ');
            return this.createErrorResponse(
              `Sprint '${args.sprintNumber}' not found on board ${args.boardId}.\n` +
              `Available sprints: ${availableSprints}`
            );
          }

          console.log(`✅ Found Sprint: ${targetSprint.name} (ID: ${targetSprint.id}, State: ${targetSprint.state})`);

          // Get issues for this sprint
          const issuesRes = await axios.default.get(
            `https://${domain}/rest/agile/1.0/sprint/${targetSprint.id}/issue?maxResults=200&expand=names`,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              } 
            }
          );

          const issues = issuesRes.data.issues;
          console.log(`📊 Found ${issues.length} issues in sprint ${targetSprint.name}`);

          // Get board information for project details
          const boardRes = await axios.default.get(
            `https://${domain}/rest/agile/1.0/board/${args.boardId}`,
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              } 
            }
          );

          const projectName = args.projectName || boardRes.data.name || `Board-${args.boardId}`;

          // Process the data for report generation
          const sprintData = this.processSprintData(targetSprint, issues, projectName);

          // Generate the report
          const format = args.format || 'markdown';
          const outputDir = args.outputDirectory || './output';
          
          // Ensure output directory exists
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '-')
            .substring(0, 19);
          
          const filename = `${targetSprint.name.replace(/[^a-zA-Z0-9-]/g, '-')}-sprint-report-${timestamp}.${format}`;
          const filePath = path.join(outputDir, filename);

          let content: string;
          if (format === 'markdown') {
            content = this.generateMarkdownReport(sprintData);
          } else {
            content = this.generateHTMLReport(sprintData);
          }

          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Report generated: ${filePath}`);

          // Send Teams notification if requested
          let teamsResult = null;
          if (args.includeTeamsNotification) {
            try {
              const teamsService = this.services.get<any>('teamsService');
              const teamsMessage = this.generateTeamsMessage(sprintData, filename);
              teamsResult = await teamsService.sendNotification({
                message: teamsMessage,
                title: `📊 Sprint Report Generated: ${targetSprint.name}`,
                isImportant: false,
                includeMetadata: true
              });
            } catch (teamsError: any) {
              console.warn(`⚠️ Teams notification failed: ${teamsError.message}`);
            }
          }

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🎉 Board-Based Release Notes Generated Successfully!\n\n` +
            `📊 **Sprint:** ${targetSprint.name}\n` +
            `📋 **Board ID:** ${args.boardId}\n` +
            `🏢 **Project:** ${projectName}\n` +
            `📄 **Format:** ${format.toUpperCase()}\n` +
            `📁 **File:** ${filename}\n` +
            `📂 **Path:** ${filePath}\n\n` +
            `📈 **Sprint Statistics:**\n` +
            `  • Total Issues: ${issues.length}\n` +
            `  • Completed: ${sprintData.stats.completed}\n` +
            `  • In Progress: ${sprintData.stats.inProgress}\n` +
            `  • To Do: ${sprintData.stats.todo}\n` +
            `  • Story Points: ${sprintData.stats.totalStoryPoints}\n` +
            `  • Completion Rate: ${sprintData.stats.completionRate}%\n\n` +
            `🔄 **Sprint Status:** ${targetSprint.state}\n` +
            `📅 **Sprint Dates:** ${targetSprint.startDate ? new Date(targetSprint.startDate).toLocaleDateString() : 'N/A'} - ${targetSprint.endDate ? new Date(targetSprint.endDate).toLocaleDateString() : 'N/A'}\n` +
            `💬 **Teams Notification:** ${args.includeTeamsNotification ? (teamsResult ? 'Sent ✅' : 'Failed ❌') : 'Skipped'}\n` +
            `⚡ **Generation Time:** ${Date.now() - startTime}ms\n` +
            `🕐 **Generated:** ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to generate board-based release notes: ${error.message}`);
        }
      }

      private processSprintData(sprint: any, issues: any[], projectName: string) {
        const statusCounts = { completed: 0, inProgress: 0, todo: 0 };
        const issueTypes: Record<string, number> = {};
        const contributors: Record<string, number> = {};
        let totalStoryPoints = 0;

        issues.forEach(issue => {
          const status = issue.fields.status.name;
          const type = issue.fields.issuetype.name;
          const assignee = issue.fields.assignee?.displayName || 'Unassigned';

          // Count by status
          if (status === 'Done' || status === 'Completed' || status === 'Closed') {
            statusCounts.completed++;
          } else if (status === 'In Progress' || status === 'In Review') {
            statusCounts.inProgress++;
          } else {
            statusCounts.todo++;
          }

          // Count by type
          issueTypes[type] = (issueTypes[type] || 0) + 1;

          // Count by contributor
          contributors[assignee] = (contributors[assignee] || 0) + 1;

          // Sum story points (check multiple possible fields)
          const storyPoints = issue.fields.customfield_10004 || 
                             issue.fields.customfield_10002 || 
                             issue.fields.customfield_10003 || 
                             issue.fields.customfield_10005 || 0;
          totalStoryPoints += storyPoints;
        });

        const completionRate = issues.length > 0 ? Math.round((statusCounts.completed / issues.length) * 100) : 0;

        return {
          sprint: {
            name: sprint.name,
            id: sprint.id,
            state: sprint.state,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            completeDate: sprint.completeDate,
            goal: sprint.goal
          },
          project: {
            name: projectName
          },
          issues,
          stats: {
            ...statusCounts,
            totalStoryPoints,
            completionRate,
            total: issues.length
          },
          breakdown: {
            byType: issueTypes,
            byContributor: contributors
          }
        };
      }

      private generateMarkdownReport(data: any): string {
        // Use the MarkdownFormatter for consistent markdown output
        const formatter = new MarkdownFormatter();
        // Map data to the expected format for MarkdownFormatter
        // You may need to adapt this mapping based on your data structure
        const jiraIssues = data.issues || [];
        const commits = data.commits || [];
        const sprintName = data.sprint?.name || data.project?.name || "Sprint Report";
        const sprintDetails = data.sprint || {};
        return formatter.format(jiraIssues, commits, sprintName, sprintDetails);
      }

      private generateHTMLReport(data: any): string {
        // Implementation for HTML format (simplified for now)
        return `<!DOCTYPE html>
<html>
<head>
    <title>Sprint Report: ${data.sprint.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .issue { border-left: 3px solid #007cba; padding: 10px; margin: 10px 0; }
        .completed { border-left-color: #28a745; }
        .in-progress { border-left-color: #ffc107; }
        .todo { border-left-color: #6c757d; }
    </style>
</head>
<body>
    <h1>Sprint Report: ${data.sprint.name}</h1>
    <div class="metric">
        <strong>Completion Rate:</strong> ${data.stats.completionRate}%
    </div>
    <div class="metric">
        <strong>Total Issues:</strong> ${data.stats.total}
    </div>
    <h2>Issues</h2>
    ${data.issues.map((issue: any) => {
      const statusClass = issue.fields.status.name === 'Done' ? 'completed' :
                         issue.fields.status.name === 'In Progress' ? 'in-progress' : 'todo';
      return `<div class="issue ${statusClass}">
        <h3>${issue.key}: ${issue.fields.summary}</h3>
        <p><strong>Status:</strong> ${issue.fields.status.name}</p>
        <p><strong>Assignee:</strong> ${issue.fields.assignee?.displayName || 'Unassigned'}</p>
      </div>`;
    }).join('')}
</body>
</html>`;
      }

      private generateTeamsMessage(data: any, filename: string): string {
        return `📊 **Sprint Report Generated**

**Sprint:** ${data.sprint.name}  
**Project:** ${data.project.name}  
**Status:** ${data.sprint.state}

📈 **Key Metrics:**
- Total Issues: ${data.stats.total}
- Completed: ${data.stats.completed} (${data.stats.completionRate}%)
- Story Points: ${data.stats.totalStoryPoints}

📁 **File:** ${filename}  
🕐 **Generated:** ${new Date().toLocaleString()}`;
      }
    })(this.services);
  }

  private createCreateReleaseWorkflowTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "create_release_workflow";
      description = "Create complete release workflow with multiple automation steps";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number for the workflow"
          },
          output: {
            type: "string",
            enum: ["confluence", "file", "both"],
            description: "Output destination (default: both)"
          },
          notifyTeams: {
            type: "boolean",
            description: "Send Teams notification (default: true)"
          }
        },
        required: ["sprintNumber"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumber"]);

          const releaseNotesService = this.services.get<any>('releaseNotesService');
          const result = await releaseNotesService.createCompleteWorkflow({
            sprintNumber: args.sprintNumber,
            output: args.output || 'both',
            notifyTeams: args.notifyTeams !== false
          });

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🚀 Release Workflow Created Successfully!\n\n` +
            `📋 Summary: ${result.summary}\n` +
            `🔄 Steps Completed: ${result.steps.length}\n` +
            `📊 Statistics:\n` +
            `  • JIRA Issues: ${result.stats.jiraIssues}\n` +
            `  • Commits: ${result.stats.commits}\n\n` +
            `📋 Workflow Steps:\n${result.steps.map((step: string, i: number) => `  ${i + 1}. ${step}`).join('\n')}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to create release workflow: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createPreviewReleaseNotesTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "preview_release_notes";
      description = "Preview release notes content before publishing";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number to preview"
          },
          format: {
            type: "string",
            enum: ["html", "markdown"],
            description: "Preview format (default: markdown)"
          }
        },
        required: ["sprintNumber"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumber"]);

          const releaseNotesService = this.services.get<any>('releaseNotesService');
          const result = await releaseNotesService.generateReleaseNotes({
            sprintNumber: args.sprintNumber,
            format: args.format || 'markdown'
          });

          this.logExecution({ toolName: this.name, startTime, args });

          const previewContent = result.content.length > 1000 ? 
            result.content.substring(0, 1000) + '\n\n... (truncated for preview)' : 
            result.content;

          return this.createSuccessResponse(
            `👀 Release Notes Preview - ${args.sprintNumber}\n\n` +
            `📊 Content Statistics:\n` +
            `  • JIRA Issues: ${result.stats.jiraIssues}\n` +
            `  • Commits: ${result.stats.commits}\n` +
            `  • Content Length: ${result.content.length} characters\n\n` +
            `📄 Content Preview:\n${previewContent}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to preview release notes: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createPublishToConfluenceTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "publish_to_confluence";
      description = "Publish release notes or content to Confluence";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number for Confluence page"
          },
          confluencePage: {
            type: "string",
            description: "Custom Confluence page title"
          }
        },
        required: ["sprintNumber"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumber"]);

          const confluenceService = this.services.get<any>('confluenceService');
          const releaseNotesService = this.services.get<any>('releaseNotesService');

          // Generate content first
          const releaseNotes = await releaseNotesService.generateReleaseNotes({
            sprintNumber: args.sprintNumber,
            format: 'html'
          });

          // Publish to Confluence
          const confluenceUrl = await confluenceService.publishPage(
            releaseNotes.content,
            args.sprintNumber
          );

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📚 Successfully Published to Confluence!\n\n` +
            `📋 Sprint: ${args.sprintNumber}\n` +
            `🔗 Confluence URL: ${confluenceUrl}\n` +
            `📊 Content Stats:\n` +
            `  • JIRA Issues: ${releaseNotes.stats.jiraIssues}\n` +
            `  • Commits: ${releaseNotes.stats.commits}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to publish to Confluence: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createComprehensiveWorkflowTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "comprehensive_release_workflow";
      description = "Execute complete end-to-end release workflow with all analysis tools, reporting, and notifications";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number for the comprehensive workflow"
          },
          includeReleaseNotes: {
            type: "boolean",
            description: "Include release notes generation (default: true)"
          },
          includeStoryPointsAnalysis: {
            type: "boolean",
            description: "Include story points analysis (default: true)"
          },
          includeVelocityAnalysis: {
            type: "boolean",
            description: "Include velocity analysis (default: true)"
          },
          includeSprintReview: {
            type: "boolean",
            description: "Include comprehensive sprint review (default: true)"
          },
          publishToConfluence: {
            type: "boolean",
            description: "Publish results to Confluence (default: false)"
          },
          sendToTeams: {
            type: "boolean",
            description: "Send workflow results to Teams (default: true)"
          },
          generateAllReports: {
            type: "boolean",
            description: "Generate all HTML reports (default: true)"
          },
          outputFormat: {
            type: "string",
            enum: ["html", "markdown", "both"],
            description: "Output format for generated content (default: both)"
          }
        },
        required: ["sprintNumber"]
      };

      constructor(
        private services: ServiceRegistry,
        private toolInstances: Map<string, any>
      ) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumber"]);

          const comprehensiveWorkflowTool = this.toolInstances.get('comprehensiveWorkflowTool');
          
          const config = {
            sprintNumber: args.sprintNumber,
            includeReleaseNotes: args.includeReleaseNotes !== false,
            includeStoryPointsAnalysis: args.includeStoryPointsAnalysis !== false,
            includeVelocityAnalysis: args.includeVelocityAnalysis !== false,
            includeSprintReview: args.includeSprintReview !== false,
            publishToConfluence: args.publishToConfluence === true,
            sendToTeams: args.sendToTeams !== false,
            generateAllReports: args.generateAllReports !== false,
            outputFormat: args.outputFormat || 'both'
          };

          const result = await comprehensiveWorkflowTool.executeComprehensiveWorkflow(config);

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🚀 Comprehensive Release Workflow Complete!\n\n` +
            `🎯 Sprint: ${result.sprintNumber}\n` +
            `📊 Overall Status: ${result.summary.overallStatus.toUpperCase()}\n` +
            `⏱️ Total Duration: ${Math.round(result.summary.totalDuration / 1000)}s\n` +
            `✅ Successful Steps: ${result.summary.successfulSteps}/${result.summary.totalSteps}\n` +
            `❌ Failed Steps: ${result.summary.failedSteps}\n` +
            `📄 Generated Files: ${result.generatedFiles.length}\n` +
            `📱 Notifications: ${result.notifications.length}\n\n` +
            `📋 Executed Steps:\n${result.executedSteps.map((step: any) => 
              `  ${step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : '⏭️'} ${step.name} (${Math.round(step.duration / 1000)}s)`
            ).join('\n')}\n\n` +
            `📄 Generated Files:\n${result.generatedFiles.map((f: string) => `  • ${f.split('/').pop()}`).join('\n')}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to execute comprehensive workflow: ${error.message}`);
        }
      }
    })(this.services, this.toolInstances);
  }

  private createComprehensiveSprintReportTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "generate_comprehensive_sprint_report";
      description = "Generate complete sprint reports with HTML, PDF, and Teams notification in one command";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number (e.g., 'SCNT-2025-22')"
          },
          formats: {
            type: "array",
            items: {
              type: "string",
              enum: ["html", "pdf", "both"]
            },
            description: "Report formats to generate (default: ['both'])"
          },
          outputDirectory: {
            type: "string",
            description: "Output directory for generated reports (default: './reports')"
          },
          sendToTeams: {
            type: "boolean",
            description: "Send generated reports to Teams channel (default: true)"
          },
          teamsMessage: {
            type: "string",
            description: "Custom message for Teams notification"
          },
          reportConfig: {
            type: "object",
            properties: {
              theme: {
                type: "string",
                enum: ["professional", "modern", "minimal"],
                description: "Report theme (default: professional)"
              },
              includeCharts: {
                type: "boolean",
                description: "Include charts and visualizations (default: true)"
              },
              includeMetrics: {
                type: "boolean", 
                description: "Include detailed sprint metrics (default: true)"
              },
              pdfFormat: {
                type: "string",
                enum: ["A4", "Letter"],
                description: "PDF page format (default: A4)"
              }
            }
          }
        },
        required: ["sprintNumber"]
      };

      constructor(private services: ServiceRegistry, private toolInstances: Map<string, any>) {
        super();  
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumber"]);

          const enhancedJiraService = this.services.get<any>('enhancedJiraService');
          const teamsService = this.services.get<any>('teamsService');

          // Fetch sprint data from JIRA
          console.log(`🔍 Fetching sprint data for ${args.sprintNumber}...`);
          const sprintData = await enhancedJiraService.getSprintMetrics(args.sprintNumber);

          if (!sprintData || !sprintData.issues) {
            throw new Error(`No data found for sprint ${args.sprintNumber}`);
          }

          // Debug: Log the structure of sprint data
          console.log('📊 Sprint data structure check:');
          console.log('- priorityData exists:', !!sprintData.priorityData);
          console.log('- topContributors exists:', !!sprintData.topContributors);
          console.log('- topContributors length:', sprintData.topContributors?.length || 'undefined');
          console.log('- workBreakdown exists:', !!sprintData.workBreakdown);

          const formats = args.formats || ['both'];
          const outputDir = args.outputDirectory || './reports';
          const config = args.reportConfig || {};
          
          const generatedFiles: string[] = [];
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          
          // Ensure output directory exists
          const fs = await import('fs');
          const path = await import('path');
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          // Generate HTML report if requested
          if (formats.includes('html') || formats.includes('both')) {
            try {
              const { SprintReportHTMLGenerator } = await import("../../generators/HTMLReportGenerator.js");
              const htmlGenerator = new SprintReportHTMLGenerator();
              
              const htmlPath = path.join(outputDir, `${args.sprintNumber}_report_${timestamp}.html`);
              console.log('🧪 About to generate HTML...');
              const htmlContent = htmlGenerator.generateHTML(sprintData);
              fs.writeFileSync(htmlPath, htmlContent, 'utf8');
              generatedFiles.push(htmlPath);
              console.log(`✅ HTML report generated: ${htmlPath}`);
            } catch (htmlError: any) {
              console.error('❌ HTML generation error:', htmlError.message);
              throw new Error(`HTML generation failed: ${htmlError.message}`);
            }
          }

          // Generate PDF report if requested  
          if (formats.includes('pdf') || formats.includes('both')) {
            const { SprintReportPDFGenerator } = await import("../../generators/PDFReportGenerator.js");
            const pdfGenerator = new SprintReportPDFGenerator();
            
            const pdfPath = path.join(outputDir, `${args.sprintNumber}_report_${timestamp}.pdf`);
            const pdfConfig = {
              format: config.pdfFormat || 'A4',
              orientation: 'portrait' as const,
              includeCharts: config.includeCharts !== false,
              theme: config.theme || 'professional'
            };
            
            await pdfGenerator.generatePDF(sprintData, pdfPath, pdfConfig);
            generatedFiles.push(pdfPath);
            console.log(`✅ PDF report generated: ${pdfPath}`);
          }

          // Send to Teams if requested
          let teamsResult = null;
          if (args.sendToTeams !== false) {
            const customMessage = args.teamsMessage || 
              `📊 **Sprint ${args.sprintNumber} Report Generated**\n\n` +
              `📈 **Completion Rate:** ${sprintData.metrics?.completionRate || 'N/A'}%\n` +
              `🎯 **Total Issues:** ${sprintData.issues?.length || 0}\n` +
              `✅ **Completed:** ${(sprintData.issues || []).filter((issue: any) => issue.fields.status.name === 'Done').length}\n` +
              `📁 **Generated Files:** ${generatedFiles.length}\n` +
              `📅 **Generated:** ${new Date().toLocaleString()}`;

            teamsResult = await teamsService.sendNotification({
              message: customMessage,
              title: `Sprint ${args.sprintNumber} Report Ready`,
              isImportant: true,
              includeMetadata: true
            });
          }

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🎉 Comprehensive Sprint Report Generated Successfully!\n\n` +
            `📊 **Sprint:** ${args.sprintNumber}\n` +
            `📁 **Output Directory:** ${outputDir}\n` +
            `📄 **Generated Files:**\n${generatedFiles.map(f => `  • ${path.basename(f)}`).join('\n')}\n\n` +
            `📈 **Sprint Metrics:**\n` +
            `  • Total Issues: ${sprintData.issues?.length || 0}\n` +
            `  • Completed: ${(sprintData.issues || []).filter((issue: any) => issue.fields.status.name === 'Done').length}\n` +
            `  • Completion Rate: ${sprintData.metrics?.completionRate || 'N/A'}%\n\n` +
            `🎨 **Configuration:**\n` +
            `  • Theme: ${config.theme || 'professional'}\n` +
            `  • Charts: ${config.includeCharts !== false ? 'Included' : 'Excluded'}\n` +
            `  • PDF Format: ${config.pdfFormat || 'A4'}\n\n` +
            `💬 **Teams Notification:** ${args.sendToTeams !== false ? 'Sent' : 'Skipped'}\n` +
            `⚡ **Total Time:** ${Date.now() - startTime}ms\n` +
            `🕐 **Generated:** ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to generate comprehensive sprint report: ${error.message}`);
        }
      }
    })(this.services, this.toolInstances);
  }
}