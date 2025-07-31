#!/usr/bin/env npx tsx

/**
 * JIRA BOARDS SEARCH - Network Directory Service
 * Searches for specific board by name in JIRA
 * 
 * FEATURES:
 * - Searches all JIRA boards for "Network Directory Service"
 * - Displays board IDs, names, and types
 * - Shows associated projects
 * - Provides direct board URLs
 * 
 * USAGE:
 * npx tsx search-jira-boards.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ===================================================================
// INTERFACES
// ===================================================================
interface JiraBoard {
    id: number;
    name: string;
    type: string;
    self: string;
    location?: {
        type: string;
        projectId?: number;
        projectName?: string;
        projectKey?: string;
        projectTypeKey?: string;
        avatarURI?: string;
        displayName?: string;
    };
}

// ===================================================================
// JIRA BOARD SEARCHER
// ===================================================================
async function searchJiraBoards(searchTerm: string = "Network Directory Service") {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;

    if (!domain || !token) {
        throw new Error("Missing JIRA environment variables. Please check .env file.");
    }

    try {
        console.log('🔍 Searching JIRA Boards...');
        console.log(`🌐 JIRA Domain: ${domain}`);
        console.log(`🔎 Search Term: "${searchTerm}"`);
        console.log('=' .repeat(80));

        // Fetch all boards with pagination
        let allBoards: JiraBoard[] = [];
        let startAt = 0;
        const maxResults = 50;
        let isLast = false;

        while (!isLast) {
            const response = await axios.get(
                `https://${domain}/rest/agile/1.0/board`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    params: {
                        startAt,
                        maxResults
                    }
                }
            );

            const boards: JiraBoard[] = response.data.values || [];
            allBoards = allBoards.concat(boards);
            
            isLast = response.data.isLast;
            startAt += maxResults;
            
            console.log(`📋 Fetched ${boards.length} boards (Total: ${allBoards.length})`);
        }

        console.log(`\n📊 Total boards found: ${allBoards.length}`);

        // Search for boards matching the search term
        const matchingBoards = allBoards.filter(board => 
            board.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        console.log(`\n🎯 Boards matching "${searchTerm}": ${matchingBoards.length}`);
        console.log('=' .repeat(80));

        if (matchingBoards.length === 0) {
            console.log(`❌ No boards found matching "${searchTerm}"`);
            
            // Try partial matches
            const partialMatches = allBoards.filter(board => 
                board.name.toLowerCase().includes('network') || 
                board.name.toLowerCase().includes('directory') ||
                board.name.toLowerCase().includes('service')
            );
            
            if (partialMatches.length > 0) {
                console.log(`\n🔍 Related boards containing "network", "directory", or "service":`);
                console.log('-'.repeat(60));
                partialMatches.slice(0, 10).forEach((board, index) => {
                    console.log(`${index + 1}. 📋 ${board.name}`);
                    console.log(`   🆔 Board ID: ${board.id}`);
                    console.log(`   📊 Type: ${board.type}`);
                    if (board.location?.projectName) {
                        console.log(`   📁 Project: ${board.location.projectName} (${board.location.projectKey})`);
                    }
                    console.log(`   🔗 URL: https://${domain}/secure/RapidBoard.jspa?rapidView=${board.id}`);
                    console.log();
                });
            }
            
        } else {
            // Display exact matches
            matchingBoards.forEach((board, index) => {
                console.log(`${index + 1}. 📋 ${board.name}`);
                console.log(`   🆔 Board ID: ${board.id}`);
                console.log(`   📊 Type: ${board.type}`);
                
                if (board.location) {
                    console.log(`   📍 Location Type: ${board.location.type}`);
                    if (board.location.projectName) {
                        console.log(`   📁 Project: ${board.location.projectName} (${board.location.projectKey})`);
                        console.log(`   🏷️ Project ID: ${board.location.projectId}`);
                    }
                    if (board.location.displayName) {
                        console.log(`   🎯 Display Name: ${board.location.displayName}`);
                    }
                }
                
                console.log(`   🔗 Board URL: https://${domain}/secure/RapidBoard.jspa?rapidView=${board.id}`);
                console.log(`   🔗 API URL: ${board.self}`);
                console.log();
            });
        }

        // Additional search suggestions
        console.log('\n💡 SEARCH SUGGESTIONS:');
        console.log('-'.repeat(60));
        console.log('Try searching for these related terms:');
        console.log('• "Network"');
        console.log('• "Directory"'); 
        console.log('• "Service"');
        console.log('• "Connect"');
        console.log('• "SCNT" (if it\'s part of Sage Connect)');
        console.log('• "Infrastructure"');
        console.log('• "Platform"');

        // Show some popular boards that might be related
        const networkRelated = allBoards.filter(board => 
            board.name.toLowerCase().includes('connect') ||
            board.name.toLowerCase().includes('scnt') ||
            board.name.toLowerCase().includes('platform') ||
            board.name.toLowerCase().includes('infrastructure')
        );

        if (networkRelated.length > 0) {
            console.log('\n🌐 POSSIBLY RELATED BOARDS:');
            console.log('-'.repeat(60));
            networkRelated.slice(0, 5).forEach((board, index) => {
                console.log(`${index + 1}. ${board.name} (ID: ${board.id})`);
                console.log(`   https://${domain}/secure/RapidBoard.jspa?rapidView=${board.id}`);
            });
        }

    } catch (error) {
        console.error('❌ Error searching JIRA boards:', error);
        if (axios.isAxiosError(error)) {
            console.error('🔍 Response status:', error.response?.status);
            console.error('🔍 Response data:', JSON.stringify(error.response?.data, null, 2));
            
            if (error.response?.status === 401) {
                console.error('🔐 Authentication failed. Please check your JIRA token.');
            } else if (error.response?.status === 403) {
                console.error('🚫 Access denied. You may not have permission to view boards.');
            } else if (error.response?.status === 404) {
                console.error('🔍 Board API endpoint not found. Check your JIRA domain.');
            }
        }
        throw error;
    }
}

// ===================================================================
// SCRIPT EXECUTION
// ===================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🔍 JIRA Board Search - Network Directory Service');
    console.log('🎯 Searching for Network Directory Service board');
    console.log('📅 Generated on:', new Date().toLocaleString());
    console.log('=' .repeat(80));
    
    searchJiraBoards("Network Directory Service").catch(error => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}
