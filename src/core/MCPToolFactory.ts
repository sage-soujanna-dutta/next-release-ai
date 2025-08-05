import { MCPTool, MCPToolCategory } from "./BaseMCPTool.js";
import { ReleaseNotesService } from "../services/ReleaseNotesService.js";
import { JiraService } from "../services/JiraService.js";
import { TeamsService } from "../services/TeamsService.js";
import { FileService } from "../services/FileService.js";
import { ConfluenceService } from "../services/ConfluenceService.js";
import { EnhancedJiraService } from "../services/EnhancedJiraService.js";
import { GitHubService } from "../services/GitHubService.js";
import { HtmlFormatter } from "../utils/HtmlFormatter.js";
import { SprintReviewTool } from "../tools/SprintReviewTool.js";
import { ShareableReportTool } from "../tools/ShareableReportTool.js";
import { TeamsValidationTool } from "../tools/TeamsValidationTool.js";
import { TeamsIntegrationTool } from "../tools/TeamsIntegrationTool.js";
import { StoryPointsAnalysisTool } from "../tools/StoryPointsAnalysisTool.js";
import { VelocityAnalysisTool } from "../tools/VelocityAnalysisTool.js";
import { ComprehensiveWorkflowTool } from "../tools/ComprehensiveWorkflowTool.js";
import { BoardLookup, STATIC_BOARD_MAPPINGS } from "../utils/BoardMappings.js";

// Import tool adapters that will be created
import { ReleaseToolsFactory } from "./factories/ReleaseToolsFactory.js";
import { AnalysisToolsFactory } from "./factories/AnalysisToolsFactory.js";
import { IntegrationToolsFactory } from "./factories/IntegrationToolsFactory.js";
import { JiraToolsFactory } from "./factories/JiraToolsFactory.js";

export interface ToolFactoryConfig {
  enabledCategories?: string[];
  customConfig?: Record<string, any>;
}

export class MCPToolFactory {
  private services: ServiceRegistry;
  private toolInstances: Map<string, any>;
  private categories: Map<string, MCPToolCategory>;

  constructor(config?: ToolFactoryConfig) {
    this.services = new ServiceRegistry();
    this.toolInstances = new Map();
    this.categories = new Map();
    
    this.initializeServices();
    this.initializeToolInstances();
    this.initializeCategories(config);
  }

  private initializeServices(): void {
    this.services.register('releaseNotesService', new ReleaseNotesService());
    this.services.register('jiraService', new JiraService());
    this.services.register('teamsService', new TeamsService());
    this.services.register('fileService', new FileService());
    this.services.register('confluenceService', new ConfluenceService());
    this.services.register('githubService', new GitHubService());
    this.services.register('htmlFormatter', new HtmlFormatter());
    this.services.register('enhancedJiraService', new EnhancedJiraService({
      domain: process.env.JIRA_DOMAIN || '',
      token: process.env.JIRA_TOKEN || '',
      email: process.env.JIRA_EMAIL
    }));
  }

  private initializeToolInstances(): void {
    // Initialize tool class instances
    this.toolInstances.set('sprintReviewTool', new SprintReviewTool());
    this.toolInstances.set('shareableReportTool', new ShareableReportTool());
    this.toolInstances.set('teamsValidationTool', new TeamsValidationTool());
    this.toolInstances.set('teamsIntegrationTool', new TeamsIntegrationTool());
    this.toolInstances.set('storyPointsAnalysisTool', new StoryPointsAnalysisTool());
    this.toolInstances.set('velocityAnalysisTool', new VelocityAnalysisTool());
    this.toolInstances.set('comprehensiveWorkflowTool', new ComprehensiveWorkflowTool());
  }

  private initializeCategories(config?: ToolFactoryConfig): void {
    const enabledCategories = config?.enabledCategories || [
      'release', 'analysis', 'integration', 'jira'
    ];

    if (enabledCategories.includes('release')) {
      const releaseFactory = new ReleaseToolsFactory(this.services, this.toolInstances);
      this.categories.set('release', releaseFactory.createCategory());
    }

    if (enabledCategories.includes('analysis')) {
      const analysisFactory = new AnalysisToolsFactory(this.services, this.toolInstances);
      this.categories.set('analysis', analysisFactory.createCategory());
    }

    if (enabledCategories.includes('integration')) {
      const integrationFactory = new IntegrationToolsFactory(this.services, this.toolInstances);
      this.categories.set('integration', integrationFactory.createCategory());
    }

    if (enabledCategories.includes('jira')) {
      const jiraFactory = new JiraToolsFactory(this.services, this.toolInstances);
      this.categories.set('jira', jiraFactory.createCategory());
    }
  }

  getAllTools(): MCPTool[] {
    const allTools: MCPTool[] = [];
    
    for (const category of this.categories.values()) {
      allTools.push(...category.tools);
    }
    
    return allTools;
  }

  getToolsByCategory(categoryName: string): MCPTool[] {
    const category = this.categories.get(categoryName);
    return category ? category.tools : [];
  }

  getTool(toolName: string): MCPTool | undefined {
    for (const category of this.categories.values()) {
      const tool = category.tools.find(t => t.name === toolName);
      if (tool) return tool;
    }
    return undefined;
  }

  getCategories(): MCPToolCategory[] {
    return Array.from(this.categories.values());
  }

  getToolCount(): number {
    return this.getAllTools().length;
  }

  getCategoryCount(): number {
    return this.categories.size;
  }

  // Service access for tools
  getService<T>(serviceName: string): T {
    return this.services.get<T>(serviceName);
  }

  getToolInstance<T>(instanceName: string): T {
    return this.toolInstances.get(instanceName) as T;
  }

  // Static Board Mappings Utilities
  
  /**
   * Get board ID by project key using static mappings
   */
  getBoardIdByProject(projectKey: string): number | null {
    return BoardLookup.getBoardIdByProject(projectKey);
  }
  
  /**
   * Get all available project keys from static mappings
   */
  getAvailableProjects(): string[] {
    return BoardLookup.getAllProjectKeys();
  }
  
  /**
   * Search boards by name using static mappings
   */
  searchBoards(searchTerm: string) {
    return BoardLookup.searchBoardsByName(searchTerm);
  }
  
  /**
   * Get current static board mappings
   */
  getStaticBoardMappings() {
    return STATIC_BOARD_MAPPINGS;
  }
}

export class ServiceRegistry {
  private services: Map<string, any> = new Map();

  register(name: string, service: any): void {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }
    return service as T;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  getAllServices(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [name, service] of this.services.entries()) {
      result[name] = service;
    }
    return result;
  }
}
