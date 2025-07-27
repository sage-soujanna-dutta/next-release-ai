#!/usr/bin/env tsx

import { TeamsService } from './src/services/TeamsService';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: string;
}

class TeamsConnectionValidator {
  private results: ValidationResult[] = [];
  
  private addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: string) {
    this.results.push({ test, status, message, details });
  }
  
  private getStatusIcon(status: 'PASS' | 'FAIL' | 'WARN'): string {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'WARN': return '⚠️';
    }
  }
  
  async validateEnvironmentVariables(): Promise<void> {
    console.log('🔍 Validating environment variables...');
    
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    const webhookEmail = process.env.TEAMS_WEBHOOK_EMAIL;
    
    if (!webhookUrl) {
      this.addResult('Environment Variables', 'FAIL', 'TEAMS_WEBHOOK_URL not found');
      return;
    }
    
    // Validate webhook URL format
    const teamsWebhookPattern = /^https:\/\/[a-zA-Z0-9\-\.]+\.webhook\.office\.com\/webhookb2\//;
    if (!teamsWebhookPattern.test(webhookUrl)) {
      this.addResult('Webhook URL Format', 'WARN', 'URL format may be invalid', 
        'Expected: https://[tenant].webhook.office.com/webhookb2/...');
    } else {
      this.addResult('Webhook URL Format', 'PASS', 'URL format is valid');
    }
    
    if (webhookEmail) {
      this.addResult('Environment Variables', 'PASS', 'All Teams variables configured', 
        `Webhook: ${webhookUrl.substring(0, 50)}...\nEmail: ${webhookEmail}`);
    } else {
      this.addResult('Environment Variables', 'WARN', 'TEAMS_WEBHOOK_EMAIL not configured (optional)');
    }
  }
  
  async validateWebhookConnectivity(): Promise<void> {
    console.log('🔗 Testing webhook connectivity...');
    
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    if (!webhookUrl) {
      this.addResult('Webhook Connectivity', 'FAIL', 'No webhook URL to test');
      return;
    }
    
    const testPayload = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: "Connection Test",
      themeColor: "0076D7",
      title: "🔍 Webhook Connectivity Test",
      text: "Testing direct webhook connectivity"
    };
    
    try {
      const response = await axios.post(webhookUrl, testPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      if (response.status === 200) {
        this.addResult('Webhook Connectivity', 'PASS', 'Direct webhook call successful', 
          `Status: ${response.status}, Response: ${response.data}`);
      } else {
        this.addResult('Webhook Connectivity', 'WARN', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      this.addResult('Webhook Connectivity', 'FAIL', 'Direct webhook call failed', 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  async validateTeamsService(): Promise<void> {
    console.log('🛠️ Testing TeamsService class...');
    
    try {
      const teamsService = new TeamsService();
      
      // Test basic notification
      await teamsService.sendNotification(
        "Service Validation Test",
        "Testing TeamsService.sendNotification() method"
      );
      
      this.addResult('TeamsService Basic', 'PASS', 'sendNotification() method works');
      
      // Test rich notification
      await teamsService.sendRichNotification({
        title: "🧪 Service Validation",
        summary: "Testing TeamsService.sendRichNotification()",
        facts: [
          { name: "Test Type", value: "Rich Notification" },
          { name: "Status", value: "Testing" },
          { name: "Timestamp", value: new Date().toISOString() }
        ]
      });
      
      this.addResult('TeamsService Rich', 'PASS', 'sendRichNotification() method works');
      
    } catch (error) {
      this.addResult('TeamsService', 'FAIL', 'TeamsService methods failed', 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  async validateReleaseWorkflowIntegration(): Promise<void> {
    console.log('🚀 Testing release workflow integration...');
    
    try {
      // Simulate a release notification like the one sent in your workflow
      const teamsService = new TeamsService();
      
      const mockReleaseContent = `## Release Notes - SCNT-2025-20
      
### 🚀 New Features
- Enhanced Teams notification system
- Improved webhook validation
- Better error handling

### 🐛 Bug Fixes  
- Fixed notification formatting
- Resolved connectivity issues

### 📊 Statistics
- **Total Issues:** 12
- **Features:** 8
- **Bug Fixes:** 4
- **Deploy Status:** ✅ Successful

Generated on ${new Date().toLocaleString()}`;

      await teamsService.sendNotification(
        "🚀 Release SCNT-2025-20 Published",
        mockReleaseContent
      );
      
      this.addResult('Release Workflow', 'PASS', 'Release notification integration works');
      
    } catch (error) {
      this.addResult('Release Workflow', 'FAIL', 'Release workflow integration failed', 
        error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  printResults(): void {
    console.log('\n📊 Validation Results');
    console.log('=====================\n');
    
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;
    
    this.results.forEach(result => {
      const icon = this.getStatusIcon(result.status);
      console.log(`${icon} ${result.test}: ${result.message}`);
      
      if (result.details) {
        console.log(`   ${result.details.split('\n').join('\n   ')}`);
      }
      
      switch (result.status) {
        case 'PASS': passCount++; break;
        case 'FAIL': failCount++; break;
        case 'WARN': warnCount++; break;
      }
      
      console.log();
    });
    
    console.log('📈 Summary:');
    console.log(`   ✅ Passed: ${passCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   ⚠️  Warnings: ${warnCount}`);
    
    if (failCount === 0) {
      console.log('\n🎉 All critical tests passed! Your Teams integration is working properly.');
      console.log('📱 Check your Teams channel for the test messages.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
      process.exit(1);
    }
  }
  
  async runAllValidations(): Promise<void> {
    console.log('🧪 Teams Integration Comprehensive Validator');
    console.log('==========================================\n');
    
    await this.validateEnvironmentVariables();
    await this.validateWebhookConnectivity();
    await this.validateTeamsService();
    await this.validateReleaseWorkflowIntegration();
    
    this.printResults();
  }
}

// Run the comprehensive validation
const validator = new TeamsConnectionValidator();
validator.runAllValidations().catch(console.error);
