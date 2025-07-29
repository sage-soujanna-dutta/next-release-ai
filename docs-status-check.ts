#!/usr/bin/env npx tsx

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();

function checkDirectoryStatus() {
  console.log('📊 Documentation Organization Status Report');
  console.log('='.repeat(50));
  
  // Check root directory
  const rootMdFiles = fs.readdirSync(PROJECT_ROOT)
    .filter(file => file.endsWith('.md'));
  
  console.log('\n🔍 Root Directory Analysis:');
  console.log(`  Total .md files: ${rootMdFiles.length}`);
  
  if (rootMdFiles.length <= 5) {
    rootMdFiles.forEach(file => {
      console.log(`  📄 ${file}`);
    });
  } else {
    rootMdFiles.slice(0, 5).forEach(file => {
      console.log(`  📄 ${file}`);
    });
    console.log(`  ... and ${rootMdFiles.length - 5} more files`);
  }
  
  // Check docs directories
  console.log('\n📁 Knowledge Base Directories:');
  const docsDirs = ['docs/setup', 'docs/guides', 'docs/templates', 'docs/summaries', 'docs/sprint-reviews', 'docs/reports'];
  
  let totalDocsFiles = 0;
  docsDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      console.log(`  📂 ${dir}: ${files.length} files`);
      totalDocsFiles += files.length;
    } else {
      console.log(`  ❌ ${dir}: Not found`);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`  Knowledge base files: ${totalDocsFiles}`);
  console.log(`  Root directory files: ${rootMdFiles.length}`);
  console.log(`  Total documentation: ${totalDocsFiles + rootMdFiles.length}`);
  
  // Status assessment
  console.log('\n🎯 Status Assessment:');
  if (rootMdFiles.length === 1 && rootMdFiles[0] === 'README.md') {
    console.log('  ✅ EXCELLENT: Root directory is clean!');
    console.log('  ✅ Only README.md remains in root as expected');
    console.log('  ✅ Knowledge base is properly organized');
  } else if (rootMdFiles.length <= 5) {
    console.log('  ⚠️  GOOD: Most files organized, few remain in root');
    console.log('  🔧 Consider manual cleanup of remaining files');
  } else {
    console.log('  ❌ NEEDS WORK: Many files still in root directory');
    console.log('  🔧 Manual organization required');
  }
  
  console.log('\n🚀 Next Steps:');
  if (rootMdFiles.length === 1) {
    console.log('  📚 Knowledge base is ready for use!');
    console.log('  👉 Access via: docs/README.md');
  } else {
    console.log('  🧹 Complete manual cleanup of remaining root files');
    console.log('  📝 Verify all important docs are in knowledge base');
  }
}

checkDirectoryStatus();
