#!/usr/bin/env npx tsx

/**
 * Demo: Find JIRA Board by Project Name
 * 
 * This script demonstrates how to use the new MCP tool for finding
 * JIRA board IDs based on project names or keys.
 */

import { MCPToolFactory } from './src/core/MCPToolFactory.js';

async function findBoardByProject(projectName: string, exactMatch: boolean = false) {
    console.log(`🔍 Finding boards for project: "${projectName}"`);
    console.log("=" .repeat(60));

    try {
        // Get the MCP tool
        const toolFactory = new MCPToolFactory();
        const tool = toolFactory.getTool('find_board_by_project');
        
        if (!tool) {
            throw new Error('Board finder tool not found');
        }

        // Execute the tool
        const startTime = Date.now();
        const result = await tool.execute({
            projectName,
            exactMatch,
            includeInactive: false
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

async function findBoardByProjectKey(projectKey: string) {
    console.log(`🔍 Finding boards for project key: "${projectKey}"`);
    console.log("=" .repeat(60));

    try {
        // Get the MCP tool
        const toolFactory = new MCPToolFactory();
        const tool = toolFactory.getTool('find_board_by_project');
        
        if (!tool) {
            throw new Error('Board finder tool not found');
        }

        // Execute the tool
        const startTime = Date.now();
        const result = await tool.execute({
            projectKey,
            exactMatch: true
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
    
    if (args.length < 1) {
        console.log("📖 Usage:");
        console.log("  npx tsx demo-find-board-by-project.ts <projectName|projectKey> [exact]");
        console.log();
        console.log("Examples:");
        console.log("  npx tsx demo-find-board-by-project.ts \"Network Directory Service\"");
        console.log("  npx tsx demo-find-board-by-project.ts \"Network\" false");
        console.log("  npx tsx demo-find-board-by-project.ts \"NDS\" true");
        console.log("  npx tsx demo-find-board-by-project.ts \"SCNT\"");
        console.log();
        
        // Run some demo searches
        console.log("🚀 Running demo searches...\n");
        
        await findBoardByProject("Network Directory Service", false);
        console.log("\n" + "=".repeat(80) + "\n");
        
        await findBoardByProjectKey("NDS");
        console.log("\n" + "=".repeat(80) + "\n");
        
        await findBoardByProject("Network", false);
        return;
    }

    const searchTerm = args[0];
    const exactMatch = args[1] === 'true';

    // Determine if it's likely a project key (short, uppercase) or project name
    if (searchTerm.length <= 5 && searchTerm.toUpperCase() === searchTerm) {
        await findBoardByProjectKey(searchTerm);
    } else {
        await findBoardByProject(searchTerm, exactMatch);
    }
}

// Auto-execute if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { findBoardByProject, findBoardByProjectKey };
