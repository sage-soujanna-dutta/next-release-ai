#!/usr/bin/env npx tsx

/**
 * Demo: Board-Based Release Notes Generation
 * 
 * This script demonstrates how to use the new MCP tool for generating
 * release notes based on JIRA board ID and sprint number.
 * 
 * Features:
 * - Works with any JIRA board
 * - Supports both markdown and HTML output
 * - Includes comprehensive sprint statistics
 * - Optional Teams notifications
 * - Dynamic project name detection
 */

import { MCPToolFactory } from './src/core/MCPToolFactory.js';

async function demonstrateBoardBasedReleaseNotes() {
    console.log("🚀 Demo: Board-Based Release Notes Generation\n");

    try {
        // Initialize the MCP Tool Factory
        const toolFactory = new MCPToolFactory();

        // Get the board-based release notes tool
        const boardTool = toolFactory.getTool('generate_board_based_release_notes');

        if (!boardTool) {
            throw new Error("Board-based release notes tool not found!");
        }

        console.log("✅ Found MCP Tool:", boardTool.name);
        console.log("📝 Description:", boardTool.description);
        console.log();

        // Demo 1: Generate markdown report for NDS board
        console.log("📋 Demo 1: NDS Sprint Report (Markdown)");
        console.log("=" .repeat(50));
        
        const ndsResult = await boardTool.execute({
            boardId: 5465,
            sprintNumber: "FY25-21",
            format: "markdown",
            outputDirectory: "./output",
            projectName: "Network Directory Service",
            includeTeamsNotification: false
        });

        console.log("Result:", ndsResult.content[0].text);
        console.log();

        // Demo 2: Generate HTML report for SCNT board (if available)
        console.log("📋 Demo 2: SCNT Sprint Report (HTML)");
        console.log("=" .repeat(50));
        
        try {
            const scntResult = await boardTool.execute({
                boardId: 1234, // Example SCNT board ID (replace with actual)
                sprintNumber: "2025-22",
                format: "html",
                outputDirectory: "./output",
                includeTeamsNotification: false
            });

            console.log("Result:", scntResult.content[0].text);
        } catch (error: any) {
            console.log("⚠️ SCNT demo skipped (board not accessible):", error.message);
        }
        console.log();

        // Demo 3: Show tool schema
        console.log("📋 Demo 3: Tool Input Schema");
        console.log("=" .repeat(50));
        console.log(JSON.stringify(boardTool.inputSchema, null, 2));
        console.log();

        // Demo 4: List available parameters
        console.log("📋 Demo 4: Available Parameters");
        console.log("=" .repeat(50));
        const properties = boardTool.inputSchema.properties;
        Object.entries(properties).forEach(([param, config]: [string, any]) => {
            const required = boardTool.inputSchema.required?.includes(param) ? " (REQUIRED)" : "";
            console.log(`• ${param}${required}: ${config.description}`);
            if (config.enum) {
                console.log(`  Options: ${config.enum.join(', ')}`);
            }
            if (config.type) {
                console.log(`  Type: ${config.type}`);
            }
            console.log();
        });

        console.log("🎉 Demo completed successfully!");
        console.log("\n📝 Usage Examples:");
        console.log("1. NDS Sprint: boardId=5465, sprintNumber='FY25-21'");
        console.log("2. SCNT Sprint: boardId=<SCNT_BOARD_ID>, sprintNumber='2025-22'");
        console.log("3. Any Board: boardId=<YOUR_BOARD_ID>, sprintNumber='<SPRINT_NAME>'");

    } catch (error: any) {
        console.error("❌ Demo failed:", error.message);
        console.error("Stack trace:", error.stack);
    }
}

// Auto-execute if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    demonstrateBoardBasedReleaseNotes();
}

export { demonstrateBoardBasedReleaseNotes };
