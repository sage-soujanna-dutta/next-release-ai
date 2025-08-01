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

          const fileService = this.services.get<any>('fileService');
          
          // Generate HTML content based on report type
          const htmlContent = this.generateHtmlContent(args.reportType, args.data, args.templateStyle || 'professional');
          
          // Save to file
          const fileName = `${args.reportType}_report_${Date.now()}.html`;
          const filePath = await fileService.saveReleaseNotes(htmlContent, fileName);

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📊 HTML Report Generated Successfully!\n\n` +
            `📄 Report Type: ${args.reportType}\n` +
            `🎨 Style: ${args.templateStyle || 'professional'}\n` +
            `📁 File: ${fileName}\n` +
            `📍 Path: ${filePath}\n` +
            `📊 Data Points: ${Object.keys(args.data).length}\n` +
            `📅 Generated: ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to generate HTML report: ${error.message}`);
        }
      }

      private generateHtmlContent(reportType: string, data: any, style: string): string {
        const title = data.reportTitle || `${reportType} Report`;
        const date = new Date().toLocaleString();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .content { padding: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-error { color: #dc3545; }
        pre { background: #f8f9fa; padding: 20px; border-radius: 8px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <p>Generated on ${date}</p>
        </div>
        <div class="content">
            ${this.renderDataSections(data)}
        </div>
    </div>
</body>
</html>`;
      }

      private renderDataSections(data: any): string {
        let sections = '';
        
        // Executive Summary
        if (data.executiveSummary) {
          sections += `<div class="section">
            <h2>📊 Executive Summary</h2>
            <div class="metrics-grid">
              ${Object.entries(data.executiveSummary).map(([key, value]) => 
                `<div class="metric-card"><div class="metric-value">${value}</div><div class="metric-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div></div>`
              ).join('')}
            </div>
          </div>`;
        }
        
        // Cycle Time Analysis
        if (data.cycleTimeAnalysis) {
          sections += `<div class="section">
            <h2>� Cycle Time Analysis</h2>
            ${data.cycleTimeAnalysis.distribution ? `
            <h3>Distribution</h3>
            <table>
              <thead><tr><th>Range</th><th>Count</th><th>Percentage</th></tr></thead>
              <tbody>
                ${data.cycleTimeAnalysis.distribution.map((item: any) => 
                  `<tr><td>${item.range}</td><td>${item.count}</td><td>${item.percentage}</td></tr>`
                ).join('')}
              </tbody>
            </table>` : ''}
          </div>`;
        }
        
        // Quality Metrics
        if (data.qualityMetrics && data.qualityMetrics.bugAnalysis) {
          const bugs = data.qualityMetrics.bugAnalysis;
          sections += `<div class="section">
            <h2>🐛 Quality Analysis</h2>
            <div class="metrics-grid">
              <div class="metric-card"><div class="metric-value">${bugs.totalBugs}</div><div class="metric-label">Total Bugs</div></div>
              <div class="metric-card"><div class="metric-value">${bugs.bugRatio}</div><div class="metric-label">Bug Ratio</div></div>
              <div class="metric-card"><div class="metric-value">${bugs.defectDensity}</div><div class="metric-label">Defect Density</div></div>
            </div>
          </div>`;
        }
        
        // Insights
        if (data.insights) {
          sections += `<div class="section">
            <h2>📈 Key Insights</h2>
            ${data.insights.findings ? `
            <h3>Findings</h3>
            <ul>
              ${data.insights.findings.map((finding: string) => `<li>${finding}</li>`).join('')}
            </ul>` : ''}
            ${data.insights.recommendations ? `
            <h3>🔧 Recommendations</h3>
            <div style="background: #e8f4fd; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px;">
              <ul>
                ${data.insights.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
              </ul>
            </div>` : ''}
          </div>`;
        }
        
        // Raw data fallback
        if (!sections) {
          sections = `<div class="section">
            <h2>Report Data</h2>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>`;
        }
        
        return sections;
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
}
