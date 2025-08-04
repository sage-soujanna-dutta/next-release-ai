import { MCPToolFactory } from './dist/core/MCPToolFactory.js';

// Initialize tool factory
const factory = new MCPToolFactory({
  enabledCategories: ['jira']
});

// Get all tools
const allTools = factory.getAllTools();
console.log('All available tools:');
allTools.forEach(tool => {
  console.log(`- ${tool.name}: ${tool.description}`);
});

// Look specifically for list boards tool
const listBoardsTool = factory.getTool('list_all_jira_boards');
if (listBoardsTool) {
  console.log('\n✅ Found list_all_jira_boards tool!');
  console.log('Tool details:', {
    name: listBoardsTool.name,
    description: listBoardsTool.description,
    inputSchema: listBoardsTool.inputSchema
  });
} else {
  console.log('\n❌ list_all_jira_boards tool not found');
}

// Test execution
if (listBoardsTool) {
  console.log('\n🧪 Testing tool execution...');
  listBoardsTool.execute({ format: 'summary' })
    .then(result => {
      console.log('✅ Tool execution result:', result);
    })
    .catch(error => {
      console.error('❌ Tool execution error:', error.message);
    });
}
