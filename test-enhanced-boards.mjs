#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Testing Enhanced JIRA Boards MCP Tool...\n');

try {
  // Import the tool factory
  const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
  const { BoardLookup } = await import('./dist/utils/BoardMappings.js');
  
  // Create factory with JIRA category
  const factory = new MCPToolFactory({
    enabledCategories: ['jira']
  });
  
  console.log('📋 Available static board utilities:');
  console.log('  • Available projects:', factory.getAvailableProjects());
  console.log('  • Board for SCNT:', factory.getBoardIdByProject('SCNT'));
  console.log('  • Board for NDS:', factory.getBoardIdByProject('NDS'));
  console.log('  • Search "network":', factory.searchBoards('network'));
  
  // Get the specific tool
  const tool = factory.getTool('list_all_jira_boards');
  
  if (!tool) {
    console.error('❌ Tool not found!');
    console.log('Available tools:', factory.getAllTools().map(t => t.name));
    process.exit(1);
  }
  
  console.log('\n✅ Tool found:', tool.description);
  
  // Test 1: Static data
  console.log('\n🔧 Test 1: Static board mappings...');
  const staticResult = await tool.execute({ 
    useStatic: true, 
    format: 'detailed' 
  });
  
  if (staticResult.isError) {
    console.error('❌ Static test failed:', staticResult.content[0].text);
  } else {
    console.log('✅ Static test passed!');
    console.log(staticResult.content[0].text.substring(0, 300) + '...');
  }
  
  // Test 2: JavaScript format
  console.log('\n🔧 Test 2: JavaScript object format...');
  const jsResult = await tool.execute({ 
    useStatic: true, 
    format: 'javascript' 
  });
  
  if (jsResult.isError) {
    console.error('❌ JavaScript test failed:', jsResult.content[0].text);
  } else {
    console.log('✅ JavaScript test passed!');
    console.log(jsResult.content[0].text.substring(0, 400) + '...');
  }
  
  // Test 3: Try live API (if credentials available)
  if (process.env.JIRA_DOMAIN && process.env.JIRA_TOKEN) {
    console.log('\n🔧 Test 3: Live API call...');
    const liveResult = await tool.execute({ 
      format: 'summary',
      updateStatic: true 
    });
    
    if (liveResult.isError) {
      console.error('❌ Live API test failed:', liveResult.content[0].text);
    } else {
      console.log('✅ Live API test passed!');
      console.log(liveResult.content[0].text);
    }
  } else {
    console.log('\n⚠️ Skipping live API test (no JIRA credentials)');
  }
  
  console.log('\n🎉 All tests completed successfully!');
  
} catch (error) {
  console.error('💥 Error:', error.message);
  console.error(error.stack);
}
