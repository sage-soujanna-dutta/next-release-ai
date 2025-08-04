#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

const serverPath = path.join(process.cwd(), 'dist', 'index.js');

console.log('🚀 Testing list_all_jira_boards via MCP server...');

const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

let hasStarted = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 STDOUT:', output);
  
  try {
    const parsed = JSON.parse(output);
    if (parsed.result && parsed.result.content) {
      console.log('✅ Tool executed successfully!');
      console.log('📋 Result:', parsed.result.content[0].text);
      serverProcess.kill();
    }
  } catch (e) {
    // Not JSON, ignore
  }
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  console.log('📋 STDERR:', output);
  
  if (output.includes('Server ready for connections') && !hasStarted) {
    hasStarted = true;
    console.log('✅ Server started, sending list_all_jira_boards request...');
    
    const toolRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "list_all_jira_boards",
        arguments: {
          format: "summary"
        }
      }
    }) + '\n';
    
    serverProcess.stdin.write(toolRequest);
    
    // Kill after 10 seconds if no response
    setTimeout(() => {
      if (!serverProcess.killed) {
        console.log('⏰ Timeout reached, killing server...');
        serverProcess.kill();
      }
    }, 10000);
  }
});

serverProcess.on('error', (error) => {
  console.error('💥 Server error:', error);
});

serverProcess.on('close', (code) => {
  console.log(`🏁 Server process exited with code ${code}`);
});

// Emergency timeout
setTimeout(() => {
  if (!serverProcess.killed) {
    console.log('🚨 Emergency timeout, killing server...');
    serverProcess.kill();
  }
}, 15000);
