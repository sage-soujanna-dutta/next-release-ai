#!/usr/bin/env npx tsx

/**
 * DIRECT TEAMS MESSAGE TEST - Simple format
 */
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function sendDirectTeamsMessage() {
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.log("❌ Teams webhook not configured");
        return;
    }

    const simpleMessage = {
        "@type": "MessageCard",
        "@context": "https://schema.org/extensions",
        "summary": "SCNT-2025-21 Sprint Report - Direct Test",
        "themeColor": "0078D4",
        "sections": [
            {
                "activityTitle": "🚀 SCNT-2025-21 - Sprint Report (Direct Test)",
                "activitySubtitle": "Jul 9 - Jul 22, 2025 | Testing Direct Delivery",
                "text": `
## Sprint Summary

**Period:** Jul 9 - Jul 22, 2025  
**Status:** Completed  
**Completion:** 89% (59/66 tickets)  
**Story Points:** 102  
**Contributors:** 16

## Quick Metrics

| Metric | Value |
|--------|-------|
| Total Issues | 66 |
| Completed | 59 |
| Remaining | 7 |
| Success Rate | 89% |

This is a direct test message to verify Teams delivery is working.

If you can see this message, please let me know!
                `,
                "markdown": true
            }
        ]
    };

    try {
        console.log('📤 Sending direct Teams message...');
        
        const response = await axios.post(webhookUrl, simpleMessage, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Direct message sent successfully!');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
    } catch (error) {
        console.error('❌ Failed to send direct message:', error);
        if (axios.isAxiosError(error)) {
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
        }
    }
}

sendDirectTeamsMessage();
