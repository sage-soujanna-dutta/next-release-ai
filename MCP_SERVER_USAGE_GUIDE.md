# 🚀 MCP Server Usage Guide

## 📋 Overview

Your MCP (Model Context Protocol) server provides 21 powerful tools across 4 categories for automated release management. Here's how to use it effectively.

## 🎯 Available Tools

### 📊 **Release Management (5 tools)**
- `generate_release_notes` - Generate comprehensive release notes
- `update_confluence_page` - Update Confluence with release information
- `sprint_summary_report` - Generate detailed sprint summaries
- `create_shareable_report` - Create formatted reports for sharing
- `complete_release_workflow` - End-to-end release automation

### 📈 **Analysis & Metrics (6 tools)**
- `analyze_story_points` - Story points analysis across sprints
- `team_velocity_analysis` - Calculate team velocity metrics
- `sprint_completion_metrics` - Sprint completion statistics
- `burndown_analysis` - Sprint burndown analysis
- `code_review_metrics` - Code review performance metrics
- `deployment_frequency_analysis` - Deployment frequency tracking

### 🔗 **Integration & Communication (5 tools)**
- `send_teams_notification` - Send notifications to Microsoft Teams
- `validate_teams_webhook` - Test Teams webhook connectivity
- `post_to_confluence` - Post content to Confluence pages
- `validate_confluence_connection` - Test Confluence connectivity
- `github_integration_test` - Test GitHub API connectivity

### 🎫 **JIRA Management (5 tools)**
- `fetch_jira_issues` - Retrieve JIRA issues by various criteria
- `analyze_jira_sprint` - Analyze specific JIRA sprint data
- `jira_story_points_summary` - Summarize story points from JIRA
- `validate_jira_connection` - Test JIRA API connectivity
- `bulk_jira_operations` - Perform bulk operations on JIRA issues

## 🛠️ Usage Methods

### **Method 1: Direct MCP Server (Recommended)**

#### **1. Start the MCP Server**
```bash
cd /Users/snehaldangroshiya/next-release-ai
npm run mcp-server
```

#### **2. Connect via MCP Client**
The server uses stdio transport and communicates via JSON-RPC messages:

```json
// List all available tools
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}

// Execute a tool
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "sprint_summary_report",
    "arguments": {
      "sprintNumber": "SCNT-2025-21",
      "includeTeamMetrics": true
    }
  }
}
```

### **Method 2: Claude Desktop Integration**

#### **1. Configure Claude Desktop**
Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "next-release-ai": {
      "command": "npm",
      "args": ["run", "mcp-server"],
      "cwd": "/Users/snehaldangroshiya/next-release-ai",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### **2. Use in Claude Desktop**
After configuration, you can ask Claude to:
- "Generate a sprint summary for SCNT-2025-21"
- "Send a Teams notification about the release"
- "Analyze story points for the current sprint"

### **Method 3: Programmatic Access**

#### **1. Direct Factory Usage**
```typescript
import { MCPToolFactory } from "./src/core/MCPToolFactory.js";

const factory = new MCPToolFactory({
  enabledCategories: ['release', 'analysis', 'integration', 'jira']
});

// Execute tools
const summaryTool = factory.getTool('sprint_summary_report');
const result = await summaryTool.execute({
  sprintNumber: 'SCNT-2025-21',
  includeTeamMetrics: true
});
```

#### **2. Custom Integration**
```typescript
// Create custom workflows
async function customSprintReview(sprintId: string) {
  const factory = new MCPToolFactory();
  
  // Generate summary
  const summary = await factory.getTool('sprint_summary_report')
    .execute({ sprintNumber: sprintId });
  
  // Analyze story points
  const analysis = await factory.getTool('analyze_story_points')
    .execute({ sprintNumbers: [sprintId] });
  
  // Send Teams notification
  await factory.getTool('send_teams_notification')
    .execute({
      message: `Sprint ${sprintId} Complete!\n${summary.content}`,
      title: `Sprint Review - ${sprintId}`,
      isImportant: true
    });
}
```

## 🚀 Common Use Cases

### **Sprint Review Automation**
```bash
# 1. Start MCP server
npm run mcp-server

# 2. Use with Claude or MCP client to:
# - Generate sprint summary
# - Analyze team performance
# - Send Teams notifications
# - Update Confluence pages
```

### **Release Notes Generation**
```json
{
  "method": "tools/call",
  "params": {
    "name": "generate_release_notes",
    "arguments": {
      "version": "v2.1.0",
      "sprintNumbers": ["SCNT-2025-21"],
      "includeMetrics": true
    }
  }
}
```

### **Teams Integration**
```json
{
  "method": "tools/call",
  "params": {
    "name": "send_teams_notification",
    "arguments": {
      "message": "Sprint SCNT-2025-21 completed with 92% story point completion!",
      "title": "Sprint Review Complete",
      "isImportant": true
    }
  }
}
```

## ⚙️ Configuration

### **Required Environment Variables**
```bash
# JIRA Configuration
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_TOKEN=your-jira-api-token

# Teams Configuration
TEAMS_WEBHOOK_URL=your-teams-webhook-url

# Confluence Configuration (optional)
CONFLUENCE_BASE_URL=your-confluence-url
CONFLUENCE_USERNAME=your-username
CONFLUENCE_PASSWORD=your-password

# GitHub Configuration (optional)
GITHUB_TOKEN=your-github-token
```

### **Verify Setup**
```json
{
  "method": "tools/call",
  "params": {
    "name": "validate_jira_connection",
    "arguments": {}
  }
}
```

## 🎉 Benefits of MCP Architecture

### ✅ **Advantages:**
- **Unified Interface**: All tools accessible through one server
- **No Script Duplication**: Single codebase for multiple access methods
- **Better Maintainability**: Centralized business logic
- **Flexible Usage**: CLI, API, Claude Desktop, or programmatic access
- **Type Safety**: Full TypeScript support with input validation

### 🔧 **Tool Factory Pattern:**
- **Service Registry**: Shared services across all tools
- **Category Organization**: Tools grouped by functionality
- **Lazy Loading**: Tools instantiated only when needed
- **Error Handling**: Consistent error handling across all tools

## 📚 Next Steps

1. **Start the MCP server**: `npm run mcp-server`
2. **Test with a simple tool**: Try `validate_jira_connection`
3. **Generate a sprint report**: Use `sprint_summary_report`
4. **Set up Claude Desktop**: Configure for seamless AI integration
5. **Create custom workflows**: Build automated processes using multiple tools

The MCP server eliminates the need for independent scripts while providing a clean, maintainable architecture for all your release automation needs!
