#!/usr/bin/env npx tsx

/**
 * ADAPTIVE CARD TEST - Alternative Teams format
 */
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function sendAdaptiveCardTest() {
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.log("❌ Teams webhook not configured");
        return;
    }

    // Try Adaptive Card format instead of MessageCard
    const adaptiveCardMessage = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.3",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "🚀 SCNT-2025-21 Sprint Report - URGENT TEST",
                            "weight": "Bolder",
                            "size": "Large",
                            "color": "Attention"
                        },
                        {
                            "type": "TextBlock",
                            "text": "Jul 9 - Jul 22, 2025 | 89% Complete",
                            "size": "Medium"
                        },
                        {
                            "type": "FactSet",
                            "facts": [
                                {
                                    "title": "Total Issues:",
                                    "value": "66"
                                },
                                {
                                    "title": "Completed:",
                                    "value": "59 (89%)"
                                },
                                {
                                    "title": "Story Points:",
                                    "value": "102"
                                },
                                {
                                    "title": "Contributors:",
                                    "value": "16"
                                }
                            ]
                        },
                        {
                            "type": "TextBlock",
                            "text": "⚠️ THIS IS A TEST MESSAGE - Please confirm if you can see this in Teams!",
                            "weight": "Bolder",
                            "color": "Warning"
                        }
                    ]
                }
            }
        ]
    };

    try {
        console.log('📤 Sending Adaptive Card test...');
        
        const response = await axios.post(webhookUrl, adaptiveCardMessage, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Adaptive Card sent successfully!');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
    } catch (error) {
        console.error('❌ Failed to send Adaptive Card:', error);
        if (axios.isAxiosError(error)) {
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
        }
    }
}

sendAdaptiveCardTest();
