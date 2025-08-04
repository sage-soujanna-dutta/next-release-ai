#!/usr/bin/env npx tsx

/**
 * Debug: JIRA Board Structure
 * 
 * This script helps debug the board search by showing the actual
 * structure of boards returned from JIRA API.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugBoardStructure() {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;

    if (!domain || !token) {
        throw new Error("Missing JIRA environment variables");
    }

    try {
        console.log("🔍 Fetching board structure for debugging...");
        
        // Fetch boards with expanded information
        const boardsRes = await axios.get(
            `https://${domain}/rest/agile/1.0/board?maxResults=10&expand=projects`,
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                } 
            }
        );

        const boards = boardsRes.data.values;
        console.log(`📋 Found ${boards.length} boards (showing first 10)`);
        console.log();

        boards.forEach((board: any, index: number) => {
            console.log(`📋 Board ${index + 1}:`);
            console.log(`   ID: ${board.id}`);
            console.log(`   Name: ${board.name}`);
            console.log(`   Type: ${board.type}`);
            console.log(`   Location:`, JSON.stringify(board.location, null, 2));
            console.log();
        });

        // Also try to fetch the specific board we know works (5465)
        console.log("🎯 Fetching known NDS board (5465) for comparison...");
        try {
            const ndsBoard = await axios.get(
                `https://${domain}/rest/agile/1.0/board/5465`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    } 
                }
            );
            
            console.log("✅ NDS Board 5465 structure:");
            console.log(JSON.stringify(ndsBoard.data, null, 2));
        } catch (error: any) {
            console.log("❌ Error fetching NDS board:", error.message);
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

debugBoardStructure();
