#!/usr/bin/env npx tsx

/**
 * Debug: List All Board Names
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function listAllBoardNames() {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;

    if (!domain || !token) {
        throw new Error("Missing JIRA environment variables");
    }

    try {
        console.log("📋 Listing all board names...");
        
        const boardsRes = await axios.get(
            `https://${domain}/rest/agile/1.0/board?maxResults=200`,
            { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                } 
            }
        );

        const boards = boardsRes.data.values;
        console.log(`Found ${boards.length} boards:`);
        
        boards.forEach((board: any, index: number) => {
            console.log(`${index + 1}. ID: ${board.id} - "${board.name}" (${board.type})`);
        });

        // Search for boards containing "Network"
        const networkBoards = boards.filter((board: any) => 
            board.name.toLowerCase().includes('network')
        );
        
        console.log(`\n🔍 Boards containing "Network": ${networkBoards.length}`);
        networkBoards.forEach((board: any) => {
            console.log(`   • ID: ${board.id} - "${board.name}"`);
        });

        // Search for boards containing "Directory"
        const directoryBoards = boards.filter((board: any) => 
            board.name.toLowerCase().includes('directory')
        );
        
        console.log(`\n📁 Boards containing "Directory": ${directoryBoards.length}`);
        directoryBoards.forEach((board: any) => {
            console.log(`   • ID: ${board.id} - "${board.name}"`);
        });

        // Look for board ID 5465 specifically
        const board5465 = boards.find((board: any) => board.id === 5465);
        if (board5465) {
            console.log(`\n✅ Found board 5465: "${board5465.name}"`);
        } else {
            console.log(`\n❌ Board 5465 not found in first 200 boards`);
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

listAllBoardNames();
