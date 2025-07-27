#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Test MCP Tools
async function testMCPTool(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing MCP Tool: ${toolName}`);
    console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));
    
    const child = spawn('npx', ['tsx', 'src/index.ts'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Send initialization request
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    };

    // Send tool call request
    const toolRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    child.stdin.write(JSON.stringify(initRequest) + '\n');
    setTimeout(() => {
      child.stdin.write(JSON.stringify(toolRequest) + '\n');
      child.stdin.end();
    }, 1000);

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Process exited with code ${code}`);
        console.error(`📋 Error:`, error);
        reject(new Error(`Process failed with code ${code}`));
      } else {
        console.log(`✅ Tool ${toolName} executed successfully`);
        console.log(`📤 Output:`, output.slice(-500)); // Last 500 chars
        resolve(output);
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      child.kill();
      reject(new Error('Test timeout'));
    }, 30000);
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Testing MCP Tools Integration\n');

  try {
    // Test 1: Analyze Story Points
    await testMCPTool('analyze_story_points', {
      sprintNumbers: ['SCNT-2025-20', 'SCNT-2025-21'],
      sendToTeams: false
    });

    // Test 2: Generate Velocity Report
    await testMCPTool('generate_velocity_report', {
      sprintNumbers: ['SCNT-2025-19', 'SCNT-2025-20', 'SCNT-2025-21'],
      sendToTeams: false
    });

    // Test 3: Sprint Summary Report
    await testMCPTool('sprint_summary_report', {
      sprintNumber: 'SCNT-2025-21',
      sendToTeams: false,
      includeTeamMetrics: true
    });

    console.log('\n🎉 All MCP Tools tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Test interrupted');
  process.exit(0);
});

runTests();
