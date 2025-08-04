#!/usr/bin/env tsx

/**
 * JIRA Connectivity Test Script
 * This script tests basic JIRA connectivity and lists available projects/boards
 */

import { config } from 'dotenv';
import axios from 'axios';

config();

async function testJiraConnectivity() {
  console.log('🔍 Testing JIRA Connectivity...');
  
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraDomain = process.env.JIRA_DOMAIN;
  const jiraToken = process.env.JIRA_TOKEN;
  
  console.log(`📧 Email: ${jiraEmail}`);
  console.log(`🌐 Domain: ${jiraDomain}`);
  console.log(`🔑 Token: ${jiraToken ? '***' + jiraToken.slice(-4) : 'NOT SET'}`);
  
  if (!jiraEmail || !jiraDomain || !jiraToken) {
    console.error('❌ Missing JIRA configuration variables');
    return;
  }
  
  const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');
  const baseURL = `https://${jiraDomain}`;
  
  try {
    // Test 1: Check authentication with myself endpoint
    console.log('\n📋 Test 1: Authentication check...');
    const authResponse = await axios.get(`${baseURL}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });
    console.log('✅ Authentication successful');
    console.log(`👤 User: ${authResponse.data.displayName} (${authResponse.data.emailAddress})`);
    
    // Test 2: List all projects
    console.log('\n📋 Test 2: Fetching projects...');
    const projectsResponse = await axios.get(`${baseURL}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });
    
    console.log(`✅ Found ${projectsResponse.data.length} projects:`);
    projectsResponse.data.forEach((project: any) => {
      console.log(`  🎯 ${project.key}: ${project.name}`);
    });
    
    // Test 3: List all boards
    console.log('\n📋 Test 3: Fetching boards...');
    const boardsResponse = await axios.get(`${baseURL}/rest/agile/1.0/board`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });
    
    console.log(`✅ Found ${boardsResponse.data.total} boards:`);
    boardsResponse.data.values.forEach((board: any) => {
      console.log(`  📊 ID: ${board.id}, Name: ${board.name}, Type: ${board.type}`);
    });
    
  } catch (error: any) {
    console.error('❌ JIRA API Error:', error.response?.status, error.response?.statusText);
    console.error('📝 Error details:', error.response?.data || error.message);
  }
}

// Run the test
testJiraConnectivity().then(() => {
  console.log('\n🏁 JIRA connectivity test completed');
}).catch((error) => {
  console.error('💥 Test failed:', error);
});
