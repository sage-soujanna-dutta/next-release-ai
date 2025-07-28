#!/usr/bin/env tsx

import { TeamsService } from './src/services/TeamsService.js';

async function testTeamsNotification() {
  console.log('🧪 Testing Teams Notification...');
  
  const teamsService = new TeamsService();
  
  try {
    console.log('📱 Sending test message to verify Teams channel...');
    
    await teamsService.sendNotification({
      title: `🧪 Test Message - Combined Sprint Verification`,
      message: `This is a test message to verify your Teams channel is receiving notifications.

**Testing**: SCNT-2025-19 and SCNT-2025-20 combined report delivery
**Time**: ${new Date().toLocaleString()}
**Status**: If you see this message, your Teams integration is working correctly.

Please confirm if you received:
1. ✅ This test message
2. ❓ The combined sprint report for SCNT-2025-19 & SCNT-2025-20
3. ❓ Any other recent sprint notifications

Reply to let me know what you're seeing in your Teams channel.`,
      isImportant: false
    });
    
    console.log('✅ Test message sent successfully!');
    console.log('📋 Please check your Teams channel and confirm what messages you see.');
    
  } catch (error) {
    console.error('❌ Error sending test message:', error);
  }
}

testTeamsNotification().catch(console.error);
