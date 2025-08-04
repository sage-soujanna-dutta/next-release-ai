#!/usr/bin/env node

// Direct test of the list_all_jira_boards tool
import dotenv from 'dotenv';
dotenv.config();

try {
  // Import the tool factory
  const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
  
  console.log('🚀 Testing list_all_jira_boards tool directly...');
  
  // Create factory with JIRA category
  const factory = new MCPToolFactory({
    enabledCategories: ['jira']
  });
  
  // Get the specific tool
  const tool = factory.getTool('list_all_jira_boards');
  
  if (!tool) {
    console.error('❌ Tool not found!');
    console.log('Available tools:', factory.getAllTools().map(t => t.name));
    process.exit(1);
  }
  
  console.log('✅ Tool found:', tool.description);
  console.log('🔧 Executing tool with summary format...');
  
  // Execute the tool
  const result = await tool.execute({ format: 'summary' });
  
  if (result.isError) {
    console.error('❌ Tool execution failed:', result.content[0].text);
  } else {
    console.log('✅ Tool executed successfully!');
    console.log('📋 Result:');
    console.log(result.content[0].text);
  }
  
} catch (error) {
  console.error('💥 Error:', error.message);
  console.error(error.stack);
}
