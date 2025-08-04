import { TeamsIntegrationTool } from './src/tools/TeamsIntegrationTool.js';

async function testTeamsIntegration() {
  console.log('Testing Teams integration...');
  
  try {
    const tool = new TeamsIntegrationTool();
    
    // Test if the method exists
    console.log('executeIntegration method exists:', typeof tool.executeIntegration === 'function');
    
    if (typeof tool.executeIntegration === 'function') {
      const result = await tool.executeIntegration({
        type: 'sprint_completion',
        data: {
          commits: 46,
          completionRate: '38%',
          contributors: 17,
          sprintDates: 'Jul 23 - Aug 6, 2025',
          sprintNumber: 'SCNT-2025-22',
          sprintStatus: 'active',
          storyPoints: '63/225'
        },
        urgency: 'medium',
        interactive: true
      });
      
      console.log('Result:', result);
    } else {
      console.log('Method not found. Available methods:');
      console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(tool)).filter(name => name !== 'constructor'));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testTeamsIntegration();
