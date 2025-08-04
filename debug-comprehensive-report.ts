#!/usr/bin/env tsx

/**
 * Debug script to test comprehensive sprint report generation
 * This will help identify the source of the .map() error
 */

import { config } from 'dotenv';
import { MCPToolFactory } from './src/core/MCPToolFactory.js';

config();

async function debugComprehensiveReport() {
  console.log('🔍 Starting comprehensive sprint report debug...');
  
  try {
    const factory = new MCPToolFactory({
      enabledCategories: ['release', 'analysis', 'integration', 'jira']
    });
    
    const tool = factory.getTool('generate_comprehensive_sprint_report');
    
    if (!tool) {
      console.error('❌ Tool not found!');
      return;
    }
    
    console.log('✅ Tool found, executing with debug parameters...');
    
    const args = {
      sprintNumber: 'SCNT-2025-22',
      formats: ['html'],
      sendToTeams: false, // Disable Teams to focus on the core issue
      reportConfig: {
        includeCharts: true,
        includeMetrics: true,
        theme: 'professional'
      }
    };
    
    console.log('📋 Args:', JSON.stringify(args, null, 2));
    
    const result = await tool.execute(args);
    
    console.log('✅ Tool execution completed');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error: any) {
    console.error('❌ Debug error:', error.message);
    console.error('📊 Stack trace:', error.stack);
    
    // Check if it's the .map() error
    if (error.message.includes("Cannot read properties of undefined (reading 'map')")) {
      console.error('🎯 This is the .map() error we\'re looking for!');
      console.error('💡 The error suggests that some array property is undefined when .map() is called');
    }
  }
}

// Run the debug
debugComprehensiveReport().then(() => {
  console.log('🏁 Debug completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});
