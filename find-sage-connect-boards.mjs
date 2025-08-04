#!/usr/bin/env node

/**
 * Quick lookup: Sage Connect board IDs
 */

import dotenv from 'dotenv';
dotenv.config();

async function findSageConnectBoards() {
  try {
    // Import the modules
    const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
    const { BoardLookup } = await import('./dist/utils/BoardMappings.js');
    
    console.log('🔍 Searching for "Sage Connect" boards...\n');
    
    // Method 1: Using factory search
    const factory = new MCPToolFactory();
    const searchResults = factory.searchBoards('Sage Connect');
    
    console.log('📋 Found boards:');
    searchResults.forEach(board => {
      if (board.name.includes('Sage Connect')) {
        console.log(`  • ${board.name}`);
        console.log(`    Board ID: ${board.id}`);
        console.log(`    Type: ${board.type}`);
        console.log();
      }
    });
    
    // Method 2: Using MCP Tool
    const tool = factory.getTool('list_all_jira_boards');
    if (tool) {
      const result = await tool.execute({ 
        useStatic: true, 
        searchTerm: 'Sage Connect',
        format: 'detailed'
      });
      
      console.log('🔧 MCP Tool Result:');
      console.log(result.content[0].text);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findSageConnectBoards();
