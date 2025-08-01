#!/usr/bin/env node

import { ReleaseNotesService } from './src/services/ReleaseNotesService.js';

async function testReleaseNotesService() {
  console.log('🔧 Testing ReleaseNotesService directly...');
  
  try {
    const releaseNotesService = new ReleaseNotesService();
    
    console.log('📝 Generating release notes for SCNT-2025-20...');
    const result = await releaseNotesService.generateReleaseNotes({
      sprintNumber: 'SCNT-2025-20',
      format: 'markdown',
      theme: 'modern'
    });

    console.log('✅ Release notes generated successfully!');
    console.log('📊 Stats:', result.stats);
    console.log('📁 File path:', result.filePath);
    console.log('📄 Content length:', result.content.length);
    
    // Show first 200 characters of content
    console.log('📖 Content preview:');
    console.log(result.content.substring(0, 200) + '...');

    return true;
  } catch (error) {
    console.error('❌ Error testing ReleaseNotesService:', error);
    return false;
  }
}

testReleaseNotesService()
  .then(success => {
    console.log(success ? '✅ Direct service test passed' : '❌ Direct service test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
