#!/usr/bin/env node

import { ConfluenceService } from './dist/services/ConfluenceService.js';
import { ReleaseNotesService } from './dist/services/ReleaseNotesService.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

async function updateConfluence() {
    console.log('📤 Updating Confluence page with SCNT-2025-20 release notes...');
    
    try {
        // Read the generated HTML file
        const htmlFilePath = path.join('./output', 'release-notes-SCNT-2025-20.html');
        const htmlContent = await fs.readFile(htmlFilePath, 'utf8');
        
        // Initialize Confluence service
        const confluenceService = new ConfluenceService();
        
        // Publish to Confluence
        const result = await confluenceService.publishPage(htmlContent, 'SCNT-2025-20');
        
        console.log('✅ Confluence update successful!');
        console.log('� Published release notes for SCNT-2025-20');
        
    } catch (error) {
        console.error('❌ Confluence update failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

updateConfluence();
