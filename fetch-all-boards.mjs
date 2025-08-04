#!/usr/bin/env node

/**
 * Get all JIRA boards using the same approach as other working tools
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function makeJiraRequest(endpoint, method = 'GET') {
  const domain = process.env.JIRA_DOMAIN;
  const token = process.env.JIRA_TOKEN;
  
  if (!domain) {
    throw new Error('JIRA_DOMAIN not configured in environment');
  }
  
  if (!token) {
    throw new Error('JIRA_TOKEN not configured in environment');
  }

  const url = `https://${domain}${endpoint}`;
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, {
    method,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`JIRA API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

async function listAllJiraBoards() {
  console.log('🚀 Fetching all JIRA boards with their IDs...\n');

  try {
    // Fetch all boards
    let allBoards = [];
    let startAt = 0;
    const maxResults = 50;
    let hasMore = true;

    while (hasMore) {
      try {
        console.log(`📡 Fetching boards (batch ${Math.floor(startAt/maxResults) + 1})...`);
        
        const response = await makeJiraRequest(
          `/rest/agile/1.0/board?startAt=${startAt}&maxResults=${maxResults}`
        );
        
        if (response.values && Array.isArray(response.values)) {
          allBoards = allBoards.concat(response.values);
          hasMore = response.values.length === maxResults;
          startAt += maxResults;
          
          console.log(`  ✅ Found ${response.values.length} boards in this batch`);
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`❌ Error fetching boards at startAt ${startAt}:`, error.message);
        hasMore = false;
      }
    }

    if (allBoards.length === 0) {
      console.log("🔍 No JIRA boards found in this instance.");
      return;
    }

    // Create board mapping
    const boardMapping = {};
    const typeStats = {};

    console.log(`\n📋 **All JIRA Boards (${allBoards.length} total)**\n`);
    console.log('Board Name → Board ID:');
    console.log('=' .repeat(80));

    allBoards.forEach(board => {
      // Map board name to ID
      boardMapping[board.name] = board.id;
      
      // Count by type
      const type = board.type || 'unknown';
      typeStats[type] = (typeStats[type] || 0) + 1;
      
      console.log(`📋 ${board.name.padEnd(50)} → ID: ${board.id.toString().padEnd(6)} (${board.type})`);
    });

    console.log('\n📊 **Board Statistics:**');
    console.log('=' .repeat(30));
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  🏷️ ${type}: ${count} boards`);
    });

    console.log('\n🗺️ **Board Name → ID Mapping (JSON format):**');
    console.log('```json');
    console.log(JSON.stringify(boardMapping, null, 2));
    console.log('```');

    console.log(`\n✅ Successfully fetched ${allBoards.length} JIRA boards!`);
    console.log(`⚡ Board types found: ${Object.keys(typeStats).join(', ')}`);

  } catch (error) {
    console.error('❌ Failed to fetch boards:', error.message);
    console.error('Full error:', error);
  }
}

listAllJiraBoards();
