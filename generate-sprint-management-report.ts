#!/usr/bin/env tsx

import { ComprehensiveWorkflowTool, WorkflowConfig } from './src/tools/ComprehensiveWorkflowTool.js';
import { SprintReviewTool } from './src/tools/SprintReviewTool.js';
import { StoryPointsAnalysisTool } from './src/tools/StoryPointsAnalysisTool.js';
import { VelocityAnalysisTool } from './src/tools/VelocityAnalysisTool.js';
import { TeamsIntegrationTool } from './src/tools/TeamsIntegrationTool.js';

async function generateSprintManagementReport() {
  console.log('🚀 Starting Sprint Management Report Generation...');
  console.log('=' .repeat(60));

  try {
    // Initialize tools
    const workflowTool = new ComprehensiveWorkflowTool();
    const sprintReviewTool = new SprintReviewTool();
    const storyPointsTool = new StoryPointsAnalysisTool();
    const velocityTool = new VelocityAnalysisTool();
    const teamsIntegration = new TeamsIntegrationTool();

    // Get current sprint number (latest sprint)
    const currentSprintNumber = 'SCNT-2025-21'; // Current sprint based on date context
    const previousSprints = ['SCNT-2025-19', 'SCNT-2025-20', 'SCNT-2025-21']; // Last 3 sprints for trend analysis

    console.log(`📋 Generating report for sprint: ${currentSprintNumber}`);
    console.log(`📊 Including trend analysis for sprints: ${previousSprints.join(', ')}`);

    // Step 1: Generate comprehensive workflow report
    console.log('\n🔄 Step 1: Executing Comprehensive Workflow...');
    const workflowConfig: WorkflowConfig = {
      sprintNumber: currentSprintNumber,
      includeReleaseNotes: true,
      includeStoryPointsAnalysis: true,
      includeVelocityAnalysis: true,
      includeSprintReview: true,
      publishToConfluence: false, // Set to true if you want to publish to Confluence
      sendToTeams: true,
      generateAllReports: true,
      outputFormat: 'html'
    };

    const workflowResult = await workflowTool.executeComprehensiveWorkflow(workflowConfig);
    console.log(`✅ Workflow completed with ${workflowResult.executedSteps.length} steps`);

    // Step 2: Generate detailed story points analysis
    console.log('\n📊 Step 2: Generating Story Points Analysis...');
    const storyPointsResult = await storyPointsTool.analyzeStoryPoints({
      sprintNumbers: previousSprints,
      includeTeamsNotification: false,
      generateHtmlReport: true
    });
    console.log(`✅ Story Points Analysis completed`);

    // Step 3: Generate velocity analysis with trends
    console.log('\n⚡ Step 3: Generating Velocity Analysis...');
    const velocityResult = await velocityTool.analyzeVelocity({
      numberOfSprints: previousSprints.length,
      includeTeamsNotification: false,
      generateHtmlReport: true,
      includePredictiveAnalysis: true
    });
    console.log(`✅ Velocity Analysis completed`);

    // Step 4: Generate comprehensive sprint review
    console.log('\n📝 Step 4: Generating Sprint Review...');
    const sprintReviewResult = await sprintReviewTool.generateSprintReview(previousSprints, {
      includeVelocityTrends: true,
      sendToTeams: false, // We'll send manually with better formatting
      format: 'html'
    });
    console.log(`✅ Sprint Review completed for ${sprintReviewResult.metrics.length} sprints`);

    // Step 5: Send professional Teams notification
    console.log('\n📱 Step 5: Sending Teams Notification...');
    await teamsIntegration.sendTeamsReport({
      reportType: 'detailed-sprint',
      sprintNumber: currentSprintNumber,
      title: `📊 Sprint Management Report - ${currentSprintNumber}`,
      summary: `Comprehensive sprint analysis including velocity trends, story points breakdown, and team performance metrics.`
    });
    console.log(`✅ Teams notification sent`);

    // Generate summary report
    console.log('\n📋 SPRINT MANAGEMENT REPORT SUMMARY');
    console.log('=' .repeat(60));
    console.log(`🎯 Current Sprint: ${currentSprintNumber}`);
    console.log(`📊 Analysis Period: ${previousSprints[0]} to ${previousSprints[previousSprints.length - 1]}`);
    console.log(`📈 Total Sprints Analyzed: ${previousSprints.length}`);
    console.log(`📁 Generated Files: ${workflowResult.generatedFiles.length}`);
    console.log(`✅ Successful Steps: ${workflowResult.summary.successfulSteps}/${workflowResult.summary.totalSteps}`);
    
    if (workflowResult.summary.failedSteps > 0) {
      console.log(`❌ Failed Steps: ${workflowResult.summary.failedSteps}`);
    }

    // Display key metrics
    const currentSprintMetrics = sprintReviewResult.metrics.find(m => m.sprintName === currentSprintNumber);
    if (currentSprintMetrics) {
      console.log('\n🔍 KEY METRICS FOR CURRENT SPRINT:');
      console.log(`  • Total Issues: ${currentSprintMetrics.totalIssues}`);
      console.log(`  • Completed Issues: ${currentSprintMetrics.completedIssues}`);
      console.log(`  • Completion Rate: ${currentSprintMetrics.completionRate}%`);
      console.log(`  • Story Points Completed: ${currentSprintMetrics.completedStoryPoints}/${currentSprintMetrics.totalStoryPoints}`);
      console.log(`  • Velocity: ${currentSprintMetrics.velocity}`);
    }

    // Display velocity trends
    console.log('\n📈 VELOCITY TRENDS:');
    sprintReviewResult.velocityTrends.forEach(trend => {
      const trendIcon = trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '➡️';
      console.log(`  • ${trend.sprintName}: ${trend.velocity} points ${trendIcon} (${trend.completionRate}% completion)`);
    });

    console.log('\n🎉 Sprint Management Report Generation Complete!');
    console.log(`📂 Check the 'output' directory for generated HTML reports`);
    console.log(`📱 Teams notification has been sent to the configured channel`);

  } catch (error) {
    console.error('❌ Error generating sprint management report:', error);
    process.exit(1);
  }
}

// Execute the report generation
generateSprintManagementReport().catch(console.error);
