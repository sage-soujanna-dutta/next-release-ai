#!/usr/bin/env node

import { HtmlFormatter } from './dist/utils/HtmlFormatter.js';
import fs from 'fs/promises';

// Sample data for demonstration
const sampleJiraIssues = [
  {
    key: 'SCNT-4149',
    fields: {
      summary: 'Locale is not getting saved in Portal',
      status: { name: 'Done' },
      issuetype: { name: 'Bug' },
      priority: { name: 'High' },
      assignee: { displayName: 'Ashish Patel' }
    }
  },
  {
    key: 'SCNT-4124',
    fields: {
      summary: 'Automate Payment Reminders - multiple invoice templates',
      status: { name: 'In Progress' },
      issuetype: { name: 'Story' },
      priority: { name: 'Medium' },
      assignee: { displayName: 'Manish B S' }
    }
  }
];

const sampleCommits = [
  {
    sha: 'abc123def456',
    message: 'Fix locale saving issue in Portal component',
    author: 'Ashish Patel',
    date: '2025-07-01T10:30:00Z'
  },
  {
    sha: 'def456ghi789',
    message: 'Add payment reminder automation feature',
    author: 'Manish B S',
    date: '2025-07-02T14:15:00Z'
  }
];

async function generateComparison() {
  console.log('🔄 Generating format comparison...');
  
  // Modern theme (unchanged)
  const modernFormatter = new HtmlFormatter('modern');
  const modernContent = modernFormatter.format(sampleJiraIssues, sampleCommits, 'SCNT-2025-20');
  
  // Confluence format (updated with tables and emojis)
  const confluenceContent = modernFormatter.formatForConfluence(sampleJiraIssues, sampleCommits, 'SCNT-2025-20');
  
  // Save both formats
  await fs.writeFile('./output/modern-theme-sample.html', modernContent);
  await fs.writeFile('./output/confluence-format-sample.html', confluenceContent);
  
  console.log('✅ Comparison files generated:');
  console.log('📄 Modern Theme (unchanged): output/modern-theme-sample.html');
  console.log('📊 Confluence Format (new tables + emojis): output/confluence-format-sample.html');
  console.log('');
  console.log('🎯 Key Improvements in Confluence Format:');
  console.log('  ✨ Enhanced tables with emojis and better column headers');
  console.log('  📊 Percentage calculations for issue types and statuses');
  console.log('  👥 Contributor summary with commit distribution');
  console.log('  🎨 Better visual hierarchy with icons and styling');
  console.log('  📱 Improved responsive table layouts');
}

generateComparison().catch(console.error);
