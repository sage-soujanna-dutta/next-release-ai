#!/usr/bin/env node

import { ReleaseMCPServer } from './dist/index.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

async function generateMarkdown() {
    console.log('📝 Generating Markdown release notes for SCNT-2025-20...');
    
    try {
        const server = new ReleaseMCPServer();
        
        // Generate the release notes in markdown format
        const result = await server.generateReleaseNotesPublic({
            sprintNumber: 'SCNT-2025-20',
            format: 'markdown',
            theme: 'modern'
        });
        
        console.log('✅ Markdown generation successful!');
        console.log('📁 File saved to:', result.filePath);
        console.log('📊 Stats:', result.stats);
        
        // Also create a copy with .md extension if needed
        const outputDir = './output';
        const markdownPath = path.join(outputDir, 'release-notes-SCNT-2025-20.md');
        
        if (result.content) {
            await fs.writeFile(markdownPath, result.content, 'utf8');
            console.log('📝 Markdown file also saved to:', markdownPath);
        }
        
    } catch (error) {
        console.error('❌ Markdown generation failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

generateMarkdown();
