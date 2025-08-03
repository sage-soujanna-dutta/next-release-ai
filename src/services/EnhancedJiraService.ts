/**
 * Enhanced JIRA Service with Deep Analysis Capabilities
 * Extends the existing JiraService with comprehensive ticket analysis
 */

import axios, { AxiosRequestConfig } from 'axios';
import { JiraExtractor, JiraTicketDetails } from '../utils/JiraExtractor.js';
import { JiraAnalyzer, TicketInsights } from '../utils/JiraAnalyzer.js';

export interface JiraApiConfig {
  domain: string;
  token: string;
  email?: string;
}

export interface JiraSearchOptions {
  jql?: string;
  fields?: string[];
  expand?: string[];
  startAt?: number;
  maxResults?: number;
}

export interface TicketAnalysisRequest {
  ticketKey: string;
  includeChangelog?: boolean;
  includeComments?: boolean;
  includeWorklogs?: boolean;
  includeAttachments?: boolean;
  customFieldMapping?: Record<string, string>;
  analysisDepth?: 'basic' | 'standard' | 'comprehensive';
}

export interface BulkAnalysisOptions {
  tickets: string[];
  batchSize?: number;
  includeInsights?: boolean;
  filterCriteria?: {
    minStoryPoints?: number;
    maxStoryPoints?: number;
    statusCategories?: string[];
    issueTypes?: string[];
    riskLevels?: ('low' | 'medium' | 'high')[];
  };
}

export interface JiraReportingOptions {
  groupBy: 'status' | 'assignee' | 'priority' | 'epic' | 'sprint' | 'risk';
  metrics: Array<'cycleTime' | 'activity' | 'collaboration' | 'quality' | 'velocity'>;
  timeRange?: {
    from: string;
    to: string;
  };
  aggregation?: 'sum' | 'average' | 'median' | 'count';
}

export class EnhancedJiraService {
  private config: JiraApiConfig;
  private baseUrl: string;
  private authHeader: string;

  constructor(config: JiraApiConfig) {
    this.config = config;
    this.baseUrl = `https://${config.domain}/rest/api/2`; // Use API v2 for better compatibility
    // Use Bearer token authentication instead of Basic auth
    this.authHeader = `Bearer ${config.token}`;
  }

  /**
   * Get comprehensive ticket analysis
   */
  async analyzeTicket(request: TicketAnalysisRequest): Promise<{ details: JiraTicketDetails; insights: TicketInsights }> {
    const { ticketKey, includeChangelog = true, customFieldMapping } = request;

    try {
      // Prepare field expansion based on analysis depth
      const expandFields = this.getExpandFields(request.analysisDepth || 'standard');
      
      // Fetch ticket details
      const ticketResponse = await axios.get(`${this.baseUrl}/issue/${ticketKey}`, {
        headers: { Authorization: this.authHeader },
        params: {
          expand: expandFields.join(','),
          fields: '*all'
        }
      });

      // Fetch changelog if requested
      let changelog = null;
      if (includeChangelog) {
        try {
          const changelogResponse = await axios.get(`${this.baseUrl}/issue/${ticketKey}/changelog`, {
            headers: { Authorization: this.authHeader }
          });
          changelog = changelogResponse.data;
        } catch (error) {
          console.warn(`Could not fetch changelog for ${ticketKey}:`, error);
        }
      }

      // Extract comprehensive details
      const details = JiraExtractor.extractComplete(ticketResponse.data, changelog, customFieldMapping);
      
      // Generate insights
      const insights = JiraAnalyzer.analyzeTicket(details);

      return { details, insights };
    } catch (error: any) {
      throw new Error(`Failed to analyze ticket ${ticketKey}: ${error.message}`);
    }
  }

  /**
   * Bulk analysis of multiple tickets
   */
  async bulkAnalyzeTickets(options: BulkAnalysisOptions): Promise<Map<string, { details: JiraTicketDetails; insights?: TicketInsights }>> {
    const { tickets, batchSize = 5, includeInsights = true, filterCriteria } = options;
    const results = new Map<string, { details: JiraTicketDetails; insights?: TicketInsights }>();
    const errors: string[] = [];

    // Process tickets in batches to avoid rate limiting
    for (let i = 0; i < tickets.length; i += batchSize) {
      const batch = tickets.slice(i, i + batchSize);
      const batchPromises = batch.map(async (ticketKey) => {
        try {
          const analysis = await this.analyzeTicket({
            ticketKey,
            analysisDepth: includeInsights ? 'standard' : 'basic'
          });

          // Apply filter criteria if provided
          if (filterCriteria && !this.matchesFilterCriteria(analysis.details, analysis.insights, filterCriteria)) {
            return null;
          }

          return {
            ticketKey,
            analysis: {
              details: analysis.details,
              insights: includeInsights ? analysis.insights : undefined
            }
          };
        } catch (error: any) {
          errors.push(`${ticketKey}: ${error.message}`);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(result => {
        if (result) {
          results.set(result.ticketKey, result.analysis);
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < tickets.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (errors.length > 0) {
      console.warn('Bulk analysis completed with errors:', errors);
    }

    return results;
  }

  /**
   * Search tickets with JQL and return analysis
   */
  async searchAndAnalyze(jql: string, options?: { maxResults?: number; includeInsights?: boolean }): Promise<Map<string, { details: JiraTicketDetails; insights?: TicketInsights }>> {
    const maxResults = options?.maxResults || 50;
    const includeInsights = options?.includeInsights !== false;

    try {
      const searchResponse = await axios.post(`${this.baseUrl}/search`, {
        jql,
        maxResults,
        fields: ['key'],
        startAt: 0
      }, {
        headers: { Authorization: this.authHeader }
      });

      const ticketKeys = searchResponse.data.issues.map((issue: any) => issue.key);
      return await this.bulkAnalyzeTickets({
        tickets: ticketKeys,
        includeInsights
      });
    } catch (error: any) {
      throw new Error(`Failed to search and analyze tickets: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive reports
   */
  async generateReport(tickets: string[], options: JiraReportingOptions): Promise<any> {
    const analysisResults = await this.bulkAnalyzeTickets({
      tickets,
      includeInsights: true
    });

    const report = {
      summary: {
        totalTickets: analysisResults.size,
        analyzedAt: new Date().toISOString(),
        groupBy: options.groupBy,
        metrics: options.metrics
      },
      groups: new Map<string, any>(),
      aggregatedMetrics: {},
      recommendations: [] as string[]
    };

    // Group tickets by specified criteria
    const groups = new Map<string, Array<{ details: JiraTicketDetails; insights: TicketInsights }>>();
    
    analysisResults.forEach((analysis, ticketKey) => {
      if (!analysis.insights) return;
      
      const groupKey = this.getGroupKey(analysis.details, analysis.insights, options.groupBy);
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)?.push({ details: analysis.details, insights: analysis.insights });
    });

    // Calculate metrics for each group
    groups.forEach((groupTickets, groupKey) => {
      const groupMetrics = this.calculateGroupMetrics(groupTickets, options.metrics);
      report.groups.set(groupKey, {
        ticketCount: groupTickets.length,
        tickets: groupTickets.map(t => ({
          key: t.details.metadata.key,
          summary: t.details.metadata.summary,
          status: t.details.metadata.status.name,
          assignee: t.details.metadata.assignee?.displayName || 'Unassigned',
          storyPoints: t.details.storyPoints,
          riskLevel: t.insights.risks.overallRisk
        })),
        metrics: groupMetrics,
        insights: this.generateGroupInsights(groupTickets)
      });
    });

    // Generate overall recommendations
    report.recommendations = this.generateReportRecommendations(analysisResults);

    return report;
  }

  /**
   * Get field configuration for different analysis depths
   */
  private getExpandFields(depth: 'basic' | 'standard' | 'comprehensive'): string[] {
    const basic = ['names', 'schema'];
    const standard = [...basic, 'renderedFields', 'transitions', 'changelog'];
    const comprehensive = [...standard, 'operations', 'editmeta', 'versionedRepresentations'];

    switch (depth) {
      case 'basic': return basic;
      case 'comprehensive': return comprehensive;
      default: return standard;
    }
  }

  /**
   * Check if ticket matches filter criteria
   */
  private matchesFilterCriteria(
    details: JiraTicketDetails, 
    insights: TicketInsights, 
    criteria: BulkAnalysisOptions['filterCriteria']
  ): boolean {
    if (!criteria) return true;

    if (criteria.minStoryPoints && (!details.storyPoints || details.storyPoints < criteria.minStoryPoints)) {
      return false;
    }

    if (criteria.maxStoryPoints && details.storyPoints && details.storyPoints > criteria.maxStoryPoints) {
      return false;
    }

    if (criteria.statusCategories && !criteria.statusCategories.includes(details.metadata.status.category)) {
      return false;
    }

    if (criteria.issueTypes && !criteria.issueTypes.includes(details.metadata.issueType.name)) {
      return false;
    }

    if (criteria.riskLevels && !criteria.riskLevels.includes(insights.risks.overallRisk)) {
      return false;
    }

    return true;
  }

  /**
   * Get group key for reporting
   */
  private getGroupKey(details: JiraTicketDetails, insights: TicketInsights, groupBy: string): string {
    switch (groupBy) {
      case 'status':
        return details.metadata.status.name;
      case 'assignee':
        return details.metadata.assignee?.displayName || 'Unassigned';
      case 'priority':
        return details.metadata.priority.name;
      case 'epic':
        return details.epic?.name || 'No Epic';
      case 'sprint':
        return details.sprints.length > 0 ? details.sprints[details.sprints.length - 1].name : 'No Sprint';
      case 'risk':
        return insights.risks.overallRisk;
      default:
        return 'All';
    }
  }

  /**
   * Calculate metrics for a group of tickets
   */
  private calculateGroupMetrics(tickets: Array<{ details: JiraTicketDetails; insights: TicketInsights }>, metrics: string[]): any {
    const result: any = {};

    if (metrics.includes('cycleTime')) {
      const cycleTimes = tickets
        .map(t => t.insights.cycleTime.leadTime)
        .filter(time => time !== undefined) as number[];
      
      if (cycleTimes.length > 0) {
        result.cycleTime = {
          average: cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length / (1000 * 60 * 60 * 24), // days
          median: this.calculateMedian(cycleTimes) / (1000 * 60 * 60 * 24), // days
          min: Math.min(...cycleTimes) / (1000 * 60 * 60 * 24), // days
          max: Math.max(...cycleTimes) / (1000 * 60 * 60 * 24) // days
        };
      }
    }

    if (metrics.includes('activity')) {
      const activityScores = tickets.map(t => t.insights.activityPattern.activityScore);
      result.activity = {
        averageScore: activityScores.reduce((sum, score) => sum + score, 0) / activityScores.length,
        highActivityCount: activityScores.filter(score => score > 70).length,
        staleCount: activityScores.filter(score => score < 20).length
      };
    }

    if (metrics.includes('collaboration')) {
      const engagementScores = tickets.map(t => t.insights.collaboration.stakeholderEngagement);
      result.collaboration = {
        averageEngagement: engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length,
        totalComments: tickets.reduce((sum, t) => sum + t.details.comments.length, 0),
        uniqueContributors: new Set(tickets.flatMap(t => t.details.comments.map(c => c.author.accountId))).size
      };
    }

    if (metrics.includes('quality')) {
      result.quality = {
        averageDescriptionQuality: tickets.reduce((sum, t) => sum + t.insights.quality.descriptionQuality, 0) / tickets.length,
        documentationCompleteCount: tickets.filter(t => t.insights.quality.documentationComplete).length,
        reopenCount: tickets.reduce((sum, t) => sum + t.insights.quality.reopenCount, 0)
      };
    }

    if (metrics.includes('velocity')) {
      const storyPoints = tickets
        .map(t => t.details.storyPoints)
        .filter(points => points !== undefined) as number[];
      
      if (storyPoints.length > 0) {
        result.velocity = {
          totalStoryPoints: storyPoints.reduce((sum, points) => sum + points, 0),
          averageStoryPoints: storyPoints.reduce((sum, points) => sum + points, 0) / storyPoints.length,
          completedTickets: tickets.filter(t => t.details.metadata.resolution).length
        };
      }
    }

    return result;
  }

  /**
   * Generate insights for a group of tickets
   */
  private generateGroupInsights(tickets: Array<{ details: JiraTicketDetails; insights: TicketInsights }>): string[] {
    const insights: string[] = [];

    // Risk analysis
    const highRiskCount = tickets.filter(t => t.insights.risks.overallRisk === 'high').length;
    const blockedCount = tickets.filter(t => t.insights.risks.isBlocked).length;
    
    if (highRiskCount > 0) {
      insights.push(`${highRiskCount} high-risk tickets require attention`);
    }
    
    if (blockedCount > 0) {
      insights.push(`${blockedCount} tickets are currently blocked`);
    }

    // Activity insights
    const staleCount = tickets.filter(t => t.insights.activityPattern.activityScore < 20).length;
    if (staleCount > tickets.length * 0.3) {
      insights.push(`${staleCount} tickets show low activity - consider review`);
    }

    // Quality insights
    const poorDocumentationCount = tickets.filter(t => t.insights.quality.descriptionQuality < 50).length;
    if (poorDocumentationCount > 0) {
      insights.push(`${poorDocumentationCount} tickets need better documentation`);
    }

    return insights;
  }

  /**
   * Generate overall recommendations for the report
   */
  private generateReportRecommendations(analysisResults: Map<string, { details: JiraTicketDetails; insights?: TicketInsights }>): string[] {
    const recommendations: string[] = [];
    const allInsights = Array.from(analysisResults.values()).filter(r => r.insights).map(r => r.insights!);

    // High-level recommendations based on aggregated data
    const highRiskCount = allInsights.filter(i => i.risks.overallRisk === 'high').length;
    const staleCount = allInsights.filter(i => i.activityPattern.activityScore < 20).length;
    const blockedCount = allInsights.filter(i => i.risks.isBlocked).length;

    if (highRiskCount > analysisResults.size * 0.2) {
      recommendations.push('🚨 High proportion of risky tickets - consider risk mitigation strategies');
    }

    if (staleCount > analysisResults.size * 0.3) {
      recommendations.push('📊 Many stale tickets detected - review backlog grooming process');
    }

    if (blockedCount > 0) {
      recommendations.push('🛑 Blocked tickets identified - prioritize blocker resolution');
    }

    return recommendations;
  }

  /**
   * Calculate median value
   */
  private calculateMedian(values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  /**
   * Get ticket by key with basic info
   */
  async getTicket(key: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/issue/${key}`, {
        headers: { Authorization: this.authHeader }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch ticket ${key}: ${error.message}`);
    }
  }

  /**
   * Search tickets with JQL
   */
  async searchTickets(jql: string, options?: JiraSearchOptions): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/search`, {
        jql,
        startAt: options?.startAt || 0,
        maxResults: options?.maxResults || 50,
        fields: options?.fields || ['key', 'summary', 'status', 'assignee'],
        expand: options?.expand || []
      }, {
        headers: { Authorization: this.authHeader }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to search tickets: ${error.message}`);
    }
  }

  /**
   * Get sprint metrics and data
   */
  async getSprintMetrics(sprintNumber: string): Promise<any> {
    try {
      // Search for issues in the sprint using correct JQL format
      const jql = `sprint = ${sprintNumber}`;
      const searchResult = await this.searchTickets(jql, {
        fields: [
          'key', 'summary', 'status', 'assignee', 'priority', 'issuetype',
          'customfield_10004', 'customfield_10002', 'customfield_10003', 'customfield_10005',
          'created', 'updated', 'resolved'
        ],
        maxResults: 1000
      });

      const issues = searchResult.issues || [];
      
      // Calculate metrics
      const totalIssues = issues.length;
      const completedIssues = issues.filter((issue: any) => 
        ['Done', 'Closed', 'Resolved'].includes(issue.fields.status?.name)
      ).length;
      
      const completionRate = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;
      
      // Calculate story points
      let totalStoryPoints = 0;
      let completedStoryPoints = 0;
      
      issues.forEach((issue: any) => {
        const storyPoints = 
          issue.fields.customfield_10004 || 
          issue.fields.customfield_10002 || 
          issue.fields.customfield_10003 || 
          issue.fields.customfield_10005 || 
          0;
        
        totalStoryPoints += storyPoints;
        
        if (['Done', 'Closed', 'Resolved'].includes(issue.fields.status?.name)) {
          completedStoryPoints += storyPoints;
        }
      });

      // Group by status, assignee, priority
      const byStatus = this.groupBy(issues, (issue: any) => issue.fields.status?.name || 'Unknown');
      const byAssignee = this.groupBy(issues, (issue: any) => issue.fields.assignee?.displayName || 'Unassigned');
      const byPriority = this.groupBy(issues, (issue: any) => issue.fields.priority?.name || 'No Priority');
      const byType = this.groupBy(issues, (issue: any) => issue.fields.issuetype?.name || 'Unknown');

      // Transform to expected format for HTML generator
      const getTypeCount = (types: string[]) => {
        return types.reduce((count, type) => count + (byType[type]?.length || 0), 0);
      };

      const userStoriesCount = getTypeCount(['Story', 'User Story']);
      const bugFixesCount = getTypeCount(['Bug', 'Defect']);
      const tasksCount = getTypeCount(['Task', 'Technical Task']);
      const epicsCount = getTypeCount(['Epic']);
      const improvementsCount = getTypeCount(['Improvement', 'Enhancement']);

      const workBreakdown = {
        userStories: { 
          count: userStoriesCount, 
          percentage: totalIssues > 0 ? Math.round((userStoriesCount / totalIssues) * 100) : 0 
        },
        bugFixes: { 
          count: bugFixesCount, 
          percentage: totalIssues > 0 ? Math.round((bugFixesCount / totalIssues) * 100) : 0 
        },
        tasks: { 
          count: tasksCount, 
          percentage: totalIssues > 0 ? Math.round((tasksCount / totalIssues) * 100) : 0 
        },
        epics: { 
          count: epicsCount, 
          percentage: totalIssues > 0 ? Math.round((epicsCount / totalIssues) * 100) : 0 
        },
        improvements: { 
          count: improvementsCount, 
          percentage: totalIssues > 0 ? Math.round((improvementsCount / totalIssues) * 100) : 0 
        }
      };

      // Transform priority data to expected format
      const getPriorityData = (priority: string) => {
        const priorityIssues = byPriority[priority] || [];
        const resolved = priorityIssues.filter((issue: any) => 
          ['Done', 'Closed', 'Resolved'].includes(issue.fields.status?.name)
        ).length;
        return { total: priorityIssues.length, resolved };
      };

      const priorityData = {
        critical: getPriorityData('Critical'),
        high: getPriorityData('High'),
        medium: getPriorityData('Medium'),
        low: getPriorityData('Low'),
        blockers: getPriorityData('Blocker')
      };

      // Transform contributors data
      const topContributors = Object.keys(byAssignee).map(assignee => ({
        name: assignee,
        commits: 0, // We don't have commit data in this context
        issues: byAssignee[assignee].length,
        storyPoints: byAssignee[assignee].reduce((sum: number, issue: any) => {
          const points = 
            issue.fields.customfield_10004 || 
            issue.fields.customfield_10002 || 
            issue.fields.customfield_10003 || 
            issue.fields.customfield_10005 || 
            0;
          return sum + (['Done', 'Closed', 'Resolved'].includes(issue.fields.status?.name) ? points : 0);
        }, 0)
      })).sort((a, b) => (b.issues + b.storyPoints) - (a.issues + a.storyPoints)).slice(0, 10);

      return {
        sprintId: sprintNumber,
        period: `Sprint ${sprintNumber}`,
        totalIssues,
        completedIssues,
        completionRate: Math.round(completionRate * 100) / 100,
        totalStoryPoints,
        completedStoryPoints,
        storyPointsCompletion: totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0,
        issues,
        // Legacy breakdown format
        breakdown: {
          byStatus,
          byAssignee,
          byPriority,
          byType
        },
        // New format expected by HTML generator
        workBreakdown,
        priorityData,
        topContributors,
        velocityData: {
          current: completedStoryPoints,
          target: totalStoryPoints,
          completionRate: totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0,
          velocity: completedStoryPoints,
          trend: 'stable' as const
        },
        contributors: Object.keys(byAssignee).map(assignee => ({
          name: assignee,
          issuesCount: byAssignee[assignee].length,
          completedCount: byAssignee[assignee].filter((issue: any) => 
            ['Done', 'Closed', 'Resolved'].includes(issue.fields.status?.name)
          ).length
        }))
      };
    } catch (error: any) {
      throw new Error(`Failed to get sprint metrics: ${error.message}`);
    }
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
}
