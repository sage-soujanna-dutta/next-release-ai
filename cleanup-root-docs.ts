#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();

// Simple file moving function
function moveFileIfExists(filename: string, targetDir: string): boolean {
  const sourcePath = path.join(PROJECT_ROOT, filename);
  const targetPath = path.join(PROJECT_ROOT, targetDir, filename);
  
  if (fs.existsSync(sourcePath)) {
    try {
      // Ensure target directory exists
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.renameSync(sourcePath, targetPath);
      console.log(`✅ Moved: ${filename} → ${targetDir}/`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to move ${filename}: ${error}`);
      return false;
    }
  }
  return false;
}

async function cleanupRootDirectory() {
  console.log('🧹 Moving .md files from root to knowledge base directories');
  console.log('='.repeat(60));
  
  let movedCount = 0;
  
  // Setup files
  const setupFiles = [
    'AUTOMATION_GUIDE.md',
    'DEPLOYMENT_GUIDE.md', 
    'SECURITY-SETUP.md',
    'CLAUDE_DESKTOP_CONFIG.md',
    'QUICK_START.md',
    'README_SETUP.md'
  ];
  
  console.log('\n📁 Moving setup files...');
  setupFiles.forEach(file => {
    if (moveFileIfExists(file, 'docs/setup')) movedCount++;
  });
  
  // Guide files
  const guideFiles = [
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
  ];
  
  console.log('\n📁 Moving guide files...');
  guideFiles.forEach(file => {
    if (moveFileIfExists(file, 'docs/guides')) movedCount++;
  });
  
  // Template files
  const templateFiles = [
    'ENHANCED_TEMPLATE_SUMMARY.md',
    'FACTORY_PATTERN_SUMMARY.md',
    'STANDARD_SPRINT_REPORT_TEMPLATE.md',
    'TEMPLATE_VS_SERVICE_COMPARISON.md'
  ];
  
  console.log('\n📁 Moving template files...');
  templateFiles.forEach(file => {
    if (moveFileIfExists(file, 'docs/templates')) movedCount++;
  });
  
  // Sprint review files
  const sprintFiles = [
    'SCNT-2025-19_SPRINT_REVIEW_SUMMARY.md',
    'SCNT-2025-20-SPRINT-REVIEW-DELIVERED.md',
    'SCNT-SPRINT-21-SUMMARY.md',
    'SCNT-2025-22-COMPLETE-REPORT-SUMMARY.md',
    'SPRINT_REVIEW_SUMMARY.md'
  ];
  
  console.log('\n📁 Moving sprint review files...');
  sprintFiles.forEach(file => {
    if (moveFileIfExists(file, 'docs/sprint-reviews')) movedCount++;
  });
  
  // Report files
  const reportFiles = [
    'COMPLETE_RELEASE_WORKFLOW_RESULTS.md',
    'TEAMS_VALIDATION_REPORT.md',
    'TEAMS-LAYOUT-FIXED-SUMMARY.md',
    'TEAMS_BULLETS_NUMBERING_FIX.md',
    'TEAMS_CONTENT_ORDER_COMPLETE.md',
    'TEAMS_INDENTATION_FIX_SUMMARY.md',
    'TEAMS_MESSAGE_ORDER_FIX.md',
    'TEAMS_NOTIFICATION_DISPLAY_FIX.md'
  ];
  
  console.log('\n📁 Moving report files...');
  reportFiles.forEach(file => {
    if (moveFileIfExists(file, 'docs/reports')) movedCount++;
  });
  
  // Move remaining .md files to summaries (except README.md)
  console.log('\n📁 Moving remaining files to summaries...');
  const remainingFiles = fs.readdirSync(PROJECT_ROOT)
    .filter(file => file.endsWith('.md') && file !== 'README.md');
  
  remainingFiles.forEach(file => {
    if (moveFileIfExists(file, 'docs/summaries')) movedCount++;
  });
  
  // Final verification
  console.log('\n🔍 Final verification...');
  const finalMdFiles = fs.readdirSync(PROJECT_ROOT)
    .filter(file => file.endsWith('.md'));
  
  console.log(`\n✅ Cleanup Complete!`);
  console.log(`📊 Files moved: ${movedCount}`);
  console.log(`📄 Files remaining in root: ${finalMdFiles.length}`);
  
  if (finalMdFiles.length === 1 && finalMdFiles[0] === 'README.md') {
    console.log('🎉 SUCCESS: Root directory cleaned! Only README.md remains.');
  } else {
    console.log('📋 Remaining files:', finalMdFiles);
  }
  
  return movedCount;
}

cleanupRootDirectory().catch(console.error);
