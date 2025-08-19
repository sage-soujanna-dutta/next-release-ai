import { JiraService } from '../services/JiraService.js';
import { TeamsService } from '../services/TeamsService.js';
import { FileService } from '../services/FileService.js';

export interface VelocityConfig {
  numberOfSprints?: number;
  startSprint?: string;
  endSprint?: string;
  includeTeamsNotification?: boolean;
  generateHtmlReport?: boolean;
  includePredictiveAnalysis?: boolean;
}

export interface VelocityResult {
  sprintAnalysis: SprintAnalysis[];
  trends: VelocityTrends;
  predictiveAnalysis: PredictiveAnalysis;
  recommendations: string[];
  summary: VelocitySummary;
}

export interface SprintAnalysis {
  sprintNumber: string;
  plannedPoints: number;
  completedPoints: number;
  completionRate: number;
  issuesCompleted: number;
  totalIssues: number;
  avgPointsPerIssue: number;
}

export interface VelocityTrends {
  averageVelocity: number;
  velocityTrend: 'increasing' | 'decreasing' | 'stable';
  consistency: 'high' | 'medium' | 'low';
  bestSprint: SprintAnalysis;
  worstSprint: SprintAnalysis;
}

export interface PredictiveAnalysis {
  nextSprintPrediction: number;
  confidenceLevel: number;
  seasonalPatterns: string[];
  riskFactors: string[];
}

export interface VelocitySummary {
  totalSprints: number;
  totalPointsPlanned: number;
  totalPointsCompleted: number;
  overallCompletionRate: number;
  teamCapacityTrend: string;
}

export class VelocityAnalysisTool {
  private jiraService: JiraService;
  private teamsService: TeamsService;
  private fileService: FileService;

  constructor() {
    this.jiraService = new JiraService();
    this.teamsService = new TeamsService();
    this.fileService = new FileService();
  }

  async analyzeVelocity(config: VelocityConfig): Promise<VelocityResult> {
    console.log('📈 Enhanced Velocity Analysis');
    console.log('='.repeat(50));

    const sprintNumbers = await this.getSprintNumbers(config);
    const sprintAnalysis: SprintAnalysis[] = [];

    console.log(`\n🔍 Analyzing ${sprintNumbers.length} sprints for velocity trends...`);

    for (const sprintNumber of sprintNumbers) {
      try {
        console.log(`\n📊 Processing Sprint: ${sprintNumber}`);
        
        const issues = await this.jiraService.fetchIssues(sprintNumber);
        const stats = this.jiraService.calculateStoryPointsStats(issues);
        
        const analysis: SprintAnalysis = {
          sprintNumber,
          plannedPoints: stats.totalStoryPoints,
          completedPoints: stats.completedStoryPoints,
          completionRate: stats.completionRate,
          issuesCompleted: issues.filter(i => i.fields.status.name === 'Done').length,
          totalIssues: issues.length,
          avgPointsPerIssue: issues.length > 0 ? stats.totalStoryPoints / issues.length : 0
        };

        sprintAnalysis.push(analysis);
        
        console.log(`   ✅ Velocity: ${analysis.completedPoints} points (${analysis.completionRate}%)`);
        
      } catch (error) {
        console.error(`❌ Error analyzing ${sprintNumber}:`, (error as Error).message);
      }
    }

    const trends = this.calculateVelocityTrends(sprintAnalysis);
    const summary = this.generateVelocitySummary(sprintAnalysis);
    const predictiveAnalysis = config.includePredictiveAnalysis ? 
      this.generatePredictiveAnalysis(sprintAnalysis) : 
      { nextSprintPrediction: 0, confidenceLevel: 0, seasonalPatterns: [], riskFactors: [] };
    const recommendations = this.generateRecommendations(sprintAnalysis, trends);

    this.logVelocityAnalysis(sprintAnalysis, trends, summary);

    const result: VelocityResult = {
      sprintAnalysis,
      trends,
      predictiveAnalysis,
      recommendations,
      summary
    };

    if (config.generateHtmlReport) {
      await this.generateHtmlReport(result);
    }

    if (config.includeTeamsNotification) {
      await this.sendTeamsNotification(result);
    }

    return result;
  }

  private async getSprintNumbers(config: VelocityConfig): Promise<string[]> {
    // Generate sprint numbers based on config
    const numberOfSprints = config.numberOfSprints || 6;
    const currentYear = new Date().getFullYear();
    const currentWeek = Math.ceil((Date.now() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    const sprintNumbers: string[] = [];
    for (let i = 0; i < numberOfSprints; i++) {
      const sprintWeek = currentWeek - i;
      if (sprintWeek > 0) {
        sprintNumbers.unshift(`SCNT-${currentYear}-${sprintWeek}`);
      }
    }
    
    return sprintNumbers;
  }

  private calculateVelocityTrends(sprintAnalysis: SprintAnalysis[]): VelocityTrends {
    if (sprintAnalysis.length === 0) {
      return {
        averageVelocity: 0,
        velocityTrend: 'stable',
        consistency: 'low',
        bestSprint: {} as SprintAnalysis,
        worstSprint: {} as SprintAnalysis
      };
    }

    const velocities = sprintAnalysis.map(s => s.completedPoints);
    const averageVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;

    // Calculate trend
    let velocityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (sprintAnalysis.length >= 3) {
      const recent = velocities.slice(-3);
      const earlier = velocities.slice(0, -3).slice(-3);
      
      if (recent.length >= 2 && earlier.length >= 2) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
        
        if (recentAvg > earlierAvg * 1.1) {
          velocityTrend = 'increasing';
        } else if (recentAvg < earlierAvg * 0.9) {
          velocityTrend = 'decreasing';
        }
      }
    }

    // Calculate consistency
    const variance = velocities.reduce((sum, vel) => sum + Math.pow(vel - averageVelocity, 2), 0) / velocities.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = averageVelocity > 0 ? standardDeviation / averageVelocity : 1;
    
    let consistency: 'high' | 'medium' | 'low';
    if (coefficientOfVariation < 0.2) {
      consistency = 'high';
    } else if (coefficientOfVariation < 0.4) {
      consistency = 'medium';
    } else {
      consistency = 'low';
    }

    const bestSprint = sprintAnalysis.reduce((prev, current) => 
      prev.completedPoints > current.completedPoints ? prev : current
    );
    
    const worstSprint = sprintAnalysis.reduce((prev, current) => 
      prev.completedPoints < current.completedPoints ? prev : current
    );

    return {
      averageVelocity: Math.round(averageVelocity),
      velocityTrend,
      consistency,
      bestSprint,
      worstSprint
    };
  }

  private generateVelocitySummary(sprintAnalysis: SprintAnalysis[]): VelocitySummary {
    const totalPointsPlanned = sprintAnalysis.reduce((sum, s) => sum + s.plannedPoints, 0);
    const totalPointsCompleted = sprintAnalysis.reduce((sum, s) => sum + s.completedPoints, 0);
    const overallCompletionRate = totalPointsPlanned > 0 ? 
      Math.round((totalPointsCompleted / totalPointsPlanned) * 100) : 0;

    const recentVelocities = sprintAnalysis.slice(-3).map(s => s.completedPoints);
    const earlierVelocities = sprintAnalysis.slice(0, -3).map(s => s.completedPoints);
    
    let teamCapacityTrend = 'Stable';
    if (recentVelocities.length >= 2 && earlierVelocities.length >= 2) {
      const recentAvg = recentVelocities.reduce((a, b) => a + b, 0) / recentVelocities.length;
      const earlierAvg = earlierVelocities.reduce((a, b) => a + b, 0) / earlierVelocities.length;
      
      if (recentAvg > earlierAvg * 1.15) {
        teamCapacityTrend = 'Improving';
      } else if (recentAvg < earlierAvg * 0.85) {
        teamCapacityTrend = 'Declining';
      }
    }

    return {
      totalSprints: sprintAnalysis.length,
      totalPointsPlanned,
      totalPointsCompleted,
      overallCompletionRate,
      teamCapacityTrend
    };
  }

  private generatePredictiveAnalysis(sprintAnalysis: SprintAnalysis[]): PredictiveAnalysis {
    const recentVelocities = sprintAnalysis.slice(-3).map(s => s.completedPoints);
    const nextSprintPrediction = recentVelocities.length > 0 ? 
      Math.round(recentVelocities.reduce((a, b) => a + b, 0) / recentVelocities.length) : 0;

    // Calculate confidence based on consistency
    const variance = recentVelocities.reduce((sum, vel) => sum + Math.pow(vel - nextSprintPrediction, 2), 0) / recentVelocities.length;
    const confidenceLevel = Math.max(0, Math.min(100, 100 - (Math.sqrt(variance) / nextSprintPrediction) * 100));

    const seasonalPatterns: string[] = [];
    const riskFactors: string[] = [];

    // Identify patterns
    if (sprintAnalysis.length >= 4) {
      const velocities = sprintAnalysis.map(s => s.completedPoints);
      const trend = this.calculateLinearTrend(velocities);
      
      if (Math.abs(trend) > 1) {
        seasonalPatterns.push(trend > 0 ? 'Consistent velocity improvement' : 'Declining velocity pattern');
      }
    }

    // Identify risk factors
    if (confidenceLevel < 60) {
      riskFactors.push('High velocity variance reduces prediction accuracy');
    }
    
    const recentDecline = recentVelocities.length >= 2 && 
      recentVelocities[recentVelocities.length - 1] < recentVelocities[0] * 0.8;
    if (recentDecline) {
      riskFactors.push('Recent velocity decline detected');
    }

    return {
      nextSprintPrediction,
      confidenceLevel: Math.round(confidenceLevel),
      seasonalPatterns,
      riskFactors
    };
  }

  private calculateLinearTrend(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = values.reduce((sum, _, x) => sum + x * x, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private generateRecommendations(sprintAnalysis: SprintAnalysis[], trends: VelocityTrends): string[] {
    const recommendations: string[] = [];

    if (trends.consistency === 'low') {
      recommendations.push('Focus on improving velocity consistency through better sprint planning');
      recommendations.push('Identify and address factors causing velocity variations');
    }

    if (trends.velocityTrend === 'decreasing') {
      recommendations.push('Investigate causes of declining velocity');
      recommendations.push('Consider team capacity or process improvements');
    }

    if (trends.averageVelocity < 20) {
      recommendations.push('Review story point estimation accuracy');
      recommendations.push('Consider breaking down larger stories into smaller tasks');
    }

    const lowCompletionRates = sprintAnalysis.filter(s => s.completionRate < 70).length;
    if (lowCompletionRates > sprintAnalysis.length * 0.3) {
      recommendations.push('Review sprint commitment process');
      recommendations.push('Improve capacity planning and scope management');
    }

    return recommendations;
  }

  private logVelocityAnalysis(sprintAnalysis: SprintAnalysis[], trends: VelocityTrends, summary: VelocitySummary) {
    console.log('\n📊 VELOCITY ANALYSIS RESULTS');
    console.log('='.repeat(50));
    
    console.log(`\n🎯 Overall Metrics:`);
    console.log(`   📈 Average Velocity: ${trends.averageVelocity} points per sprint`);
    console.log(`   📋 Total Sprints Analyzed: ${summary.totalSprints}`);
    console.log(`   ✅ Overall Completion Rate: ${summary.overallCompletionRate}%`);
    console.log(`   🔄 Velocity Trend: ${trends.velocityTrend}`);
    console.log(`   📊 Consistency: ${trends.consistency}`);
    console.log(`   🚀 Team Capacity: ${summary.teamCapacityTrend}`);

    console.log(`\n🏆 Best Sprint: ${trends.bestSprint.sprintNumber} (${trends.bestSprint.completedPoints} points)`);
    console.log(`   ⚠️ Worst Sprint: ${trends.worstSprint.sprintNumber} (${trends.worstSprint.completedPoints} points)`);

    console.log('\n📈 Sprint-by-Sprint Breakdown:');
    sprintAnalysis.forEach(sprint => {
      console.log(`   ${sprint.sprintNumber}: ${sprint.completedPoints}/${sprint.plannedPoints} points (${sprint.completionRate}%)`);
    });
  }

  private async generateHtmlReport(result: VelocityResult): Promise<void> {
    const html = this.generateHtmlContent(result);
    const fileName = `velocity-analysis-${result.summary.totalSprints}-sprints`;
    
    const filePath = await this.fileService.saveReleaseNotes(html, fileName);
    console.log(`📄 Velocity analysis HTML report generated: ${filePath}`);
  }

  private generateHtmlContent(result: VelocityResult): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Velocity Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
        .metrics { display: flex; flex-wrap: wrap; gap: 20px; margin: 30px 0; }
        .metric { flex: 1; min-width: 200px; background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; color: #667eea; }
        .sprint-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .sprint-table th, .sprint-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .sprint-table th { background: #f8f9fa; font-weight: bold; }
        .trend-up { color: #28a745; }
        .trend-down { color: #dc3545; }
        .trend-stable { color: #6c757d; }
        .recommendations { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 Velocity Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>${result.summary.totalSprints} sprints analyzed</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <h3>Average Velocity</h3>
                <div class="value">${result.trends.averageVelocity}</div>
                <p>points per sprint</p>
            </div>
            <div class="metric">
                <h3>Completion Rate</h3>
                <div class="value">${result.summary.overallCompletionRate}%</div>
                <p>overall delivery</p>
            </div>
            <div class="metric">
                <h3>Consistency</h3>
                <div class="value">${result.trends.consistency.toUpperCase()}</div>
                <p>velocity stability</p>
            </div>
            <div class="metric">
                <h3>Trend</h3>
                <div class="value trend-${result.trends.velocityTrend === 'increasing' ? 'up' : result.trends.velocityTrend === 'decreasing' ? 'down' : 'stable'}">${result.trends.velocityTrend.toUpperCase()}</div>
                <p>direction</p>
            </div>
        </div>

        <h2>📊 Sprint Performance</h2>
        <table class="sprint-table">
            <thead>
                <tr>
                    <th>Sprint</th>
                    <th>Planned Points</th>
                    <th>Completed Points</th>
                    <th>Completion Rate</th>
                    <th>Issues</th>
                </tr>
            </thead>
            <tbody>
                ${result.sprintAnalysis.map(sprint => `
                <tr>
                    <td><strong>${sprint.sprintNumber}</strong></td>
                    <td>${sprint.plannedPoints}</td>
                    <td>${sprint.completedPoints}</td>
                    <td>${sprint.completionRate}%</td>
                    <td>${sprint.issuesCompleted}/${sprint.totalIssues}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        ${result.predictiveAnalysis.nextSprintPrediction > 0 ? `
        <h2>🔮 Predictive Analysis</h2>
        <div class="metrics">
            <div class="metric">
                <h3>Next Sprint Prediction</h3>
                <div class="value">${result.predictiveAnalysis.nextSprintPrediction}</div>
                <p>estimated points</p>
            </div>
            <div class="metric">
                <h3>Confidence Level</h3>
                <div class="value">${result.predictiveAnalysis.confidenceLevel}%</div>
                <p>prediction accuracy</p>
            </div>
        </div>
        ` : ''}

        <div class="recommendations">
            <h2>💡 Recommendations</h2>
            <ul>
                ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  private async sendTeamsNotification(result: VelocityResult): Promise<void> {
    const summary = `Velocity Analysis Complete - ${result.trends.averageVelocity} avg points, ${result.trends.velocityTrend} trend`;
    const content = `📈 **Velocity Analysis Report**\n\n**Key Metrics:**\n- Average Velocity: ${result.trends.averageVelocity} points/sprint\n- Overall Completion: ${result.summary.overallCompletionRate}%\n- Velocity Trend: ${result.trends.velocityTrend}\n- Consistency: ${result.trends.consistency}\n- Team Capacity: ${result.summary.teamCapacityTrend}\n\n**Best Sprint:** ${result.trends.bestSprint.sprintNumber} (${result.trends.bestSprint.completedPoints} points)\n**Analysis Period:** ${result.summary.totalSprints} sprints\n\n**Top Recommendations:**\n${result.recommendations.slice(0, 3).map(r => `- ${r}`).join('\n')}`;

    await this.teamsService.sendNotification(summary, content);
    console.log('📱 Velocity analysis Teams notification sent successfully');
  }
}
