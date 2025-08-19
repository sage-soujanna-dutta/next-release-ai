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
