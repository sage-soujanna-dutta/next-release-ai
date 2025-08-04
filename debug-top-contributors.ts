import { ReleaseNotesService } from './src/services/ReleaseNotesService.js';

async function testTopContributors() {
  console.log('Testing Top Contributors section generation...');
  
  try {
    const service = new ReleaseNotesService();
    const result = await service.generateReleaseNotes({
      sprintNumber: 'SCNT-2025-22',
      format: 'markdown'
    });
    
    console.log('Generation successful');
    console.log('Content length:', result.content.length);
    console.log('Contains Top Contributors:', result.content.includes('🏆'));
    console.log('Contains Priority Resolution Status:', result.content.includes('Priority Resolution Status'));
    
    // Find where content cuts off
    const lines = result.content.split('\n');
    console.log('Total lines:', lines.length);
    console.log('Last 10 lines:');
    lines.slice(-10).forEach((line, i) => {
      console.log(`${lines.length - 10 + i}: ${line}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testTopContributors();
