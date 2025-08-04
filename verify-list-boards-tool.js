#!/usr/bin/env node

/**
 * Simple test to verify the list_all_jira_boards tool is registered and working
 */

async function testListAllBoards() {
  console.log('🚀 Testing list_all_jira_boards MCP tool registration...\n');

  try {
    // Import the built server
    const { MCPToolFactory } = await import('./dist/index.js');
    
    // Create factory and get tools
    const factory = new MCPToolFactory({});
    const allTools = factory.getAllTools();
    
    // Check if our tool is registered
    const listBoardsTool = allTools.find(tool => tool.name === 'list_all_jira_boards');
    
    if (listBoardsTool) {
      console.log('✅ list_all_jira_boards tool found and registered!');
      console.log(`📋 Tool Name: ${listBoardsTool.name}`);
      console.log(`📝 Description: ${listBoardsTool.description}`);
      console.log(`🔧 Input Schema Properties: ${Object.keys(listBoardsTool.inputSchema.properties || {}).join(', ')}`);
    } else {
      console.log('❌ list_all_jira_boards tool NOT found in registered tools');
      console.log('📋 Available JIRA tools:');
      allTools.filter(tool => tool.name.includes('jira')).forEach(tool => {
        console.log(`  • ${tool.name}: ${tool.description}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testListAllBoards();
