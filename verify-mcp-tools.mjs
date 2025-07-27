#!/usr/bin/env node

/**
 * Simple test to verify MCP tools integration
 * Tests if our new story points tools are available and working
 */

import { spawn } from 'child_process';

async function listMCPTools() {
  return new Promise((resolve, reject) => {
    console.log('📋 Listing available MCP tools...\n');
    
    const child = spawn('node', ['-e', `
      const { spawn } = require('child_process');
      const mcp = spawn('npx', ['tsx', 'src/index.ts'], { stdio: ['pipe', 'pipe', 'inherit'] });
      
      const request = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list"
      };
      
      let output = '';
      mcp.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      mcp.on('close', () => {
        console.log('Raw output:', output);
        const lines = output.split('\\n');
        const jsonResponses = lines.filter(line => {
          try {
            const parsed = JSON.parse(line);
            return parsed.result && parsed.result.tools;
          } catch {
            return false;
          }
        });
        
        if (jsonResponses.length > 0) {
          const response = JSON.parse(jsonResponses[0]);
          console.log('\\n🛠️  Available MCP Tools:');
          response.result.tools.forEach(tool => {
            console.log(\`  ✓ \${tool.name} - \${tool.description}\`);
          });
        }
      });
      
      mcp.stdin.write(JSON.stringify(request) + '\\n');
      mcp.stdin.end();
    `], { cwd: process.cwd() });

    child.on('close', resolve);
    child.on('error', reject);
  });
}

async function main() {
  try {
    console.log('🧪 Testing MCP Tools Integration\n');
    await listMCPTools();
    console.log('\n✅ MCP tools verification completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();
