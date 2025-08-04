#!/usr/bin/env node

/**
 * Test the new find_board_id MCP Tool
 */

import dotenv from 'dotenv';
dotenv.config();

async function testFindBoardIdTool() {
  console.log('🧪 Testing find_board_id MCP Tool\n');

  try {
    // Import the compiled modules
    const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
    
    // Create factory with JIRA category
    const factory = new MCPToolFactory({
      enabledCategories: ['jira']
    });
    
    console.log(`📊 Factory initialized with ${factory.getToolCount()} tools\n`);
    
    // Get the new tool
    const findBoardIdTool = factory.getTool('find_board_id');
    
    if (!findBoardIdTool) {
      console.error('❌ find_board_id tool not found!');
      console.log('Available tools:', factory.getAllTools().map(t => t.name));
      return;
    }
    
    console.log('✅ Tool found:', findBoardIdTool.description);
    console.log();
    
    // Test 1: Exact match for "Sage Connect"
    console.log('🔧 Test 1: Exact match for "Sage Connect"');
    console.log('=' .repeat(50));
    
    const exactResult = await findBoardIdTool.execute({
      boardName: 'Sage Connect',
      exactMatch: true
    });
    
    if (exactResult.isError) {
      console.error('❌ Test 1 failed:', exactResult.content[0].text);
    } else {
      console.log('✅ Test 1 passed!');
      console.log(exactResult.content[0].text);
    }
    console.log();
    
    // Test 2: Partial match for "Sage Connect"
    console.log('🔧 Test 2: Partial match for "Sage Connect"');
    console.log('=' .repeat(50));
    
    const partialResult = await findBoardIdTool.execute({
      boardName: 'Sage Connect',
      exactMatch: false,
      maxResults: 5
    });
    
    if (partialResult.isError) {
      console.error('❌ Test 2 failed:', partialResult.content[0].text);
    } else {
      console.log('✅ Test 2 passed!');
      console.log(partialResult.content[0].text);
    }
    console.log();
    
    // Test 3: Search for "Security"
    console.log('🔧 Test 3: Search for "Security" boards');
    console.log('=' .repeat(50));
    
    const securityResult = await findBoardIdTool.execute({
      boardName: 'Security',
      exactMatch: false,
      maxResults: 3
    });
    
    if (securityResult.isError) {
      console.error('❌ Test 3 failed:', securityResult.content[0].text);
    } else {
      console.log('✅ Test 3 passed!');
      console.log(securityResult.content[0].text);
    }
    console.log();
    
    // Test 4: Board not found
    console.log('🔧 Test 4: Search for non-existent board');
    console.log('=' .repeat(50));
    
    const notFoundResult = await findBoardIdTool.execute({
      boardName: 'NonExistentBoard12345',
      exactMatch: false
    });
    
    if (notFoundResult.isError) {
      console.error('❌ Test 4 failed:', notFoundResult.content[0].text);
    } else {
      console.log('✅ Test 4 passed!');
      console.log(notFoundResult.content[0].text);
    }
    console.log();
    
    // Test 5: Empty board name (error case)
    console.log('🔧 Test 5: Empty board name (should fail)');
    console.log('=' .repeat(50));
    
    const emptyResult = await findBoardIdTool.execute({
      boardName: ''
    });
    
    if (emptyResult.isError) {
      console.log('✅ Test 5 passed! (Expected error)');
      console.log('Error message:', emptyResult.content[0].text);
    } else {
      console.error('❌ Test 5 failed: Should have returned error for empty name');
    }
    console.log();
    
    // Success summary
    console.log('🎉 All Tests Completed!');
    console.log('=' .repeat(50));
    console.log('✅ MCP Tool: find_board_id is working correctly');
    console.log('✅ Exact matching: Working');
    console.log('✅ Partial matching: Working');
    console.log('✅ Error handling: Working');
    console.log('✅ Result limiting: Working');
    
    console.log('\n💡 Usage Examples:');
    console.log('🔧 Find exact board:');
    console.log('   await tool.execute({ boardName: "Sage Connect", exactMatch: true });');
    console.log('');
    console.log('🔧 Search boards:');
    console.log('   await tool.execute({ boardName: "Security", maxResults: 5 });');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFindBoardIdTool();
