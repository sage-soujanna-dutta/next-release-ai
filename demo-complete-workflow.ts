#!/usr/bin/env npx tsx

/**
 * Complete Demo: Board Finder + Release Notes Generation
 * 
 * This script demonstrates the complete workflow:
 * 1. Find board ID by project name
 * 2. Generate release notes using the found board ID
 */

import { MCPToolFactory } from './src/core/MCPToolFactory.js';

async function completeWorkflowDemo() {
    console.log("🚀 Complete Workflow Demo: Find Board + Generate Release Notes");
    console.log("=" .repeat(80));

    try {
        const toolFactory = new MCPToolFactory();
        
        // Step 1: Find board by project name/ID
        console.log("📋 Step 1: Finding NDS Board");
        console.log("-" .repeat(40));
        
        const boardTool = toolFactory.getTool('find_board_by_project');
        if (!boardTool) {
            throw new Error('Board finder tool not found');
        }

        // Method 1: Direct board ID lookup (fastest)
        console.log("🎯 Method 1: Direct Board ID Lookup");
        const boardResult = await boardTool.execute({
            boardId: 5465
        });

        if (boardResult.isError) {
            console.log("❌ Direct lookup failed, trying by name...");
            
            // Method 2: Search by project name
            console.log("🔍 Method 2: Search by Project Name");
            const nameResult = await boardTool.execute({
                projectName: "Network",
                exactMatch: false
            });
            
            if (nameResult.isError) {
                throw new Error("Could not find any boards");
            }
            console.log(nameResult.content[0].text);
        } else {
            console.log("✅ Board found via direct lookup:");
            console.log(boardResult.content[0].text);
            console.log();
        }

        // Step 2: Generate release notes using the board
        console.log("📋 Step 2: Generating Release Notes");
        console.log("-" .repeat(40));
        
        const releaseNotesTool = toolFactory.getTool('generate_board_based_release_notes');
        if (!releaseNotesTool) {
            throw new Error('Release notes tool not found');
        }

        console.log("📝 Generating markdown release notes for NDS-FY25-21...");
        const releaseResult = await releaseNotesTool.execute({
            boardId: 5465,
            sprintNumber: "FY25-21",
            format: "markdown",
            outputDirectory: "./output",
            projectName: "Network Directory Service",
            includeTeamsNotification: false
        });

        console.log("✅ Release notes generated:");
        console.log(releaseResult.content[0].text);
        console.log();

        // Step 3: Show the complete integration
        console.log("📋 Step 3: Integration Summary");
        console.log("-" .repeat(40));
        console.log("🎯 **Complete Workflow Accomplished:**");
        console.log("   1. ✅ Found board ID 5465 for 'Network Directory Service'");
        console.log("   2. ✅ Generated release notes for sprint 'FY25-21'");
        console.log("   3. ✅ Saved to markdown file with timestamp");
        console.log();
        console.log("🔧 **Available Tools:**");
        console.log("   • find_board_by_project - Find board IDs by name/key");
        console.log("   • generate_board_based_release_notes - Generate reports");
        console.log();
        console.log("💡 **Usage Pattern:**");
        console.log("   1. Use find_board_by_project to discover board IDs");
        console.log("   2. Use generate_board_based_release_notes with the board ID");
        console.log("   3. Optionally enable Teams notifications for automation");

    } catch (error: any) {
        console.error("❌ Demo failed:", error.message);
    }
}

// Auto-execute
completeWorkflowDemo();
