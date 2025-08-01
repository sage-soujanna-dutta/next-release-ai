#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

// Test the generate_release_notes MCP tool with improved communication
async function testGenerateReleaseNotes() {
  console.log('🔬 Testing generate_release_notes MCP tool with improved server...');
  
  // Create MCP request payload
  const mcpRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "generate_release_notes",
      arguments: {
        sprintNumber: "SCNT-2025-20",
        format: "markdown"
      }
    }
  };

  try {
    // Start MCP server process with better configuration
    console.log('🚀 Starting MCP server...');
    const serverProcess = spawn('npm', ['run', 'mcp-server:stdio'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });

    let responseData = '';
    let errorData = '';
    let serverReady = false;

    // Set up data handlers with better buffering
    serverProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      responseData += chunk;
      console.log('📤 Server output:', chunk.trim());
      
      // Check if this looks like a complete JSON response
      if (chunk.includes('"jsonrpc"') && chunk.includes('"id"')) {
        console.log('✅ Received JSON-RPC response');
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorData += chunk;
      console.log('📡 Server status:', chunk.trim());
      
      // Check if server is ready
      if (chunk.includes('Server ready for MCP client connections')) {
        console.log('✅ Server is ready for connections');
        serverReady = true;
      }
    });

    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await new Promise((resolve, reject) => {
      const readyTimeout = setTimeout(() => {
        reject(new Error('Server startup timeout after 10 seconds'));
      }, 10000);

      const checkReady = setInterval(() => {
        if (serverReady) {
          clearTimeout(readyTimeout);
          clearInterval(checkReady);
          resolve(true);
        }
      }, 100);
    });

    console.log('📤 Sending MCP request...');
    console.log('Request:', JSON.stringify(mcpRequest, null, 2));
    
    // Send the MCP request
    serverProcess.stdin.write(JSON.stringify(mcpRequest) + '\n');

    // Wait for response with longer timeout
    console.log('⏳ Waiting for response...');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        serverProcess.kill('SIGTERM');
        console.log('⏰ Tool execution timeout - this is expected for long-running operations');
        resolve(true); // Don't treat timeout as failure since tool might complete
      }, 180000); // 3 minute timeout

      serverProcess.on('exit', (code) => {
        clearTimeout(timeout);
        console.log(`🏁 Server process exited with code: ${code}`);
        resolve(code);
      });

      // Check for complete response periodically
      let lastResponseLength = 0;
      const responseCheck = setInterval(() => {
        if (responseData.length > lastResponseLength) {
          lastResponseLength = responseData.length;
          console.log(`📊 Response length: ${responseData.length} characters`);
          
          // If we have a substantial response, that's good enough
          if (responseData.length > 1000) {
            clearTimeout(timeout);
            clearInterval(responseCheck);
            serverProcess.kill('SIGTERM');
            resolve(0);
          }
        }
      }, 5000); // Check every 5 seconds
    });

    console.log('\n� MCP Response Analysis:');
    console.log('Response length:', responseData.length);
    
    // Try to extract JSON responses
    const jsonResponses: any[] = [];
    const lines = responseData.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('{') && trimmed.includes('"jsonrpc"')) {
        try {
          const json = JSON.parse(trimmed);
          jsonResponses.push(json);
        } catch (e) {
          // Not valid JSON, skip
        }
      }
    }

    if (jsonResponses.length > 0) {
      console.log('\n✅ Found JSON-RPC responses:');
      jsonResponses.forEach((response, index) => {
        console.log(`\nResponse ${index + 1}:`, JSON.stringify(response, null, 2));
      });
    } else {
      console.log('\n� Raw response data:');
      console.log(responseData.substring(0, 2000) + (responseData.length > 2000 ? '...' : ''));
    }
    
    if (errorData) {
      console.log('\n📊 Server status messages:');
      console.log(errorData);
    }

    // Save response to file for analysis
    const testResult = {
      request: mcpRequest,
      response: responseData,
      jsonResponses: jsonResponses,
      error: errorData,
      timestamp: new Date().toISOString(),
      success: jsonResponses.length > 0
    };
    
    writeFileSync('./mcp-test-result-improved.json', JSON.stringify(testResult, null, 2));
    console.log('\n💾 Test results saved to: ./mcp-test-result-improved.json');

    return jsonResponses.length > 0;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testGenerateReleaseNotes()
  .then((success) => {
    if (success) {
      console.log('\n✅ MCP tool test completed successfully');
    } else {
      console.log('\n⚠️  MCP tool test completed with issues - check logs');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Test error:', error);
    process.exit(1);
  });
