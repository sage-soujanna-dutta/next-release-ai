# MCP Client Configuration Guide

## Problem: Why Your MCP Server Isn't Showing Up

MCP clients like Claude Desktop expect servers to use **STDIO transport** (standard input/output), but you converted your server to **HTTP transport**. This guide shows you how to configure both modes.

## Solution: Dual-Mode Server

Your server now supports both modes:

### Mode 1: STDIO (For MCP Clients like Claude Desktop)
```bash
npm run mcp-server:stdio
# or simply
npm run mcp-server
```

### Mode 2: HTTP (For Web Hosting)
```bash
npm run mcp-server:http
```

## Claude Desktop Configuration

To add your MCP server to Claude Desktop, you need to configure it in the Claude Desktop settings.

### Step 1: Find Claude Desktop Config File

The config file location depends on your OS:

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```
~/.config/claude_desktop_config.json
```

### Step 2: Add Your MCP Server Configuration

Edit the `claude_desktop_config.json` file and add your server:

```json
{
  "mcpServers": {
    "next-release-ai": {
      "command": "npm",
      "args": ["run", "mcp-server:stdio"],
      "cwd": "/Users/snehaldangroshiya/next-release-ai",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Important:** Replace `/Users/snehaldangroshiya/next-release-ai` with your actual project path.

### Step 3: Alternative Configuration (Direct tsx)

If npm isn't available in Claude's environment, use tsx directly:

```json
{
  "mcpServers": {
    "next-release-ai": {
      "command": "npx",
      "args": ["tsx", "src/dual-server.ts", "stdio"],
      "cwd": "/Users/snehaldangroshiya/next-release-ai"
    }
  }
}
```

### Step 4: Alternative Configuration (Built Version)

If you want to use the built version:

```json
{
  "mcpServers": {
    "next-release-ai": {
      "command": "node",
      "args": ["dist/dual-server.js", "stdio"],
      "cwd": "/Users/snehaldangroshiya/next-release-ai"
    }
  }
}
```

## Testing Your Configuration

### Test STDIO Mode (for Claude Desktop)
```bash
cd /Users/snehaldangroshiya/next-release-ai
npm run mcp-server:stdio
```

You should see:
```
🚀 Next Release AI MCP Server (STDIO) started successfully!
📱 Mode: STDIO (Compatible with Claude Desktop and MCP clients)
📊 Total tools loaded: 23
📂 Categories available: 4
✅ Server ready for MCP client connections
```

### Test HTTP Mode (for hosting)
```bash
npm run mcp-server:http
```

You should see:
```
🚀 Next Release AI MCP Server (HTTP) started successfully!
🌐 Mode: HTTP (For hosting and web integration)
🌐 Server running on http://localhost:3000
```

## Complete Example Configuration

Here's a complete `claude_desktop_config.json` example:

```json
{
  "mcpServers": {
    "next-release-ai": {
      "command": "npm",
      "args": ["run", "mcp-server:stdio"],
      "cwd": "/Users/snehaldangroshiya/next-release-ai",
      "env": {
        "JIRA_BASE_URL": "https://your-jira.atlassian.net",
        "JIRA_EMAIL": "your-email@company.com",
        "JIRA_API_TOKEN": "your-api-token",
        "GITHUB_TOKEN": "your-github-token"
      }
    }
  }
}
```

## Troubleshooting

### 1. Server Not Appearing in Claude Desktop

**Check:**
- Path in `cwd` is correct
- npm is available in system PATH
- Configuration file syntax is valid JSON
- Server starts successfully when run manually

**Test manually:**
```bash
cd /Users/snehaldangroshiya/next-release-ai
npm run mcp-server:stdio
```

### 2. Tools Not Working

**Check:**
- Environment variables are set correctly
- JIRA and GitHub credentials are valid
- Network connectivity to external services

### 3. Permission Issues

**Fix:**
```bash
chmod +x /Users/snehaldangroshiya/next-release-ai/src/dual-server.ts
```

## Restart Claude Desktop

After updating the configuration:
1. Save the `claude_desktop_config.json` file
2. Completely quit Claude Desktop
3. Restart Claude Desktop
4. Your MCP server should now appear in the configuration tools list

## Verification

Once configured correctly, you should see your MCP server listed in Claude Desktop's MCP configuration, and you'll be able to use commands like:

- "Generate release notes for sprint SCNT-2025-22"
- "Analyze story points for the last 3 sprints"
- "Send a Teams notification about the release"

Your MCP tools will now be available directly in Claude Desktop! 🎉
