#!/usr/bin/env npx tsx

/**
 * Test ProfessionalTeamsTemplateService initialization
 */
import * as dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

console.log('🔍 Pre-import environment check:');
console.log('TEAMS_WEBHOOK_URL exists:', !!process.env.TEAMS_WEBHOOK_URL);
console.log('TEAMS_WEBHOOK_URL length:', process.env.TEAMS_WEBHOOK_URL?.length || 0);

console.log('\n📦 Importing ProfessionalTeamsTemplateService...');

try {
    const { ProfessionalTeamsTemplateService } = await import('./src/services/ProfessionalTeamsTemplateService.js');
    
    console.log('✅ Import successful');
    console.log('🔧 Creating service instance...');
    
    const service = new ProfessionalTeamsTemplateService();
    console.log('✅ Service created successfully!');
    
} catch (error) {
    console.error('❌ Error creating service:', error);
    
    // Check if it's a webhook error
    if (error instanceof Error && error.message.includes('Teams webhook URL is not configured')) {
        console.log('\n🔍 Webhook detection issue:');
        console.log('Environment variable during error:', process.env.TEAMS_WEBHOOK_URL?.substring(0, 50));
    }
}
