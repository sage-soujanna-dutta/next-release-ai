#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function validateTeamsConnection() {
  console.log('🔍 Validating Teams webhook connection...\n');
  
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('❌ TEAMS_WEBHOOK_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('✅ Teams webhook URL found in environment');
  console.log(`📍 URL: ${webhookUrl.substring(0, 50)}...`);
  
  // Test payload matching the TeamsService format
  const testPayload = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: "Teams Connection Test",
    themeColor: "0076D7",
    title: "🧪 Teams Webhook Connection Test",
    text: "This is a test message to validate the Teams webhook connection from your release notes system.",
    sections: [
      {
        activityTitle: "Connection Validation",
        activitySubtitle: `Test performed on ${new Date().toLocaleString()}`,
        facts: [
          {
            name: "Status",
            value: "Testing Connection"
          },
          {
            name: "Timestamp",
            value: new Date().toISOString()
          },
          {
            name: "Source",
            value: "Release Notes AI System"
          }
        ]
      }
    ]
  };
  
  try {
    console.log('📤 Sending test message to Teams...');
    
    const response = await axios.post(webhookUrl, testPayload, {
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Release-Notes-AI/1.0'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: Teams webhook connection is working!');
      console.log('📱 Check your Teams channel for the test message');
      console.log(`📊 Response status: ${response.status}`);
      console.log(`🔄 Response data: ${response.data}`);
    } else {
      console.log(`⚠️  WARNING: Received status ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    }
    
  } catch (error) {
    console.error('❌ FAILED: Teams webhook connection test failed');
    
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`💬 Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('🔌 Network error: No response received');
      console.error('This could indicate:');
      console.error('  - Invalid webhook URL');
      console.error('  - Network connectivity issues');
      console.error('  - Webhook expired or disabled');
    } else {
      console.error(`🐛 Error: ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Additional validation function
async function validateWebhookFormat() {
  console.log('\n🔍 Validating webhook URL format...');
  
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('❌ TEAMS_WEBHOOK_URL not found');
    return false;
  }
  
  // Check if it's a valid Teams webhook URL
  const teamsWebhookPattern = /^https:\/\/[a-zA-Z0-9\-\.]+\.webhook\.office\.com\/webhookb2\//;
  
  if (teamsWebhookPattern.test(webhookUrl)) {
    console.log('✅ Webhook URL format appears valid');
    return true;
  } else {
    console.log('⚠️  Webhook URL format may be invalid');
    console.log('Expected format: https://[tenant].webhook.office.com/webhookb2/...');
    return false;
  }
}

// Run the validation
async function main() {
  console.log('🚀 Teams Webhook Connection Validator');
  console.log('=====================================\n');
  
  const formatValid = await validateWebhookFormat();
  
  if (formatValid) {
    await validateTeamsConnection();
  } else {
    console.log('⚠️  Proceeding with connection test despite format warning...\n');
    await validateTeamsConnection();
  }
}

main().catch(console.error);
