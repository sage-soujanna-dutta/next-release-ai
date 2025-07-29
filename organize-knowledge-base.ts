#!/usr/bin/env npx tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = '/Users/snehaldangroshiya/next-release-ai';

// File organization mapping
const fileOrganization = {
  'docs/setup': [
    'AUTOMATION_GUIDE.md',
    'DEPLOYMENT_GUIDE.md',
    'SECURITY-SETUP.md',
    'CLAUDE_DESKTOP_CONFIG.md',
    'QUICK_START.md',
    'README_SETUP.md'
  ],
  'docs/guides': [
    'HOW_TO_GET_TOP_CONTRIBUTORS.md',
    'HOW_TO_UTILIZE_MCP_SERVER.md',
    'HOW_TO_USE_MCP_SERVER.md',
    'MCP_SERVER_USAGE_GUIDE.md',
    'MCP_COMMANDS.md',
    'MCP_SPRINT_REPORTS_GUIDE.md',
    'RELEASE_WORKFLOW_GUIDE.md',
    'PROFESSIONAL_PRESENTATION_GUIDE.md',
    'GITHUB_COPILOT_INTEGRATION.md',
    'GITHUB_COPILOT_READY.md',
    'TEAMS_TEMPLATE_SYSTEM_GUIDE.md',
    'SPRINT_REPORT_QUICK_REFERENCE.md'
  ],
  'docs/templates': [
    'ENHANCED_TEMPLATE_SUMMARY.md',
    'FACTORY_PATTERN_SUMMARY.md',
    'STANDARD_SPRINT_REPORT_TEMPLATE.md',
    'TEMPLATE_VS_SERVICE_COMPARISON.md'
  ],
  'docs/summaries': [
    'BUILD_SUMMARY.md',
    'CONSOLIDATION_SUMMARY.md',
    'DOCUMENTATION_SUMMARY.md',
    'ENHANCED_JIRA_TOOLS.md',
    'ENHANCED_TEAMS_LAYOUT_SUMMARY.md',
    'project-showcase.md',
    'MCP_SERVER_UTILIZATION_SUMMARY.md',
    'MCP_TOOLS_INTEGRATION.md',
    'PROFESSIONAL_SPRINT_REPORTS_SUMMARY.md',
    'TEAMS_NOTIFICATIONS_SUMMARY.md',
    'TEAMS_SERVICE_PROFESSIONAL_DEFAULT.md',
    'STAKEHOLDER_RELEASE_NOTES_DOCUMENTATION.md',
    'PDF_REPORT_GENERATOR_CODE_REVIEW.md',
    'HTML_ATTACHMENT_SOLUTION_SUMMARY.md',
    'HTML_REPORT_TEAMS_SUMMARY.md',
    'MOST_ACCURATE_CONTRIBUTOR_ANALYSIS_COMPLETE.md'
  ],
  'docs/sprint-reviews': [
    'SCNT-2025-19_SPRINT_REVIEW_SUMMARY.md',
    'SCNT-2025-20-SPRINT-REVIEW-DELIVERED.md',
    'SCNT-SPRINT-21-SUMMARY.md',
    'SCNT-2025-22-COMPLETE-REPORT-SUMMARY.md',
    'SPRINT_REVIEW_SUMMARY.md'
  ],
  'docs/reports': [
    'COMPLETE_RELEASE_WORKFLOW_RESULTS.md',
    'TEAMS_VALIDATION_REPORT.md',
    'TEAMS-LAYOUT-FIXED-SUMMARY.md',
    'TEAMS_BULLETS_NUMBERING_FIX.md',
    'TEAMS_CONTENT_ORDER_COMPLETE.md',
    'TEAMS_INDENTATION_FIX_SUMMARY.md',
    'TEAMS_MESSAGE_ORDER_FIX.md',
    'TEAMS_NOTIFICATION_DISPLAY_FIX.md'
  ]
};

async function organizeDocumentation() {
  console.log('🗂️  Organizing Markdown Files into Knowledge Base Structure');
  console.log('='.repeat(70));

  let totalMoved = 0;

  // Move files according to the organization mapping
  for (const [folder, files] of Object.entries(fileOrganization)) {
    console.log(`\n📁 Moving files to ${folder}/`);
    
    for (const file of files) {
      const sourcePath = path.join(PROJECT_ROOT, file);
      const destPath = path.join(PROJECT_ROOT, folder, file);
      
      if (fs.existsSync(sourcePath)) {
        try {
          // Ensure destination directory exists
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          
          // Move the file
          fs.renameSync(sourcePath, destPath);
          console.log(`  ✅ ${file} → ${folder}/`);
          totalMoved++;
        } catch (error) {
          console.log(`  ❌ Failed to move ${file}: ${error}`);
        }
      } else {
        console.log(`  ⚠️  ${file} not found`);
      }
    }
  }

  // Move any remaining .md files to summaries (except README.md)
  console.log(`\n📁 Moving remaining files to docs/summaries/`);
  const remainingFiles = fs.readdirSync(PROJECT_ROOT)
    .filter(file => file.endsWith('.md') && file !== 'README.md');

  for (const file of remainingFiles) {
    const sourcePath = path.join(PROJECT_ROOT, file);
    const destPath = path.join(PROJECT_ROOT, 'docs/summaries', file);
    
    try {
      fs.renameSync(sourcePath, destPath);
      console.log(`  ✅ ${file} → docs/summaries/`);
      totalMoved++;
    } catch (error) {
      console.log(`  ❌ Failed to move ${file}: ${error}`);
    }
  }

  console.log(`\n✅ Organization Complete! Moved ${totalMoved} files`);
  console.log('\n📊 Knowledge Base Structure:');
  console.log('  • docs/setup/ - Installation and configuration guides');
  console.log('  • docs/guides/ - User guides and how-to documentation');
  console.log('  • docs/templates/ - Reusable templates and patterns');
  console.log('  • docs/summaries/ - Project summaries and general documentation');
  console.log('  • docs/sprint-reviews/ - Sprint-specific reviews and reports');
  console.log('  • docs/reports/ - Status reports and validation documents');

  return totalMoved;
}

// Run the organization
organizeDocumentation().then((count) => {
  console.log(`\n🎉 Successfully organized ${count} documentation files!`);
}).catch(console.error);
