#!/usr/bin/env npx tsx

/**
 * Quick Test: Board-Based Release Notes MCP Tool
 * 
 * This script provides a simple interface to test the new MCP tool
 * with different board IDs and sprint numbers.
 */

import { MCPToolFactory } from './src/core/MCPToolFactory.js';

async function generateReleaseNotes(boardId: number, sprintNumber: string, format: 'html' | 'markdown' = 'markdown') {
    console.log(`🚀 Generating release notes for Board ${boardId}, Sprint ${sprintNumber}`);
    console.log("=" .repeat(60));

    try {
        // Get the MCP tool
        const toolFactory = new MCPToolFactory();
        const tool = toolFactory.getTool('generate_board_based_release_notes');
        
        if (!tool) {
            throw new Error('Board-based release notes tool not found');
        }

        // Execute the tool
        const startTime = Date.now();
        const result = await tool.execute({
            boardId,
            sprintNumber,
            format,
            outputDirectory: './output',
            includeTeamsNotification: false
        });

        const duration = Date.now() - startTime;
        
        console.log("📋 RESULT:");
        console.log(result.content[0].text);
        console.log();
        console.log(`⏱️ Total execution time: ${duration}ms`);
        
        return result;
    } catch (error: any) {
        console.error("❌ Error:", error.message);
        return null;
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log("📖 Usage: npx tsx test-board-release-notes.ts <boardId> <sprintNumber> [format]");
        console.log();
        console.log("Examples:");
        console.log("  npx tsx test-board-release-notes.ts 5465 FY25-21");
        console.log("  npx tsx test-board-release-notes.ts 5465 FY25-21 html");
        console.log("  npx tsx test-board-release-notes.ts 1234 SCNT-2025-22 markdown");
        console.log();
        console.log("Known working examples:");
        console.log("  📋 NDS Board: npx tsx test-board-release-notes.ts 5465 FY25-21");
        return;
    }

    const boardId = parseInt(args[0]);
    const sprintNumber = args[1];
    const format = (args[2] as 'html' | 'markdown') || 'markdown';

    if (isNaN(boardId)) {
        console.error("❌ Board ID must be a number");
        return;
    }

    await generateReleaseNotes(boardId, sprintNumber, format);
}

// Auto-execute if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { generateReleaseNotes };
