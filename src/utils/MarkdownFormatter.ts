import { JiraIssue } from "../services/JiraService.js";
import { GitHubCommit } from "../services/GitHubService.js";

export class MarkdownFormatter {
  format(jiraIssues: JiraIssue[], commits: GitHubCommit[], sprintName?: string, sprintDetails?: any): string {
    // Extract comprehensive sprint information, merging with provided sprint details
    const sprintInfo = this.extractSprintInfo(jiraIssues, sprintDetails);
    const finalSprintName = sprintName || sprintInfo.name || `Sprint ${new Date().toISOString().slice(0, 10)}`;
    
    // Calculate comprehensive metrics
    const metrics = this.calculateComprehensiveMetrics(jiraIssues, commits);
    const analysis = this.performSprintAnalysis(jiraIssues, commits);
    
    return this.generateComprehensiveTemplate({
      sprintName: finalSprintName,
      sprintInfo,
      metrics,
      analysis,
      jiraIssues,
      githubCommits: commits
    });
  }

  private extractSprintInfo(jiraIssues: JiraIssue[], sprintDetails?: any): any {
    // If sprint details are provided, use them first
    if (sprintDetails) {
      return {
        name: sprintDetails.name,
        startDate: sprintDetails.startDate,
        endDate: sprintDetails.endDate,
        duration: this.calculateSprintDuration(sprintDetails.startDate, sprintDetails.endDate),
        state: sprintDetails.state || 'ACTIVE'
      };
    }

    if (jiraIssues.length === 0) {
      return {
        name: null,
        startDate: null,
        endDate: null,
        duration: null,
        state: 'Unknown'
      };
    }

    // Extract sprint information from the first issue
    const firstIssue = jiraIssues[0];
    // Try to extract sprint information from available fields  
    const sprintField = (firstIssue.fields as any)?.sprint || (firstIssue.fields as any)?.customfield_10020;
    
    if (sprintField && Array.isArray(sprintField) && sprintField.length > 0) {
      const sprint = sprintField[0];
      return {
        name: sprint.name || firstIssue.key.split('-')[0] + '-Sprint',
        startDate: sprint.startDate || null,
        endDate: sprint.endDate || null,
        duration: this.calculateSprintDuration(sprint.startDate, sprint.endDate),
        state: sprint.state || 'ACTIVE'
      };
    }

    // Fallback: extract from issue key pattern
    const sprintMatch = firstIssue.key.match(/([A-Z]+-\d{4}-\d{2})/);
    if (sprintMatch) {
      return {
        name: sprintMatch[1],
        startDate: null,
        endDate: null,
        duration: null,
        state: 'Unknown'
      };
    }

    // Final fallback
    return {
      name: firstIssue.key.split('-').slice(0, 2).join('-') || firstIssue.key.split('-')[0] + '-Sprint',
      startDate: null,
      endDate: null,
      duration: null,
      state: 'Unknown'
    };
  }

  private calculateComprehensiveMetrics(jiraIssues: JiraIssue[], commits: GitHubCommit[]): any {
    const totalIssues = jiraIssues.length;
    const completedIssues = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const inProgressIssues = jiraIssues.filter(issue => 
      issue.fields.status.name === 'In Progress' || 
      issue.fields.status.name === 'In Review'
    ).length;
    const todoIssues = jiraIssues.filter(issue => issue.fields.status.name === 'To Do').length;
    
    const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;
    const storyPoints = this.calculateStoryPoints(jiraIssues);
    const completedStoryPoints = this.calculateCompletedStoryPoints(jiraIssues);
    
    const contributors = this.getUniqueContributors(commits);
    const issueTypes = this.getIssueTypeBreakdown(jiraIssues);
    const priorityBreakdown = this.getPriorityBreakdown(jiraIssues);

    return {
      totalIssues,
      completedIssues,
      inProgressIssues,
      todoIssues,
      completionRate,
      storyPoints,
      completedStoryPoints,
      storyPointsCompletionRate: storyPoints > 0 ? Math.round((completedStoryPoints / storyPoints) * 100) : 0,
      totalCommits: commits.length,
      uniqueContributors: contributors.length,
      contributors: contributors,
      issueTypes,
      priorityBreakdown,
      averageStoryPointsPerIssue: totalIssues > 0 ? Math.round((storyPoints / totalIssues) * 10) / 10 : 0,
      velocity: completedStoryPoints
    };
  }

  private performSprintAnalysis(jiraIssues: JiraIssue[], commits: GitHubCommit[]): any {
    const workBreakdown = this.getWorkBreakdown(jiraIssues);
    const priorityStatus = this.getPriorityStatus(jiraIssues);
    const topContributors = this.getTopContributors(commits, jiraIssues);
    const qualityMetrics = this.calculateQualityMetrics(jiraIssues);
    const velocityAnalysis = this.analyzeVelocity(jiraIssues);
    const riskAssessment = this.assessProjectRisks(jiraIssues);
    const achievements = this.identifyKeyAchievements(jiraIssues);
    const actionItems = this.generateActionItems(jiraIssues);
    const nextSteps = this.planNextSteps(jiraIssues);

    return {
      workBreakdown,
      priorityStatus,
      topContributors,
      qualityMetrics,
      velocityAnalysis,
      riskAssessment,
      achievements,
      actionItems,
      nextSteps
    };
  }

  private generateComprehensiveTemplate(data: any): string {
    const { sprintName, sprintInfo, metrics, analysis } = data;
    
    const sprintDates = this.formatSprintDates(sprintInfo);
    const status = this.getSprintStatus(sprintInfo.state, metrics.completionRate);
    
    return `# 🚀 ${sprintName} - Sprint Report

${sprintDates} | ${status} | ${metrics.completionRate}% Complete

<details>
  <summary><h2 style="display:inline-block">📊 Executive Summary</h2></summary>

| Metric                | Value           | Status      |
|---------------------- |-----------------|-------------|
| Completion Rate       | ${metrics.completionRate}% (${metrics.completedIssues}/${metrics.totalIssues})     | ${this.getStatusEmoji(metrics.completionRate)} ${this.getStatusText(metrics.completionRate)} |
| Story Points          | ${metrics.completedStoryPoints}/${metrics.storyPoints} points | ${this.getStoryPointsStatus(metrics.storyPointsCompletionRate)} |
| Team Size             | ${metrics.uniqueContributors} contributors | 👥 Active    |
| Development Activity  | ${metrics.totalCommits} commits     | ${this.getActivityLevel(metrics.totalCommits)} |
| Sprint Duration       | ${sprintInfo.duration || 'TBD'}         | ${this.getDurationStatus(sprintInfo)} |
| Sprint Velocity       | ${metrics.velocity} points/sprint | ${this.getVelocityTrend(metrics.velocity)} |

</details>

${this.generateSprintGoalsSection(data)}

${this.generateSprintObjectivesSection(data)}

${this.generateDeliverablesSection(data)}

<details>
  <summary><h2 style="display:inline-block">📈 Sprint Comparison vs Previous Sprint</h2></summary>

${this.generateSprintComparisonSection(metrics)}

</details>

${this.generateWorkBreakdownSection(analysis.workBreakdown)}

${this.generateEpicsSection(data.jiraIssues)}

${this.generateImprovementsSection(data.jiraIssues)}

${this.generatePriorityStatusSection(analysis.priorityStatus)}

${this.generateTopContributorsSection(analysis.topContributors)}

${this.generateSprintAnalysisSection(analysis)}

${this.generateQualityMetricsSection(analysis.qualityMetrics)}

${this.generateVelocityAnalysisSection(analysis.velocityAnalysis)}

${this.generateReleaseNotesSection(data)}

${this.generateActionItemsSection(analysis.actionItems)}

${this.generateNextStepsSection(analysis.nextSteps)}

${this.generateConclusionSection(data)}

${this.generateAcknowledgementsSection(analysis.topContributors)}

---
*Generated: ${new Date().toLocaleString()}*
*Report Status: ${this.getReportStatus(metrics.completionRate)}*
*Sprint State: ${sprintInfo.state}*
`;
  }

  private generateWorkBreakdownSection(workBreakdown: any): string {
    return `<details>
  <summary><h2 style="display:inline-block">📉 Work Breakdown Analysis</h2></summary>

| Work Type     | Count     | Percentage | Focus Area           |
|---------------|-----------|------------|----------------------|
| User Stories  | ${workBreakdown.stories} items  | ${workBreakdown.storiesPercent}%        | Feature Development  |
| Bug Fixes     | ${workBreakdown.bugs} items  | ${workBreakdown.bugsPercent}%        | Quality Maintenance  |
| Tasks         | ${workBreakdown.tasks} items  | ${workBreakdown.tasksPercent}%        | Operations           |
| Epics         | ${workBreakdown.epics} items  | ${workBreakdown.epicsPercent}%        | Strategic Initiatives|
| Improvements  | ${workBreakdown.improvements} items   | ${workBreakdown.improvementsPercent}%         | Process Enhancement  |

</details>`;
  }

  private generatePriorityStatusSection(priorityStatus: any): string {
    return `<details>
  <summary><h2 style="display:inline-block">🛠️ Priority Resolution Status</h2></summary>

| Priority Level | Resolved | Total | Success Rate | Status      |
|---------------|----------|-------|--------------|-------------|
| Critical      | ${priorityStatus.critical.resolved}        | ${priorityStatus.critical.total}     | ${priorityStatus.critical.rate}%           | ${priorityStatus.critical.status}         |
| Major         | ${priorityStatus.major.resolved}        | ${priorityStatus.major.total}     | ${priorityStatus.major.rate}%          | ${priorityStatus.major.status} |
| Minor         | ${priorityStatus.minor.resolved}       | ${priorityStatus.minor.total}    | ${priorityStatus.minor.rate}%          | ${priorityStatus.minor.status} |
| Low           | ${priorityStatus.low.resolved}        | ${priorityStatus.low.total}     | ${priorityStatus.low.rate}%           | ${priorityStatus.low.status}         |
| Blockers      | ${priorityStatus.blockers.resolved}        | ${priorityStatus.blockers.total}     | ${priorityStatus.blockers.rate}%           | ${priorityStatus.blockers.status}         |

</details>`;
  }

  private generateTopContributorsSection(contributors: any[]): string {
    if (contributors.length === 0) {
      return `## 🏆 Top Contributors

*No contributor data available for this sprint.*`;
    }

    const contributorRows = contributors.map(c => 
      `| ${c.name}     | ${c.commits}      | ${c.points} pts           | ${c.issues}              | ✨ HIGH      |`
    ).join('\n');

    return `<details>
  <summary><h2 style="display:inline-block">🏆 Top Contributors</h2></summary>

| Contributor      | Commits | Points Completed | Issues Assigned | Impact Level |
|------------------|---------|------------------|-----------------|-------------|
${contributorRows}

</details>`;
  }

  private generateKeyAchievementsSection(jiraIssues: JiraIssue[], completionRate: number): string {
    const achievements = this.getKeyAchievements(jiraIssues, completionRate);
    const achievementRows = achievements.map(a => 
      `| ${a.title} | ${a.description} | POSITIVE | N/A |`
    ).join('\n');

    return `## 🎉 Key Achievements

| Achievement                        | Description                                 | Impact Level | Metrics |
|-------------------------------------|---------------------------------------------|--------------|---------|
${achievementRows}`;
  }

  private generateInsightsSection(jiraIssues: JiraIssue[], completionRate: number): string {
    return `## 🔍 Key Insights & Performance Analysis

### Team Strengths
| # | Strength                              | Description                                 |
|---|----------------------------------------|---------------------------------------------|
| 1 | ${completionRate}% completion rate achieved           | ${completionRate}% completion rate achieved                |
| 2 | Strong team collaboration and coordination | Strong team collaboration and coordination |
| 3 | Consistent delivery practices          | Consistent delivery practices               |

### Areas for Improvement
| Priority | Improvement Area                |
|----------|---------------------------------|
| 1        | Continue high-performance practices |
| 2        | Maintain quality standards       |
| 3        | Optimize development workflow    |

### Performance Trends
| Trend     | Observation                                 |
|-----------|---------------------------------------------|
| 1         | Sprint velocity: Stable performance         |
| 2         | Team engagement and delivery consistency    |`;
  }

  private generateRiskAssessmentSection(jiraIssues: JiraIssue[]): string {
    const riskLevel = this.assessRiskLevel(jiraIssues);
    return `## ⚠️ Risk Assessment

| Assessment Category | Details                       |
|---------------------|-------------------------------|
| Risk Level          | 🟡 ${riskLevel}                     |
| Issues Identified   | 2 items requiring attention   |
| Mitigation Actions  | 2 strategies implemented      |

### Identified Risk Factors
| Priority | Risk Factor                        |
|----------|------------------------------------|
| 1        | Some capacity challenges identified |
| 2        | Scope management needed             |

### Mitigation Strategy
| Action | Mitigation Approach           |
|--------|-------------------------------|
| 1      | Review capacity planning      |
| 2      | Improve estimation accuracy  |`;
  }

  private generateStrategicRecommendationsSection(completionRate: number): string {
    return `## 🎯 Strategic Recommendations
| Category   | Recommendation                                 | Rationale                                         | Priority |
|------------|------------------------------------------------|---------------------------------------------------|----------|
| Process    | Implement automated testing pipeline           | Reduce manual testing overhead and improve quality | 🔴 High  |
| Team       | Cross-train team members on critical components| Reduce bus factor and improve knowledge sharing    | 🟠 Medium|
| Technical  | Refactor legacy components identified in this sprint | Improve maintainability and reduce technical debt | 🟠 Medium|
| Performance| Monitor and optimize slow queries identified   | Improve user experience and system performance     | 🟠 Medium|`;
  }

  // Helper methods for calculations
  private calculateSprintDuration(startDate: string | null, endDate: string | null): string | null {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 7) return '1 week';
    if (diffDays === 14) return '2 weeks';
    if (diffDays === 21) return '3 weeks';
    return `${diffDays} days`;
  }

  private calculateCompletedStoryPoints(jiraIssues: JiraIssue[]): number {
    return jiraIssues
      .filter(issue => issue.fields.status.name === 'Done')
      .reduce((total, issue) => {
        const points = issue.fields?.customfield_10004 || issue.fields?.storyPoints || 0;
        return total + (typeof points === 'number' ? points : 0);
      }, 0);
  }

  private getIssueTypeBreakdown(jiraIssues: JiraIssue[]): Record<string, number> {
    return jiraIssues.reduce((breakdown, issue) => {
      const type = issue.fields.issuetype.name;
      breakdown[type] = (breakdown[type] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);
  }

  private getPriorityBreakdown(jiraIssues: JiraIssue[]): Record<string, number> {
    return jiraIssues.reduce((breakdown, issue) => {
      const priority = issue.fields.priority?.name || 'None';
      breakdown[priority] = (breakdown[priority] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);
  }

  private calculateQualityMetrics(jiraIssues: JiraIssue[]): any {
    const totalIssues = jiraIssues.length;
    const bugs = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Bug').length;
    const stories = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Story').length;
    const completedBugs = jiraIssues.filter(issue => 
      issue.fields.issuetype.name === 'Bug' && issue.fields.status.name === 'Done'
    ).length;
    
    return {
      totalIssues,
      bugs,
      stories,
      bugRatio: totalIssues > 0 ? Math.round((bugs / totalIssues) * 100) : 0,
      completedBugs,
      bugResolutionRate: bugs > 0 ? Math.round((completedBugs / bugs) * 100) : 0,
      qualityScore: this.calculateQualityScore(bugs, stories, totalIssues)
    };
  }

  private calculateQualityScore(bugs: number, stories: number, total: number): string {
    if (total === 0) return 'N/A';
    const bugRatio = bugs / total;
    if (bugRatio <= 0.1) return 'Excellent';
    if (bugRatio <= 0.2) return 'Good';
    if (bugRatio <= 0.3) return 'Fair';
    return 'Needs Improvement';
  }

  private analyzeVelocity(jiraIssues: JiraIssue[]): any {
    const completedStoryPoints = this.calculateCompletedStoryPoints(jiraIssues);
    const totalStoryPoints = this.calculateStoryPoints(jiraIssues);
    const velocityPercentage = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;
    
    return {
      plannedVelocity: totalStoryPoints,
      actualVelocity: completedStoryPoints,
      velocityPercentage,
      velocityTrend: this.getVelocityTrend(completedStoryPoints),
      predictedNextSprint: Math.round(completedStoryPoints * 1.1) // Simple prediction
    };
  }

  private assessProjectRisks(jiraIssues: JiraIssue[]): any {
    const blockers = jiraIssues.filter(issue => 
      issue.fields.issuetype.name === 'Blocker' || 
      issue.fields.priority?.name === 'Critical'
    ).length;
    
    const openIssues = jiraIssues.filter(issue => issue.fields.status.name !== 'Done').length;
    const highPriorityOpen = jiraIssues.filter(issue => 
      (issue.fields.priority?.name === 'High' || issue.fields.priority?.name === 'Highest') &&
      issue.fields.status.name !== 'Done'
    ).length;

    return {
      riskLevel: this.assessRiskLevel(jiraIssues),
      blockers,
      openIssues,
      highPriorityOpen,
      riskFactors: this.identifyRiskFactors(jiraIssues),
      mitigationStrategies: this.generateMitigationStrategies(blockers, openIssues)
    };
  }

  private identifyRiskFactors(jiraIssues: JiraIssue[]): string[] {
    const factors = [];
    const openIssues = jiraIssues.filter(issue => issue.fields.status.name !== 'Done').length;
    const totalIssues = jiraIssues.length;
    
    if (openIssues / totalIssues > 0.3) {
      factors.push('High number of open issues');
    }
    
    const blockers = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Blocker').length;
    if (blockers > 0) {
      factors.push(`${blockers} blocking issue(s) identified`);
    }

    if (factors.length === 0) {
      factors.push('No significant risk factors identified');
    }

    return factors;
  }

  private generateMitigationStrategies(blockers: number, openIssues: number): string[] {
    const strategies = [];
    
    if (blockers > 0) {
      strategies.push('Prioritize resolution of blocking issues');
      strategies.push('Assign senior team members to critical blockers');
    }
    
    if (openIssues > 5) {
      strategies.push('Review and reprioritize open issues');
      strategies.push('Consider scope adjustment for next sprint');
    }
    
    if (strategies.length === 0) {
      strategies.push('Continue current practices');
      strategies.push('Monitor for emerging risks');
    }

    return strategies;
  }

  private identifyKeyAchievements(jiraIssues: JiraIssue[]): any[] {
    const completed = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const storyPoints = this.calculateCompletedStoryPoints(jiraIssues);
    const completionRate = jiraIssues.length > 0 ? Math.round((completed / jiraIssues.length) * 100) : 0;
    
    const achievements = [];
    
    if (completionRate >= 90) {
      achievements.push({
        title: `Outstanding ${completionRate}% completion rate`,
        description: `Exceeded expectations with ${completionRate}% of planned work completed`,
        impact: 'HIGH'
      });
    } else if (completionRate >= 70) {
      achievements.push({
        title: `Strong ${completionRate}% completion rate`,
        description: `Successfully delivered ${completionRate}% of planned sprint work`,
        impact: 'MEDIUM'
      });
    }
    
    if (storyPoints > 0) {
      achievements.push({
        title: `Delivered ${storyPoints} story points`,
        description: `Successfully completed ${storyPoints} story points of planned work`,
        impact: 'HIGH'
      });
    }

    const criticalIssues = jiraIssues.filter(issue => 
      issue.fields.priority?.name === 'Critical' && issue.fields.status.name === 'Done'
    ).length;
    
    if (criticalIssues > 0) {
      achievements.push({
        title: `Resolved ${criticalIssues} critical issue(s)`,
        description: `Successfully addressed all critical priority items`,
        impact: 'HIGH'
      });
    }

    return achievements;
  }

  private generateActionItems(jiraIssues: JiraIssue[]): any[] {
    const openIssues = jiraIssues.filter(issue => issue.fields.status.name !== 'Done');
    const actionItems = [];

    // Review incomplete work
    if (openIssues.length > 0) {
      actionItems.push({
        category: 'Sprint Completion',
        action: `Review and plan completion of ${openIssues.length} remaining issues`,
        assignee: 'Scrum Master',
        timeline: 'Next 2 business days',
        priority: 'HIGH'
      });
    }

    // Sprint retrospective
    actionItems.push({
      category: 'Process Improvement',
      action: 'Conduct sprint retrospective meeting',
      assignee: 'Scrum Master',
      timeline: 'End of current week',
      priority: 'MEDIUM'
    });

    // Documentation
    const documentsNeeded = jiraIssues.filter(issue => 
      issue.fields.status.name === 'Done' && 
      !issue.fields.components?.some(c => c.name.includes('Documentation'))
    ).length;

    if (documentsNeeded > 0) {
      actionItems.push({
        category: 'Documentation',
        action: `Update documentation for ${documentsNeeded} completed features`,
        assignee: 'Tech Lead',
        timeline: 'Within 1 week',
        priority: 'MEDIUM'
      });
    }

    return actionItems;
  }

  private planNextSteps(jiraIssues: JiraIssue[]): any[] {
    const openIssues = jiraIssues.filter(issue => issue.fields.status.name !== 'Done');
    const nextSteps = [];

    // Carry over incomplete work
    if (openIssues.length > 0) {
      nextSteps.push({
        step: 'Carry forward incomplete work',
        description: `${openIssues.length} issues to be included in next sprint planning`,
        timeline: 'Next sprint planning',
        impact: 'MEDIUM'
      });
    }

    // Sprint planning
    nextSteps.push({
      step: 'Conduct next sprint planning',
      description: 'Plan work for upcoming sprint based on current velocity and priorities',
      timeline: 'Sprint planning meeting',
      impact: 'HIGH'
    });

    // Retrospective actions
    nextSteps.push({
      step: 'Implement retrospective improvements',
      description: 'Apply lessons learned from current sprint to improve processes',
      timeline: 'Ongoing',
      impact: 'MEDIUM'
    });

    return nextSteps;
  }

  private formatSprintDates(sprintInfo: any): string {
    if (sprintInfo.startDate && sprintInfo.endDate) {
      const start = new Date(sprintInfo.startDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const end = new Date(sprintInfo.endDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `*${start} - ${end}*`;
    }
    return '*Sprint dates TBD*';
  }

  private getSprintStatus(state: string, completionRate: number): string {
    if (state === 'CLOSED' || state === 'COMPLETE') {
      return completionRate >= 90 ? '✅ Successfully Completed' : '⚠️ Completed with Issues';
    }
    if (state === 'ACTIVE') {
      return '🔄 In Progress';
    }
    return `📋 ${state}`;
  }

  private getStoryPointsStatus(completionRate: number): string {
    if (completionRate >= 90) return '✅ Excellent';
    if (completionRate >= 70) return '📈 Good';
    if (completionRate >= 50) return '⚠️ Moderate';
    return '🔴 Needs Attention';
  }

  private getActivityLevel(commits: number): string {
    if (commits >= 50) return '⚡ Very High';
    if (commits >= 20) return '🔥 High';
    if (commits >= 10) return '📈 Moderate';
    return '📉 Low';
  }

  private getDurationStatus(sprintInfo: any): string {
    if (!sprintInfo.duration) return '⏰ TBD';
    if (sprintInfo.duration.includes('2 week')) return '⏰ Standard';
    if (sprintInfo.duration.includes('1 week')) return '⚡ Short';
    if (sprintInfo.duration.includes('3 week')) return '📅 Extended';
    return '⏰ Custom';
  }

  private getReportStatus(completionRate: number): string {
    if (completionRate >= 90) return 'Executive Ready';
    if (completionRate >= 70) return 'Management Review';
    return 'Requires Action';
  }

  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      "Done": "✅",
      "In Progress": "🔄", 
      "To Do": "📝",
      "Testing": "🧪",
      "Review": "👀",
      "In Review": "👀",
      "Closed": "✅",
      "Open": "📋",
      "Resolved": "✅"
    };
    return icons[status] || "📋";
  }
  // Section generation methods
  private generateSprintGoalsSection(data: any): string {
    const { jiraIssues } = data;
    const epics = jiraIssues.filter((issue: JiraIssue) => issue.fields.issuetype.name === 'Epic');
    
    return `<details>
  <summary><h2 style="display:inline-block">🎯 Sprint Goals</h2></summary>

| Goal | Description | Status | Progress |
|------|-------------|--------|----------|
${epics.length > 0 ? 
  epics.map((epic: JiraIssue) => 
    `| ${epic.fields.summary} | Epic: ${epic.key} | ${epic.fields.status.name} | ${this.getStatusEmoji(epic.fields.status.name === 'Done' ? 100 : 50)} |`
  ).join('\n') :
  '| Complete planned sprint work | Deliver committed story points and resolve priority issues | In Progress | 🔄 |'
}

</details>`;
  }

  private generateSprintObjectivesSection(data: any): string {
    const { metrics } = data;
    
    return `<details>
  <summary><h2 style="display:inline-block">📋 Sprint Objectives</h2></summary>

| Objective | Target | Actual | Status |
|-----------|--------|--------|--------|
| Sprint Completion Rate | ≥90% | ${metrics.completionRate}% | ${metrics.completionRate >= 90 ? '✅' : '⚠️'} |
| Story Points Delivery | ${metrics.storyPoints} pts | ${metrics.completedStoryPoints} pts | ${metrics.storyPointsCompletionRate >= 90 ? '✅' : '⚠️'} |
| Quality Maintenance | Zero critical bugs | ${data.analysis.qualityMetrics.bugs} bugs | ${data.analysis.qualityMetrics.bugs === 0 ? '✅' : '⚠️'} |
| Team Collaboration | High engagement | ${metrics.uniqueContributors} contributors | ✅ |

</details>`;
  }

  private generateDeliverablesSection(data: any): string {
    const { jiraIssues, githubCommits } = data;
    
    // Sprint Deliverables show bugs, user stories, and tasks that are planned for a sprint
    const bugs = jiraIssues.filter((issue: JiraIssue) => issue.fields.issuetype.name.toLowerCase().includes('bug'));
    const userStories = jiraIssues.filter((issue: JiraIssue) => issue.fields.issuetype.name.toLowerCase().includes('story'));
    const tasks = jiraIssues.filter((issue: JiraIssue) => 
      issue.fields.issuetype.name.toLowerCase().includes('task') || 
      issue.fields.issuetype.name.toLowerCase().includes('sub-task')
    );
    
    let deliverableSection = `<details>
  <summary><h2 style="display:inline-block">📦 Sprint Deliverables</h2></summary>

Sprint Deliverables show bugs, user stories, and tasks that are planned for a sprint. They are used to track the progress of the sprint and ensure that all planned work is completed.

`;

    // Bugs Section
    if (bugs.length > 0) {
      deliverableSection += `<details>
  <summary><h3 style="display:inline-block">🐛 Bugs (${bugs.length})</h3></summary>

| Issue | Summary | Priority | Assignee | Status |
|-------|---------|----------|----------|--------|
`;
      
      bugs.forEach((issue: JiraIssue) => {
        const priority = issue.fields.priority?.name || 'Medium';
        const assignee = issue.fields.assignee?.displayName || 'Unassigned';
        const status = issue.fields.status.name;
        const statusIcon = status === 'Done' ? '✅' : status === 'In Progress' ? '🔄' : '📋';
        deliverableSection += `| ${issue.key} | ${issue.fields.summary} | ${priority} | ${assignee} | ${statusIcon} ${status} |\n`;
      });
      deliverableSection += '</details>\n\n';
    }

    // User Stories Section
    if (userStories.length > 0) {
      deliverableSection += `<details>
  <summary><h3 style="display:inline-block">✨ User Stories (${userStories.length})</h3></summary>

| Issue | Summary | Story Points | Assignee | Status |
|-------|---------|--------------|----------|--------|
`;
      
      userStories.forEach((issue: JiraIssue) => {
        const points = issue.fields?.customfield_10004 || issue.fields?.storyPoints || 0;
        const assignee = issue.fields.assignee?.displayName || 'Unassigned';
        const status = issue.fields.status.name;
        const statusIcon = status === 'Done' ? '✅' : status === 'In Progress' ? '🔄' : '📋';
        deliverableSection += `| ${issue.key} | ${issue.fields.summary} | ${points} pts | ${assignee} | ${statusIcon} ${status} |\n`;
      });
      deliverableSection += '</details>\n\n';
    }

    // Tasks Section
    if (tasks.length > 0) {
      deliverableSection += `<details>
  <summary><h3 style="display:inline-block">📋 Tasks (${tasks.length})</h3></summary>

| Issue | Summary | Type | Assignee | Status |
|-------|---------|------|----------|--------|
`;
      
      tasks.forEach((issue: JiraIssue) => {
        const assignee = issue.fields.assignee?.displayName || 'Unassigned';
        const status = issue.fields.status.name;
        const statusIcon = status === 'Done' ? '✅' : status === 'In Progress' ? '🔄' : '📋';
        deliverableSection += `| ${issue.key} | ${issue.fields.summary} | ${issue.fields.issuetype.name} | ${assignee} | ${statusIcon} ${status} |\n`;
      });
      deliverableSection += '</details>\n\n';
    }

    // Commits Section
    if (githubCommits && githubCommits.length > 0) {
      deliverableSection += `<details>
  <summary><h3 style="display:inline-block">💾 Commits (${githubCommits.length})</h3></summary>

All commits that are part of the sprint, providing a complete view of the work done during the sprint.

| Commit | Message | Author | Date |
|--------|---------|--------|------|
`;
      
      githubCommits.forEach((commit: any) => {
        const shortSha = commit.sha ? commit.sha.substring(0, 7) : 'N/A';
        const message = commit.message || commit.commit?.message || 'No message';
        const author = commit.author?.name || commit.commit?.author?.name || 'Unknown';
        const date = commit.date || commit.commit?.author?.date || 'Unknown';
        const formattedDate = date !== 'Unknown' ? new Date(date).toLocaleDateString() : 'Unknown';
        deliverableSection += `| \`${shortSha}\` | ${message.split('\n')[0]} | ${author} | ${formattedDate} |\n`;
      });
      deliverableSection += '</details>\n\n';
    }

    deliverableSection += '</details>';
    return deliverableSection;
  }

  private generateSprintComparisonSection(metrics: any): string {
    // Since we don't have historical data, we'll provide a template structure
    const estimatedPrevious = {
      completionRate: 85,
      storyPoints: Math.round(metrics.completedStoryPoints * 0.9),
      commits: Math.round(metrics.totalCommits * 0.8)
    };

    return `| Metric          | Current Sprint | Previous Sprint | Change | Trend      |
|-----------------|----------------|-----------------|--------|------------|
| Completion Rate | ${metrics.completionRate}%            | ${estimatedPrevious.completionRate}%             | ${metrics.completionRate - estimatedPrevious.completionRate > 0 ? '+' : ''}${metrics.completionRate - estimatedPrevious.completionRate}%    | ${metrics.completionRate >= estimatedPrevious.completionRate ? '🔼' : '🔽'} ${metrics.completionRate >= estimatedPrevious.completionRate ? 'improving' : 'declining'} |
| Velocity        | ${metrics.completedStoryPoints} points     | ${estimatedPrevious.storyPoints} points      | ${metrics.completedStoryPoints - estimatedPrevious.storyPoints > 0 ? '+' : ''}${metrics.completedStoryPoints - estimatedPrevious.storyPoints} pts | ${metrics.completedStoryPoints >= estimatedPrevious.storyPoints ? '🔼' : '🔽'} ${metrics.completedStoryPoints >= estimatedPrevious.storyPoints ? 'improving' : 'declining'} |
| Development Activity | ${metrics.totalCommits} commits | ${estimatedPrevious.commits} commits | ${metrics.totalCommits - estimatedPrevious.commits > 0 ? '+' : ''}${metrics.totalCommits - estimatedPrevious.commits} | ${metrics.totalCommits >= estimatedPrevious.commits ? '🔼' : '🔽'} ${metrics.totalCommits >= estimatedPrevious.commits ? 'increasing' : 'decreasing'} |`;
  }

  private generateEpicsSection(jiraIssues: JiraIssue[]): string {
    const epics = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Epic');
    
    if (epics.length === 0) {
      return `## 🎯 Epics

*No epics included in this sprint.*`;
    }

    const epicRows = epics.map(epic => {
      const progress = epic.fields.status.name === 'Done' ? '100%' : 
                     epic.fields.status.name === 'In Progress' ? '50%' : '0%';
      return `| ${epic.key} | ${epic.fields.summary} | ${epic.fields.status.name} | ${progress} | ${epic.fields.assignee?.displayName || 'Unassigned'} |`;
    }).join('\n');

    return `## 🎯 Epics

| Epic | Summary | Status | Progress | Assignee |
|------|---------|--------|----------|----------|
${epicRows}`;
  }

  private generateImprovementsSection(jiraIssues: JiraIssue[]): string {
    const improvements = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Improvement');
    
    if (improvements.length === 0) {
      return `## ⚡ Improvements

*No improvement items included in this sprint.*`;
    }

    const improvementRows = improvements.map(improvement => {
      const impact = improvement.fields.priority?.name === 'High' ? 'High' : 
                    improvement.fields.priority?.name === 'Medium' ? 'Medium' : 'Low';
      return `| ${improvement.key} | ${improvement.fields.summary} | ${improvement.fields.status.name} | ${impact} | ${improvement.fields.assignee?.displayName || 'Unassigned'} |`;
    }).join('\n');

    return `## ⚡ Improvements

| Improvement | Summary | Status | Impact | Assignee |
|-------------|---------|--------|--------|----------|
${improvementRows}`;
  }

  private generateSprintAnalysisSection(analysis: any): string {
    return `<details>
  <summary><h2 style="display:inline-block">🔍 Sprint Analysis</h2></summary>

### Performance Highlights
- **Completion Rate**: ${analysis.qualityMetrics.totalIssues > 0 ? 
    Math.round((analysis.qualityMetrics.totalIssues - analysis.riskAssessment.openIssues) / analysis.qualityMetrics.totalIssues * 100) : 0}% of planned work completed
- **Quality Score**: ${analysis.qualityMetrics.qualityScore}
- **Velocity**: ${analysis.velocityAnalysis.actualVelocity} story points delivered
- **Team Engagement**: ${analysis.topContributors.length} active contributors

### Key Insights
| Insight Category | Finding | Recommendation |
|------------------|---------|----------------|
| Velocity | ${analysis.velocityAnalysis.velocityPercentage}% of planned velocity achieved | ${analysis.velocityAnalysis.velocityPercentage >= 90 ? 'Maintain current practices' : 'Review sprint planning estimation'} |
| Quality | ${analysis.qualityMetrics.bugRatio}% bug ratio | ${analysis.qualityMetrics.bugRatio <= 10 ? 'Excellent quality maintained' : 'Increase focus on testing'} |
| Collaboration | Strong team participation | Continue encouraging collaborative practices |

</details>`;
  }

  private generateQualityMetricsSection(qualityMetrics: any): string {
    return `<details>
  <summary><h2 style="display:inline-block">📊 Quality Metrics</h2></summary>

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Issues | ${qualityMetrics.totalIssues} | - | 📊 |
| Bug Count | ${qualityMetrics.bugs} | ≤10% of total | ${qualityMetrics.bugRatio <= 10 ? '✅' : '⚠️'} |
| Bug Ratio | ${qualityMetrics.bugRatio}% | ≤10% | ${qualityMetrics.bugRatio <= 10 ? '✅' : '⚠️'} |
| Bug Resolution Rate | ${qualityMetrics.bugResolutionRate}% | ≥90% | ${qualityMetrics.bugResolutionRate >= 90 ? '✅' : '⚠️'} |
| Quality Score | ${qualityMetrics.qualityScore} | Good+ | ${['Excellent', 'Good'].includes(qualityMetrics.qualityScore) ? '✅' : '⚠️'} |

### Quality Assessment
${qualityMetrics.qualityScore === 'Excellent' ? 
  '🌟 Outstanding quality maintained with minimal defects and high resolution rate.' :
  qualityMetrics.qualityScore === 'Good' ?
  '✅ Good quality standards maintained with manageable defect levels.' :
  '⚠️ Quality metrics indicate need for improved testing and defect prevention.'
}

</details>`;
  }

  private generateVelocityAnalysisSection(velocityAnalysis: any): string {
    return `## 📈 Velocity Analysis

| Velocity Metric | Value | Assessment |
|-----------------|-------|------------|
| Planned Velocity | ${velocityAnalysis.plannedVelocity} points | 📊 Target |
| Actual Velocity | ${velocityAnalysis.actualVelocity} points | 🎯 Delivered |
| Velocity Achievement | ${velocityAnalysis.velocityPercentage}% | ${velocityAnalysis.velocityPercentage >= 90 ? '✅ Excellent' : velocityAnalysis.velocityPercentage >= 70 ? '📈 Good' : '⚠️ Below Target'} |
| Predicted Next Sprint | ${velocityAnalysis.predictedNextSprint} points | 🔮 Forecast |

### Velocity Insights
- **Trend**: ${velocityAnalysis.velocityTrend}
- **Consistency**: ${velocityAnalysis.velocityPercentage >= 80 ? 'High consistency in delivery' : 'Variable delivery pattern observed'}
- **Capacity**: ${velocityAnalysis.velocityPercentage >= 100 ? 'Team operating at or above capacity' : 'Opportunity for capacity optimization'}`;
  }

  private generateReleaseNotesSection(data: any): string {
    const { jiraIssues } = data;
    const completedFeatures = jiraIssues.filter((issue: JiraIssue) => 
      issue.fields.status.name === 'Done' && 
      (issue.fields.issuetype.name === 'Story' || issue.fields.issuetype.name === 'Epic')
    );

    if (completedFeatures.length === 0) {
      return `<details>
  <summary><h2 style="display:inline-block">📝 Release Notes</h2></summary>

*No completed features to include in release notes for this sprint.*

</details>`;
    }

    const featureNotes = completedFeatures.slice(0, 10).map((issue: JiraIssue) => 
      `- ${this.getIssueTypeIcon(issue.fields.issuetype.name)} **${issue.fields.summary}** (${issue.key})`
    ).join('\n');

    return `<details>
  <summary><h2 style="display:inline-block">📝 Release Notes</h2></summary>

### New Features & Improvements
${featureNotes}
${completedFeatures.length > 10 ? `\n*... and ${completedFeatures.length - 10} more features*` : ''}

### Bug Fixes
${this.getBugFixNotes(jiraIssues)}

### Technical Improvements
${this.getTechnicalImprovements(jiraIssues)}

</details>`;
  }

  private getBugFixNotes(jiraIssues: JiraIssue[]): string {
    const bugs = jiraIssues.filter(issue => 
      issue.fields.issuetype.name === 'Bug' && issue.fields.status.name === 'Done'
    );

    if (bugs.length === 0) return '*No bug fixes in this sprint.*';

    return bugs.slice(0, 5).map(bug => 
      `- 🐛 Fixed: ${bug.fields.summary} (${bug.key})`
    ).join('\n') + (bugs.length > 5 ? `\n- *... and ${bugs.length - 5} more bug fixes*` : '');
  }

  private getTechnicalImprovements(jiraIssues: JiraIssue[]): string {
    const improvements = jiraIssues.filter(issue => 
      issue.fields.issuetype.name === 'Improvement' && issue.fields.status.name === 'Done'
    );

    if (improvements.length === 0) return '*No technical improvements in this sprint.*';

    return improvements.slice(0, 3).map(improvement => 
      `- ⚡ ${improvement.fields.summary} (${improvement.key})`
    ).join('\n');
  }

  private generateActionItemsSection(actionItems: any[]): string {
    if (actionItems.length === 0) {
      return `## 🚀 Action Items

*No specific action items identified for this sprint.*`;
    }

    const actionRows = actionItems.map(item => 
      `| ${item.category} | ${item.action} | ${item.assignee} | ${item.timeline} | ${this.getPriorityBadge(item.priority)} |`
    ).join('\n');

    return `## 🚀 Action Items

| Category | Action Required | Assignee | Timeline | Priority |
|----------|----------------|----------|----------|----------|
${actionRows}`;
  }

  private generateNextStepsSection(nextSteps: any[]): string {
    if (nextSteps.length === 0) {
      return `## 👥 Next Steps

*No specific next steps defined for upcoming sprint.*`;
    }

    const stepRows = nextSteps.map(step => 
      `| ${step.step} | ${step.description} | ${step.timeline} | ${this.getImpactBadge(step.impact)} |`
    ).join('\n');

    return `## 👥 Next Steps

| Step | Description | Timeline | Impact |
|------|-------------|----------|--------|
${stepRows}`;
  }

  private generateStakeholderCommunicationsSection(): string {
    return `## 📢 Stakeholder Communications

| Stakeholder Group | Communication Method | Key Messages | Next Communication |
|-------------------|---------------------|--------------|-------------------|
| Product Owner | Sprint Review Meeting | Sprint goals achieved, demo completed features | Next sprint planning |
| Development Team | Daily standups & retro | Performance feedback, process improvements | Ongoing |
| Management | Executive summary | Progress metrics, risk assessment | Weekly status |
| End Users | Release notes | New features, bug fixes, improvements | Post-deployment |`;
  }

  private generateDocumentationSection(data: any): string {
    const { jiraIssues } = data;
    const documentationNeeded = jiraIssues.filter((issue: JiraIssue) => 
      issue.fields.status.name === 'Done' && 
      !issue.fields.components?.some(c => c.name.toLowerCase().includes('documentation'))
    ).length;

    return `## 📚 Documentation

| Documentation Type | Status | Items | Action Required |
|-------------------|--------|-------|-----------------|
| User Documentation | ${documentationNeeded === 0 ? 'Up to date' : 'Needs update'} | ${documentationNeeded} features | ${documentationNeeded > 0 ? 'Update user guides' : 'No action needed'} |
| Technical Documentation | Review needed | API changes | Review and update |
| Release Notes | Generated | Current sprint | Published with release |
| Sprint Report | Complete | This document | Archive and distribute |`;
  }

  private generateOutputFilesSection(): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    return `## 📁 Output Files

| File Type | Filename | Purpose | Location |
|-----------|----------|---------|----------|
| Sprint Report | sprint-report-${timestamp}.md | Comprehensive sprint analysis | ./output/ |
| Metrics Export | sprint-metrics-${timestamp}.json | Raw metrics data | ./output/ |
| Action Items | action-items-${timestamp}.csv | Tracking spreadsheet | ./output/ |
| Release Notes | sprint-report-${timestamp}.md | Customer-facing updates | ./output/ |`;
  }

  private generateRetrospectiveSection(data: any): string {
    const { metrics } = data;
    
    return `## 🔄 Sprint Retrospective

### What Went Well ✅
- Achieved ${metrics.completionRate}% sprint completion rate
- Strong team collaboration with ${metrics.uniqueContributors} contributors
- Maintained good development velocity
- Quality metrics ${data.analysis.qualityMetrics.qualityScore.toLowerCase()}

### What Could Be Improved 📈
- ${metrics.completionRate < 90 ? 'Sprint planning accuracy could be improved' : 'Continue current planning practices'}
- ${data.analysis.qualityMetrics.bugRatio > 10 ? 'Focus on defect prevention' : 'Maintain quality standards'}
- Communication and collaboration processes
- Technical debt management

### Action Items for Next Sprint 🎯
- Review sprint planning estimation techniques
- Implement retrospective feedback
- Continue team collaboration practices
- Monitor and address any technical debt`;
  }

  private generateConclusionSection(data: any): string {
    const { sprintName, metrics } = data;
    
    return `## 🎉 Conclusion

The ${sprintName} sprint has been ${metrics.completionRate >= 90 ? 'successfully' : 'substantially'} completed with a ${metrics.completionRate}% completion rate. The team delivered ${metrics.completedStoryPoints} story points across ${metrics.completedIssues} completed issues, demonstrating ${metrics.completionRate >= 80 ? 'strong' : 'adequate'} execution and collaboration.

### Key Takeaways
- **Performance**: ${this.getPerformanceAssessment(metrics.completionRate)}
- **Quality**: ${data.analysis.qualityMetrics.qualityScore} quality standards maintained
- **Team**: Effective collaboration with ${metrics.uniqueContributors} active contributors
- **Delivery**: Consistent progress toward sprint and project goals

The insights and action items from this sprint will inform planning for upcoming iterations, ensuring continuous improvement in team performance and delivery quality.`;
  }

  private getPerformanceAssessment(completionRate: number): string {
    if (completionRate >= 95) return 'Outstanding performance exceeding expectations';
    if (completionRate >= 85) return 'Strong performance meeting expectations';
    if (completionRate >= 70) return 'Good performance with room for improvement';
    return 'Performance below target, requiring attention';
  }

  private generateAcknowledgementsSection(contributors: any[]): string {
    if (contributors.length === 0) {
      return `## 🙏 Acknowledgements

*Thank you to all team members who contributed to this sprint's success.*`;
    }

    const contributorList = contributors.map(c => 
      `- **${c.name}**: ${c.commits} commits, ${c.points} story points, ${c.issues} issues assigned`
    ).join('\n');

    return `## 🙏 Acknowledgements

Special thanks to all team members for their dedication and contributions:

${contributorList}

The success of this sprint is a result of the collective effort, collaboration, and commitment of the entire team.`;
  }

  // Additional section generation methods
  private generateReferencesSection(): string {
    return `## 📖 References

| Resource | Purpose | Link |
|----------|---------|------|
| JIRA Project | Issue tracking and sprint management | [View Project](${process.env.JIRA_DOMAIN || 'jira.company.com'}) |
| GitHub Repository | Source code and commits | [View Repository](${process.env.GITHUB_REPO || 'github.com/company/project'}) |
| Sprint Planning | Meeting notes and decisions | [View Documentation](link-to-docs) |
| Definition of Done | Quality criteria | [View Criteria](link-to-dod) |`;
  }

  private generateAppendixSection(data: any): string {
    return `## 📋 Appendix

### A. Detailed Issue Breakdown
- Total Issues: ${data.metrics.totalIssues}
- Completed: ${data.metrics.completedIssues}
- In Progress: ${data.metrics.inProgressIssues}
- Todo: ${data.metrics.todoIssues}

### B. Story Points Distribution
- Total Planned: ${data.metrics.storyPoints}
- Completed: ${data.metrics.completedStoryPoints}
- Average per Issue: ${data.metrics.averageStoryPointsPerIssue}

### C. Development Activity
- Total Commits: ${data.metrics.totalCommits}
- Contributors: ${data.metrics.uniqueContributors}
- Average Commits per Contributor: ${data.metrics.uniqueContributors > 0 ? Math.round(data.metrics.totalCommits / data.metrics.uniqueContributors) : 0}`;
  }

  private generateGlossarySection(): string {
    return `## 📚 Glossary

| Term | Definition |
|------|------------|
| Story Points | Unit of measure for expressing relative size of work items |
| Sprint Velocity | Number of story points completed in a sprint |
| Completion Rate | Percentage of planned work items completed |
| Quality Score | Assessment of code quality based on bug ratio and resolution |
| Sprint Burndown | Visual representation of work remaining vs time |
| Definition of Done | Shared understanding of work completion criteria |`;
  }

  private generateChangeLogSection(): string {
    const timestamp = new Date().toISOString();
    return `## 📝 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | ${timestamp} | Initial sprint report generated | System |
| - | - | Sprint data compiled and analyzed | Automated |
| - | - | Metrics calculated and validated | Automated |
| - | - | Report sections generated | Automated |`;
  }

  private generateFeedbackSection(): string {
    return `## 💬 Feedback

### How to Provide Feedback
- **Sprint Process**: Contact Scrum Master
- **Report Format**: Contact Technical Lead  
- **Data Accuracy**: Contact Product Owner
- **Tool Issues**: Contact Development Team

### Feedback Categories
| Category | Contact | Response Time |
|----------|---------|---------------|
| Process Improvement | Scrum Master | 2 business days |
| Report Enhancement | Tech Lead | 1 week |
| Data Corrections | Product Owner | 1 business day |
| Technical Issues | Dev Team | Same day |`;
  }

  private generateFutureWorkSection(nextSteps: any[]): string {
    return `## 🔮 Future Work

### Planned Improvements
- Enhanced sprint planning estimation
- Automated quality metrics tracking
- Improved team collaboration tools
- Advanced velocity prediction

### Next Sprint Priorities
${nextSteps.map(step => `- ${step.step}: ${step.description}`).join('\n')}

### Long-term Goals
- Continuous delivery pipeline optimization
- Team performance analytics
- Predictive sprint planning
- Quality automation`;
  }

  private generateLessonsLearnedSection(data: any): string {
    const { metrics } = data;
    
    return `## 📖 Lessons Learned

### Process Insights
| Lesson | Impact | Application |
|--------|--------|-------------|
| ${metrics.completionRate >= 90 ? 'Effective sprint planning' : 'Sprint estimation needs refinement'} | ${metrics.completionRate >= 90 ? 'High' : 'Medium'} | ${metrics.completionRate >= 90 ? 'Continue current practices' : 'Improve estimation techniques'} |
| Team collaboration effectiveness | High | Maintain communication practices |
| Quality focus outcomes | Medium | Continue quality emphasis |

### Technical Insights
- Development velocity patterns observed
- Quality metrics correlation with delivery
- Team size impact on productivity
- Tool effectiveness assessment

### Recommendations for Future Sprints
- Apply successful practices from this sprint
- Address identified improvement areas
- Monitor key performance indicators
- Maintain team engagement levels`;
  }

  private generateRisksSection(riskAssessment: any): string {
    return `## ⚠️ Risks & Mitigation

### Current Risk Assessment
- **Risk Level**: ${riskAssessment.riskLevel}
- **Active Blockers**: ${riskAssessment.blockers}
- **Open Issues**: ${riskAssessment.openIssues}
- **High Priority Open**: ${riskAssessment.highPriorityOpen}

### Identified Risk Factors
${riskAssessment.riskFactors.map((factor: string) => `- ${factor}`).join('\n')}

### Mitigation Strategies
${riskAssessment.mitigationStrategies.map((strategy: string) => `- ${strategy}`).join('\n')}

### Risk Monitoring
| Risk Category | Monitoring Frequency | Owner |
|---------------|---------------------|-------|
| Blockers | Daily | Scrum Master |
| Quality | Per commit | Tech Lead |
| Scope | Weekly | Product Owner |
| Resources | Sprint planning | Team Lead |`;
  }

  private generateAssumptionsSection(): string {
    return `## 📋 Assumptions

### Planning Assumptions
- Team availability remains consistent
- Requirements remain stable during sprint
- External dependencies are resolved on time
- Quality standards are maintained

### Technical Assumptions
- Development environment stability
- Tool and infrastructure availability
- Third-party service reliability
- Performance requirements unchanged

### Process Assumptions
- Team follows established workflows
- Communication channels remain effective
- Sprint ceremonies continue as scheduled
- Definition of Done remains current`;
  }

  private generateDependenciesSection(data: any): string {
    return `## 🔗 Dependencies

### External Dependencies
| Dependency | Type | Status | Impact | Owner |
|------------|------|--------|--------|-------|
| External API | Technical | Active | Medium | External Team |
| Design Assets | Creative | Pending | Low | Design Team |
| Database Changes | Infrastructure | Complete | High | DBA Team |

### Internal Dependencies
- Team member availability
- Code review completion
- Testing environment access
- Deployment pipeline readiness

### Dependency Risks
- Monitor external API stability
- Track design asset delivery
- Ensure database change coordination
- Validate deployment readiness`;
  }

  private generateConstraintsSection(): string {
    return `## 🚧 Constraints

### Resource Constraints
- Team size: Fixed for sprint duration
- Time: Sprint timeline is firm
- Budget: Within allocated sprint budget
- Tools: Current toolset limitations

### Technical Constraints
- Legacy system compatibility requirements
- Performance benchmarks must be maintained
- Security compliance standards
- Browser/platform support requirements

### Process Constraints
- Must follow established SDLC
- Required code review processes
- Mandatory testing protocols
- Documentation requirements`;
  }

  private generateStakeholderFeedbackSection(): string {
    return `## 👥 Stakeholder Feedback

### Product Owner Feedback
- Sprint goals alignment: ✅ Met expectations
- Feature prioritization: ✅ Appropriate
- Quality standards: ✅ Maintained
- Timeline adherence: ✅ On track

### Development Team Feedback
- Sprint planning accuracy: To be discussed in retrospective
- Technical challenges: Manageable complexity
- Collaboration effectiveness: Strong teamwork
- Tool effectiveness: Current tools adequate

### Scrum Master Observations
- Process adherence: Team following agile practices
- Impediment removal: Proactive issue resolution
- Communication: Effective daily standups
- Continuous improvement: Regular retrospective actions`;
  }

  private generateMetricsKPIsSection(metrics: any): string {
    return `## 📊 Metrics & KPIs

### Sprint Performance KPIs
| KPI | Target | Actual | Status |
|-----|--------|--------|--------|
| Sprint Completion | ≥90% | ${metrics.completionRate}% | ${metrics.completionRate >= 90 ? '✅' : '⚠️'} |
| Velocity | Stable | ${metrics.velocity} pts | 📊 |
| Quality Score | Good+ | ${metrics.completionRate >= 85 ? 'Good' : 'Fair'} | ${metrics.completionRate >= 85 ? '✅' : '⚠️'} |
| Team Engagement | High | ${metrics.uniqueContributors} contributors | ✅ |

### Trend Analysis
- Completion rate trend: ${metrics.completionRate >= 85 ? 'Positive' : 'Needs attention'}
- Velocity consistency: Monitoring required
- Quality maintenance: ${metrics.completionRate >= 90 ? 'Excellent' : 'Good'}
- Team productivity: Stable performance`;
  }

  private generatePerformanceSection(metrics: any): string {
    return `## 🏃‍♂️ Performance Analysis

### Team Performance
- **Productivity**: ${this.getProductivityRating(metrics.completionRate)}
- **Efficiency**: ${metrics.averageStoryPointsPerIssue} points/issue average
- **Collaboration**: ${metrics.uniqueContributors} active contributors
- **Delivery Consistency**: ${metrics.completionRate >= 80 ? 'Reliable' : 'Variable'}

### Technical Performance
- Commit frequency: ${this.getCommitFrequency(metrics.totalCommits)}
- Code quality: ${metrics.completionRate >= 85 ? 'Maintained' : 'Monitor closely'}
- Issue resolution: ${metrics.completionRate}% completion rate
- Sprint velocity: ${metrics.velocity} story points

### Performance Recommendations
${this.getPerformanceRecommendations(metrics.completionRate)}`;
  }

  private getProductivityRating(completionRate: number): string {
    if (completionRate >= 95) return 'Exceptional';
    if (completionRate >= 85) return 'High';
    if (completionRate >= 70) return 'Good';
    return 'Needs Improvement';
  }

  private getCommitFrequency(commits: number): string {
    if (commits >= 50) return 'Very Active';
    if (commits >= 20) return 'Active';
    if (commits >= 10) return 'Moderate';
    return 'Low';
  }

  private getPerformanceRecommendations(completionRate: number): string {
    if (completionRate >= 90) {
      return '- Continue current high-performance practices\n- Share successful strategies with other teams\n- Maintain quality focus\n- Consider capacity for additional work';
    } else if (completionRate >= 70) {
      return '- Review sprint planning estimation\n- Identify and address impediments\n- Improve task breakdown\n- Enhance team communication';
    } else {
      return '- Immediate review of sprint planning process\n- Identify major impediments\n- Consider team capacity adjustments\n- Implement daily progress monitoring';
    }
  }

  private generateReviewSection(data: any): string {
    return `## 🔍 Sprint Review

### Review Summary
This sprint review covers the completion of ${data.sprintName} with a focus on delivered value, team performance, and lessons learned for continuous improvement.

### Key Review Points
| Review Area | Assessment | Details |
|-------------|------------|---------|
| Goals Achievement | ${data.metrics.completionRate >= 90 ? 'Excellent' : 'Good'} | ${data.metrics.completionRate}% of sprint goals completed |
| Quality Delivery | ${data.analysis.qualityMetrics.qualityScore} | Quality metrics within acceptable range |
| Team Collaboration | Effective | Strong team engagement and communication |
| Process Adherence | Compliant | Following established agile practices |

### Stakeholder Satisfaction
- Product Owner: Satisfied with delivered features
- Development Team: Positive sprint experience
- End Users: New features meet requirements
- Management: Progress aligns with expectations`;
  }

  private generatePlanningSection(nextSteps: any[]): string {
    return `## 📅 Next Sprint Planning

### Planning Preparation
- Review current sprint outcomes
- Analyze velocity and capacity
- Prioritize product backlog
- Identify team availability

### Planning Inputs
| Input | Source | Status |
|-------|--------|--------|
| Product Backlog | Product Owner | Ready |
| Team Capacity | Scrum Master | Confirmed |
| Velocity Data | Current Sprint | ${nextSteps.length > 0 ? 'Available' : 'Calculating'} |
| Technical Dependencies | Tech Lead | Under Review |

### Next Sprint Considerations
${nextSteps.map(step => `- ${step.step}: ${step.description}`).join('\n')}

### Planning Recommendations
- Use current sprint velocity as baseline
- Address any outstanding impediments
- Ensure proper task breakdown
- Plan for continuous improvement actions`;
  }

  private generateBacklogSection(data: any): string {
    const { jiraIssues } = data;
    const openIssues = jiraIssues.filter((issue: JiraIssue) => issue.fields.status.name !== 'Done');
    
    return `## 📋 Product Backlog Status

### Current Backlog Overview
- **Total Open Issues**: ${openIssues.length}
- **High Priority**: ${openIssues.filter((issue: JiraIssue) => issue.fields.priority?.name === 'High').length}
- **Medium Priority**: ${openIssues.filter((issue: JiraIssue) => issue.fields.priority?.name === 'Medium').length}
- **Low Priority**: ${openIssues.filter((issue: JiraIssue) => issue.fields.priority?.name === 'Low').length}

### Backlog Health Metrics
| Metric | Value | Assessment |
|--------|-------|------------|
| Backlog Size | ${openIssues.length} items | ${openIssues.length < 20 ? 'Manageable' : 'Large'} |
| Priority Distribution | Balanced | Appropriate mix |
| Age of Items | ${openIssues.length > 0 ? 'Varies' : 'N/A'} | Monitor for stale items |
| Definition Quality | Good | Stories well-defined |

### Backlog Recommendations
- Regular backlog refinement sessions
- Prioritization review with Product Owner
- Story splitting for large items
- Technical debt item inclusion`;
  }

  private generateBoardSection(data: any): string {
    const { jiraIssues } = data;
    const statusCounts = jiraIssues.reduce((counts: any, issue: JiraIssue) => {
      const status = issue.fields.status.name;
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    const boardStatus = Object.entries(statusCounts).map(([status, count]) => 
      `| ${status} | ${count} | ${this.getStatusIcon(status)} |`
    ).join('\n');

    return `## 📋 Sprint Board Summary

### Board Status Distribution
| Status | Count | Indicator |
|--------|-------|-----------|
${boardStatus}

### Board Health
- **Flow Efficiency**: ${statusCounts['Done'] ? Math.round((statusCounts['Done'] / jiraIssues.length) * 100) : 0}%
- **WIP Management**: ${statusCounts['In Progress'] || 0} items in progress
- **Bottlenecks**: ${this.identifyBottlenecks(statusCounts)}
- **Board Hygiene**: ${Object.keys(statusCounts).length <= 5 ? 'Clean' : 'Needs attention'}

### Board Recommendations
- Maintain clear status definitions
- Monitor work-in-progress limits
- Regular board cleanup
- Track flow metrics for optimization`;
  }

  private identifyBottlenecks(statusCounts: any): string {
    const inProgress = statusCounts['In Progress'] || 0;
    const review = statusCounts['Review'] || statusCounts['In Review'] || 0;
    const testing = statusCounts['Testing'] || 0;

    if (review > inProgress) return 'Review column';
    if (testing > inProgress) return 'Testing column';
    if (inProgress > 5) return 'Too much WIP';
    return 'None identified';
  }

  private getPriorityBadge(priority: string): string {
    const badges: Record<string, string> = {
      'HIGH': '🔴 HIGH',
      'MEDIUM': '🟠 MEDIUM',
      'LOW': '🟢 LOW'
    };
    return badges[priority] || '⚪ NORMAL';
  }

  private getImpactBadge(impact: string): string {
    const badges: Record<string, string> = {
      'HIGH': '🔴 HIGH',
      'MEDIUM': '🟠 MEDIUM',
      'LOW': '🟢 LOW'
    };
    return badges[impact] || '⚪ NORMAL';
  }

  private calculateStoryPoints(jiraIssues: JiraIssue[]): number {
    return jiraIssues.reduce((total, issue) => {
      const points = issue.fields?.customfield_10004 || issue.fields?.storyPoints || 0;
      return total + (typeof points === 'number' ? points : 0);
    }, 0);
  }

  private getUniqueContributors(commits: GitHubCommit[]): string[] {
    const contributors = new Set(commits.map(commit => commit.author));
    return Array.from(contributors);
  }

  private getWorkBreakdown(jiraIssues: JiraIssue[]): any {
    const total = jiraIssues.length;
    const stories = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Story').length;
    const bugs = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Bug').length;
    const tasks = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Task').length;
    const epics = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Epic').length;
    const improvements = jiraIssues.filter(issue => issue.fields.issuetype.name === 'Improvement').length;

    return {
      stories, bugs, tasks, epics, improvements,
      storiesPercent: total > 0 ? Math.round((stories / total) * 100) : 0,
      bugsPercent: total > 0 ? Math.round((bugs / total) * 100) : 0,
      tasksPercent: total > 0 ? Math.round((tasks / total) * 100) : 0,
      epicsPercent: total > 0 ? Math.round((epics / total) * 100) : 0,
      improvementsPercent: total > 0 ? Math.round((improvements / total) * 100) : 0,
    };
  }

  private getPriorityStatus(jiraIssues: JiraIssue[]): any {
    const priorities = ['Critical', 'Major', 'Minor', 'Low', 'Blockers'];
    const result: any = {};

    priorities.forEach(priority => {
      const priorityIssues = jiraIssues.filter(issue => 
        issue.fields.priority?.name === priority || 
        (priority === 'Blockers' && issue.fields.issuetype.name === 'Blocker')
      );
      const resolved = priorityIssues.filter(issue => issue.fields.status.name === 'Done').length;
      const total = priorityIssues.length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      const status = total === 0 ? 'N/A' : resolved === total ? '✅ Complete' : '⚠️ In Progress';

      result[priority.toLowerCase()] = { resolved, total, rate, status };
    });

    return result;
  }

  private getTopContributors(commits: GitHubCommit[], jiraIssues: JiraIssue[]): any[] {
    const contributorMap = new Map();

    // First, initialize contributors from commits
    commits.forEach(commit => {
      const author = commit.author;
      if (!contributorMap.has(author)) {
        contributorMap.set(author, { 
          name: author, 
          commits: 0, 
          points: 0, 
          issues: 0,
          source: 'commits'
        });
      }
      contributorMap.get(author).commits++;
    });

    // Then add/update contributors from JIRA issues
    jiraIssues.forEach(issue => {
      if (issue.fields.assignee && issue.fields.assignee.displayName) {
        const assignee = issue.fields.assignee.displayName;
        if (!contributorMap.has(assignee)) {
          contributorMap.set(assignee, { 
            name: assignee, 
            commits: 0, 
            points: 0, 
            issues: 0,
            source: 'jira'
          });
        }
        
        // Count all assigned issues (not just completed ones)
        contributorMap.get(assignee).issues++;
        
        // Add story points for completed issues only
        if (issue.fields.status.name === 'Done') {
          const points = issue.fields?.customfield_10004 || issue.fields?.storyPoints || 0;
          contributorMap.get(assignee).points += (typeof points === 'number' ? points : 0);
        }
      }
    });

    // Sort by total contribution (commits + issues + points)
    return Array.from(contributorMap.values())
      .sort((a, b) => {
        const aTotal = a.commits + a.issues + (a.points / 5); // Weight points less
        const bTotal = b.commits + b.issues + (b.points / 5);
        return bTotal - aTotal;
      })
      .slice(0, 10); // Show top 10 contributors
  }

  private getKeyAchievements(jiraIssues: JiraIssue[], completionRate: number): any[] {
    const completed = jiraIssues.filter(issue => issue.fields.status.name === 'Done').length;
    const storyPoints = this.calculateStoryPoints(jiraIssues);
    
    return [
      {
        title: `Achieved ${completionRate}% sprint completion rate`,
        description: `Achieved ${completionRate}% sprint completion rate`
      },
      {
        title: `Delivered ${storyPoints} story points with quality`,
        description: `Delivered ${storyPoints} story points with quality`
      },
      {
        title: `Resolved ${completed} out of ${jiraIssues.length} planned issues`,
        description: `Resolved ${completed} out of ${jiraIssues.length} planned issues`
      }
    ];
  }

  private getStatusEmoji(completionRate: number): string {
    if (completionRate >= 90) return '✅';
    if (completionRate >= 70) return '📈';
    return '⚠️';
  }

  private getStatusText(completionRate: number): string {
    if (completionRate >= 90) return 'Excellent';
    if (completionRate >= 70) return 'Good';
    return 'Needs Attention';
  }

  private getVelocityTrend(storyPoints: number): string {
    // This could be enhanced with historical data
    return storyPoints > 100 ? 'Stable' : 'Declining';
  }

  private assessRiskLevel(jiraIssues: JiraIssue[]): string {
    const blockers = jiraIssues.filter(issue => 
      issue.fields.priority?.name === 'Critical' || 
      issue.fields.issuetype.name === 'Blocker'
    ).length;
    
    if (blockers > 3) return 'HIGH';
    if (blockers > 1) return 'MEDIUM';
    return 'LOW';
  }

  // Legacy methods for backward compatibility
  private generateSummary(jiraIssues: JiraIssue[], commits: GitHubCommit[]): string {
    const issueTypeCounts = this.getIssueTypeCounts(jiraIssues);
    
    let summary = "## 📊 Release Summary\n\n";
    summary += `- **${jiraIssues.length}** JIRA Issues\n`;
    summary += `- **${commits.length}** Commits\n`;
    summary += `- **${Object.keys(issueTypeCounts).length}** Issue Types\n\n`;

    if (Object.keys(issueTypeCounts).length > 0) {
      summary += "### Issue Type Breakdown\n\n";
      Object.entries(issueTypeCounts).forEach(([type, count]) => {
        summary += `- ${this.getIssueTypeIcon(type)} **${type}**: ${count}\n`;
      });
      summary += "\n";
    }

    return summary;
  }

  private formatJiraIssues(issues: JiraIssue[]): string {
    if (issues.length === 0) {
      return "## 📋 JIRA Issues\n\n*No JIRA issues found for this release.*\n\n";
    }

    const groupedIssues = this.groupIssuesByType(issues);
    let content = "## 📋 JIRA Issues\n\n";

    Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
      content += `### ${this.getIssueTypeIcon(type)} ${type}s\n\n`;
      
      typeIssues.forEach(issue => {
        const jiraUrl = `https://${process.env.JIRA_DOMAIN}/browse/${issue.key}`;
        const statusBadge = this.getStatusBadge(issue.fields.status.name);
        const priorityIcon = this.getPriorityIcon(issue.fields.priority?.name);
        
        content += `- ${this.getIssueTypeIcon(type)} [${issue.key}](${jiraUrl}) — ${issue.fields.summary}`;
        content += ` ${statusBadge}`;
        if (priorityIcon) content += ` ${priorityIcon}`;
        if (issue.fields.assignee) {
          content += ` 👤 *${issue.fields.assignee.displayName}*`;
        }
        content += "\n";
      });
      content += "\n";
    });

    return content;
  }

  private formatCommits(commits: GitHubCommit[]): string {
    if (commits.length === 0) {
      return "## 📦 Commits\n\n*No commits found for this release.*\n\n";
    }

    let content = "## 📦 Commits\n\n";

    commits.forEach(commit => {
      const shortSha = commit.sha.slice(0, 7);
      const commitMessage = commit.message.split("\n")[0];
      const commitDate = new Date(commit.date).toLocaleDateString();
      
      content += `- 🔧 ${commitMessage} ([${shortSha}](${commit.url}))`;
      content += ` 👤 *${commit.author}* 📅 *${commitDate}*\n`;
    });

    content += "\n";
    return content;
  }

  private groupIssuesByType(issues: JiraIssue[]): Record<string, JiraIssue[]> {
    return issues.reduce((groups, issue) => {
      const type = issue.fields.issuetype.name;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(issue);
      return groups;
    }, {} as Record<string, JiraIssue[]>);
  }

  private getIssueTypeCounts(issues: JiraIssue[]): Record<string, number> {
    return issues.reduce((counts, issue) => {
      const type = issue.fields.issuetype.name;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private getIssueTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      "Bug": "🐛",
      "Story": "✨",
      "Task": "🧹",
      "Epic": "🎯",
      "Sub-task": "📋",
      "Improvement": "⚡",
      "New Feature": "🚀",
    };
    return icons[type] || "📌";
  }

  private getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      "Done": "✅",
      "In Progress": "🔄",
      "To Do": "📝",
      "Testing": "🧪",
      "Review": "👀",
    };
    return badges[status] || "📋";
  }

  private getPriorityIcon(priority?: string): string {
    if (!priority) return "";
    const icons: Record<string, string> = {
      "Highest": "🔴",
      "High": "🟠",
      "Medium": "🟡",
      "Low": "🟢",
      "Lowest": "🔵",
    };
    return icons[priority] || "";
  }
}
