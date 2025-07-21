#!/usr/bin/env node

import { HtmlFormatter } from './dist/utils/HtmlFormatter.js';
import { JiraService } from './dist/services/JiraService.js';
import { AzureDevOpsService } from './dist/services/AzureDevOpsService.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

async function testConfluenceFormat() {
    console.log('🧪 Testing Confluence format with component segregation...');
    
    try {
        const jiraService = new JiraService();
        const azureDevOpsService = new AzureDevOpsService();
        
        // Fetch a small sample of issues for testing
        console.log('📊 Fetching JIRA issues...');
        const jiraIssues = await jiraService.fetchIssues('SCNT-2025-20');
        console.log(`✅ Found ${jiraIssues.length} JIRA issues`);
        
        // Fetch build pipeline data
        console.log('🔨 Fetching build pipeline data...');
        const buildPipelineData = await azureDevOpsService.fetchPipelineData('SCNT-2025-20');
        console.log(`✅ Found build data for ${buildPipelineData.length} pipelines`);
        
        // Generate Confluence format
        console.log('🎨 Generating Confluence format...');
        const htmlFormatter = new HtmlFormatter('modern');
        const confluenceContent = htmlFormatter.formatForConfluence(jiraIssues, [], 'SCNT-2025-20', buildPipelineData);
        
        // Save to test file
        const testFilePath = './output/confluence-test.html';
        await fs.writeFile(testFilePath, confluenceContent, 'utf8');
        console.log(`✅ Confluence format saved to: ${testFilePath}`);
        
        // Show component structure
        const componentGroups = jiraIssues.reduce((acc, issue) => {
            const component = issue.fields.components?.[0]?.name || 'No Component';
            if (!acc[component]) {
                acc[component] = [];
            }
            acc[component].push(issue);
            return acc;
        }, {});
        
        console.log('\n📋 Component Structure:');
        Object.entries(componentGroups).forEach(([component, issues]) => {
            console.log(`   🏗️ ${component}: ${issues.length} issues`);
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testConfluenceFormat();
