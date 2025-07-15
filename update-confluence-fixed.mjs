#!/usr/bin/env node

import { ConfluenceService } from './dist/services/ConfluenceService.js';
import { ReleaseNotesService } from './dist/services/ReleaseNotesService.js';
import { HtmlFormatter } from './dist/utils/HtmlFormatter.js';
import { JiraService } from './dist/services/JiraService.js';
import { GitHubService } from './dist/services/GitHubService.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateConfluenceWithProperFormat() {
    console.log('📤 Updating Confluence page with SCNT-2025-20 release notes...');
    
    try {
        // Initialize services
        const jiraService = new JiraService();
        const githubService = new GitHubService();
        const confluenceService = new ConfluenceService();
        
        console.log('📊 Fetching JIRA issues for SCNT-2025-20...');
        const jiraIssues = await jiraService.fetchIssues('SCNT-2025-20');
        console.log(`✅ Fetched ${jiraIssues.length} JIRA issues`);
        
        console.log('💻 Fetching GitHub commits for sprint period...');
        // Get commits for the sprint period using the standard method
        const commits = await githubService.fetchCommits();
        console.log(`✅ Fetched ${commits.length} GitHub commits`);
        
        console.log('🎨 Generating Confluence-formatted content...');
        const htmlFormatter = new HtmlFormatter('modern');
        const confluenceContent = htmlFormatter.formatForConfluence(jiraIssues, commits, 'SCNT-2025-20');
        
        console.log('📄 Publishing to Confluence page...');
        await confluenceService.publishPage(confluenceContent, 'SCNT-2025-20');
        
        console.log('✅ Confluence update successful!');
        console.log('📄 Published release notes for SCNT-2025-20');
        console.log(`📊 Stats: ${jiraIssues.length} issues, ${commits.length} commits`);
        
    } catch (error) {
        console.error('❌ Confluence update failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

updateConfluenceWithProperFormat();
