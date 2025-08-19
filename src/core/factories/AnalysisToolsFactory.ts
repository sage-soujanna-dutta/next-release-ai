import { MCPTool, MCPToolCategory, BaseMCPTool, MCPToolResult } from "../BaseMCPTool.js";
import { ServiceRegistry } from "../MCPToolFactory.js";

export class AnalysisToolsFactory {
  constructor(
    private services: ServiceRegistry,
    private toolInstances: Map<string, any>
  ) {}

  createCategory(): MCPToolCategory {
    return {
      name: "Analysis & Metrics",
      description: "Tools for sprint analysis, velocity tracking, and performance metrics",
      tools: [
        this.createStoryPointsAnalysisTool(),
        this.createVelocityReportTool(),
        this.createSprintSummaryTool(),
        this.createEnhancedStoryPointsAnalysisTool(),
        this.createEnhancedVelocityAnalysisTool()
      ]
    };
  }

  private createStoryPointsAnalysisTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "analyze_story_points";
      description = "Analyze story points completion and trends across sprints";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumbers: {
            type: "array",
            items: { type: "string" },
            description: "Array of sprint numbers to analyze"
          },
          includeTeamMetrics: {
            type: "boolean",
            description: "Include team performance metrics (default: true)"
          }
        },
        required: ["sprintNumbers"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumbers"]);

          const jiraService = this.services.get<any>('jiraService');
          const results: Array<{
            sprintNumber: string;
            stats: any;
            issueCount: number;
          }> = [];

          for (const sprintNumber of args.sprintNumbers) {
            const issues = await jiraService.fetchIssues(sprintNumber);
            const stats = jiraService.calculateStoryPointsStats(issues);
            results.push({ sprintNumber, stats, issueCount: issues.length });
          }

          const totalPoints = results.reduce((sum, r) => sum + r.stats.totalStoryPoints, 0);
          const completedPoints = results.reduce((sum, r) => sum + r.stats.completedStoryPoints, 0);
          const overallCompletion = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📊 Story Points Analysis Complete!\n\n` +
            `🎯 Overall Results:\n` +
            `  • Total Story Points: ${totalPoints}\n` +
            `  • Completed Points: ${completedPoints}\n` +
            `  • Overall Completion: ${overallCompletion}%\n\n` +
            `📋 Sprint Breakdown:\n${results.map(r => 
              `  • ${r.sprintNumber}: ${r.stats.completedStoryPoints}/${r.stats.totalStoryPoints} points (${r.stats.completionRate}%) - ${r.issueCount} issues`
            ).join('\n')}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to analyze story points: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createVelocityReportTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "generate_velocity_report";
      description = "Generate team velocity report with trends and predictions";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumbers: {
            type: "array",
            items: { type: "string" },
            description: "Sprint numbers for velocity analysis"
          },
          includeCurrentSprint: {
            type: "boolean",
            description: "Include current sprint in analysis (default: true)"
          }
        },
        required: ["sprintNumbers"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumbers"]);

          const jiraService = this.services.get<any>('jiraService');
          const velocityData: Array<{
            sprint: string;
            velocity: number;
            planned: number;
            completion: number;
          }> = [];

          for (const sprintNumber of args.sprintNumbers) {
            const issues = await jiraService.fetchIssues(sprintNumber);
            const stats = jiraService.calculateStoryPointsStats(issues);
            velocityData.push({
              sprint: sprintNumber,
              velocity: stats.completedStoryPoints,
              planned: stats.totalStoryPoints,
              completion: stats.completionRate
            });
          }

          const avgVelocity = Math.round(
            velocityData.reduce((sum, v) => sum + v.velocity, 0) / velocityData.length
          );

          const trend = this.calculateTrend(velocityData.map(v => v.velocity));

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📈 Velocity Report Generated!\n\n` +
            `🎯 Key Metrics:\n` +
            `  • Average Velocity: ${avgVelocity} points/sprint\n` +
            `  • Velocity Trend: ${trend}\n` +
            `  • Sprints Analyzed: ${velocityData.length}\n\n` +
            `📊 Sprint Velocities:\n${velocityData.map(v => 
              `  • ${v.sprint}: ${v.velocity} points (${v.completion}% completion)`
            ).join('\n')}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to generate velocity report: ${error.message}`);
        }
      }

      private calculateTrend(velocities: number[]): string {
        if (velocities.length < 2) return 'Insufficient data';
        
        const recent = velocities.slice(-Math.ceil(velocities.length / 2));
        const earlier = velocities.slice(0, Math.floor(velocities.length / 2));
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
        
        if (recentAvg > earlierAvg * 1.1) return 'Increasing 📈';
        if (recentAvg < earlierAvg * 0.9) return 'Decreasing 📉';
        return 'Stable 📊';
      }
    })(this.services);
  }

  private createSprintSummaryTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "sprint_summary_report";
      description = "Generate detailed sprint summary with team insights";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number for summary report"
          },
          includeTeamMetrics: {
            type: "boolean",
            description: "Include team collaboration metrics (default: true)"
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

          const jiraService = this.services.get<any>('jiraService');
          const issues = await jiraService.fetchIssues(args.sprintNumber);
          const stats = jiraService.calculateStoryPointsStats(issues);

          // Additional analysis
          const issuesByType = this.groupByField(issues, 'fields.issuetype.name');
          const issuesByStatus = this.groupByField(issues, 'fields.status.name');
          const issuesByAssignee = this.groupByField(issues, 'fields.assignee.displayName');

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📋 Sprint Summary - ${args.sprintNumber}\n\n` +
            `🎯 Overview:\n` +
            `  • Total Issues: ${issues.length}\n` +
            `  • Story Points: ${stats.completedStoryPoints}/${stats.totalStoryPoints} (${stats.completionRate}%)\n` +
            `  • Completed Issues: ${Object.keys(issuesByStatus).filter(s => s.toLowerCase().includes('done')).reduce((sum, s) => sum + issuesByStatus[s], 0)}\n\n` +
            `📊 Issue Types:\n${Object.entries(issuesByType).map(([type, count]) => `  • ${type}: ${count}`).join('\n')}\n\n` +
            `👥 Team Distribution:\n${Object.entries(issuesByAssignee).slice(0, 5).map(([assignee, count]) => `  • ${assignee || 'Unassigned'}: ${count}`).join('\n')}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to generate sprint summary: ${error.message}`);
        }
      }

      private groupByField(issues: any[], fieldPath: string): Record<string, number> {
        const groups: Record<string, number> = {};
        
        issues.forEach(issue => {
          const value = this.getNestedValue(issue, fieldPath) || 'Unknown';
          groups[value] = (groups[value] || 0) + 1;
        });
        
        return groups;
      }

      private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
      }
    })(this.services);
  }

  private createEnhancedStoryPointsAnalysisTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "enhanced_story_points_analysis";
      description = "Enhanced multi-sprint story points analysis with trends, Teams integration, and HTML reports";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumbers: {
            type: "array",
            items: { type: "string" },
            description: "Array of sprint numbers to analyze (e.g., ['SCNT-2025-20', 'SCNT-2025-21'])"
          },
          includeTeamsNotification: {
            type: "boolean",
            description: "Send results to Teams channel (default: true)"
          },
          generateHtmlReport: {
            type: "boolean", 
            description: "Generate comprehensive HTML report (default: true)"
          }
        },
        required: ["sprintNumbers"]
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
          this.validateRequiredArgs(args, ["sprintNumbers"]);

          const storyPointsAnalysisTool = this.toolInstances.get('storyPointsAnalysisTool');
          
          const result = await storyPointsAnalysisTool.analyzeStoryPoints({
            sprintNumbers: args.sprintNumbers,
            includeTeamsNotification: args.includeTeamsNotification !== false,
            generateHtmlReport: args.generateHtmlReport !== false
          });

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📊 Enhanced Story Points Analysis Complete!\n\n` +
            `📊 Total Story Points: ${result.totalPoints}\n` +
            `✅ Completed Points: ${result.completedPoints}\n` +
            `📈 Overall Completion Rate: ${result.overallCompletionRate}%\n` +
            `🏆 Performance Assessment: ${result.performanceAssessment}\n\n` +
            `📋 Sprint Analysis:\n${result.sprintMetrics.map((s: any) => 
              `  • ${s.sprintNumber}: ${s.stats.completedStoryPoints}/${s.stats.totalStoryPoints} points (${s.stats.completionRate}%)`
            ).join('\n')}\n\n` +
            `💡 Recommendations:\n${result.recommendations.map((r: string) => `  • ${r}`).join('\n')}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to perform enhanced story points analysis: ${error.message}`);
        }
      }
    })(this.services, this.toolInstances);
  }

  private createEnhancedVelocityAnalysisTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "enhanced_velocity_analysis";
      description = "Comprehensive velocity analysis with predictive analytics, trends, and consistency metrics";
      inputSchema = {
        type: "object",
        properties: {
          numberOfSprints: {
            type: "number",
            description: "Number of recent sprints to analyze (default: 6)"
          },
          includePredictiveAnalysis: {
            type: "boolean",
            description: "Include next sprint velocity prediction (default: true)"
          },
          generateHtmlReport: {
            type: "boolean",
            description: "Generate detailed HTML velocity report (default: true)"
          },
          includeTeamsNotification: {
            type: "boolean",
            description: "Send analysis to Teams (default: true)"
          }
        }
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
          const velocityAnalysisTool = this.toolInstances.get('velocityAnalysisTool');
          const numberOfSprints = args.numberOfSprints || 6;

          const result = await velocityAnalysisTool.analyzeVelocity({
            numberOfSprints,
            includePredictiveAnalysis: args.includePredictiveAnalysis !== false,
            generateHtmlReport: args.generateHtmlReport !== false,
            includeTeamsNotification: args.includeTeamsNotification !== false
          });

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📈 Enhanced Velocity Analysis Complete!\n\n` +
            `📈 Average Velocity: ${result.trends.averageVelocity} points/sprint\n` +
            `📊 Velocity Trend: ${result.trends.velocityTrend}\n` +
            `🎯 Consistency: ${result.trends.consistency}\n` +
            `✅ Overall Completion: ${result.summary.overallCompletionRate}%\n` +
            `🚀 Team Capacity: ${result.summary.teamCapacityTrend}\n\n` +
            `🏆 Best Sprint: ${result.trends.bestSprint.sprintNumber} (${result.trends.bestSprint.completedPoints} points)\n` +
            `⚖️ Worst Sprint: ${result.trends.worstSprint.sprintNumber} (${result.trends.worstSprint.completedPoints} points)\n\n` +
            `🔮 Next Sprint Prediction: ${result.predictiveAnalysis.nextSprintPrediction} points (${result.predictiveAnalysis.confidenceLevel}% confidence)\n\n` +
            `💡 Top Recommendations:\n${result.recommendations.slice(0, 3).map((r: string) => `  • ${r}`).join('\n')}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to perform enhanced velocity analysis: ${error.message}`);
        }
      }
    })(this.services, this.toolInstances);
  }
}
