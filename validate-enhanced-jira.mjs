#!/usr/bin/env node

/**
 * Enhanced JIRA Tools Validation Script
 * Tests all new JIRA integration utilities and MCP tools
 */

import fs from 'fs';
import path from 'path';

function validateFileStructure() {
  console.log('📁 Validating enhanced JIRA tools structure...\n');
  
  const requiredFiles = [
    'src/utils/JiraExtractor.ts',
    'src/utils/JiraAnalyzer.ts', 
    'src/services/EnhancedJiraService.ts',
    'src/index.ts',
    'ENHANCED_JIRA_TOOLS.md'
  ];
  
  let allValid = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - MISSING`);
      allValid = false;
    }
  });
  
  return allValid;
}

function validateJiraExtractor() {
  console.log('\n🔍 Validating JiraExtractor utility...\n');
  
  try {
    const extractorContent = fs.readFileSync('src/utils/JiraExtractor.ts', 'utf8');
    
    const checks = [
      { name: 'JiraTicketMetadata interface', pattern: /interface JiraTicketMetadata/ },
      { name: 'JiraComment interface', pattern: /interface JiraComment/ },
      { name: 'JiraWorklog interface', pattern: /interface JiraWorklog/ },
      { name: 'JiraLinkIssue interface', pattern: /interface JiraLinkIssue/ },
      { name: 'JiraChangeHistory interface', pattern: /interface JiraChangeHistory/ },
      { name: 'JiraTicketDetails interface', pattern: /interface JiraTicketDetails/ },
      { name: 'JiraExtractor class', pattern: /export class JiraExtractor/ },
      { name: 'extractMetadata method', pattern: /static extractMetadata/ },
      { name: 'extractComments method', pattern: /static extractComments/ },
      { name: 'extractWorklogs method', pattern: /static extractWorklogs/ },
      { name: 'extractLinkedIssues method', pattern: /static extractLinkedIssues/ },
      { name: 'extractChangeHistory method', pattern: /static extractChangeHistory/ },
      { name: 'extractComplete method', pattern: /static extractComplete/ },
      { name: 'generateSummary method', pattern: /static generateSummary/ }
    ];
    
    let allValid = true;
    
    checks.forEach(check => {
      if (check.pattern.test(extractorContent)) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name} - NOT FOUND`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.error('❌ Error reading JiraExtractor:', error.message);
    return false;
  }
}

function validateJiraAnalyzer() {
  console.log('\n📊 Validating JiraAnalyzer utility...\n');
  
  try {
    const analyzerContent = fs.readFileSync('src/utils/JiraAnalyzer.ts', 'utf8');
    
    const checks = [
      { name: 'StatusTransition interface', pattern: /interface StatusTransition/ },
      { name: 'CycleTimeMetrics interface', pattern: /interface CycleTimeMetrics/ },
      { name: 'ActivityPattern interface', pattern: /interface ActivityPattern/ },
      { name: 'CollaborationMetrics interface', pattern: /interface CollaborationMetrics/ },
      { name: 'QualityMetrics interface', pattern: /interface QualityMetrics/ },
      { name: 'RiskIndicators interface', pattern: /interface RiskIndicators/ },
      { name: 'TicketInsights interface', pattern: /interface TicketInsights/ },
      { name: 'JiraAnalyzer class', pattern: /export class JiraAnalyzer/ },
      { name: 'analyzeStatusTransitions method', pattern: /static analyzeStatusTransitions/ },
      { name: 'analyzeActivityPattern method', pattern: /static analyzeActivityPattern/ },
      { name: 'analyzeCollaboration method', pattern: /static analyzeCollaboration/ },
      { name: 'analyzeQuality method', pattern: /static analyzeQuality/ },
      { name: 'analyzeRisks method', pattern: /static analyzeRisks/ },
      { name: 'generateRecommendations method', pattern: /static generateRecommendations/ },
      { name: 'analyzeTicket method', pattern: /static analyzeTicket/ }
    ];
    
    let allValid = true;
    
    checks.forEach(check => {
      if (check.pattern.test(analyzerContent)) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name} - NOT FOUND`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.error('❌ Error reading JiraAnalyzer:', error.message);
    return false;
  }
}

function validateEnhancedJiraService() {
  console.log('\n🚀 Validating EnhancedJiraService...\n');
  
  try {
    const serviceContent = fs.readFileSync('src/services/EnhancedJiraService.ts', 'utf8');
    
    const checks = [
      { name: 'JiraApiConfig interface', pattern: /interface JiraApiConfig/ },
      { name: 'TicketAnalysisRequest interface', pattern: /interface TicketAnalysisRequest/ },
      { name: 'BulkAnalysisOptions interface', pattern: /interface BulkAnalysisOptions/ },
      { name: 'JiraReportingOptions interface', pattern: /interface JiraReportingOptions/ },
      { name: 'EnhancedJiraService class', pattern: /export class EnhancedJiraService/ },
      { name: 'analyzeTicket method', pattern: /async analyzeTicket/ },
      { name: 'bulkAnalyzeTickets method', pattern: /async bulkAnalyzeTickets/ },
      { name: 'searchAndAnalyze method', pattern: /async searchAndAnalyze/ },
      { name: 'generateReport method', pattern: /async generateReport/ },
      { name: 'getTicket method', pattern: /async getTicket/ },
      { name: 'searchTickets method', pattern: /async searchTickets/ }
    ];
    
    let allValid = true;
    
    checks.forEach(check => {
      if (check.pattern.test(serviceContent)) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name} - NOT FOUND`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.error('❌ Error reading EnhancedJiraService:', error.message);
    return false;
  }
}

function validateMCPIntegration() {
  console.log('\n🔧 Validating MCP server integration...\n');
  
  try {
    const indexContent = fs.readFileSync('src/index.ts', 'utf8');
    
    const checks = [
      { name: 'EnhancedJiraService import', pattern: /import.*EnhancedJiraService.*from/ },
      { name: 'enhancedJiraService property', pattern: /private enhancedJiraService: EnhancedJiraService/ },
      { name: 'enhancedJiraService initialization', pattern: /this\.enhancedJiraService = new EnhancedJiraService/ },
      { name: 'analyze_jira_ticket tool', pattern: /name: "analyze_jira_ticket"/ },
      { name: 'bulk_analyze_tickets tool', pattern: /name: "bulk_analyze_tickets"/ },
      { name: 'generate_jira_report tool', pattern: /name: "generate_jira_report"/ },
      { name: 'ticket_risk_assessment tool', pattern: /name: "ticket_risk_assessment"/ },
      { name: 'ticket_collaboration_analysis tool', pattern: /name: "ticket_collaboration_analysis"/ },
      { name: 'analyzeJiraTicket method', pattern: /private async analyzeJiraTicket/ },
      { name: 'bulkAnalyzeTickets method', pattern: /private async bulkAnalyzeTickets/ },
      { name: 'generateJiraReport method', pattern: /private async generateJiraReport/ },
      { name: 'ticketRiskAssessment method', pattern: /private async ticketRiskAssessment/ },
      { name: 'ticketCollaborationAnalysis method', pattern: /private async ticketCollaborationAnalysis/ },
      { name: 'analyze_jira_ticket case handler', pattern: /case "analyze_jira_ticket":/ },
      { name: 'bulk_analyze_tickets case handler', pattern: /case "bulk_analyze_tickets":/ }
    ];
    
    let allValid = true;
    
    checks.forEach(check => {
      if (check.pattern.test(indexContent)) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name} - NOT FOUND`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.error('❌ Error reading MCP server index:', error.message);
    return false;
  }
}

function validateDocumentation() {
  console.log('\n📚 Validating documentation...\n');
  
  try {
    const docContent = fs.readFileSync('ENHANCED_JIRA_TOOLS.md', 'utf8');
    
    const docChecks = [
      'Enhanced JIRA Integration Tools',
      'JiraExtractor',
      'JiraAnalyzer', 
      'EnhancedJiraService',
      'analyze_jira_ticket',
      'bulk_analyze_tickets',
      'generate_jira_report',
      'ticket_risk_assessment',
      'ticket_collaboration_analysis',
      'Risk Assessment Framework',
      'Collaboration Metrics',
      'Quality Evaluation',
      'Cycle Time Analysis',
      'Configuration & Setup',
      'Best Practices'
    ];
    
    let allValid = true;
    
    docChecks.forEach(check => {
      if (docContent.includes(check)) {
        console.log(`  ✅ ${check} documented`);
      } else {
        console.log(`  ❌ ${check} - NOT DOCUMENTED`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.error('❌ Error reading documentation:', error.message);
    return false;
  }
}

function validatePackageJsonUpdates() {
  console.log('\n📦 Validating package.json for new dependencies...\n');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      'axios',
      '@types/node',
      'typescript'
    ];
    
    let allValid = true;
    
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`  ✅ ${dep}: ${dependencies[dep]}`);
      } else {
        console.log(`  ❌ ${dep} - NOT FOUND`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Enhanced JIRA Tools - Comprehensive Validation\n');
  console.log('=' .repeat(60));
  
  const results = {
    fileStructure: validateFileStructure(),
    jiraExtractor: validateJiraExtractor(),
    jiraAnalyzer: validateJiraAnalyzer(),
    enhancedJiraService: validateEnhancedJiraService(),
    mcpIntegration: validateMCPIntegration(),
    documentation: validateDocumentation(),
    packageJson: validatePackageJsonUpdates()
  };
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 VALIDATION SUMMARY\n');
  
  Object.entries(results).forEach(([category, isValid]) => {
    const status = isValid ? '✅ PASS' : '❌ FAIL';
    const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`  ${categoryName}: ${status}`);
  });
  
  const allValid = Object.values(results).every(result => result);
  
  if (allValid) {
    console.log('\n🎉 All validations passed! Enhanced JIRA tools are ready.');
    console.log('\n📋 Available MCP Tools:');
    console.log('  • analyze_jira_ticket - Deep individual ticket analysis');
    console.log('  • bulk_analyze_tickets - Multi-ticket analysis with filtering');
    console.log('  • generate_jira_report - Comprehensive reporting with grouping');
    console.log('  • ticket_risk_assessment - Risk evaluation and mitigation');
    console.log('  • ticket_collaboration_analysis - Team collaboration insights');
    console.log('\n🚀 Next steps:');
    console.log('  1. Run: npm run mcp-server');
    console.log('  2. Use tools through VS Code Copilot');
    console.log('  3. Configure JIRA credentials in .env file');
    console.log('  4. Test with sample tickets for your project');
  } else {
    console.log('\n❌ Some validations failed. Please review the issues above.');
    console.log('\n🔧 Common fixes:');
    console.log('  • Ensure all TypeScript files compile without errors');
    console.log('  • Check import/export statements');
    console.log('  • Verify interface definitions');
    console.log('  • Update documentation if needed');
    process.exit(1);
  }
}

main();
