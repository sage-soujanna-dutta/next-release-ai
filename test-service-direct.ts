import { ReleaseNotesService } from './src/services/ReleaseNotesService.js';

// Test the service directly
const service = new ReleaseNotesService();

console.log('Testing ReleaseNotesService with markdown format...');

// Use a simple test to see what gets generated
try {
  const result = await service.generateReleaseNotes({
    sprintNumber: 'SCNT-2025-22',
    format: 'markdown'
  });
  console.log('Generated content (first 500 chars):');
  console.log(result.content.substring(0, 500));
  console.log('\n=== Title extraction ===');
  const lines = result.content.split('\n');
  console.log('First line:', lines[0]);
  console.log('Second line:', lines[1]);
  console.log('Third line:', lines[2]);
} catch (error) {
  console.error('Error:', error);
}
