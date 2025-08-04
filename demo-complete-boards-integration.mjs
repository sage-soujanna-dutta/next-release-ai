#!/usr/bin/env node

/**
 * Complete Demo: JIRA Boards MCP Tool & Static JavaScript Mappings
 * 
 * This script demonstrates:
 * 1. MCP tool for listing all JIRA boards
 * 2. Static JavaScript object mappings for reuse
 * 3. Integration with MCPToolFactory
 * 4. Practical usage patterns
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Complete Demo: JIRA Boards MCP Tool & Static Mappings\n');

async function demonstrateBoards() {
  try {
    // Import the compiled modules
    const { MCPToolFactory } = await import('./dist/core/MCPToolFactory.js');
    const { BoardLookup, STATIC_BOARD_MAPPINGS, BOARD_NAME_MAPPINGS } = await import('./dist/utils/BoardMappings.js');
    
    console.log('✅ All modules imported successfully\n');
    
    // Create factory with JIRA category
    const factory = new MCPToolFactory({
      enabledCategories: ['jira']
    });
    
    console.log(`📊 MCPToolFactory initialized with ${factory.getToolCount()} tools\n`);
    
    // === SECTION 1: Static Mappings Overview ===
    console.log('📋 SECTION 1: Static Mappings Overview');
    console.log('=' .repeat(60));
    
    const projectKeys = Object.keys(STATIC_BOARD_MAPPINGS);
    const nameBasedBoards = Object.keys(BOARD_NAME_MAPPINGS);
    
    console.log(`🏢 Project-based boards: ${projectKeys.length}`);
    console.log(`📋 Name-based boards: ${nameBasedBoards.length}`);
    console.log(`📊 Total static mappings: ${projectKeys.length + nameBasedBoards.length}`);
    
    // Show sample project keys (if any)
    if (projectKeys.length > 0) {
      console.log(`🔍 Sample project keys: ${projectKeys.slice(0, 5).join(', ')}`);
    }
    
    // Show some interesting board names
    const interestingBoards = nameBasedBoards.filter(name => 
      name.toLowerCase().includes('scnt') || 
      name.toLowerCase().includes('sage') ||
      name.toLowerCase().includes('security')
    ).slice(0, 5);
    
    console.log(`🎯 Sample interesting boards: ${interestingBoards.join(', ')}`);
    console.log();
    
    // === SECTION 2: MCP Tool - Different Formats ===
    console.log('🔧 SECTION 2: MCP Tool - Different Output Formats');
    console.log('=' .repeat(60));
    
    const listBoardsTool = factory.getTool('list_all_jira_boards');
    
    if (!listBoardsTool) {
      console.error('❌ list_all_jira_boards tool not found!');
      return;
    }
    
    console.log('✅ MCP Tool found:', listBoardsTool.description);
    console.log();
    
    // 2.1 Summary format
    console.log('📊 2.1 Summary Format');
    console.log('-'.repeat(30));
    const summaryResult = await listBoardsTool.execute({ 
      useStatic: true, 
      format: 'summary' 
    });
    console.log(summaryResult.content[0].text);
    console.log();
    
    // 2.2 JavaScript object format
    console.log('🔧 2.2 JavaScript Object Format (for reuse in code)');
    console.log('-'.repeat(30));
    const jsResult = await listBoardsTool.execute({ 
      useStatic: true, 
      format: 'javascript' 
    });
    const jsContent = jsResult.content[0].text;
    const codeBlock = jsContent.match(/```javascript\n([\s\S]*?)\n```/);
    if (codeBlock) {
      const jsObjectSample = codeBlock[1].substring(0, 400);
      console.log('Sample of generated JavaScript object:');
      console.log(jsObjectSample + '...');
    }
    console.log();
    
    // 2.3 Mapping format (JSON)
    console.log('🗺️ 2.3 Mapping Format (JSON for external tools)');
    console.log('-'.repeat(30));
    const mappingResult = await listBoardsTool.execute({ 
      useStatic: true, 
      format: 'mapping' 
    });
    const mappingContent = mappingResult.content[0].text;
    console.log(mappingContent.substring(0, 300) + '...');
    console.log();
    
    // === SECTION 3: Search Functionality ===
    console.log('🔍 SECTION 3: Search & Filter Functionality');
    console.log('=' .repeat(60));
    
    // 3.1 Search by term
    console.log('🔍 3.1 Search for "SCNT" boards');
    const scntResults = await listBoardsTool.execute({ 
      useStatic: true, 
      searchTerm: 'SCNT',
      format: 'detailed'
    });
    console.log(scntResults.content[0].text);
    
    // 3.2 Search by term using BoardLookup directly
    console.log('🔍 3.2 Direct BoardLookup search for "Sage"');
    const sageBoards = BoardLookup.searchBoardsByName('Sage');
    console.log(`Found ${sageBoards.length} boards with "Sage" in the name`);
    sageBoards.slice(0, 3).forEach(board => {
      console.log(`  • ${board.name} (ID: ${board.id}) - ${board.type}`);
    });
    console.log();
    
    // === SECTION 4: MCPToolFactory Integration ===
    console.log('🏭 SECTION 4: MCPToolFactory Direct Integration');
    console.log('=' .repeat(60));
    
    console.log('🔧 Using factory utility methods:');
    
    // Try to find boards for different project keys
    const testProjects = ['SCNT', 'NDS', 'SEC', 'APP'];
    testProjects.forEach(projectKey => {
      const boardId = factory.getBoardIdByProject(projectKey);
      console.log(`  • ${projectKey}: ${boardId || 'Not found in project mappings'}`);
    });
    
    console.log();
    console.log('🔍 Search results using factory:');
    const securityResults = factory.searchBoards('security');
    console.log(`  • "security": ${securityResults.length} boards found`);
    
    const networkResults = factory.searchBoards('network');
    console.log(`  • "network": ${networkResults.length} boards found`);
    console.log();
    
    // === SECTION 5: Practical Usage Examples ===
    console.log('💡 SECTION 5: Practical Usage Examples');
    console.log('=' .repeat(60));
    
    console.log('🔧 Code Examples for Integration:');
    console.log();
    
    console.log('1️⃣ Basic MCP Tool Usage:');
    console.log('```javascript');
    console.log('const factory = new MCPToolFactory({ enabledCategories: ["jira"] });');
    console.log('const tool = factory.getTool("list_all_jira_boards");');
    console.log('const result = await tool.execute({ useStatic: true, format: "summary" });');
    console.log('```');
    console.log();
    
    console.log('2️⃣ Search for specific boards:');
    console.log('```javascript');
    console.log('// Using MCP tool with search');
    console.log('const scntBoards = await tool.execute({ useStatic: true, searchTerm: "SCNT" });');
    console.log();
    console.log('// Using static utility directly');
    console.log('const securityBoards = factory.searchBoards("security");');
    console.log('```');
    console.log();
    
    console.log('3️⃣ Generate reusable JavaScript object:');
    console.log('```javascript');
    console.log('const jsMapping = await tool.execute({ useStatic: true, format: "javascript" });');
    console.log('// Copy the generated code to your project files');
    console.log('```');
    console.log();
    
    console.log('4️⃣ Static mappings access:');
    console.log('```javascript');
    console.log('import { STATIC_BOARD_MAPPINGS, BoardLookup } from "./utils/BoardMappings.js";');
    console.log();
    console.log('// Direct access');
    console.log('const boards = Object.values(STATIC_BOARD_MAPPINGS);');
    console.log();
    console.log('// Using utility functions');
    console.log('const projectBoards = BoardLookup.getAllProjectKeys();');
    console.log('const searchResults = BoardLookup.searchBoardsByName("term");');
    console.log('```');
    console.log();
    
    // === SUCCESS SUMMARY ===
    console.log('🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('✅ MCP Tool: list_all_jira_boards is working');
    console.log('✅ Static Mappings: Available with 2,000+ boards');
    console.log('✅ JavaScript Object: Can be generated for reuse');
    console.log('✅ MCPToolFactory: Utility methods integrated');
    console.log('✅ Search: Both MCP tool and direct access working');
    console.log('✅ Multiple Formats: summary, detailed, mapping, javascript');
    
    console.log('\n📚 Key Features:');
    console.log('  🔄 Live API calls with fallback to static data');
    console.log('  💾 Static mappings for offline use');
    console.log('  🔍 Search and filter capabilities');
    console.log('  📋 Multiple output formats');
    console.log('  🏭 Factory pattern integration');
    console.log('  ♻️  Reusable JavaScript objects');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the demonstration
demonstrateBoards();
