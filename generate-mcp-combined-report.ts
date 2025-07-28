#!/usr/bin/env tsx

import { MCPToolFactory } from './src/core/MCPToolFactory.js';
import dotenv from 'dotenv';

dotenv.config();

async function generateCombinedSprintReport() {
  console.log('🎯 Generating Combined Sprint Review Report via MCP Tools');
  console.log('📊 Sprint Analysis: SCNT-2025-19 & SCNT-2025-20');
  console.log('=' .repeat(70));
  console.log('');

  try {
    // Initialize MCP Tool Factory
    const toolFactory = new MCPToolFactory({
      enabledCategories: ['release', 'analysis', 'integration', 'jira']
    });

    console.log('📋 Available MCP Tools:', toolFactory.getToolCount());
    console.log('📂 Categories loaded:', toolFactory.getCategoryCount());
    console.log('');

    // Get the enhanced story points analysis tool
    const storyPointsTool = toolFactory.getTool('enhanced_story_points_analysis');
    
    if (!storyPointsTool) {
      throw new Error('Enhanced story points analysis tool not found');
    }

    console.log('🔧 Using Tool: enhanced_story_points_analysis');
    console.log('📊 Analyzing sprints: SCNT-2025-19, SCNT-2025-20');
    console.log('📱 Teams integration: Enabled');
    console.log('📄 HTML report generation: Enabled');
    console.log('');

    // Execute the tool with multiple sprints
    const result = await storyPointsTool.execute({
      sprintNumbers: ['SCNT-2025-19', 'SCNT-2025-20'],
      includeTeamsNotification: true,
      generateHtmlReport: true
    });

    if (result.isError) {
      const errorText = Array.isArray(result.content) 
        ? result.content.map(c => c.text || c).join('\n')
        : result.content;
      throw new Error(errorText);
    }

    console.log('✅ Combined Sprint Report Generated Successfully!');
    console.log('');
    console.log('📊 Report Results:');
    const reportText = Array.isArray(result.content) 
      ? result.content.map(c => c.text || c).join('\n')
      : result.content;
    console.log(reportText);
    console.log('');
    console.log('📱 Teams Notification: Sent automatically via MCP tool');
    console.log('📄 HTML Report: Generated and saved to output directory');
    console.log('');

    // Also generate velocity analysis for comprehensive insights
    console.log('📈 Generating Additional Velocity Analysis...');
    const velocityTool = toolFactory.getTool('generate_velocity_report');
    
    if (velocityTool) {
      const velocityResult = await velocityTool.execute({
        sprintNumbers: ['SCNT-2025-19', 'SCNT-2025-20'],
        includeCurrentSprint: false
      });

      if (!velocityResult.isError) {
        console.log('');
        console.log('📈 Velocity Analysis Results:');
        const velocityText = Array.isArray(velocityResult.content) 
          ? velocityResult.content.map(c => c.text || c).join('\n')
          : velocityResult.content;
        console.log(velocityText);
      }
    }

    console.log('');
    console.log('🎉 COMBINED SPRINT REVIEW COMPLETED!');
    console.log('=' .repeat(70));
    console.log('✅ Sprint Analysis: SCNT-2025-19 & SCNT-2025-20');
    console.log('✅ Teams Notification: Sent with professional formatting');
    console.log('✅ HTML Report: Generated with comprehensive metrics');
    console.log('✅ Velocity Analysis: Included for trend insights');
    console.log('');
    console.log('📋 Check your Teams channel for the detailed report!');

  } catch (error) {
    console.error('❌ Error generating combined sprint report:', error);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   • Verify MCP server configuration');
    console.error('   • Check JIRA and Teams API credentials');
    console.error('   • Ensure sprint numbers exist and are accessible');
    process.exit(1);
  }
}

// Execute the combined sprint report generation
generateCombinedSprintReport().catch(console.error);
