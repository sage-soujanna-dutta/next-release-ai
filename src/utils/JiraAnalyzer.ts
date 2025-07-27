/**
 * JIRA Analysis Utility
 * Advanced analysis and insights generation for JIRA tickets
 */

import { JiraTicketDetails, JiraExtractor, JiraChangeHistory, JiraComment, JiraWorklog } from './JiraExtractor.js';

export interface StatusTransition {
  from: string;
  to: string;
  date: string;
  author: string;
  durationInPreviousStatus?: number; // milliseconds
}

export interface CycleTimeMetrics {
  createdToInProgress?: number;
  inProgressToReview?: number;
  reviewToTesting?: number;
  testingToDone?: number;
  totalCycleTime?: number;
  leadTime?: number; // created to done
  activeTime?: number; // time in 'active' statuses
  waitTime?: number; // time in 'waiting' statuses
}

export interface ActivityPattern {
  mostActiveDay: string;
  mostActiveHour: number;
  commentFrequency: number; // comments per day
  worklogFrequency: number; // worklogs per day
  lastActivity: string;
  activityScore: number; // 0-100 based on recent activity
}

export interface CollaborationMetrics {
  uniqueCommentators: number;
  commentThreads: number;
  averageCommentLength: number;
  uniqueWorkloggers: number;
  handoffCount: number; // how many times assignee changed
  stakeholderEngagement: number; // 0-100 score
}

export interface QualityMetrics {
  descriptionQuality: number; // 0-100 score
  hasAcceptanceCriteria: boolean;
  hasTestCases: boolean;
  linkedToRequirements: boolean;
  reopenCount: number;
  bugFixRelated: boolean;
  documentationComplete: boolean;
}

export interface RiskIndicators {
  isBlocked: boolean;
  hasBlockers: boolean;
  overdueRisk: 'low' | 'medium' | 'high';
  complexityRisk: 'low' | 'medium' | 'high';
  stakeholderRisk: 'low' | 'medium' | 'high';
  technicalDebtRisk: 'low' | 'medium' | 'high';
  overallRisk: 'low' | 'medium' | 'high';
}

export interface TicketInsights {
  cycleTime: CycleTimeMetrics;
  activityPattern: ActivityPattern;
  collaboration: CollaborationMetrics;
  quality: QualityMetrics;
  risks: RiskIndicators;
  predictiveMetrics: {
    estimatedCompletion?: string;
    velocityImpact: number; // -1 to 1
    burndownImpact: number; // -1 to 1
  };
  recommendations: string[];
  tags: string[]; // auto-generated insight tags
}

export class JiraAnalyzer {
  /**
   * Analyze status transitions and calculate cycle time metrics
   */
  static analyzeStatusTransitions(details: JiraTicketDetails): { transitions: StatusTransition[], cycleTime: CycleTimeMetrics } {
    const transitions: StatusTransition[] = [];
    const statusChanges = details.changeHistory
      .filter(change => change.items.some(item => item.field === 'status'))
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

    let previousStatus = 'Created';
    let previousDate = details.metadata.created;

    statusChanges.forEach(change => {
      const statusChange = change.items.find(item => item.field === 'status');
      if (statusChange && statusChange.toString) {
        const duration = new Date(change.created).getTime() - new Date(previousDate).getTime();
        
        transitions.push({
          from: previousStatus,
          to: statusChange.toString,
          date: change.created,
          author: change.author.displayName,
          durationInPreviousStatus: duration
        });

        previousStatus = statusChange.toString;
        previousDate = change.created;
      }
    });

    // Calculate cycle time metrics
    const cycleTime = this.calculateCycleTimeMetrics(transitions, details.metadata.created, details.metadata.resolutionDate);

    return { transitions, cycleTime };
  }

  /**
   * Calculate detailed cycle time metrics
   */
  private static calculateCycleTimeMetrics(transitions: StatusTransition[], createdDate: string, resolvedDate?: string): CycleTimeMetrics {
    const metrics: CycleTimeMetrics = {};
    
    // Define status mappings (customizable based on workflow)
    const statusMappings = {
      'In Progress': 'inProgress',
      'Code Review': 'review',
      'Testing': 'testing',
      'Done': 'done',
      'Resolved': 'done',
      'Closed': 'done'
    };

    const statusDurations: Record<string, number> = {};
    
    transitions.forEach(transition => {
      const statusKey = statusMappings[transition.to as keyof typeof statusMappings];
      if (statusKey && transition.durationInPreviousStatus) {
        statusDurations[statusKey] = (statusDurations[statusKey] || 0) + transition.durationInPreviousStatus;
      }
    });

    // Calculate specific metrics
    metrics.createdToInProgress = transitions.find(t => t.to === 'In Progress')?.durationInPreviousStatus;
    metrics.inProgressToReview = statusDurations.review;
    metrics.reviewToTesting = statusDurations.testing;
    metrics.testingToDone = statusDurations.done;

    if (resolvedDate) {
      metrics.leadTime = new Date(resolvedDate).getTime() - new Date(createdDate).getTime();
      metrics.totalCycleTime = transitions.reduce((sum, t) => sum + (t.durationInPreviousStatus || 0), 0);
      
      // Calculate active vs wait time
      const activeStatuses = ['In Progress', 'Code Review', 'Testing'];
      const waitStatuses = ['To Do', 'Backlog', 'Blocked', 'Waiting'];
      
      metrics.activeTime = transitions
        .filter(t => activeStatuses.includes(t.to))
        .reduce((sum, t) => sum + (t.durationInPreviousStatus || 0), 0);
        
      metrics.waitTime = transitions
        .filter(t => waitStatuses.includes(t.to))
        .reduce((sum, t) => sum + (t.durationInPreviousStatus || 0), 0);
    }

    return metrics;
  }

  /**
   * Analyze activity patterns
   */
  static analyzeActivityPattern(details: JiraTicketDetails): ActivityPattern {
    const allActivities = [
      ...details.comments.map(c => ({ date: c.created, type: 'comment' })),
      ...details.worklogs.map(w => ({ date: w.created, type: 'worklog' })),
      ...details.changeHistory.map(ch => ({ date: ch.created, type: 'change' }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Analyze by day of week
    const dayActivity: Record<string, number> = {};
    const hourActivity: Record<number, number> = {};

    allActivities.forEach(activity => {
      const date = new Date(activity.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      dayActivity[dayName] = (dayActivity[dayName] || 0) + 1;
      hourActivity[hour] = (hourActivity[hour] || 0) + 1;
    });

    const mostActiveDay = Object.entries(dayActivity).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];
    const mostActiveHour = parseInt(Object.entries(hourActivity).reduce((a, b) => a[1] > b[1] ? a : b, ['0', 0])[0]);

    // Calculate frequencies
    const ticketAgeInDays = Math.max(1, Math.floor((Date.now() - new Date(details.metadata.created).getTime()) / (1000 * 60 * 60 * 24)));
    const commentFrequency = details.comments.length / ticketAgeInDays;
    const worklogFrequency = details.worklogs.length / ticketAgeInDays;

    // Calculate activity score
    const recentActivityDays = 7;
    const recentActivityCount = allActivities.filter(activity => 
      Date.now() - new Date(activity.date).getTime() < recentActivityDays * 24 * 60 * 60 * 1000
    ).length;
    const activityScore = Math.min(100, (recentActivityCount / recentActivityDays) * 20);

    return {
      mostActiveDay,
      mostActiveHour,
      commentFrequency,
      worklogFrequency,
      lastActivity: allActivities[allActivities.length - 1]?.date || details.metadata.created,
      activityScore
    };
  }

  /**
   * Analyze collaboration metrics
   */
  static analyzeCollaboration(details: JiraTicketDetails): CollaborationMetrics {
    const uniqueCommentators = new Set(details.comments.map(c => c.author.accountId)).size;
    const uniqueWorkloggers = new Set(details.worklogs.map(w => w.author.accountId)).size;
    
    // Count assignee changes
    const assigneeChanges = details.changeHistory.filter(change =>
      change.items.some(item => item.field === 'assignee')
    );
    const handoffCount = assigneeChanges.length;

    // Calculate average comment length
    const averageCommentLength = details.comments.length > 0 
      ? details.comments.reduce((sum, c) => sum + c.body.length, 0) / details.comments.length
      : 0;

    // Estimate comment threads (comments within 1 hour of each other)
    let commentThreads = 0;
    let currentThread = false;
    
    details.comments.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
    
    for (let i = 1; i < details.comments.length; i++) {
      const timeDiff = new Date(details.comments[i].created).getTime() - new Date(details.comments[i-1].created).getTime();
      const isThread = timeDiff < 60 * 60 * 1000; // 1 hour
      
      if (isThread && !currentThread) {
        commentThreads++;
        currentThread = true;
      } else if (!isThread) {
        currentThread = false;
      }
    }

    // Calculate stakeholder engagement score
    const totalStakeholders = uniqueCommentators + uniqueWorkloggers;
    const engagementScore = Math.min(100, (totalStakeholders * 20) + (details.comments.length * 2));

    return {
      uniqueCommentators,
      commentThreads,
      averageCommentLength,
      uniqueWorkloggers,
      handoffCount,
      stakeholderEngagement: engagementScore
    };
  }

  /**
   * Analyze quality metrics
   */
  static analyzeQuality(details: JiraTicketDetails): QualityMetrics {
    const description = details.metadata.description || '';
    
    // Description quality scoring
    let descriptionScore = 0;
    if (description.length > 100) descriptionScore += 30;
    if (description.length > 300) descriptionScore += 20;
    if (description.includes('acceptance criteria') || description.includes('AC:')) descriptionScore += 25;
    if (description.includes('test') || description.includes('verify')) descriptionScore += 25;

    const hasAcceptanceCriteria = /acceptance criteria|AC:|given.*when.*then/i.test(description);
    const hasTestCases = /test case|test scenario|verify|validate/i.test(description);
    
    // Check for requirements links
    const linkedToRequirements = details.linkedIssues.some(link => 
      link.linkType.name.toLowerCase().includes('requirement') ||
      link.issueType.toLowerCase().includes('requirement') ||
      link.issueType.toLowerCase().includes('epic')
    );

    // Count reopens
    const reopenCount = details.changeHistory.filter(change =>
      change.items.some(item => 
        item.field === 'status' && 
        item.fromString === 'Resolved' && 
        item.toString !== 'Closed'
      )
    ).length;

    // Check if bug-fix related
    const bugFixRelated = details.metadata.issueType.name.toLowerCase().includes('bug') ||
      details.metadata.summary.toLowerCase().includes('fix') ||
      details.linkedIssues.some(link => link.issueType.toLowerCase().includes('bug'));

    // Documentation completeness
    const documentationComplete = hasAcceptanceCriteria && hasTestCases && description.length > 200;

    return {
      descriptionQuality: descriptionScore,
      hasAcceptanceCriteria,
      hasTestCases,
      linkedToRequirements,
      reopenCount,
      bugFixRelated,
      documentationComplete
    };
  }

  /**
   * Analyze risk indicators
   */
  static analyzeRisks(details: JiraTicketDetails): RiskIndicators {
    // Check if blocked
    const isBlocked = details.metadata.status.name.toLowerCase().includes('blocked') ||
      details.metadata.labels.some(label => label.toLowerCase().includes('blocked'));

    // Check for blockers
    const hasBlockers = details.linkedIssues.some(link => 
      link.linkType.name.toLowerCase().includes('block') && link.direction === 'inward'
    );

    // Overdue risk
    let overdueRisk: 'low' | 'medium' | 'high' = 'low';
    if (details.dueDate) {
      const daysOverdue = Math.floor((Date.now() - new Date(details.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) overdueRisk = daysOverdue > 7 ? 'high' : 'medium';
    }

    // Complexity risk based on multiple factors
    let complexityScore = 0;
    if (details.linkedIssues.length > 5) complexityScore += 2;
    if (details.storyPoints && details.storyPoints > 8) complexityScore += 3;
    if (details.comments.length > 20) complexityScore += 2;
    if (details.changeHistory.length > 15) complexityScore += 2;
    if ((details.metadata.description || '').length > 1000) complexityScore += 1;
    
    const complexityRisk: 'low' | 'medium' | 'high' = complexityScore > 6 ? 'high' : complexityScore > 3 ? 'medium' : 'low';

    // Stakeholder risk
    const daysSinceLastActivity = Math.floor((Date.now() - new Date(details.metadata.updated).getTime()) / (1000 * 60 * 60 * 24));
    const stakeholderRisk: 'low' | 'medium' | 'high' = daysSinceLastActivity > 14 ? 'high' : daysSinceLastActivity > 7 ? 'medium' : 'low';

    // Technical debt risk
    const technicalDebtIndicators = [
      details.metadata.summary.toLowerCase().includes('technical debt'),
      details.metadata.summary.toLowerCase().includes('refactor'),
      details.metadata.labels.some(label => label.toLowerCase().includes('debt')),
      details.metadata.components.some(comp => comp.name.toLowerCase().includes('legacy'))
    ];
    const technicalDebtRisk: 'low' | 'medium' | 'high' = 
      technicalDebtIndicators.filter(Boolean).length > 2 ? 'high' : 
      technicalDebtIndicators.filter(Boolean).length > 0 ? 'medium' : 'low';

    // Overall risk calculation
    const riskScores = {
      low: 1,
      medium: 2,
      high: 3
    };
    
    const totalRiskScore = riskScores[overdueRisk] + riskScores[complexityRisk] + 
                          riskScores[stakeholderRisk] + riskScores[technicalDebtRisk] +
                          (isBlocked ? 3 : 0) + (hasBlockers ? 2 : 0);
    
    const overallRisk: 'low' | 'medium' | 'high' = totalRiskScore > 10 ? 'high' : totalRiskScore > 6 ? 'medium' : 'low';

    return {
      isBlocked,
      hasBlockers,
      overdueRisk,
      complexityRisk,
      stakeholderRisk,
      technicalDebtRisk,
      overallRisk
    };
  }

  /**
   * Generate actionable recommendations
   */
  static generateRecommendations(details: JiraTicketDetails, insights: TicketInsights): string[] {
    const recommendations: string[] = [];

    // Risk-based recommendations
    if (insights.risks.overallRisk === 'high') {
      recommendations.push('🚨 High risk ticket - consider breaking down or prioritizing');
    }

    if (insights.risks.isBlocked) {
      recommendations.push('🛑 Ticket is blocked - escalate blocker resolution');
    }

    if (insights.risks.overdueRisk === 'high') {
      recommendations.push('⏰ Overdue ticket - review scope and timeline');
    }

    // Quality recommendations
    if (!insights.quality.hasAcceptanceCriteria) {
      recommendations.push('📋 Add acceptance criteria to improve clarity');
    }

    if (insights.quality.descriptionQuality < 50) {
      recommendations.push('📝 Improve ticket description with more details');
    }

    // Collaboration recommendations
    if (insights.collaboration.stakeholderEngagement < 30) {
      recommendations.push('👥 Low stakeholder engagement - consider reaching out');
    }

    if (insights.collaboration.handoffCount > 3) {
      recommendations.push('🔄 Multiple handoffs detected - review assignment strategy');
    }

    // Activity recommendations
    if (insights.activityPattern.activityScore < 20) {
      recommendations.push('📊 Low recent activity - check if ticket is still active');
    }

    // Cycle time recommendations
    if (insights.cycleTime.leadTime && insights.cycleTime.leadTime > 30 * 24 * 60 * 60 * 1000) {
      recommendations.push('🕐 Long lead time - consider breaking into smaller tasks');
    }

    return recommendations;
  }

  /**
   * Generate insight tags for easy categorization
   */
  static generateInsightTags(details: JiraTicketDetails, insights: TicketInsights): string[] {
    const tags: string[] = [];

    // Risk tags
    if (insights.risks.overallRisk === 'high') tags.push('high-risk');
    if (insights.risks.isBlocked) tags.push('blocked');
    if (insights.risks.overdueRisk !== 'low') tags.push('overdue');

    // Activity tags
    if (insights.activityPattern.activityScore > 70) tags.push('high-activity');
    if (insights.activityPattern.activityScore < 20) tags.push('stale');

    // Quality tags
    if (insights.quality.documentationComplete) tags.push('well-documented');
    if (insights.quality.reopenCount > 0) tags.push('reopened');
    if (insights.quality.bugFixRelated) tags.push('bug-related');

    // Collaboration tags
    if (insights.collaboration.stakeholderEngagement > 70) tags.push('collaborative');
    if (insights.collaboration.handoffCount > 2) tags.push('multiple-handoffs');

    // Complexity tags
    if (insights.risks.complexityRisk === 'high') tags.push('complex');
    if (details.storyPoints && details.storyPoints > 8) tags.push('large-story');

    // Cycle time tags
    if (insights.cycleTime.leadTime && insights.cycleTime.leadTime > 14 * 24 * 60 * 60 * 1000) {
      tags.push('long-cycle');
    }

    return tags;
  }

  /**
   * Comprehensive analysis of a JIRA ticket
   */
  static analyzeTicket(details: JiraTicketDetails): TicketInsights {
    const { transitions, cycleTime } = this.analyzeStatusTransitions(details);
    const activityPattern = this.analyzeActivityPattern(details);
    const collaboration = this.analyzeCollaboration(details);
    const quality = this.analyzeQuality(details);
    const risks = this.analyzeRisks(details);

    // Generate predictive metrics (simplified)
    const predictiveMetrics = {
      velocityImpact: risks.overallRisk === 'high' ? -0.5 : risks.overallRisk === 'medium' ? -0.2 : 0.1,
      burndownImpact: activityPattern.activityScore > 50 ? 0.2 : -0.1
    };

    const insights: TicketInsights = {
      cycleTime,
      activityPattern,
      collaboration,
      quality,
      risks,
      predictiveMetrics,
      recommendations: [],
      tags: []
    };

    // Generate recommendations and tags
    insights.recommendations = this.generateRecommendations(details, insights);
    insights.tags = this.generateInsightTags(details, insights);

    return insights;
  }
}
