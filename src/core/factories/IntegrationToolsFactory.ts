import { MCPTool, MCPToolCategory, BaseMCPTool, MCPToolResult } from "../BaseMCPTool.js";
import { ServiceRegistry } from "../MCPToolFactory.js";

export class IntegrationToolsFactory {
  constructor(
    private services: ServiceRegistry,
    private toolInstances: Map<string, any>
  ) {}

  createCategory(): MCPToolCategory {
    return {
      name: "Integration & Communication",
      description: "Tools for Teams notifications, Confluence publishing, and external integrations",
      tools: [
        this.createTeamsNotificationTool(),
        this.createConfluencePublishTool(),
        this.createHtmlReportGeneratorTool(),
        this.createPdfReportGeneratorTool(),
        this.createTeamsReleaseNotificationTool(),
        this.createEnhancedTeamsIntegrationTool()
      ]
    };
  }

  private createTeamsNotificationTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "send_teams_notification";
      description = "Send notifications to Microsoft Teams channels";
      inputSchema = {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Message content to send to Teams"
          },
          title: {
            type: "string",
            description: "Title for the Teams notification (optional)"
          },
          isImportant: {
            type: "boolean",
            description: "Mark as important notification (default: false)"
          },
          includeMetadata: {
            type: "boolean",
            description: "Include timestamp and user metadata (default: true)"
          }
        },
        required: ["message"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["message"]);

          const teamsService = this.services.get<any>('teamsService');
          
          const notification = {
            message: args.message,
            title: args.title || 'MCP Notification',
            isImportant: args.isImportant || false,
            timestamp: new Date().toISOString(),
            includeMetadata: args.includeMetadata !== false
          };

          await teamsService.sendNotification(notification);

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📢 Teams Notification Sent Successfully!\n\n` +
            `📋 Title: ${notification.title}\n` +
            `💬 Message: ${args.message.substring(0, 100)}${args.message.length > 100 ? '...' : ''}\n` +
            `⚡ Priority: ${notification.isImportant ? 'High' : 'Normal'}\n` +
            `🕐 Sent at: ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to send Teams notification: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createConfluencePublishTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "publish_to_confluence";
      description = "Publish content to Confluence pages";
      inputSchema = {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Page title for Confluence"
          },
          content: {
            type: "string",
            description: "HTML content to publish"
          },
          spaceKey: {
            type: "string",
            description: "Confluence space key (optional, uses default if not provided)"
          },
          parentPageId: {
            type: "string",
            description: "Parent page ID (optional)"
          }
        },
        required: ["title", "content"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["title", "content"]);

          const confluenceService = this.services.get<any>('confluenceService');
          
          const publishResult = await confluenceService.publishPage({
            title: args.title,
            content: args.content,
            spaceKey: args.spaceKey,
            parentPageId: args.parentPageId
          });

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📚 Confluence Page Published Successfully!\n\n` +
            `📄 Page Title: ${args.title}\n` +
            `🔗 Page URL: ${publishResult.url}\n` +
            `📊 Page ID: ${publishResult.pageId}\n` +
            `📅 Published: ${new Date().toLocaleString()}\n` +
            `📝 Content Length: ${args.content.length} characters`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to publish to Confluence: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createHtmlReportGeneratorTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "generate_html_report";
      description = "Generate comprehensive HTML reports from analysis data";
      inputSchema = {
        type: "object",
        properties: {
          reportType: {
            type: "string",
            enum: ["sprint_analysis", "velocity_report", "release_notes", "team_metrics"],
            description: "Type of HTML report to generate"
          },
          data: {
            type: "object",
            description: "Data object containing the information to include in the report"
          },
          templateStyle: {
            type: "string",
            enum: ["professional", "modern", "minimal"],
            description: "HTML template style (default: professional)"
          },
          includeCharts: {
            type: "boolean",
            description: "Include interactive charts and graphs (default: true)"
          }
        },
        required: ["reportType", "data"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["reportType", "data"]);

          const htmlFormatter = this.services.get<any>('htmlFormatter');
          
          const reportConfig = {
            type: args.reportType,
            data: args.data,
            style: args.templateStyle || 'professional',
            includeCharts: args.includeCharts !== false,
            timestamp: new Date().toISOString()
          };

          const htmlContent = await htmlFormatter.generateReport(reportConfig);
          const fileName = `${args.reportType}_${Date.now()}.html`;

          // Save to file service
          const fileService = this.services.get<any>('fileService');
          const filePath = await fileService.saveHtmlReport(fileName, htmlContent);

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📊 HTML Report Generated Successfully!\n\n` +
            `📄 Report Type: ${args.reportType}\n` +
            `🎨 Template Style: ${reportConfig.style}\n` +
            `📈 Charts Included: ${reportConfig.includeCharts ? 'Yes' : 'No'}\n` +
            `📁 File Path: ${filePath}\n` +
            `📏 Content Size: ${Math.round(htmlContent.length / 1024)}KB\n` +
            `🕐 Generated: ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to generate HTML report: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createTeamsReleaseNotificationTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "send_release_notification";
      description = "Send formatted release notifications to Teams with rich content";
      inputSchema = {
        type: "object",
        properties: {
          releaseVersion: {
            type: "string",
            description: "Release version or sprint number"
          },
          summary: {
            type: "string",
            description: "Release summary content"
          },
          highlights: {
            type: "array",
            items: { type: "string" },
            description: "Key highlights and achievements"
          },
          metrics: {
            type: "object",
            description: "Release metrics (story points, issues, etc.)"
          },
          includeCallToAction: {
            type: "boolean",
            description: "Include call-to-action buttons (default: true)"
          }
        },
        required: ["releaseVersion", "summary"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["releaseVersion", "summary"]);

          const teamsService = this.services.get<any>('teamsService');
          
          const releaseNotification = {
            title: `🚀 Release ${args.releaseVersion} - Now Available!`,
            summary: args.summary,
            highlights: args.highlights || [],
            metrics: args.metrics || {},
            timestamp: new Date().toISOString(),
            includeCallToAction: args.includeCallToAction !== false
          };

          await teamsService.sendReleaseNotification(releaseNotification);

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🚀 Release Notification Sent to Teams!\n\n` +
            `📦 Release: ${args.releaseVersion}\n` +
            `📝 Summary: ${args.summary.substring(0, 100)}${args.summary.length > 100 ? '...' : ''}\n` +
            `✨ Highlights: ${(args.highlights || []).length} items\n` +
            `📊 Metrics Included: ${Object.keys(args.metrics || {}).length > 0 ? 'Yes' : 'No'}\n` +
            `🕐 Sent: ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to send release notification: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createEnhancedTeamsIntegrationTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "enhanced_teams_integration";
      description = "Advanced Teams integration with adaptive cards, workflow notifications, and interactive features";
      inputSchema = {
        type: "object",
        properties: {
          integrationType: {
            type: "string",
            enum: ["sprint_completion", "velocity_alert", "release_announcement", "custom_workflow"],
            description: "Type of Teams integration to execute"
          },
          data: {
            type: "object",
            description: "Integration-specific data payload"
          },
          urgencyLevel: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            description: "Notification urgency level (default: medium)"
          },
          includeInteractiveElements: {
            type: "boolean",
            description: "Include interactive buttons and actions (default: true)"
          },
          targetAudience: {
            type: "array",
            items: { type: "string" },
            description: "Specific team members or groups to notify"
          }
        },
        required: ["integrationType", "data"]
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
          this.validateRequiredArgs(args, ["integrationType", "data"]);

          const teamsIntegrationTool = this.toolInstances.get('teamsIntegrationTool');
          
          const result = await teamsIntegrationTool.executeIntegration({
            type: args.integrationType,
            data: args.data,
            urgency: args.urgencyLevel || 'medium',
            interactive: args.includeInteractiveElements !== false,
            audience: args.targetAudience || []
          });

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🔗 Enhanced Teams Integration Complete!\n\n` +
            `🎯 Integration Type: ${args.integrationType}\n` +
            `⚡ Urgency Level: ${args.urgencyLevel || 'medium'}\n` +
            `🎛️ Interactive Elements: ${args.includeInteractiveElements !== false ? 'Enabled' : 'Disabled'}\n` +
            `👥 Target Audience: ${(args.targetAudience || []).length || 'All'} recipients\n` +
            `📊 Notification ID: ${result.notificationId}\n` +
            `✅ Status: ${result.status}\n` +
            `🕐 Executed: ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to execute enhanced Teams integration: ${error.message}`);
        }
      }
    })(this.services, this.toolInstances);
  }

  private createPdfReportGeneratorTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "generate_pdf_report";
      description = "Generate high-quality PDF reports from sprint data with professional layouts";
      inputSchema = {
        type: "object",
        properties: {
          reportData: {
            type: "object",
            description: "Sprint or release data to include in the PDF report"
          },
          reportType: {
            type: "string",
            enum: ["sprint_review", "release_notes", "executive_summary", "team_metrics"],
            description: "Type of PDF report to generate"
          },
          outputPath: {
            type: "string",
            description: "Output path for the PDF file (optional, defaults to reports/ directory)"
          },
          config: {
            type: "object",
            properties: {
              format: {
                type: "string",
                enum: ["A4", "Letter"],
                description: "Page format (default: A4)"
              },
              orientation: {
                type: "string", 
                enum: ["portrait", "landscape"],
                description: "Page orientation (default: portrait)"
              },
              includeCharts: {
                type: "boolean",
                description: "Include charts and graphs (default: true)"
              },
              theme: {
                type: "string",
                enum: ["professional", "modern", "minimal"],
                description: "Visual theme (default: professional)"
              }
            }
          },
          sendToTeams: {
            type: "boolean",
            description: "Send PDF to Teams channel after generation (default: false)"
          },
          teamsMessage: {
            type: "string",
            description: "Custom message to include with Teams notification"
          }
        },
        required: ["reportData", "reportType"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["reportData", "reportType"]);

          // Import the PDF generator here to avoid circular dependencies  
          const { SprintReportPDFGenerator } = await import("../../generators/PDFReportGenerator.js");
          const { SprintReportHTMLGenerator } = await import("../../generators/HTMLReportGenerator.js");
          
          const pdfGenerator = new SprintReportPDFGenerator();
          const htmlGenerator = new SprintReportHTMLGenerator();

          // Generate output path if not provided
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const outputPath = args.outputPath || `./reports/${args.reportType}_${timestamp}.pdf`;

          // Prepare PDF configuration
          const pdfConfig = {
            format: args.config?.format || 'A4',
            orientation: args.config?.orientation || 'portrait',
            includeCharts: args.config?.includeCharts !== false,
            theme: args.config?.theme || 'professional',
            ...args.config
          };

          // Generate the PDF report
          await pdfGenerator.generatePDF(args.reportData, outputPath, pdfConfig);

          let teamsResult = null;
          if (args.sendToTeams) {
            const teamsService = this.services.get<any>('teamsService');
            const message = args.teamsMessage || `📊 New ${args.reportType} PDF report has been generated!`;
            
            teamsResult = await teamsService.sendNotification({
              message: message,
              title: `PDF Report Generated: ${args.reportType}`,
              includeAttachment: true,
              attachmentPath: outputPath
            });
          }

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📄 PDF Report Generated Successfully!\n\n` +
            `📊 Report Type: ${args.reportType}\n` +
            `📁 Output Path: ${outputPath}\n` +
            `📋 Format: ${pdfConfig.format} (${pdfConfig.orientation})\n` +
            `🎨 Theme: ${pdfConfig.theme}\n` +
            `📈 Charts Included: ${pdfConfig.includeCharts ? 'Yes' : 'No'}\n` +
            `💬 Teams Notification: ${args.sendToTeams ? 'Sent' : 'Not sent'}\n` +
            `🕐 Generated: ${new Date().toLocaleString()}\n` +
            `⚡ Execution Time: ${Date.now() - startTime}ms`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to generate PDF report: ${error.message}`);
        }
      }
    })(this.services);
  }
}
