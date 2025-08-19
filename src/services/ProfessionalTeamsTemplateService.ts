/**
 * Professional Teams Template System
 * Integrates table-formatted templates with TeamsService
 * Provides default templates for various report types
 */

import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export interface SprintData {
    sprintId: string;
    period: string;
    completionRate: number;
    totalIssues: number;
    completedIssues: number;
    storyPoints: number;
    commits: number;
    contributors: number;
    status: string;
    startDate: string;
    endDate: string;
    duration: string;
    reportDate: string;
    velocity?: number;
    previousSprintComparison?: {
        completionRate: number;
        velocity: number;
        trend: 'increasing' | 'decreasing' | 'stable';
    };
    topContributors?: Array<{
        name: string;
        commits: number;
        pointsCompleted: number;
        issuesResolved: number;
    }>;
    riskAssessment?: {
        level: 'low' | 'medium' | 'high' | 'critical';
        issues: string[];
        mitigation: string[];
    };
    performanceInsights?: {
        strengths: string[];
        improvements: string[];
        trends: string[];
    };
}

export interface WorkBreakdown {
    userStories: { count: number; percentage: number };
    bugFixes: { count: number; percentage: number };
    tasks: { count: number; percentage: number };
    epics: { count: number; percentage: number };
    improvements: { count: number; percentage: number };
}

export interface PriorityBreakdown {
    critical: { total: number; resolved: number };
    high: { total: number; resolved: number };
    medium: { total: number; resolved: number };
    low: { total: number; resolved: number };
    blockers: { total: number; resolved: number };
}

export interface TeamNotificationData {
    type: 'sprint-report' | 'release-notes' | 'status-update' | 'custom';
    title: string;
    subtitle?: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    sprintData?: SprintData;
    workBreakdown?: WorkBreakdown;
    priorityData?: PriorityBreakdown;
    actionItems?: Array<{
        role: string;
        action: string;
        timeline: string;
        priority: string;
    }>;
    resources?: Array<{
        type: string;
        description: string;
        access: string;
        url?: string;
    }>;
    achievements?: Array<{
        title: string;
        description: string;
        impact: string;
        metrics?: string;
    }>;
    customContent?: string;
    strategicRecommendations?: Array<{
        category: string;
        recommendation: string;
        rationale: string;
        priority: string;
    }>;
}

export class ProfessionalTeamsTemplateService {
    private readonly teamsWebhookUrl: string;

    constructor() {
        this.teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL || '';
        if (!this.teamsWebhookUrl) {
            throw new Error('Teams webhook URL is not configured');
        }
    }

    /**
     * Format date in the requested format (e.g., "Jul 11 - Jul 24, 2024")
     */
    private formatDateShort(startDate: string, endDate: string): string {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
        const startDay = start.getDate();
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
        const endDay = end.getDate();
        const endYear = end.getFullYear();
        
        // Always show full format: "Jul 11 - Jul 24, 2024"
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
    }

    /**
     * Send notification using the appropriate template based on type
     */
    public async sendNotification(data: TeamNotificationData): Promise<void> {
        if (!this.teamsWebhookUrl) {
            console.log("Teams webhook not configured, skipping notification");
            return;
        }

        try {
            let messageCard: any;

            switch (data.type) {
                case 'sprint-report':
                    messageCard = this.createSprintReportTemplate(data);
                    break;
                case 'release-notes':
                    messageCard = this.createReleaseNotesTemplate(data);
                    break;
                case 'status-update':
                    messageCard = this.createStatusUpdateTemplate(data);
                    break;
                case 'custom':
                    messageCard = this.createCustomTemplate(data);
                    break;
                default:
                    messageCard = this.createDefaultTemplate(data);
            }

            await this.sendTeamsMessage(messageCard);
            console.log(`✅ Teams notification sent successfully (${data.type})`);
        } catch (error) {
            console.error("Error sending Teams notification:", error);
            throw new Error(`Failed to send Teams notification: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    /**
     * Create comprehensive sprint report template with tables
     */
    private createSprintReportTemplate(data: TeamNotificationData): any {
        const { sprintData, workBreakdown, priorityData, actionItems, resources, achievements } = data;
        
        if (!sprintData || !workBreakdown || !priorityData) {
            throw new Error("Sprint report requires sprintData, workBreakdown, and priorityData");
        }

        return {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": `${data.title || `${sprintData.sprintId} - Sprint Report`}`,
            "themeColor": this.getThemeColor(data.priority),
            "sections": [
                {
                    "activityTitle": `🚀 ${data.title || `${sprintData.sprintId} - Sprint Report`}`,
                    "activitySubtitle": `${this.formatDateShort(sprintData.startDate, sprintData.endDate)} | ✅ ${sprintData.status} | ${sprintData.completionRate}% Complete`,
                    "activityImage": "https://img.icons8.com/fluency/96/rocket.png",
                    "text": this.generateSprintReportContent(sprintData, workBreakdown, priorityData, actionItems, resources, achievements) + (data.customContent ? `\n\n${data.customContent}` : ''),
                    "markdown": true
                }
            ],
            "potentialAction": this.generateActionButtons(resources)
        };
    }

    /**
     * Create release notes template
     */
    private createReleaseNotesTemplate(data: TeamNotificationData): any {
        return {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": `${data.title} - Release Notes`,
            "themeColor": this.getThemeColor(data.priority),
            "sections": [
                {
                    "activityTitle": `📋 ${data.title}`,
                    "activitySubtitle": data.subtitle || "Latest release information",
                    "activityImage": "https://img.icons8.com/fluency/96/documents.png",
                    "text": this.generateReleaseNotesContent(data),
                    "markdown": true
                }
            ],
            "potentialAction": this.generateActionButtons(data.resources)
        };
    }

    /**
     * Create status update template
     */
    private createStatusUpdateTemplate(data: TeamNotificationData): any {
        return {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": `${data.title} - Status Update`,
            "themeColor": this.getThemeColor(data.priority),
            "sections": [
                {
                    "activityTitle": `📊 ${data.title}`,
                    "activitySubtitle": data.subtitle || "Project status update",
                    "activityImage": "https://img.icons8.com/fluency/96/dashboard.png",
                    "text": this.generateStatusUpdateContent(data),
                    "markdown": true
                }
            ],
            "potentialAction": this.generateActionButtons(data.resources)
        };
    }

    /**
     * Create custom template for flexible content
     */
    private createCustomTemplate(data: TeamNotificationData): any {
        return {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": data.title,
            "themeColor": this.getThemeColor(data.priority),
            "sections": [
                {
                    "activityTitle": data.title,
                    "activitySubtitle": data.subtitle || "",
                    "activityImage": "https://img.icons8.com/fluency/96/info.png",
                    "text": data.customContent || "Custom notification content",
                    "markdown": true
                }
            ],
            "potentialAction": this.generateActionButtons(data.resources)
        };
    }

    /**
     * Create default template
     */
    private createDefaultTemplate(data: TeamNotificationData): any {
        return {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": data.title,
            "themeColor": this.getThemeColor(data.priority),
            "sections": [
                {
                    "activityTitle": data.title,
                    "activitySubtitle": data.subtitle || "Team notification",
                    "text": data.customContent || "No content provided",
                    "markdown": true
                }
            ]
        };
    }

    /**
     * Generate comprehensive sprint report content with enhanced sections
     */
    private generateSprintReportContent(
        sprintData: SprintData,
        workBreakdown: WorkBreakdown,
        priorityData: PriorityBreakdown,
        actionItems?: Array<{role: string; action: string; timeline: string; priority: string}>,
        resources?: Array<{type: string; description: string; access: string}>,
        achievements?: Array<{title: string; description: string; impact: string; metrics?: string}>
    ): string {
        return `
## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Completion Rate** | ${sprintData.completionRate}% (${sprintData.completedIssues}/${sprintData.totalIssues}) | ${sprintData.completionRate >= 90 ? '🌟 Exceptional' : sprintData.completionRate >= 80 ? '✅ Excellent' : sprintData.completionRate >= 70 ? '⚠️ Good' : '🔴 Needs Attention'} |
| **Story Points** | ${sprintData.storyPoints} points | 🎯 Delivered |
| **Team Size** | ${sprintData.contributors} contributors | 👥 Active |
| **Development Activity** | ${sprintData.commits} commits | ⚡ High |
| **Sprint Duration** | ${sprintData.duration} | ⏱️ On Time |
${sprintData.velocity ? `| **Sprint Velocity** | ${sprintData.velocity} points/sprint | 🚀 ${sprintData.previousSprintComparison?.trend === 'increasing' ? 'Improving' : sprintData.previousSprintComparison?.trend === 'decreasing' ? 'Declining' : 'Stable'} |` : ''}

---

${sprintData.previousSprintComparison ? this.generateSprintComparisonSection(
    sprintData.previousSprintComparison, 
    {completionRate: sprintData.completionRate, velocity: sprintData.velocity || 0}
) : ''}

## 📈 Work Breakdown Analysis

| Work Type | Count | Percentage | Focus Area |
|-----------|-------|------------|------------|
| 📚 **User Stories** | ${workBreakdown.userStories.count} items | ${workBreakdown.userStories.percentage}% | Feature Development |
| 🐛 **Bug Fixes** | ${workBreakdown.bugFixes.count} items | ${workBreakdown.bugFixes.percentage}% | Quality Maintenance |
| ⚙️ **Tasks** | ${workBreakdown.tasks.count} items | ${workBreakdown.tasks.percentage}% | Operations |
| 🎯 **Epics** | ${workBreakdown.epics.count} items | ${workBreakdown.epics.percentage}% | Strategic Initiatives |
| 🔧 **Improvements** | ${workBreakdown.improvements.count} items | ${workBreakdown.improvements.percentage}% | Process Enhancement |

---

## 🎯 Priority Resolution Status

| Priority Level | Resolved | Total | Success Rate | Status |
|----------------|----------|-------|--------------|--------|
| 🔴 **Critical** | ${priorityData.critical.resolved} | ${priorityData.critical.total} | ${priorityData.critical.total > 0 ? Math.round((priorityData.critical.resolved/priorityData.critical.total)*100) : 0}% | ${priorityData.critical.total > 0 ? (priorityData.critical.resolved === priorityData.critical.total ? '✅ Complete' : '⚠️ In Progress') : 'N/A'} |
| 🟠 **Major** | ${priorityData.high.resolved} | ${priorityData.high.total} | ${priorityData.high.total > 0 ? Math.round((priorityData.high.resolved/priorityData.high.total)*100) : 0}% | ${priorityData.high.total > 0 ? (priorityData.high.resolved === priorityData.high.total ? '✅ Complete' : '⚠️ In Progress') : 'N/A'} |
| 🟡 **Minor** | ${priorityData.medium.resolved} | ${priorityData.medium.total} | ${priorityData.medium.total > 0 ? Math.round((priorityData.medium.resolved/priorityData.medium.total)*100) : 0}% | ${priorityData.medium.total > 0 ? (priorityData.medium.resolved === priorityData.medium.total ? '✅ Complete' : '⚠️ In Progress') : 'N/A'} |
| 🟢 **Low** | ${priorityData.low.resolved} | ${priorityData.low.total} | ${priorityData.low.total > 0 ? Math.round((priorityData.low.resolved/priorityData.low.total)*100) : 0}% | ${priorityData.low.total > 0 ? (priorityData.low.resolved === priorityData.low.total ? '✅ Complete' : '⚠️ In Progress') : 'N/A'} |
| 🚫 **Blockers** | ${priorityData.blockers.resolved} | ${priorityData.blockers.total} | ${priorityData.blockers.total > 0 ? Math.round((priorityData.blockers.resolved/priorityData.blockers.total)*100) : 0}% | ${priorityData.blockers.total > 0 ? (priorityData.blockers.resolved === priorityData.blockers.total ? '✅ Complete' : '⚠️ In Progress') : 'N/A'} |

---

${sprintData.topContributors ? this.generateTopContributorsSection(sprintData.topContributors) : ''}

${achievements ? this.generateDetailedAchievementsSection(achievements) : ''}

${sprintData.performanceInsights ? this.generatePerformanceInsightsTable(sprintData.performanceInsights) : ''}

${sprintData.riskAssessment ? this.generateRiskAssessmentSection(sprintData.riskAssessment) : ''}

${actionItems ? this.generateEnhancedActionItemsTable(actionItems) : ''}

${this.generateStrategicRecommendations()}

---

**📅 Generated:** ${new Date().toLocaleString()}  
**🏆 Status:** Ready for executive presentation
        `;
    }

    /**
     * Generate release notes content
     */
    private generateReleaseNotesContent(data: TeamNotificationData): string {
        return `
## 📋 Release Information

${data.customContent || 'Release notes content not provided'}

${data.achievements ? this.generateAchievementsSection(data.achievements) : ''}

${data.actionItems ? this.generateActionItemsTable(data.actionItems) : ''}

${data.resources ? this.generateResourcesTable(data.resources) : ''}

**📅 Generated:** ${new Date().toLocaleString()}
        `;
    }

    /**
     * Generate status update content
     */
    private generateStatusUpdateContent(data: TeamNotificationData): string {
        return `
## 📊 Status Update

${data.customContent || 'Status update content not provided'}

${data.actionItems ? this.generateActionItemsTable(data.actionItems) : ''}

${data.resources ? this.generateResourcesTable(data.resources) : ''}

**📅 Updated:** ${new Date().toLocaleString()}
        `;
    }

    /**
     * Generate action items table
     */
    private generateActionItemsTable(actionItems: Array<{role: string; action: string; timeline: string}>): string {
        return `
---

## 🚀 Action Items

| Role | Action Required | Timeline |
|------|----------------|----------|
${actionItems.map(item => `| ${item.role} | ${item.action} | ${item.timeline} |`).join('\n')}
        `;
    }

    /**
     * Generate resources table
     */
    private generateResourcesTable(resources: Array<{type: string; description: string; access: string}>): string {
        return `
---

## 📄 Available Resources

| Resource Type | Description | Access |
|---------------|-------------|--------|
${resources.map(resource => `| ${resource.type} | ${resource.description} | ${resource.access} |`).join('\n')}
        `;
    }

    /**
     * Generate achievements section
     */
    private generateAchievementsSection(achievements: Array<{title: string; description: string; impact: string; metrics?: string}>): string {
        return `
---

### 🎯 **Key Achievements**

${achievements.map(achievement => `    ✅ ${achievement.title}`).join('\n')}
        `;
    }

    /**
     * Generate action buttons for message card
     */
    private generateActionButtons(resources?: Array<{type: string; description: string; access: string; url?: string}>): any[] {
        const actions: any[] = [];
        
        if (resources) {
            resources.forEach(resource => {
                if (resource.url) {
                    actions.push({
                        "@type": "OpenUri",
                        "name": `📊 ${resource.type}`,
                        "targets": [
                            {
                                "os": "default",
                                "uri": resource.url
                            }
                        ]
                    });
                }
            });
        }

        // Default action if no specific resources
        if (actions.length === 0) {
            actions.push({
                "@type": "OpenUri",
                "name": "📄 View Documentation",
                "targets": [
                    {
                        "os": "default",
                        "uri": "https://github.com/sage-soujanna-dutta/next-release-ai"
                    }
                ]
            });
        }

        return actions;
    }

    /**
     * Get theme color based on priority
     */
    private getThemeColor(priority: string): string {
        switch (priority) {
            case 'critical': return 'DC2626'; // Red
            case 'high': return 'D97706';     // Orange
            case 'normal': return '2563EB';   // Blue
            case 'low': return '059669';      // Green
            default: return '2563EB';         // Default blue
        }
    }

    /**
     * Send message to Teams webhook
     */
    private async sendTeamsMessage(messageCard: any): Promise<void> {
        const response = await axios.post(this.teamsWebhookUrl, messageCard, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw new Error(`Teams API returned status ${response.status}`);
        }
    }

    /**
     * Quick helper method for sprint reports (backwards compatibility)
     */
    public async sendSprintReport(
        sprintData: SprintData,
        workBreakdown: WorkBreakdown,
        priorityData: PriorityBreakdown,
        options?: {
            actionItems?: Array<{role: string; action: string; timeline: string}>;
            resources?: Array<{type: string; description: string; access: string; url?: string}>;
            achievements?: string[];
            priority?: 'low' | 'normal' | 'high' | 'critical';
            customContent?: string;
        }
    ): Promise<void> {
        // Transform actionItems to include priority field
        const transformedActionItems = options?.actionItems?.map(item => ({
            ...item,
            priority: 'normal' as string
        }));

        // Transform achievements from string[] to proper objects
        const transformedAchievements = options?.achievements?.map(achievement => ({
            title: achievement,
            description: achievement,
            impact: 'Positive' as string,
            metrics: undefined as string | undefined
        }));

        const data: TeamNotificationData = {
            type: 'sprint-report',
            title: `${sprintData.sprintId} - Sprint Report`,
            subtitle: `${this.formatDateShort(sprintData.startDate, sprintData.endDate)} | ${sprintData.status} | ${sprintData.completionRate}% Complete`,
            priority: options?.priority || 'normal',
            sprintData,
            workBreakdown,
            priorityData,
            actionItems: transformedActionItems,
            resources: options?.resources,
            achievements: transformedAchievements
        };

        await this.sendNotification(data);
    }

    /**
     * Generate sprint comparison section
     */
    private generateSprintComparisonSection(
        comparison: {completionRate: number; velocity: number; trend: string}, 
        currentSprintData: {completionRate: number; velocity: number}
    ): string {
        const trendIcon = comparison.trend === 'increasing' ? '📈' : comparison.trend === 'decreasing' ? '📉' : '➡️';
        const completionChange = currentSprintData.completionRate - comparison.completionRate;
        const velocityChange = currentSprintData.velocity - comparison.velocity;
        
        return `
## 📊 Sprint Comparison vs Previous Sprint

| Metric | Current Sprint | Previous Sprint | Change | Trend |
|--------|----------------|-----------------|--------|-------|
| **Completion Rate** | ${currentSprintData.completionRate}% | ${comparison.completionRate}% | ${completionChange > 0 ? '+' : ''}${completionChange}% | ${trendIcon} ${comparison.trend} |
| **Velocity** | ${currentSprintData.velocity} points | ${comparison.velocity} points | ${velocityChange > 0 ? '+' : ''}${velocityChange} pts | ${trendIcon} ${comparison.trend} |

---
        `;
    }

    /**
     * Generate top contributors section with improved spacing
     */
    private generateTopContributorsSection(contributors: Array<{name: string; commits: number; pointsCompleted: number; issuesResolved: number}>): string {
        return `

## 🏆 Top Contributors

| Contributor | Commits | Points Completed | Issues Resolved | Impact Level |
|-------------|---------|------------------|-----------------|--------------|
${contributors.slice(0, 5).map(contributor => 
    `| **${contributor.name}** | ${contributor.commits} | ${contributor.pointsCompleted} pts | ${contributor.issuesResolved} | 🌟 **HIGH** |`
).join('\n')}

---

        `;
    }

    /**
     * Generate detailed achievements section with improved spacing
     */
    private generateDetailedAchievementsSection(achievements: Array<{title: string; description: string; impact: string; metrics?: string}>): string {
        return `

## 🎉 Key Achievements

| Achievement | Description | Impact Level | Metrics |
|-------------|-------------|--------------|---------|
${achievements.map(achievement => 
    `| **🏆 ${achievement.title}** | ${achievement.description} | **${achievement.impact.toUpperCase()}** | ${achievement.metrics || 'N/A'} |`
).join('\n')}

---

        `;
    }

    /**
     * Generate performance insights table with improved structure
     */
    private generatePerformanceInsightsTable(insights: {strengths: string[]; improvements: string[]; trends: string[]}): string {
        return `

## 📈 Key Insights & Performance Analysis

### 🎯 Team Strengths

| Strength | Description |
|----------|-------------|
${insights.strengths.map((strength, index) => `| ${index + 1} | ${strength} |`).join('\n')}

### 🔧 Areas for Improvement

| Priority | Improvement Area |
|----------|------------------|
${insights.improvements.map((improvement, index) => `| ${index + 1} | ${improvement} |`).join('\n')}

### 📊 Performance Trends

| Trend | Observation |
|-------|-------------|
${insights.trends.map((trend, index) => `| ${index + 1} | ${trend} |`).join('\n')}

---

        `;
    }

    /**
     * Generate risk assessment section with structured table format
     */
    private generateRiskAssessmentSection(risk: {level: string; issues: string[]; mitigation: string[]}): string {
        const riskIcon = risk.level === 'critical' ? '🔴' : risk.level === 'high' ? '🟠' : risk.level === 'medium' ? '🟡' : '🟢';
        const riskColor = risk.level === 'critical' ? '**CRITICAL**' : risk.level === 'high' ? '**HIGH**' : risk.level === 'medium' ? '**MEDIUM**' : '**LOW**';
        
        return `

## ⚠️ Risk Assessment

| Assessment Category | Details |
|---------------------|---------|
| **Risk Level** | ${riskIcon} ${riskColor} |
| **Issues Identified** | ${risk.issues.length} items requiring attention |
| **Mitigation Actions** | ${risk.mitigation.length} strategies implemented |

### 🚨 Identified Risk Factors

| Priority | Risk Factor |
|----------|-------------|
${risk.issues.map((issue, index) => `| ${index + 1} | ${issue} |`).join('\n')}

### 🛡️ Mitigation Strategy

| Action | Mitigation Approach |
|--------|-------------------|
${risk.mitigation.map((strategy, index) => `| ${index + 1} | ${strategy} |`).join('\n')}

---

        `;
    }

    /**
     * Generate enhanced action items table with improved spacing
     */
    private generateEnhancedActionItemsTable(actionItems: Array<{role: string; action: string; timeline: string; priority: string}>): string {
        return `

## 🚀 Action Items

| Role | Action Required | Timeline | Priority Level |
|------|----------------|----------|----------------|
${actionItems.map(item => {
    const priorityIcon = item.priority === 'critical' ? '🔴' : item.priority === 'high' ? '🟠' : item.priority === 'medium' ? '🟡' : '🟢';
    return `| **${item.role}** | ${item.action} | ${item.timeline} | ${priorityIcon} ${item.priority.toUpperCase()} |`;
}).join('\n')}

---

        `;
    }

    /**
     * Generate strategic recommendations
     */
    private generateStrategicRecommendations(): string {
        return `
## 🎯 Strategic Recommendations

| Category | Recommendation | Rationale | Priority |
|----------|---------------|-----------|----------|
| **Process** | Implement automated testing pipeline | Reduce manual testing overhead and improve quality | 🔴 High |
| **Team** | Cross-train team members on critical components | Reduce bus factor and improve knowledge sharing | 🟠 Medium |
| **Technical** | Refactor legacy components identified in this sprint | Improve maintainability and reduce technical debt | 🟡 Medium |
| **Performance** | Monitor and optimize slow queries identified | Improve user experience and system performance | 🟠 Medium |

---
        `;
    }
}

// Export the service for use in other modules
export default ProfessionalTeamsTemplateService;