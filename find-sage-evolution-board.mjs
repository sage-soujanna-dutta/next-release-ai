#!/usr/bin/env node

/**
 * Find "Sage Evolution Analysis Board" using MCP Tool
 */

import dotenv from 'dotenv';
dotenv.config();

async function findSageEvolutionBoard() {
  console.log('🔍 Finding "Sage Evolution Analysis Board" using MCP Tool\n');

  try {
    // Import the tool factory
    const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
    
    // Create factory with JIRA category
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
    
    // Search for "Sage Evolution Analysis Board" - exact match first
    console.log('🎯 Searching for exact match: "Sage Evolution Analysis Board"');
    console.log('=' .repeat(60));
    
    const exactResult = await tool.execute({
      boardName: 'Sage Evolution Analysis Board',
      exactMatch: true
    });
    
    if (exactResult.isError) {
      console.log('⚠️ Exact match failed, trying partial match...\n');
    } else {
      console.log('✅ Exact match found!');
      console.log(exactResult.content[0].text);
      return; // Found exact match, we're done
    }
    
    // If exact match fails, try partial match with "Sage Evolution"
    console.log('🔍 Searching for partial match: "Sage Evolution"');
    console.log('=' .repeat(60));
    
    const partialResult = await tool.execute({
      boardName: 'Sage Evolution',
      exactMatch: false,
      maxResults: 10
    });
    
    if (partialResult.isError) {
      console.log('❌ Partial search failed:', partialResult.content[0].text);
    } else {
      console.log('✅ Partial search completed!');
      console.log(partialResult.content[0].text);
    }
    
    // Also try searching just "Evolution Analysis"
    console.log('\n🔍 Alternative search: "Evolution Analysis"');
    console.log('=' .repeat(60));
    
    const altResult = await tool.execute({
      boardName: 'Evolution Analysis',
      exactMatch: false,
      maxResults: 5
    });
    
    if (altResult.isError) {
      console.log('❌ Alternative search failed:', altResult.content[0].text);
    } else {
      console.log('✅ Alternative search completed!');
      console.log(altResult.content[0].text);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

findSageEvolutionBoard();
