#!/usr/bin/env node

import { ReleaseMCPServer } from './dist/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function testGeneration() {
    console.log('🧪 Testing release notes generation...');
    
    try {
        const server = new ReleaseMCPServer();
        
        // Test the generation directly
        const result = await server.generateReleaseNotesPublic({
            sprintNumber: 'SCNT-2025-19',
            format: 'html',
            theme: 'modern'
        });
        
        console.log('✅ Generation successful!');
        console.log('📁 File saved to:', result.filePath);
        console.log('📊 Stats:', result.stats);
        
    } catch (error) {
        console.error('❌ Generation failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testGeneration();
