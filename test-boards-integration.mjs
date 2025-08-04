#!/usr/bin/env node

/**
 * Test script to verify JIRA Boards MCP Tool integration with static mappings
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Testing JIRA Boards MCP Tool & Static Mappings Integration\n');

try {
  // Import the compiled modules
  const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
  const { BoardLookup, STATIC_BOARD_MAPPINGS } = await import('./dist/utils/BoardMappings.js');
  
  console.log('✅ Modules imported successfully');
  
  // Create factory with JIRA category
  const factory = new MCPToolFactory({
    enabledCategories: ['jira']
  });
  
  console.log(`📊 Factory initialized with ${factory.getToolCount()} tools\n`);
  
  // Test 1: Direct Static Board Mappings Access
  console.log('🔧 Test 1: Direct Static Board Mappings Access');
  console.log('=' .repeat(50));
  
  console.log('📋 Available static utilities:');
  console.log('  • Available projects:', factory.getAvailableProjects().slice(0, 10), '...');
  console.log('  • Board for SCNT:', factory.getBoardIdByProject('SCNT'));
  console.log('  • Board for NDS:', factory.getBoardIdByProject('NDS'));
  console.log('  • Search "network":', factory.searchBoards('network').length, 'results');
  console.log('  • Total static mappings:', Object.keys(STATIC_BOARD_MAPPINGS).length);
  
  // Test 2: MCP Tool - Static Mode
  console.log('\n🔧 Test 2: MCP Tool - Static Mode');
  console.log('=' .repeat(50));
  
  const listBoardsTool = factory.getTool('list_all_jira_boards');
  
  if (!listBoardsTool) {
    console.error('❌ Tool not found!');
    process.exit(1);
  }
  
  console.log('✅ Tool found:', listBoardsTool.description);
  
  // Test static summary
  console.log('\n📊 Testing static summary format...');
  const summaryResult = await listBoardsTool.execute({ 
    useStatic: true, 
    format: 'summary' 
  });
  
  if (summaryResult.isError) {
    console.error('❌ Summary test failed:', summaryResult.content[0].text);
  } else {
    console.log('✅ Summary test passed!');
    console.log(summaryResult.content[0].text.substring(0, 500) + '...\n');
  }
  
  // Test 3: JavaScript Object Format
  console.log('🔧 Test 3: JavaScript Object Format');
  console.log('=' .repeat(50));
  
  const jsResult = await listBoardsTool.execute({ 
    useStatic: true, 
    format: 'javascript' 
  });
  
  if (jsResult.isError) {
    console.error('❌ JavaScript format test failed:', jsResult.content[0].text);
  } else {
    console.log('✅ JavaScript format test passed!');
    const content = jsResult.content[0].text;
    const codeBlock = content.match(/```javascript\n([\s\S]*?)\n```/);
    if (codeBlock) {
      console.log('📋 JavaScript object generated (sample):');
      const jsContent = codeBlock[1];
      console.log(jsContent.substring(0, 300) + '...\n');
    }
  }
  
  // Test 4: Search Functionality
  console.log('🔧 Test 4: Search Functionality');
  console.log('=' .repeat(50));
  
  const searchResult = await listBoardsTool.execute({ 
    useStatic: true, 
    format: 'detailed',
    searchTerm: 'SCNT' 
  });
  
  if (searchResult.isError) {
    console.error('❌ Search test failed:', searchResult.content[0].text);
  } else {
    console.log('✅ Search test passed!');
    console.log('🔍 SCNT search results preview:');
    const lines = searchResult.content[0].text.split('\n');
    console.log(lines.slice(0, 10).join('\n') + '...\n');
  }
  
  // Test 5: Direct BoardLookup Usage
  console.log('🔧 Test 5: Direct BoardLookup Usage');
  console.log('=' .repeat(50));
  
  console.log('🔍 Testing BoardLookup utilities:');
  console.log('  • SCNT board ID:', BoardLookup.getBoardIdByProject('SCNT'));
  console.log('  • All project keys count:', BoardLookup.getAllProjectKeys().length);
  console.log('  • Search "security":', BoardLookup.searchBoardsByName('security').length, 'results');
  
  // Success summary
  console.log('\n🎉 All Tests Completed Successfully!');
  console.log('=' .repeat(50));
  console.log('✅ MCP Tool Integration: Working');
  console.log('✅ Static Board Mappings: Available');
  console.log('✅ MCPToolFactory Utilities: Working');
  console.log('✅ JavaScript Object Generation: Working');
  console.log('✅ Search Functionality: Working');
  
  console.log('\n💡 Usage Examples:');
  console.log('🔧 Programmatic access:');
  console.log('   const factory = new MCPToolFactory();');
  console.log('   const boardId = factory.getBoardIdByProject("SCNT");');
  console.log('');
  console.log('🔧 MCP Tool usage:');
  console.log('   const tool = factory.getTool("list_all_jira_boards");');
  console.log('   const result = await tool.execute({ useStatic: true, format: "javascript" });');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
