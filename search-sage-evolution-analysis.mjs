#!/usr/bin/env node

/**
 * Find "Sage Evolution Analysis Board" board ID using MCP Tool
 * Testing both exact and partial matching
 */

import dotenv from 'dotenv';
dotenv.config();

async function findSageEvolutionAnalysisBoard() {
  console.log('🔍 Finding "Sage Evolution Analysis Board" Board ID\n');

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
    
    console.log('✅ Using MCP Tool: find_board_id');
    console.log('📝 Description:', tool.description);
    console.log();
    
    // Method 1: Exact matching
    console.log('🎯 Method 1: Exact Match Search');
    console.log('=' .repeat(50));
    console.log('🔍 Searching for: "Sage Evolution Analysis Board"');
    
    const exactResult = await tool.execute({
      boardName: 'Sage Evolution Analysis Board',
      exactMatch: true
    });
    
    if (exactResult.isError) {
      console.log('❌ Exact match failed:', exactResult.content[0].text);
    } else {
      console.log('✅ Exact match successful!');
      console.log(exactResult.content[0].text);
    }
    
    console.log('\n' + '=' .repeat(70) + '\n');
    
    // Method 2: Partial matching
    console.log('🔍 Method 2: Partial Match Search');
    console.log('=' .repeat(50));
    console.log('🔍 Searching for: "Sage Evolution Analysis Board" (partial)');
    
    const partialResult = await tool.execute({
      boardName: 'Sage Evolution Analysis Board',
      exactMatch: false,
      maxResults: 5
    });
    
    if (partialResult.isError) {
      console.log('❌ Partial match failed:', partialResult.content[0].text);
    } else {
      console.log('✅ Partial match successful!');
      console.log(partialResult.content[0].text);
    }
    
    console.log('\n' + '=' .repeat(70) + '\n');
    
    // Method 3: Broader search with "Sage Evolution"
    console.log('🔍 Method 3: Broader Search - "Sage Evolution"');
    console.log('=' .repeat(50));
    
    const broaderResult = await tool.execute({
      boardName: 'Sage Evolution',
      exactMatch: false,
      maxResults: 10
    });
    
    if (broaderResult.isError) {
      console.log('❌ Broader search failed:', broaderResult.content[0].text);
    } else {
      console.log('✅ Broader search successful!');
      console.log(broaderResult.content[0].text);
    }
    
    console.log('\n🎉 Search Complete!');
    console.log('📋 Summary: Use any of the above methods to find board IDs');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

findSageEvolutionAnalysisBoard();
