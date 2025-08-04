#!/usr/bin/env npx tsx

/**
 * Debug: Find Board 5465 Specifically
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function findBoard5465() {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;

    if (!domain || !token) {
        throw new Error("Missing JIRA environment variables");
    }

    try {
        console.log("🔍 Searching for board 5465 across all pages...");
        
        let startAt = 0;
        const maxResults = 50;
        let totalFound = 0;
        let board5465 = null;

        while (true) {
            const boardsRes = await axios.get(
                `https://${domain}/rest/agile/1.0/board?startAt=${startAt}&maxResults=${maxResults}`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    } 
                }
            );

            const boards = boardsRes.data.values;
            totalFound += boards.length;
            
            console.log(`📋 Checked boards ${startAt + 1} to ${startAt + boards.length} (total: ${totalFound})`);

            // Look for board 5465
            const foundBoard = boards.find((board: any) => board.id === 5465);
            if (foundBoard) {
                board5465 = foundBoard;
                console.log(`✅ Found board 5465: "${foundBoard.name}"`);
                break;
            }

            // Look for boards with "Network" or "Directory" in the name
            const relevantBoards = boards.filter((board: any) => 
                board.name.toLowerCase().includes('network') ||
                board.name.toLowerCase().includes('directory') ||
                board.name.toLowerCase().includes('nds')
            );
            
            if (relevantBoards.length > 0) {
                console.log(`🎯 Found relevant boards:`);
                relevantBoards.forEach((board: any) => {
                    console.log(`   • ID: ${board.id} - "${board.name}"`);
                });
            }

            // Check if we've reached the end
            if (boards.length < maxResults) {
                console.log(`📄 Reached end of boards. Total: ${totalFound}`);
                break;
            }

            startAt += maxResults;

            // Safety limit to avoid infinite loop
            if (startAt > 1000) {
                console.log("⚠️ Safety limit reached. Stopping search.");
                break;
            }
        }

        if (!board5465) {
            console.log("❌ Board 5465 not found");
            
            // Try to access it directly
            console.log("🎯 Trying to access board 5465 directly...");
            try {
                const directBoard = await axios.get(
                    `https://${domain}/rest/agile/1.0/board/5465`,
                    { 
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        } 
                    }
                );
                console.log("✅ Direct access successful:");
                console.log(`   Name: "${directBoard.data.name}"`);
                console.log(`   Type: ${directBoard.data.type}`);
                console.log("   This board exists but may not be listed in the general board API");
            } catch (directError: any) {
                console.log("❌ Direct access failed:", directError.message);
            }
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

findBoard5465();
