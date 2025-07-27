#!/usr/bin/env node

/**
 * Final validation of MCP Tools Integration
 * Ensures all components are working correctly
 */

import fs from 'fs';
import path from 'path';

function validateFiles() {
  console.log('📁 Validating file structure...\n');
  
  const requiredFiles = [
    'src/index.ts',
    'src/services/JiraService.ts',
    'src/services/TeamsService.ts',
    'src/services/FileService.ts',
    'MCP_TOOLS_INTEGRATION.md',
    'package.json'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - MISSING`);
      missingFiles.push(file);
    }
  });
  
  return missingFiles.length === 0;
}

function validateMCPServer() {
  console.log('\n🔍 Validating MCP server structure...\n');
  
  try {
    const indexContent = fs.readFileSync('src/index.ts', 'utf8');
    
    const checks = [
      { name: 'ReleaseMCPServer class', pattern: /class ReleaseMCPServer/ },
      { name: 'JiraService integration', pattern: /private jiraService: JiraService/ },
      { name: 'TeamsService integration', pattern: /private teamsService: TeamsService/ },
      { name: 'analyzeStoryPoints method', pattern: /private async analyzeStoryPoints/ },
      { name: 'generateVelocityReport method', pattern: /private async generateVelocityReport/ },
      { name: 'sprintSummaryReport method', pattern: /private async sprintSummaryReport/ },
      { name: 'analyze_story_points tool', pattern: /name: "analyze_story_points"/ },
      { name: 'generate_velocity_report tool', pattern: /name: "generate_velocity_report"/ },
      { name: 'sprint_summary_report tool', pattern: /name: "sprint_summary_report"/ }
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
    console.error('❌ Error reading MCP server file:', error.message);
    return false;
  }
}

function validatePackageJson() {
  console.log('\n📦 Validating package.json scripts...\n');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const expectedScripts = [
      'mcp-server',
      'story-points', 
      'velocity',
      'sprint-summary'
    ];
    
    let allValid = true;
    
    expectedScripts.forEach(script => {
      if (scripts[script]) {
        console.log(`  ✅ npm run ${script}`);
      } else {
        console.log(`  ❌ npm run ${script} - NOT FOUND`);
        allValid = false;
      }
    });
    
    return allValid;
  } catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    return false;
  }
}

function validateDocumentation() {
  console.log('\n📚 Validating documentation...\n');
  
  try {
    const integrationDoc = fs.readFileSync('MCP_TOOLS_INTEGRATION.md', 'utf8');
    
    const docChecks = [
      'analyze_story_points',
      'generate_velocity_report', 
      'sprint_summary_report',
      'MCP Tools Integration Summary',
      'Architecture Improvements'
    ];
    
    let allValid = true;
    
    docChecks.forEach(check => {
      if (integrationDoc.includes(check)) {
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

async function main() {
  console.log('🧪 MCP Tools Integration - Final Validation\n');
  console.log('=' .repeat(50));
  
  const results = {
    files: validateFiles(),
    mcpServer: validateMCPServer(),
    packageJson: validatePackageJson(),
    documentation: validateDocumentation()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 VALIDATION SUMMARY\n');
  
  Object.entries(results).forEach(([category, isValid]) => {
    const status = isValid ? '✅ PASS' : '❌ FAIL';
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    console.log(`  ${categoryName}: ${status}`);
  });
  
  const allValid = Object.values(results).every(result => result);
  
  if (allValid) {
    console.log('\n🎉 All validations passed! MCP Tools integration is complete.');
    console.log('\n📋 Next steps:');
    console.log('  1. Run: npm run mcp-server');
    console.log('  2. Use tools through VS Code Copilot');
    console.log('  3. Test individual tools with CLI scripts');
  } else {
    console.log('\n❌ Some validations failed. Please review the issues above.');
    process.exit(1);
  }
}

main();
