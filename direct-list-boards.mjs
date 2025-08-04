#!/usr/bin/env node

/**
 * Direct test of the list_all_jira_boards functionality
 * This bypasses MCP and tests the tool logic directly
 */

import { JiraService } from './dist/services/JiraService.js';

async function listAllJiraBoards() {
  console.log('🚀 Fetching all JIRA boards with their IDs...\n');

  try {
    // Initialize JIRA service
    const jiraService = new JiraService();
    
    // Fetch all boards
    let allBoards = [];
    let startAt = 0;
    const maxResults = 50;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await jiraService.makeRequest(
          `/rest/agile/1.0/board?startAt=${startAt}&maxResults=${maxResults}`,
          'GET'
        );
        
        if (response.values && Array.isArray(response.values)) {
          allBoards = allBoards.concat(response.values);
          hasMore = response.values.length === maxResults;
          startAt += maxResults;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching boards at startAt ${startAt}:`, error.message);
        hasMore = false;
      }
    }

    if (allBoards.length === 0) {
      console.log("🔍 No JIRA boards found in this instance.");
      return;
    }

    // Create board mapping
    const boardMapping = {};
    const projectMapping = {};

    console.log(`📋 **All JIRA Boards (${allBoards.length} total)**\n`);
    console.log('Board Name → Board ID:');
    console.log('=' .repeat(50));

    allBoards.forEach(board => {
      // Map board name to ID
      boardMapping[board.name] = board.id;
      console.log(`📋 ${board.name} → ID: ${board.id} (Type: ${board.type})`);
    });

    console.log('\n📊 **Board Name → ID Mapping (JSON format):**');
    console.log('```json');
    console.log(JSON.stringify(boardMapping, null, 2));
    console.log('```');

    console.log(`\n✅ Successfully fetched ${allBoards.length} JIRA boards!`);

  } catch (error) {
    console.error('❌ Failed to fetch boards:', error.message);
    console.error('Stack:', error.stack);
  }
}

listAllJiraBoards();
