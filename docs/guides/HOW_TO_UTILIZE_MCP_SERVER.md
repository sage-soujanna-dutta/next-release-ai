# 🚀 How to Utilize the MCP Server - Complete Guide

## 📋 **Quick Start - Three Ways to Use the MCP Server**

### **Method 1: Direct MCP Client (Recommended)**

Use the provided `mcp-client.js` for easy command-line access:

```bash
# List all 23 available tools
node mcp-client.js list-tools

# Generate comprehensive sprint report (HTML + PDF + Teams)
node mcp-client.js generate-sprint-report SCNT-2025-22

# Generate PDF only
node mcp-client.js generate-pdf SCNT-2025-22

# Send Teams notification
node mcp-client.js send-teams "Sprint 22 completed successfully!"
```

### **Method 2: Direct Server Interaction**

Start the server manually and interact with it:

```bash
# Terminal 1: Start MCP Server
npm run mcp-server

# Terminal 2: Send MCP requests
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | npx tsx src/index.ts
```

### **Method 3: Integration with VS Code/Copilot**

The MCP server can be integrated with VS Code through Copilot or other MCP-compatible clients.

---

## 🎯 **Available Tools & Usage Examples**

### **📊 Sprint Report Generation**

#### **Comprehensive Sprint Report** (One Command Does Everything)
```bash
node mcp-client.js generate-sprint-report SCNT-2025-22
```

This single command:
- ✅ Fetches sprint data from JIRA
- ✅ Generates professional HTML report
- ✅ Creates high-quality PDF report
- ✅ Sends Teams notification with attachments
- ✅ Saves files to reports/ directory

#### **Individual Components**
```bash
# Just HTML report
curl -X POST localhost:3000/tools/call -d '{
  "tool": "generate_html_report",
  "arguments": {
    "reportType": "sprint_review",
    "data": { "sprintNumber": "SCNT-2025-22" }
  }
}'

# Just PDF report
curl -X POST localhost:3000/tools/call -d '{
  "tool": "generate_pdf_report", 
  "arguments": {
    "reportData": { "sprintNumber": "SCNT-2025-22" },
    "reportType": "sprint_review",
    "sendToTeams": true
  }
}'
```

### **📈 Analysis Tools**

```bash
# Story points analysis
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"enhanced_story_points_analysis","arguments":{"sprints":["SCNT-2025-21","SCNT-2025-22"]}}}' | npx tsx src/index.ts

# Velocity analysis
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"enhanced_velocity_analysis","arguments":{"sprintNumber":"SCNT-2025-22"}}}' | npx tsx src/index.ts
```

### **🔗 Integration Tools**

```bash
# Teams notification
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"send_teams_notification","arguments":{"message":"Sprint 22 report ready!","title":"Sprint Update"}}}' | npx tsx src/index.ts

# Confluence publishing  
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"publish_to_confluence","arguments":{"content":"<h1>Sprint Report</h1>","title":"SCNT-2025-22 Report"}}}' | npx tsx src/index.ts
```

---

## 🛠️ **Custom MCP Client Development**

Create your own client for specific workflows:

```javascript
// custom-client.js
import { MCPClient } from './mcp-client.js';

async function customWorkflow() {
  const client = new MCPClient();
  
  try {
    await client.startServer();
    
    // Generate sprint report
    const sprintResult = await client.callTool('generate_comprehensive_sprint_report', {
      sprintNumber: 'SCNT-2025-22',
      formats: ['both'],
      sendToTeams: true
    });
    
    // Send follow-up notification
    await client.callTool('send_teams_notification', {
      message: 'Sprint report generated and uploaded!',
      isImportant: true
    });
    
    console.log('Workflow completed!');
    
  } finally {
    await client.close();
  }
}

customWorkflow();
```

---

## 🎯 **Integration with Existing Workflows**

### **Replace Standalone Scripts**

Instead of creating files like:
- ❌ `generate-scnt-2025-22-executive-pdf.ts`
- ❌ `send-pdf-teams-notification.ts` 
- ❌ `generate-professional-html-pdf.ts`

Use the MCP server:
- ✅ `node mcp-client.js generate-sprint-report SCNT-2025-22`

### **Automated CI/CD Integration**

```yaml
# .github/workflows/sprint-report.yml
name: Generate Sprint Report
on:
  schedule:
    - cron: '0 18 * * 5' # Every Friday at 6 PM
    
jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node mcp-client.js generate-sprint-report SCNT-2025-$(date +%U)
```

### **Slack/Teams Bot Integration**

```javascript
// teams-bot.js
app.command('/sprint-report', async ({ command, ack, respond }) => {
  await ack();
  
  const client = new MCPClient();
  await client.startServer();
  
  const result = await client.callTool('generate_comprehensive_sprint_report', {
    sprintNumber: command.text,
    formats: ['both'],
    sendToTeams: true
  });
  
  await respond(`📊 Sprint report generated: ${result.content[0].text}`);
  await client.close();
});
```

---

## 🔧 **Troubleshooting & Configuration**

### **Environment Setup**

Ensure these environment variables are set:

```bash
# .env
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_TOKEN=your-jira-token
JIRA_EMAIL=your-email@company.com
JIRA_BOARD_ID=123
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_TOKEN=your-confluence-token
```

### **Common Issues**

1. **JIRA Authentication Error**
   ```bash
   # Test JIRA connection
   node mcp-client.js list-tools
   # Check if JIRA tools are available
   ```

2. **Teams Webhook Issues**
   ```bash
   # Test Teams notification
   node mcp-client.js send-teams "Test message"
   ```

3. **Permission Issues**
   ```bash
   # Ensure reports directory exists
   mkdir -p reports
   chmod 755 reports
   ```

---

## 🎉 **Benefits vs Standalone Scripts**

| Aspect | 📁 Standalone Scripts | 🚀 MCP Server |
|--------|---------------------|----------------|
| **Maintenance** | New script every time | Single server, multiple tools |
| **Code Reuse** | Copy-paste code | Shared services & components |
| **Error Handling** | Individual error handling | Centralized error management |
| **Discovery** | Manual script tracking | Dynamic tool listing |
| **Integration** | Hard to integrate | Standard MCP protocol |
| **Testing** | Test each script | Test tools through server |
| **Documentation** | Scattered docs | Self-documenting tools |

---

## 🚀 **Next Steps**

1. **Start Using Today:**
   ```bash
   node mcp-client.js generate-sprint-report SCNT-2025-22
   ```

2. **Integrate with Your Workflow:**
   - Add to CI/CD pipelines
   - Create custom clients for specific needs
   - Integrate with existing automation

3. **Extend the Server:**
   - Add new tools to existing categories
   - Create custom tool categories
   - Add new integrations (Slack, Email, etc.)

**🎯 The MCP server approach gives you professional, scalable sprint reporting without the script proliferation problem!**
