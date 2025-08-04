#!/usr/bin/env node

/**
 * Demo: Find Sage Connect Board ID using the new MCP Tool
 */

import dotenv from 'dotenv';
dotenv.config();

async function findSageConnectBoard() {
  console.log('🎯 Finding Sage Connect Board ID using MCP Tool\n');

  try {
    // Import the tool factory
    const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
    
    // Create factory
    const factory = new MCPToolFactory({
      enabledCategories: ['jira']
    });
    
    // Get the find_board_id tool
    const tool = factory.getTool('find_board_id');
    
    if (!tool) {
      console.error('❌ find_board_id tool not found!');
      return;
    }
    
    console.log('✅ Using MCP Tool:', tool.description);
    console.log();
    
    // Find "Sage Connect" board
    console.log('🔍 Searching for "Sage Connect" board...');
    
    const result = await tool.execute({
      boardName: 'Sage Connect',
      exactMatch: false  // This will find all boards containing "Sage Connect"
    });
    
    if (result.isError) {
      console.error('❌ Search failed:', result.content[0].text);
    } else {
      console.log('✅ Search completed successfully!\n');
      console.log(result.content[0].text);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findSageConnectBoard();
