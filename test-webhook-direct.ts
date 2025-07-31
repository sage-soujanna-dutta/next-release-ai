#!/usr/bin/env npx tsx

/**
 * Direct webhook test - bypass service initialization
 */
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

console.log('Environment variables loaded:');
console.log('TEAMS_WEBHOOK_URL exists:', !!process.env.TEAMS_WEBHOOK_URL);
console.log('TEAMS_WEBHOOK_URL length:', process.env.TEAMS_WEBHOOK_URL?.length || 0);
console.log('TEAMS_WEBHOOK_URL starts with:', process.env.TEAMS_WEBHOOK_URL?.substring(0, 50) || 'N/A');

const webhookUrl = process.env.TEAMS_WEBHOOK_URL;

if (!webhookUrl) {
    console.log('❌ No webhook URL found in environment');
    process.exit(1);
}

// TypeScript assertion since we've already checked for null
const validWebhookUrl: string = webhookUrl;

console.log('✅ Webhook URL found, attempting to send test message...');

const testMessage = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": "0076D7",
    "summary": "NDS-FY25-21 Sprint Report Test",
    "sections": [{
        "activityTitle": "Test Message",
        "activitySubtitle": "Webhook Configuration Test",
        "text": "This is a test message to verify Teams webhook configuration."
    }]
};

async function sendTestMessage() {
    try {
        const response = await axios.post(validWebhookUrl, testMessage, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Test message sent successfully!');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
    } catch (error) {
        console.error('❌ Failed to send test message:');
        if (axios.isAxiosError(error)) {
            console.error('Status:', error.response?.status);
            console.error('Status text:', error.response?.statusText);
            console.error('Data:', error.response?.data);
        } else {
            console.error('Error:', error);
        }
    }
}

sendTestMessage();
