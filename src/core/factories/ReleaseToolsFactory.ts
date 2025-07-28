import { MCPTool, MCPToolCategory, BaseMCPTool, MCPToolResult } from "../BaseMCPTool.js";
import { ServiceRegistry } from "../MCPToolFactory.js";

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
            const { SprintReportHTMLGenerator } = await import("../../generators/HTMLReportGenerator.js");
            const htmlGenerator = new SprintReportHTMLGenerator();
            
            const htmlPath = path.join(outputDir, `${args.sprintNumber}_report_${timestamp}.html`);
            const htmlContent = htmlGenerator.generateHTML(sprintData);
            fs.writeFileSync(htmlPath, htmlContent, 'utf8');
            generatedFiles.push(htmlPath);
            console.log(`✅ HTML report generated: ${htmlPath}`);
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
