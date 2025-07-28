/**
 * Teams Webhook Setup and Notification Sender
 * Step-by-step guide to send professional release notes to Teams
 */

import { ProfessionalTeamsNotificationSender } from './send-professional-template-teams.js';

console.log('🚀 Teams Webhook Setup Guide');
console.log('=============================\n');

console.log('📋 **Step 1: Get Your Teams Webhook URL**');
console.log('1. Open Microsoft Teams');
console.log('2. Go to the channel where you want notifications');
console.log('3. Click the "..." (three dots) next to the channel name');
console.log('4. Select "Connectors"');
console.log('5. Find "Incoming Webhook" and click "Configure"');
console.log('6. Give it a name like "Sprint Release Notes"');
console.log('7. Copy the webhook URL that appears');
console.log('');

console.log('📋 **Step 2: Set Your Webhook URL**');
console.log('Run one of these commands in your terminal:');
console.log('');
console.log('🖥️  **macOS/Linux:**');
console.log('export TEAMS_WEBHOOK_URL="your-webhook-url-here"');
console.log('');
console.log('🪟 **Windows (PowerShell):**');
console.log('$env:TEAMS_WEBHOOK_URL="your-webhook-url-here"');
console.log('');
console.log('🪟 **Windows (Command Prompt):**');
console.log('set TEAMS_WEBHOOK_URL=your-webhook-url-here');
console.log('');

console.log('📋 **Step 3: Send Notifications**');
console.log('After setting the webhook URL, run:');
console.log('npx tsx send-professional-template-teams.ts');
console.log('');

console.log('⚠️  **Current Status Check:**');
const webhookUrl = process.env.TEAMS_WEBHOOK_URL;

if (!webhookUrl || webhookUrl === 'https://your-teams-webhook-url-here') {
    console.log('❌ Teams webhook URL not set');
    console.log('💡 Please follow steps 1-2 above to set your webhook URL');
    console.log('');
    console.log('🔧 **Quick Test Command:**');
    console.log('After setting the webhook URL, you can test with:');
    console.log('TEAMS_WEBHOOK_URL="your-actual-webhook-url" npx tsx send-professional-template-teams.ts');
} else {
    console.log('✅ Teams webhook URL is configured');
    console.log('🚀 Ready to send notifications!');
    console.log('');
    
    // Auto-send if webhook is configured
    console.log('🔄 Sending notifications now...');
    const sender = new ProfessionalTeamsNotificationSender(webhookUrl);
    sender.sendProfessionalReleaseNotification()
        .then(() => {
            console.log('✅ All notifications sent successfully!');
        })
        .catch((error) => {
            console.error('❌ Error sending notifications:', error.message);
        });
}

console.log('');
console.log('📄 **What Will Be Sent:**');
console.log('• 🚀 Executive Summary Card - Key sprint metrics');
console.log('• 📈 Performance Metrics Card - Work breakdown analysis');
console.log('• 🎯 Priority Management Card - Resolution status');
console.log('• 🚀 Stakeholder Actions Card - Next steps and guidance');
console.log('');
console.log('🎨 All cards follow Teams design guidelines for optimal display!');
