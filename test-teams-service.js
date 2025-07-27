#!/usr/bin/env node

import { TeamsService } from './src/services/TeamsService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testTeamsServiceMethods() {
  console.log('🧪 Testing TeamsService Methods');
  console.log('===============================\n');
  
  const teamsService = new TeamsService();
  
  try {
    // Test 1: Basic notification (matches your release notes flow)
    console.log('📤 Test 1: Basic release notification...');
    await teamsService.sendNotification(
      "Release Notes Test - Basic Notification",
      "## Test Release Notes\n\n### New Features\n- ✅ Teams webhook validation\n- 🔧 Connection testing\n\n### Bug Fixes\n- Fixed webhook connectivity issues\n\nThis is a test of the basic notification system used by your release notes workflow."
    );
    console.log('✅ Basic notification sent successfully!\n');
    
    // Test 2: Rich notification with facts and actions
    console.log('📤 Test 2: Rich notification with facts...');
    await teamsService.sendRichNotification({
      title: "🚀 Release Deployment Status",
      summary: "Sprint SCNT-2025-20 Release Summary",
      facts: [
        { name: "Sprint Number", value: "SCNT-2025-20" },
        { name: "Total Issues", value: "15" },
        { name: "Bug Fixes", value: "8" },
        { name: "New Features", value: "7" },
        { name: "Deploy Status", value: "✅ Successful" },
        { name: "Environment", value: "Production" }
      ],
      actions: [
        { 
          name: "View Release Notes", 
          url: "https://raj211.atlassian.net/wiki/spaces/~712020983044e6ce22482db843da5c10d1008d/pages/341440053t" 
        },
        { 
          name: "View JIRA Sprint", 
          url: "https://jira.sage.com/secure/RapidBoard.jspa?rapidView=6306" 
        }
      ]
    });
    console.log('✅ Rich notification sent successfully!\n');
    
    console.log('🎉 All Teams notification tests completed successfully!');
    console.log('📱 Check your Teams channel for both test messages');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
testTeamsServiceMethods().catch(console.error);
