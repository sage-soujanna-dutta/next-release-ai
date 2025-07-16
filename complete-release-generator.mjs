#!/usr/bin/env node

/**
 * Complete Release Notes Generator for SCNT Sprints
 * Generates HTML (modern theme), Markdown, and updates Confluence
 * All enhanced features restored and working
 */

import { ReleaseMCPServer } from './dist/index.js';
import { ConfluenceService } from './dist/services/ConfluenceService.js';
import { HtmlFormatter } from './dist/utils/HtmlFormatter.js';
import { JiraService } from './dist/services/JiraService.js';
import { GitHubService } from './dist/services/GitHubService.js';
import { AzureDevOpsService } from './dist/services/AzureDevOpsService.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

async function generateCompleteReleaseNotes(sprintNumber = 'SCNT-2025-20') {
    console.log(`🚀 Starting Complete Release Notes Generation for ${sprintNumber}`);
    console.log('📋 This will generate: HTML (modern theme), Markdown, and update Confluence\n');

    try {
        // Step 1: Generate Modern Theme HTML
        console.log('📄 Step 1: Generating HTML with Modern Theme...');
        const server = new ReleaseMCPServer();
        const htmlResult = await server.generateReleaseNotesPublic({
            sprintNumber: sprintNumber,
            format: 'html',
            theme: 'modern'
        });
        console.log(`   ✅ HTML generated: ${htmlResult.filePath}`);
        console.log(`   📊 Stats: ${htmlResult.stats.jiraIssues} issues, ${htmlResult.stats.commits} commits\n`);

        // Step 2: Generate Markdown
        console.log('📝 Step 2: Generating Markdown Version...');
        const mdResult = await server.generateReleaseNotesPublic({
            sprintNumber: sprintNumber,
            format: 'markdown',
            theme: 'modern'
        });
        console.log(`   ✅ Markdown generated: ${mdResult.filePath}\n`);

        // Step 3: Update Confluence with Enhanced Format
        console.log('☁️ Step 3: Updating Confluence with Enhanced Tables...');
        
        // Fetch data for Confluence formatting
        const jiraService = new JiraService();
        const githubService = new GitHubService();
        const azureDevOpsService = new AzureDevOpsService();
        
        console.log('   📊 Fetching JIRA issues...');
        const jiraIssues = await jiraService.fetchIssues(sprintNumber);
        
        console.log('   💻 Fetching GitHub commits...');
        const commits = await githubService.fetchCommits();
        
        console.log('   🔨 Fetching build pipeline data...');
        const buildPipelineData = await azureDevOpsService.fetchPipelineData(sprintNumber);
        
        console.log('   🎨 Generating enhanced Confluence format...');
        const htmlFormatter = new HtmlFormatter('modern');
        const confluenceContent = htmlFormatter.formatForConfluence(jiraIssues, commits, sprintNumber, buildPipelineData);
        
        console.log('   📤 Publishing to Confluence...');
        const confluenceService = new ConfluenceService();
        await confluenceService.publishPage(confluenceContent, sprintNumber);
        console.log('   ✅ Confluence updated with enhanced tables and emojis\n');

        // Step 4: Generate Summary
        console.log('📋 Step 4: Generation Summary');
        console.log('=' .repeat(60));
        console.log(`Sprint: ${sprintNumber}`);
        console.log(`JIRA Issues: ${jiraIssues.length}`);
        console.log(`GitHub Commits: ${commits.length}`);
        console.log('');
        console.log('📁 Generated Files:');
        console.log(`   • ${htmlResult.filePath} (Modern Theme HTML)`);
        console.log(`   • ${mdResult.filePath} (Markdown)`);
        console.log('   • Confluence page updated with enhanced tables');
        console.log('');
        console.log('🎨 Features Included:');
        console.log('   • Modern Theme: Gradients, animations, card layouts');
        console.log('   • Confluence: Enhanced tables with emojis and percentages');
        console.log('   • Markdown: Clean documentation format');
        console.log('   • GitHub Integration: Working commit links');
        console.log('   • Analytics: Contributor stats and completion rates');
        console.log('');
        console.log('✅ ALL OUTPUTS GENERATED SUCCESSFULLY!');
        console.log(`🔗 View HTML: file://${process.cwd()}/${htmlResult.filePath}`);

    } catch (error) {
        console.error('❌ Generation failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Allow command line sprint override
const sprintArg = process.argv[2];
const targetSprint = sprintArg || process.env.JIRA_SPRINT_NUMBER || 'SCNT-2025-20';

console.log('🔧 Enhanced Release Notes Generator');
console.log('   Modern Theme (preserved) + Enhanced Confluence Tables');
console.log(`   Target Sprint: ${targetSprint}\n`);

generateCompleteReleaseNotes(targetSprint);
