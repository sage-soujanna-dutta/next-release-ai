#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

const serverPath = path.join(process.cwd(), 'dist', 'index.js');

console.log('🚀 Starting MCP server to check tool registration...');

const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

let serverOutput = '';
let serverErrors = '';

serverProcess.stdout.on('data', (data) => {
  console.log('📤 STDOUT:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  serverErrors += output;
  console.log('📋 STDERR:', output);
  
  // Look for tool registration info
  if (output.includes('Server ready for connections')) {
    console.log('✅ Server started successfully');
    
    // Send a list tools request
    const listToolsRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    }) + '\n';
    
    console.log('📋 Sending list tools request...');
    serverProcess.stdin.write(listToolsRequest);
    
    // Give it a moment then send the board list request
    setTimeout(() => {
      const boardListRequest = JSON.stringify({
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
      
      console.log('🔧 Sending list_all_jira_boards request...');
      serverProcess.stdin.write(boardListRequest);
      
      // Kill after another moment
      setTimeout(() => {
        console.log('🛑 Terminating server...');
        serverProcess.kill();
      }, 3000);
    }, 2000);
  }
});

serverProcess.on('close', (code) => {
  console.log(`🏁 Server process exited with code ${code}`);
});

// Kill after 10 seconds if it's still running
setTimeout(() => {
  if (!serverProcess.killed) {
    console.log('⏰ Timeout reached, killing server...');
    serverProcess.kill();
  }
}, 10000);
