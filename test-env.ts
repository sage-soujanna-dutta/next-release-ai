#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Environment Variables Test');
console.log('=' .repeat(50));
console.log(`JIRA_DOMAIN: ${process.env.JIRA_DOMAIN || 'NOT FOUND'}`);
console.log(`JIRA_TOKEN: ${process.env.JIRA_TOKEN ? 'FOUND' : 'NOT FOUND'}`);
console.log(`JIRA_BOARD_ID: ${process.env.JIRA_BOARD_ID || 'NOT FOUND'}`);
console.log(`TEAMS_WEBHOOK_URL: ${process.env.TEAMS_WEBHOOK_URL ? 'FOUND' : 'NOT FOUND'}`);
console.log('=' .repeat(50));
