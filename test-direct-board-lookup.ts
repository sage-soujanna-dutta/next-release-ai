#!/usr/bin/env npx tsx

/**
 * Test: Direct Board ID Lookup
 */

import { MCPToolFactory } from './src/core/MCPToolFactory.js';

async function testDirectBoardLookup() {
    console.log("🎯 Testing direct board ID lookup...");
    
    try {
        const toolFactory = new MCPToolFactory();
        const tool = toolFactory.getTool('find_board_by_project');
        
        if (!tool) {
            throw new Error('Board finder tool not found');
        }

        // Test with board ID 5465
        console.log("Testing with board ID 5465...");
        const result = await tool.execute({
            boardId: 5465
        });

        console.log("📋 RESULT:");
        console.log(result.content[0].text);
        
    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

testDirectBoardLookup();
