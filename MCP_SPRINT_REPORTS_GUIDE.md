# MCP Server Sprint Reports Guide

## 🎯 Overview

Instead of creating standalone scripts every time, you can now use the **MCP Server** with its comprehensive tool suite for generating sprint reports. The server includes 23 tools across 4 categories.

## 🚀 Starting the MCP Server

```bash
# Start the MCP server
npm run mcp-server
# or
npm start
# or 
tsx src/index.ts
```

## 📊 Available Sprint Report Tools

### 1. **Comprehensive Sprint Report** (Recommended)
- **Tool Name:** `generate_comprehensive_sprint_report`
- **Description:** Generate complete sprint reports with HTML, PDF, and Teams notification in one command
- **Category:** Release Management

**Example Usage:**
```json
{
  "tool": "generate_comprehensive_sprint_report",
  "arguments": {
    "sprintNumber": "SCNT-2025-22",
    "formats": ["both"],
    "sendToTeams": true,
    "teamsMessage": "📊 Sprint 22 report is ready for review!",
    "reportConfig": {
      "theme": "professional",
      "includeCharts": true,
      "pdfFormat": "A4"
    }
  }
}
```

### 2. **PDF Report Generator**
- **Tool Name:** `generate_pdf_report`
- **Description:** Generate high-quality PDF reports from sprint data
- **Category:** Integration & Communication

**Example Usage:**
```json
{
  "tool": "generate_pdf_report",
  "arguments": {
    "reportData": { /* sprint data */ },
    "reportType": "sprint_review",
    "sendToTeams": true,
    "config": {
      "format": "A4",
      "theme": "professional"
    }
  }
}
```

### 3. **HTML Report Generator**
- **Tool Name:** `generate_html_report`
- **Description:** Generate comprehensive HTML reports from analysis data
- **Category:** Integration & Communication

### 4. **Teams Integration**
- **Tool Name:** `send_teams_notification`
- **Description:** Send notifications to Microsoft Teams channels
- **Category:** Integration & Communication

## 🛠️ How to Use MCP Tools (No More Standalone Scripts!)

### Option 1: MCP Client Integration
If you have an MCP client integrated with VS Code or another editor, you can call tools directly:

```typescript
// Example MCP client usage
const result = await mcpClient.callTool('generate_comprehensive_sprint_report', {
  sprintNumber: 'SCNT-2025-22',
  formats: ['both'],
  sendToTeams: true
});
```

### Option 2: Direct Server Communication
You can communicate with the MCP server using the Model Context Protocol over stdio:

```bash
# The server listens on stdio and responds to MCP protocol messages
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | npx tsx src/index.ts
```

### Option 3: Create a Simple MCP Client Script
Instead of standalone scripts, create a reusable MCP client:

```typescript
// mcp-client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function generateSprintReport(sprintNumber: string) {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/index.ts"]
  });
  
  const client = new Client({
    name: "sprint-report-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  
  const result = await client.request({
    method: "tools/call",
    params: {
      name: "generate_comprehensive_sprint_report",
      arguments: {
        sprintNumber,
        formats: ["both"],
        sendToTeams: true
      }
    }
  });
  
  console.log("Report generated:", result);
  await client.close();
}

// Usage
generateSprintReport("SCNT-2025-22");
```

## 📋 All Available Tools

The MCP server now includes **23 tools** across **4 categories**:

### 🎯 Release Management (6 tools)
- `generate_release_notes`
- `create_release_workflow`
- `generate_comprehensive_sprint_report` ⭐ **NEW**
- `preview_release_notes`
- `publish_to_confluence`
- `comprehensive_workflow`

### 📊 Analysis & Metrics (5 tools)
- `analyze_story_points`
- `enhanced_story_points_analysis`
- `calculate_velocity`
- `enhanced_velocity_analysis`
- `comprehensive_sprint_analysis`

### 🔗 Integration & Communication (6 tools)
- `send_teams_notification`
- `publish_to_confluence`
- `generate_html_report`
- `generate_pdf_report` ⭐ **NEW**
- `teams_release_notification`
- `enhanced_teams_integration`

### 🎫 JIRA Management (6 tools)
- `fetch_jira_issues`
- `get_sprint_issues`
- `enhanced_jira_search`
- `get_sprint_metrics`
- `fetch_sprint_data`
- `analyze_jira_sprint`

## 🎉 Benefits of Using MCP Server

✅ **No More Script Proliferation** - One server, multiple tools  
✅ **Consistent API** - All tools follow the same interface  
✅ **Shared Services** - JIRA, Teams, and file services are reused  
✅ **Better Error Handling** - Centralized error management  
✅ **Tool Discovery** - List all available tools dynamically  
✅ **Extensible** - Easy to add new tools without creating new scripts  

## 🚀 Quick Start for Sprint Reports

1. **Start the MCP server:**
   ```bash
   npm run mcp-server
   ```

2. **Use the comprehensive sprint report tool:**
   ```json
   {
     "tool": "generate_comprehensive_sprint_report",
     "arguments": {
       "sprintNumber": "SCNT-2025-22"
     }
   }
   ```

3. **Get HTML + PDF + Teams notification in one command!** 🎉

---

**No more standalone scripts needed!** The MCP server architecture provides a much cleaner, more maintainable solution for all your sprint reporting needs.
