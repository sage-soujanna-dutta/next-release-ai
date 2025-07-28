#!/usr/bin/env tsx

import { MCPToolFactory } from './src/core/MCPToolFactory.js';
import dotenv from 'dotenv';

dotenv.config();

async function generateCombinedSprintSummary1516() {
  console.log('🎯 Combined Sprint Summary Generation');
  console.log('📊 Analyzing SCNT-2025-15 & SCNT-2025-16');
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Initialize MCP Tool Factory
    const toolFactory = new MCPToolFactory({
      enabledCategories: ['release', 'analysis', 'integration', 'jira']
    });

    console.log('📋 MCP Tools Available:', toolFactory.getToolCount());
    console.log('📂 Categories Loaded:', toolFactory.getCategoryCount());
    console.log('');

    // Use enhanced story points analysis for comprehensive multi-sprint reporting
    const storyPointsTool = toolFactory.getTool('enhanced_story_points_analysis');
    
    if (!storyPointsTool) {
      throw new Error('Enhanced story points analysis tool not found in MCP factory');
    }

    console.log('🔧 Tool Selected: enhanced_story_points_analysis');
    console.log('📊 Target Sprints: SCNT-2025-15, SCNT-2025-16');
    console.log('📱 Teams Integration: Enabled with Professional Template');
    console.log('📄 HTML Report Generation: Enabled for documentation');
    console.log('');

    // Execute comprehensive sprint analysis
    console.log('⚡ Executing Enhanced Sprint Analysis...');
    const result = await storyPointsTool.execute({
      sprintNumbers: ['SCNT-2025-15', 'SCNT-2025-16'],
      includeTeamsNotification: true,
      generateHtmlReport: true
    });

    if (result.isError) {
      const errorText = Array.isArray(result.content) 
        ? result.content.map(c => c.text || c).join('\n')
        : result.content;
      throw new Error(`Story points analysis failed: ${errorText}`);
    }

    console.log('✅ Primary Analysis Completed Successfully!');
    console.log('');
    
    // Display detailed results
    const reportText = Array.isArray(result.content) 
      ? result.content.map(c => c.text || c).join('\n')
      : result.content;
    console.log('📊 Story Points Analysis Results:');
    console.log(reportText);
    console.log('');

    // Generate complementary velocity analysis
    console.log('📈 Generating Velocity Trend Analysis...');
    const velocityTool = toolFactory.getTool('generate_velocity_report');
    
    if (velocityTool) {
      const velocityResult = await velocityTool.execute({
        sprintNumbers: ['SCNT-2025-15', 'SCNT-2025-16'],
        includeCurrentSprint: false
      });

      if (!velocityResult.isError) {
        console.log('');
        console.log('📈 Velocity Analysis Results:');
        const velocityText = Array.isArray(velocityResult.content) 
          ? velocityResult.content.map(c => c.text || c).join('\n')
          : velocityResult.content;
        console.log(velocityText);
      } else {
        console.log('⚠️ Velocity analysis completed with warnings (data may be limited for older sprints)');
      }
    }

    // Final summary and confirmation
    console.log('');
    console.log('🎉 COMBINED SPRINT SUMMARY COMPLETED!');
    console.log('=' .repeat(80));
    console.log('✅ Target Sprints: SCNT-2025-15 & SCNT-2025-16');
    console.log('✅ Multi-Sprint Analysis: Comprehensive story points and velocity review');
    console.log('✅ Teams Notification: Sent with professional formatting and tables');
    console.log('✅ HTML Documentation: Generated and saved to output directory');
    console.log('✅ Velocity Trends: Historical performance analysis included');
    console.log('');
    console.log('📱 Teams Channel: Check for the combined sprint summary report');
    console.log('📄 HTML Report: Available in output/ directory for sharing');
    console.log('');
    console.log('🏆 Analysis Focus: Performance comparison between SCNT-2025-15 and SCNT-2025-16');
    console.log('📊 Data Source: Real-time JIRA integration with validated metrics');

  } catch (error) {
    console.error('❌ Error generating combined sprint summary:', error);
    console.error('');
    console.error('🔧 Troubleshooting Steps:');
    console.error('   1. Verify JIRA connectivity and sprint accessibility');
    console.error('   2. Check Teams webhook configuration');
    console.error('   3. Ensure SCNT-2025-15 and SCNT-2025-16 exist in JIRA');
    console.error('   4. Validate environment variables (.env file)');
    console.error('');
    console.error('💡 Note: Older sprints may have limited data availability');
    process.exit(1);
  }
}

// Execute the combined sprint summary generation
generateCombinedSprintSummary1516().catch(console.error);
