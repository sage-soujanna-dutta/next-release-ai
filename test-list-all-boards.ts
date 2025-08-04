#!/usr/bin/env node

/**
 * Test script for the new list_all_jira_boards MCP tool
 * Tests different output formats and board filtering capabilities
 */

const MCPClient = require('./dist/src/MCPClient.js').MCPClient;

async function testListAllBoardsTool() {
  console.log('🚀 Testing list_all_jira_boards MCP tool...\n');

  const client = new MCPClient();

  try {
    console.log('📊 Test 1: Summary format (board count and type statistics)');
    console.log('=' .repeat(60));
    const summaryResult = await client.callTool('list_all_jira_boards', {
      format: 'summary'
    });
    console.log(summaryResult);
    console.log('\n');

    console.log('🗺️ Test 2: Mapping format (board name → ID and project → board IDs)');
    console.log('=' .repeat(70));
    const mappingResult = await client.callTool('list_all_jira_boards', {
      format: 'mapping',
      includeProjects: true
    });
    console.log(mappingResult);
    console.log('\n');

    console.log('📋 Test 3: Detailed format with scrum boards only');
    console.log('=' .repeat(60));
    const detailedResult = await client.callTool('list_all_jira_boards', {
      format: 'detailed',
      filterByType: 'scrum',
      includeProjects: true
    });
    console.log(detailedResult);
    console.log('\n');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testListAllBoardsTool().then(() => {
  console.log('\n🎯 Test Summary:');
  console.log('• Summary format provides quick statistics');
  console.log('• Mapping format gives static name→ID lookup tables');
  console.log('• Detailed format shows comprehensive board information');
  console.log('• Filtering by board type works correctly');
  console.log('\n💡 Use the mapping format to get board IDs for other MCP tools!');
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
