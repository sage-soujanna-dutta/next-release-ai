#!/usr/bin/env npx tsx

/**
 * Debug script to identify the exact location of the .map() error
 * in the comprehensive sprint report generation
 */

import { ServiceRegistry } from './src/core/ServiceRegistry.js';
import { ReleaseToolsFactory } from './src/core/factories/ReleaseToolsFactory.js';

async function debugComprehensiveSprintReport() {
  try {
    console.log('🔧 Initializing services...');
    
    // Initialize services
    const services = new ServiceRegistry();
    await services.initializeServices();
    
    // Create tools factory
    const factory = new ReleaseToolsFactory(services);
    const tools = factory.createTools();
    
    // Find the comprehensive sprint report tool
    const comprehensiveSprintTool = tools.find(
      tool => tool.name === 'generate_comprehensive_sprint_report'
    );
    
    if (!comprehensiveSprintTool) {
      throw new Error('Comprehensive sprint report tool not found');
    }
    
    console.log('🔍 Fetching sprint data first...');
    
    // First, let's test just the data fetching part
    const enhancedJiraService = services.get('enhancedJiraService');
    const sprintData = await enhancedJiraService.getSprintMetrics('SCNT-2025-22');
    
    console.log('📊 Sprint data structure:');
    console.log('- sprintData keys:', Object.keys(sprintData || {}));
    console.log('- issues:', sprintData?.issues?.length || 'undefined');
    console.log('- priorityData:', sprintData?.priorityData ? 'exists' : 'undefined');
    console.log('- topContributors:', sprintData?.topContributors?.length || 'undefined');
    console.log('- workBreakdown:', sprintData?.workBreakdown ? 'exists' : 'undefined');
    
    if (sprintData?.priorityData) {
      console.log('- priorityData keys:', Object.keys(sprintData.priorityData));
    }
    
    if (sprintData?.topContributors) {
      console.log('- topContributors[0]:', sprintData.topContributors[0]);
    }
    
    console.log('🧪 Testing HTML generation...');
    
    // Test HTML generation directly
    const { SprintReportHTMLGenerator } = await import('./src/generators/HTMLReportGenerator.js');
    const htmlGenerator = new SprintReportHTMLGenerator();
    
    try {
      const htmlContent = htmlGenerator.generateHTML(sprintData);
      console.log('✅ HTML generation successful');
    } catch (htmlError: any) {
      console.error('❌ HTML generation failed:', htmlError.message);
      console.error('Stack:', htmlError.stack);
      return;
    }
    
    console.log('🎯 Testing full comprehensive report tool...');
    
    // Now test the full tool
    const result = await comprehensiveSprintTool.execute({
      sprintNumber: 'SCNT-2025-22',
      formats: ['html'],
      sendToTeams: false
    });
    
    console.log('✅ Result:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.error('❌ Error:', result.error);
    } else {
      console.log('📄 Content:', result.content);
    }
    
  } catch (error: any) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the debug script
debugComprehensiveSprintReport();
