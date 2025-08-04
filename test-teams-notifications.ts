/**
 * Teams Notification Test Suite
 * 
 * This script tests various Teams notification methods to ensure they work correctly.
 */

import { TeamsService } from './src/services/TeamsService.js';
import { TeamsIntegrationTool } from './src/tools/TeamsIntegrationTool.js';
import { ProfessionalTeamsTemplateService } from './src/services/ProfessionalTeamsTemplateService.js';

export class TeamsNotificationTester {
  private teamsService: TeamsService;
  private teamsIntegrationTool: TeamsIntegrationTool;
  private professionalTeamsService: ProfessionalTeamsTemplateService;

  constructor() {
    this.teamsService = new TeamsService();
    this.teamsIntegrationTool = new TeamsIntegrationTool();
    this.professionalTeamsService = new ProfessionalTeamsTemplateService();
  }

  /**
   * Test all Teams notification methods
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Teams Notification Test Suite...\n');

    const tests = [
      { name: 'Basic Teams Service', fn: () => this.testBasicTeamsService() },
      { name: 'Professional Teams Template', fn: () => this.testProfessionalTeamsTemplate() },
      { name: 'Teams Integration Tool - executeIntegration', fn: () => this.testTeamsIntegrationTool() },
      { name: 'Teams Integration Tool - sendTeamsReport', fn: () => this.testTeamsReportMethod() },
      { name: 'Teams Connection Validation', fn: () => this.testTeamsConnection() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        console.log(`🔍 Testing: ${test.name}`);
        await test.fn();
        console.log(`✅ PASSED: ${test.name}\n`);
        passed++;
      } catch (error) {
        console.error(`❌ FAILED: ${test.name} - ${error.message}\n`);
        failed++;
      }
    }

    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📋 Total: ${passed + failed}`);
    
    if (failed === 0) {
      console.log('🎉 All Teams notification tests passed!');
    } else {
      console.log('⚠️ Some tests failed. Check the details above.');
    }
  }

  /**
   * Test basic Teams service notification
   */
  private async testBasicTeamsService(): Promise<void> {
    const testData = {
      title: '🧪 Test Notification - Basic Teams Service',
      message: 'This is a test of the basic Teams service notification functionality.',
      timestamp: new Date().toLocaleString()
    };

    await this.teamsService.sendNotification(testData);
    console.log('   ✓ Basic Teams service notification sent successfully');
  }

  /**
   * Test professional Teams template service
   */
  private async testProfessionalTeamsTemplate(): Promise<void> {
    const testData = {
      type: 'sprint-report' as const,
      title: '🧪 Test Sprint Report - Professional Template',
      priority: 'normal' as const,
      sprintData: {
        sprintId: 'TEST-2025-01',
        period: 'July 1-15, 2025',
        completionRate: 85,
        totalIssues: 20,
        completedIssues: 17,
        storyPoints: 34,
        commits: 25,
        contributors: 5,
        status: 'completed',
        startDate: '2025-07-01',
        endDate: '2025-07-15',
        duration: '2 weeks',
        reportDate: new Date().toISOString().split('T')[0]
      },
      workBreakdown: {
        userStories: { count: 8, percentage: 40 },
        bugFixes: { count: 6, percentage: 30 },
        tasks: { count: 4, percentage: 20 },
        epics: { count: 1, percentage: 5 },
        improvements: { count: 1, percentage: 5 }
      }
    };

    await this.professionalTeamsService.sendNotification(testData);
    console.log('   ✓ Professional Teams template notification sent successfully');
  }

  /**
   * Test Teams integration tool executeIntegration method
   */
  private async testTeamsIntegrationTool(): Promise<void> {
    const testData = {
      sprintNumber: 'TEST-2025-01',
      sprintDates: 'Jul 1 - Jul 15, 2025',
      completionRate: '85%',
      storyPoints: '34/40',
      commits: 25,
      contributors: 5,
      sprintStatus: 'completed'
    };

    const result = await this.teamsIntegrationTool.executeIntegration({
      type: 'sprint_completion',
      data: testData,
      urgency: 'medium',
      interactive: true
    });

    console.log(`   ✓ Teams integration tool executed successfully (ID: ${result.notificationId})`);
  }

  /**
   * Test Teams integration tool sendTeamsReport method
   */
  private async testTeamsReportMethod(): Promise<void> {
    const reportConfig = {
      reportType: 'single-sprint' as const,
      sprintNumber: 'TEST-2025-01',
      title: '🧪 Test Sprint Report',
      summary: 'This is a test of the sendTeamsReport functionality.',
      includeAttachment: false,
      extractContent: false
    };

    const result = await this.teamsIntegrationTool.sendTeamsReport(reportConfig);
    console.log(`   ✓ Teams report method executed successfully: ${result}`);
  }

  /**
   * Test Teams connection validation
   */
  private async testTeamsConnection(): Promise<void> {
    const result = await this.teamsIntegrationTool.validateTeamsConnection();
    console.log(`   ✓ Teams connection validation: ${result}`);
  }

  /**
   * Test Teams notification with sprint report data
   */
  async testSprintReportNotification(sprintNumber: string = 'SCNT-2025-22'): Promise<void> {
    console.log(`\n🎯 Testing Sprint Report Teams Notification for ${sprintNumber}...\n`);

    try {
      // Test with real sprint data format
      const sprintData = {
        sprintNumber,
        sprintDates: 'Jul 23 - Aug 6, 2025',
        completionRate: '38%',
        storyPoints: '63/225',
        commits: 46,
        contributors: 17,
        sprintStatus: 'active',
        filePath: `output/release-notes-${sprintNumber}-test.md`
      };

      console.log('📱 Testing enhanced Teams integration...');
      const result = await this.teamsIntegrationTool.executeIntegration({
        type: 'sprint_completion',
        data: sprintData,
        urgency: 'medium',
        interactive: true
      });

      console.log(`✅ Sprint report Teams notification sent successfully!`);
      console.log(`📋 Notification ID: ${result.notificationId}`);
      console.log(`📊 Status: ${result.status}`);

    } catch (error) {
      console.error(`❌ Sprint report Teams notification failed: ${error.message}`);
      throw error;
    }
  }
}

// Main test execution
async function runTeamsTests(): Promise<void> {
  const tester = new TeamsNotificationTester();
  
  try {
    // Run comprehensive test suite
    await tester.runAllTests();
    
    // Test with actual sprint data
    await tester.testSprintReportNotification('SCNT-2025-22');
    
  } catch (error) {
    console.error('🚨 Teams notification testing failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting Teams Notification Testing...\n');
  runTeamsTests().then(() => {
    console.log('\n✅ Teams notification testing completed!');
  }).catch(error => {
    console.error('\n❌ Teams notification testing failed:', error.message);
    process.exit(1);
  });
}
