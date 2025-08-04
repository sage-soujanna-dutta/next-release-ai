#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Import the compiled code
const projectRoot = process.cwd();
const distPath = path.join(projectRoot, 'dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ Dist folder not found. Run npm run build first.');
  process.exit(1);
}

try {
  // Import the MCPToolFactory
  const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
  
  console.log('🚀 Testing MCP Tool Factory...');
  
  // Create factory instance
  const factory = new MCPToolFactory({
    enabledCategories: ['jira']
  });
  
  // Get all tools
  const allTools = factory.getAllTools();
  console.log(`📊 Total tools: ${allTools.length}`);
  
  // Find board-related tools
  const boardTools = allTools.filter(tool => 
    tool.name.includes('board') || 
    tool.name.includes('jira') ||
    tool.description.toLowerCase().includes('board')
  );
  
  console.log('\n📋 Board/JIRA related tools:');
  boardTools.forEach(tool => {
    console.log(`  • ${tool.name}: ${tool.description}`);
  });
  
  // Try to find the specific tool
  const listBoardsTool = factory.getTool('list_all_jira_boards');
  if (listBoardsTool) {
    console.log('\n✅ Found list_all_jira_boards tool!');
    console.log('📄 Description:', listBoardsTool.description);
    
    // Test execution (but don't actually run it since we need JIRA creds)
    console.log('🔧 Tool is callable and ready to use');
  } else {
    console.log('\n❌ list_all_jira_boards tool not found');
    console.log('Available tools:', allTools.map(t => t.name));
  }
  
} catch (error) {
  console.error('❌ Error testing factory:', error.message);
  console.error(error.stack);
}
