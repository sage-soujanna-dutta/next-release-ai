#!/usr/bin/env npx tsx

/**
 * Professional Sprint Report HTML Generator
 * Generates beautiful HTML reports with professional styling
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface SprintReportData {
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
  velocity: number;
  previousSprintComparison?: {
    completionRate: number;
    velocity: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  workBreakdown: {
    userStories: { count: number; percentage: number };
    bugFixes: { count: number; percentage: number };
    tasks: { count: number; percentage: number };
    epics: { count: number; percentage: number };
    improvements: { count: number; percentage: number };
  };
  priorityData: {
    critical: { total: number; resolved: number };
    high: { total: number; resolved: number };
    medium: { total: number; resolved: number };
    low: { total: number; resolved: number };
    blockers: { total: number; resolved: number };
  };
  topContributors: Array<{
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
  achievements: string[];
  actionItems: Array<{
    role: string;
    action: string;
    timeline: string;
    priority: string;
  }>;
}

class SprintReportHTMLGenerator {
  private generateCSS(): string {
    return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Roboto', sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f4f7fa;
        padding: 20px;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      
      .header {
        background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      
      .header h1 {
        font-size: 2.8rem;
        margin-bottom: 10px;
        font-weight: 400;
      }
      
      .header .subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
      }
      
      .content {
        padding: 30px;
      }
      
      .section {
        margin-bottom: 50px;
      }
      
      .section h2 {
        color: #343a40;
        border-bottom: 3px solid #007bff;
        padding-bottom: 10px;
        margin-bottom: 30px;
        font-size: 2rem;
        position: relative;
      }
      
      .section h2::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #007bff, transparent);
        bottom: -5px;
        left: 0;
      }
      
      .section h3 {
        color: #495057;
        margin-bottom: 20px;
        font-size: 1.5rem;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 25px;
        margin-bottom: 40px;
      }
      
      .metric-card {
        background: #f8f9fa;
        border-left: 4px solid #007bff;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s;
      }
      
      .metric-card:hover {
        transform: translateY(-2px);
      }
      
      .metric-card h4 {
        color: #343a40;
        margin-bottom: 15px;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .metric-card .value {
        font-size: 2.2rem;
        font-weight: 500;
        color: #007bff;
        margin-bottom: 8px;
      }
      
      .metric-card .status {
        font-size: 0.9rem;
        color: #868e96;
      }
      
      .status.excellent { color: #28a745; }
      .status.good { color: #ffc107; }
      .status.needs-attention { color: #dc3545; }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 25px;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      th {
        background: #007bff;
        color: white;
        padding: 15px;
        text-align: left;
        font-weight: 500;
      }
      
      td {
        padding: 12px 15px;
        border-bottom: 1px solid #ecf0f1;
      }
      
      tr:hover {
        background-color: #f1f3f5;
      }
      
      .progress-bar {
        width: 100%;
        height: 20px;
        background-color: #ecf0f1;
        border-radius: 10px;
        overflow: hidden;
        margin: 10px 0;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #6610f2);
        transition: width 0.3s ease;
      }
      
      .risk-level {
        padding: 5px 15px;
        border-radius: 20px;
        font-weight: 500;
        text-transform: uppercase;
        font-size: 0.9rem;
      }
      
      .risk-low { background: #d4edda; color: #155724; }
      .risk-medium { background: #fff3cd; color: #856404; }
      .risk-high { background: #f8d7da; color: #721c24; }
      .risk-critical { background: #f5c6cb; color: #c82333; }
      
      .priority-icon {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      
      .priority-critical { background: #dc3545; }
      .priority-high { background: #ffc107; }
      .priority-medium { background: #17a2b8; }
      .priority-low { background: #28a745; }
      
      .footer {
        background: #343a40;
        color: white;
        padding: 25px 30px;
        text-align: center;
        font-size: 0.9rem;
      }
      
      .comparison-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 25px;
        margin: 25px 0;
      }
      
      .comparison-card {
        text-align: center;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: transform 0.3s;
      }
      
      .comparison-card:hover {
        transform: translateY(-2px);
      }
      
      .comparison-card h4 {
        color: #343a40;
        margin-bottom: 12px;
        font-size: 1rem;
      }
      
      .comparison-card .value {
        font-size: 1.6rem;
        font-weight: 500;
        color: #007bff;
      }
      
      .trend-up { color: #28a745; }
      .trend-down { color: #dc3545; }
      .trend-stable { color: #ffc107; }
      
      @media (max-width: 768px) {
        .container { margin: 10px; }
        .header { padding: 25px; }
        .header h1 { font-size: 2.2rem; }
        .content { padding: 20px; }
        .metrics-grid { grid-template-columns: 1fr; }
        .comparison-grid { grid-template-columns: 1fr 1fr; }
      }
      
      @media print {
        body { background: white; }
        .container { box-shadow: none; }
        .section { page-break-inside: avoid; }
      }
    </style>
    `;
  }

  private generateExecutiveSummary(data: SprintReportData): string {
    const statusClass = data.completionRate >= 90 ? 'excellent' : 
                      data.completionRate >= 70 ? 'good' : 'needs-attention';
    
    return `
    <div class="section">
      <h2>📊 Executive Summary</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Completion Rate</h4>
          <div class="value">${data.completionRate}%</div>
          <div class="status ${statusClass}">
            ${data.completedIssues}/${data.totalIssues} issues
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${data.completionRate}%"></div>
          </div>
        </div>
        <div class="metric-card">
          <h4>Story Points</h4>
          <div class="value">${data.storyPoints}</div>
          <div class="status">Delivered</div>
        </div>
        <div class="metric-card">
          <h4>Team Size</h4>
          <div class="value">${data.contributors}</div>
          <div class="status">Active Contributors</div>
        </div>
        <div class="metric-card">
          <h4>Development Activity</h4>
          <div class="value">${data.commits}</div>
          <div class="status">Commits</div>
        </div>
        <div class="metric-card">
          <h4>Sprint Velocity</h4>
          <div class="value">${data.velocity}</div>
          <div class="status">Points/Sprint</div>
        </div>
        <div class="metric-card">
          <h4>Sprint Duration</h4>
          <div class="value">${data.duration}</div>
          <div class="status">On Schedule</div>
        </div>
      </div>
    </div>
    `;
  }

  private generateSprintComparison(data: SprintReportData): string {
    if (!data.previousSprintComparison) return '';
    
    const comp = data.previousSprintComparison;
    const completionChange = data.completionRate - comp.completionRate;
    const velocityChange = data.velocity - comp.velocity;
    
    const trendClass = comp.trend === 'increasing' ? 'trend-up' : 
                      comp.trend === 'decreasing' ? 'trend-down' : 'trend-stable';
    
    return `
    <div class="section">
      <h2>📈 Sprint Comparison vs Previous Sprint</h2>
      <div class="comparison-grid">
        <div class="comparison-card">
          <h4>Current Completion</h4>
          <div class="value">${data.completionRate}%</div>
        </div>
        <div class="comparison-card">
          <h4>Previous Completion</h4>
          <div class="value">${comp.completionRate}%</div>
        </div>
        <div class="comparison-card">
          <h4>Change</h4>
          <div class="value ${completionChange >= 0 ? 'trend-up' : 'trend-down'}">
            ${completionChange >= 0 ? '+' : ''}${completionChange}%
          </div>
        </div>
        <div class="comparison-card">
          <h4>Trend</h4>
          <div class="value ${trendClass}">${comp.trend}</div>
        </div>
      </div>
      <div class="comparison-grid">
        <div class="comparison-card">
          <h4>Current Velocity</h4>
          <div class="value">${data.velocity} pts</div>
        </div>
        <div class="comparison-card">
          <h4>Previous Velocity</h4>
          <div class="value">${comp.velocity} pts</div>
        </div>
        <div class="comparison-card">
          <h4>Change</h4>
          <div class="value ${velocityChange >= 0 ? 'trend-up' : 'trend-down'}">
            ${velocityChange >= 0 ? '+' : ''}${velocityChange} pts
          </div>
        </div>
        <div class="comparison-card">
          <h4>Performance</h4>
          <div class="value ${trendClass}">
            ${velocityChange >= 0 ? '📈' : '📉'} ${Math.abs(velocityChange)} pts
          </div>
        </div>
      </div>
    </div>
    `;
  }

  private generateWorkBreakdown(data: SprintReportData): string {
    return `
    <div class="section">
      <h2>🏗️ Work Breakdown Analysis</h2>
      <table>
        <thead>
          <tr>
            <th>Work Type</th>
            <th>Count</th>
            <th>Percentage</th>
            <th>Focus Area</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>📚 User Stories</td>
            <td>${data.workBreakdown.userStories.count} items</td>
            <td>${data.workBreakdown.userStories.percentage}%</td>
            <td>Feature Development</td>
          </tr>
          <tr>
            <td>🐛 Bug Fixes</td>
            <td>${data.workBreakdown.bugFixes.count} items</td>
            <td>${data.workBreakdown.bugFixes.percentage}%</td>
            <td>Quality Maintenance</td>
          </tr>
          <tr>
            <td>⚙️ Tasks</td>
            <td>${data.workBreakdown.tasks.count} items</td>
            <td>${data.workBreakdown.tasks.percentage}%</td>
            <td>Operations</td>
          </tr>
          <tr>
            <td>🎯 Epics</td>
            <td>${data.workBreakdown.epics.count} items</td>
            <td>${data.workBreakdown.epics.percentage}%</td>
            <td>Strategic Initiatives</td>
          </tr>
          <tr>
            <td>🔧 Improvements</td>
            <td>${data.workBreakdown.improvements.count} items</td>
            <td>${data.workBreakdown.improvements.percentage}%</td>
            <td>Process Enhancement</td>
          </tr>
        </tbody>
      </table>
    </div>
    `;
  }

  private generatePriorityResolution(data: SprintReportData): string {
    const priorities = [
      { name: 'Critical', data: data.priorityData.critical, class: 'priority-critical' },
      { name: 'Major', data: data.priorityData.high, class: 'priority-high' },
      { name: 'Minor', data: data.priorityData.medium, class: 'priority-medium' },
      { name: 'Low', data: data.priorityData.low, class: 'priority-low' },
      { name: 'Blockers', data: data.priorityData.blockers, class: 'priority-critical' }
    ];

    return `
    <div class="section">
      <h2>🎯 Priority Resolution Status</h2>
      <table>
        <thead>
          <tr>
            <th>Priority Level</th>
            <th>Resolved</th>
            <th>Total</th>
            <th>Success Rate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${priorities.map(priority => {
            const successRate = priority.data.total > 0 ? 
              Math.round((priority.data.resolved / priority.data.total) * 100) : 0;
            const status = priority.data.total === 0 ? 'N/A' :
              priority.data.resolved === priority.data.total ? '✅ Complete' : '⚠️ In Progress';
            
            return `
            <tr>
              <td>
                <span class="priority-icon ${priority.class}"></span>
                ${priority.name}
              </td>
              <td>${priority.data.resolved}</td>
              <td>${priority.data.total}</td>
              <td>${successRate}%</td>
              <td>${status}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    `;
  }

  private generateTopContributors(data: SprintReportData): string {
    return `
    <div class="section">
      <h2>🏆 Top Contributors</h2>
      <table>
        <thead>
          <tr>
            <th>Contributor</th>
            <th>Commits</th>
            <th>Points Completed</th>
            <th>Issues Resolved</th>
            <th>Impact Level</th>
          </tr>
        </thead>
        <tbody>
          ${data.topContributors.slice(0, 10).map(contributor => `
          <tr>
            <td><strong>${contributor.name}</strong></td>
            <td>${contributor.commits}</td>
            <td>${contributor.pointsCompleted} pts</td>
            <td>${contributor.issuesResolved}</td>
            <td>🌟 <strong>HIGH</strong></td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `;
  }

  private generateRiskAssessment(data: SprintReportData): string {
    if (!data.riskAssessment) return '';
    
    const risk = data.riskAssessment;
    const riskClass = `risk-${risk.level}`;
    
    return `
    <div class="section">
      <h2>⚠️ Risk Assessment</h2>
      <table>
        <thead>
          <tr>
            <th>Assessment Category</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Risk Level</strong></td>
            <td><span class="risk-level ${riskClass}">${risk.level}</span></td>
          </tr>
          <tr>
            <td><strong>Issues Identified</strong></td>
            <td>${risk.issues.length} items requiring attention</td>
          </tr>
          <tr>
            <td><strong>Mitigation Actions</strong></td>
            <td>${risk.mitigation.length} strategies implemented</td>
          </tr>
        </tbody>
      </table>
      
      <h3>🚨 Identified Risk Factors</h3>
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Risk Factor</th>
          </tr>
        </thead>
        <tbody>
          ${risk.issues.map((issue, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${issue}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h3>🛡️ Mitigation Strategy</h3>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Mitigation Approach</th>
          </tr>
        </thead>
        <tbody>
          ${risk.mitigation.map((strategy, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${strategy}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `;
  }

  private generateActionItems(data: SprintReportData): string {
    return `
    <div class="section">
      <h2>🚀 Action Items</h2>
      <table>
        <thead>
          <tr>
            <th>Role</th>
            <th>Action Required</th>
            <th>Timeline</th>
            <th>Priority Level</th>
          </tr>
        </thead>
        <tbody>
          ${data.actionItems.map(item => {
            const priorityIcon = item.priority === 'critical' ? '🔴' : 
                                item.priority === 'high' ? '🟠' : 
                                item.priority === 'medium' ? '🟡' : '🟢';
            
            return `
            <tr>
              <td><strong>${item.role}</strong></td>
              <td>${item.action}</td>
              <td>${item.timeline}</td>
              <td>${priorityIcon} <strong>${item.priority.toUpperCase()}</strong></td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    `;
  }

  private generateAchievements(data: SprintReportData): string {
    return `
    <div class="section">
      <h2>🎉 Key Achievements</h2>
      <ul style="list-style: none; padding: 0;">
        ${data.achievements.map(achievement => `
        <li style="background: #f8f9fa; margin: 10px 0; padding: 15px; border-left: 4px solid #28a745; border-radius: 4px;">
          ✅ ${achievement}
        </li>
        `).join('')}
      </ul>
    </div>
    `;
  }

  public generateHTML(data: SprintReportData): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.sprintId} - Professional Sprint Report</title>
      ${this.generateCSS()}
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>🚀 ${data.sprintId} - Professional Sprint Report</h1>
          <div class="subtitle">
            ${data.period} | ✅ ${data.status} | ${data.completionRate}% Complete
          </div>
        </header>
        
        <div class="content">
          ${this.generateExecutiveSummary(data)}
          ${this.generateSprintComparison(data)}
          ${this.generateWorkBreakdown(data)}
          ${this.generatePriorityResolution(data)}
          ${this.generateTopContributors(data)}
          ${this.generateAchievements(data)}
          ${this.generateRiskAssessment(data)}
          ${this.generateActionItems(data)}
          
          <div class="section">
            <h2>🎯 Strategic Recommendations</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Recommendation</th>
                  <th>Rationale</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Process</strong></td>
                  <td>Implement automated testing pipeline</td>
                  <td>Reduce manual testing overhead and improve quality</td>
                  <td>🔴 High</td>
                </tr>
                <tr>
                  <td><strong>Team</strong></td>
                  <td>Cross-train team members on critical components</td>
                  <td>Reduce bus factor and improve knowledge sharing</td>
                  <td>🟠 Medium</td>
                </tr>
                <tr>
                  <td><strong>Technical</strong></td>
                  <td>Refactor legacy components identified in this sprint</td>
                  <td>Improve maintainability and reduce technical debt</td>
                  <td>🟠 Medium</td>
                </tr>
                <tr>
                  <td><strong>Performance</strong></td>
                  <td>Monitor and optimize slow queries identified</td>
                  <td>Improve user experience and system performance</td>
                  <td>🟠 Medium</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <footer class="footer">
          📅 Generated: ${new Date().toLocaleString()} | 🏆 Status: Ready for executive presentation
        </footer>
      </div>
    </body>
    </html>
    `;
  }
}

export { SprintReportHTMLGenerator, SprintReportData };
