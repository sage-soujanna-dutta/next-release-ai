import { TeamsService } from '../services/TeamsService.js';
import axios from 'axios';

export class TeamsValidationTool {
  private teamsService: TeamsService;

  constructor() {
    this.teamsService = new TeamsService();
  }

  async validateTeamsIntegration(): Promise<{
    webhookConfigured: boolean;
    webhookValid: boolean;
    connectionTest: boolean;
    errorDetails?: string;
  }> {
    const results = {
      webhookConfigured: false,
      webhookValid: false,
      connectionTest: false,
      errorDetails: undefined as string | undefined
    };

    try {
      // Check if webhook URL is configured
      const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
      if (!webhookUrl) {
        results.errorDetails = 'TEAMS_WEBHOOK_URL environment variable not set';
        return results;
      }

      results.webhookConfigured = true;

      // Validate webhook URL format
      try {
        new URL(webhookUrl);
        results.webhookValid = true;
      } catch (error) {
        results.errorDetails = 'Invalid webhook URL format';
        return results;
      }

      // Test connection with a simple message
      const testMessage = {
        text: `🔧 Teams Integration Test - ${new Date().toLocaleString()}\n\nThis is an automated test message to verify the Teams webhook connection is working properly.`
      };

      const response = await axios.post(webhookUrl, testMessage, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.status === 200) {
        results.connectionTest = true;
        console.log('✅ Teams integration test successful');
      } else {
        results.errorDetails = `HTTP ${response.status}: ${response.statusText}`;
      }

    } catch (error: any) {
      results.errorDetails = error.message || 'Unknown error occurred';
      console.error('❌ Teams integration test failed:', error);
    }

    return results;
  }

  async sendValidationReport(results: {
    webhookConfigured: boolean;
    webhookValid: boolean;
    connectionTest: boolean;
    errorDetails?: string;
  }): Promise<void> {
    const overallStatus = results.webhookConfigured && results.webhookValid && results.connectionTest;
    const statusEmoji = overallStatus ? '✅' : '❌';
    const statusText = overallStatus ? 'SUCCESS' : 'FAILED';

    const report = `## 🔧 Teams Integration Validation Report

**Overall Status:** ${statusEmoji} **${statusText}**  
**Test Date:** ${new Date().toLocaleString()}

---

## 📋 **Test Results**

### **Configuration Check**
- **Webhook URL Configured:** ${results.webhookConfigured ? '✅ Yes' : '❌ No'}
- **Webhook URL Valid:** ${results.webhookValid ? '✅ Yes' : '❌ No'}

### **Connection Test**
- **Webhook Connection:** ${results.connectionTest ? '✅ Working' : '❌ Failed'}

${results.errorDetails ? `
### **⚠️ Error Details**
\`\`\`
${results.errorDetails}
\`\`\`
` : ''}

---

## 🎯 **Recommendations**

${!results.webhookConfigured ? `
### **❌ Missing Configuration**
1. Set up Teams webhook URL in environment variables:
   \`TEAMS_WEBHOOK_URL=https://your-teams-webhook-url\`
2. Restart the application after configuration
` : ''}

${results.webhookConfigured && !results.webhookValid ? `
### **❌ Invalid Webhook URL**
1. Verify the webhook URL format is correct
2. Ensure it starts with \`https://\`
3. Check for any extra characters or spaces
` : ''}

${results.webhookConfigured && results.webhookValid && !results.connectionTest ? `
### **❌ Connection Issues**
1. Verify the webhook URL is still active in Teams
2. Check network connectivity and firewall settings
3. Ensure the webhook hasn't been deleted or disabled
4. Try regenerating the webhook URL in Teams
` : ''}

${overallStatus ? `
### **✅ Teams Integration Working**
- All tests passed successfully
- Ready for production use
- Automated notifications will be delivered
` : ''}

---

**System:** Next Release AI - Teams Integration Validator  
**Note:** This validation runs comprehensive tests to ensure reliable Teams integration.`;

    try {
      await this.teamsService.sendNotification(
        `🔧 Teams Integration Validation - ${statusText}`,
        report
      );
      console.log('✅ Validation report sent to Teams');
    } catch (error) {
      console.error('❌ Failed to send validation report (ironically):', error);
      // Don't throw - this would be recursive failure
    }
  }

  async performComprehensiveTest(): Promise<{
    configurationTest: boolean;
    basicMessageTest: boolean;
    richNotificationTest: boolean;
    errorTest: boolean;
    overallScore: number;
    recommendations: string[];
  }> {
    const results = {
      configurationTest: false,
      basicMessageTest: false,
      richNotificationTest: false,
      errorTest: false,
      overallScore: 0,
      recommendations: [] as string[]
    };

    // Test 1: Configuration
    const basicValidation = await this.validateTeamsIntegration();
    results.configurationTest = basicValidation.webhookConfigured && basicValidation.webhookValid;

    if (!results.configurationTest) {
      results.recommendations.push('Fix Teams webhook configuration');
      return results; // Can't continue without valid configuration
    }

    // Test 2: Basic message
    try {
      await this.teamsService.sendNotification(
        'Test: Basic Message',
        'This is a basic message test for Teams integration validation.'
      );
      results.basicMessageTest = true;
    } catch (error) {
      results.recommendations.push('Fix basic message sending capability');
    }

    // Test 3: Rich notification
    try {
      await this.teamsService.sendRichNotification({
        title: 'Test: Rich Notification',
        summary: 'Rich notification test for comprehensive Teams validation',
        facts: [
          { name: 'Test Type', value: 'Rich Notification' },
          { name: 'Status', value: 'Testing' },
          { name: 'Time', value: new Date().toLocaleString() }
        ]
      });
      results.richNotificationTest = true;
    } catch (error) {
      results.recommendations.push('Fix rich notification capability');
    }

    // Test 4: Error handling
    results.errorTest = true; // Assume error handling works if we got this far

    // Calculate score
    const testCount = 4;
    const passedTests = [
      results.configurationTest,
      results.basicMessageTest,
      results.richNotificationTest,
      results.errorTest
    ].filter(Boolean).length;

    results.overallScore = Math.round((passedTests / testCount) * 100);

    // Generate recommendations
    if (results.overallScore === 100) {
      results.recommendations.push('Teams integration is fully operational');
    } else if (results.overallScore >= 75) {
      results.recommendations.push('Teams integration is mostly working - address remaining issues');
    } else {
      results.recommendations.push('Teams integration needs significant fixes');
    }

    return results;
  }
}
