#!/usr/bin/env node

import { spawn } from 'child_process';

const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let hasStarted = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 Server Response:', output);
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  console.log('📋 Server Log:', output);
  
  if (output.includes('Server ready') && !hasStarted) {
    hasStarted = true;
    console.log('\n🔧 Testing both tools...\n');
    
    // Test 1: Working tool
    console.log('1️⃣ Testing fetch_jira_issues...');
    const workingRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "fetch_jira_issues",
        arguments: { sprintNumber: "SCNT-2025-20" }
      }
    }) + '\n';
    
    serverProcess.stdin.write(workingRequest);
    
    // Test 2: Our new tool after a delay
    setTimeout(() => {
      console.log('\n2️⃣ Testing list_all_jira_boards...');
      const boardsRequest = JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "list_all_jira_boards",
          arguments: { format: "summary" }
        }
      }) + '\n';
      
      serverProcess.stdin.write(boardsRequest);
      
      // Kill after another delay
      setTimeout(() => {
        console.log('\n🛑 Terminating server...');
        serverProcess.kill();
      }, 5000);
    }, 3000);
  }
});

serverProcess.on('close', (code) => {
  console.log(`\n🏁 Server exited with code ${code}`);
});

setTimeout(() => {
  if (!serverProcess.killed) {
    console.log('\n⏰ Emergency timeout');
    serverProcess.kill();
  }
}, 15000);
