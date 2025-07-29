# GitHub Copilot MCP Integration Guide

## Using Your MCP Server with GitHub Copilot in VS Code

Since GitHub Copilot doesn't have direct MCP protocol support like Claude Desktop, we've created multiple integration methods for you to use your MCP tools with GitHub Copilot.

## ✅ Ready-to-Use Integration Setup

Your MCP server is now configured with multiple GitHub Copilot integration options:

### Method 1: VS Code Tasks (Recommended)

**Start your MCP server:**
```bash
npm run mcp-server:http
```

**Use VS Code Command Palette:**
1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Tasks: Run Task"
3. Choose from available MCP tasks:
   - `MCP: Generate Release Notes`
   - `MCP: Analyze Story Points`
   - `MCP: Send Teams Notification`
   - `MCP: List All Tools`
   - `MCP: Server Health Check`

### Method 2: Helper Scripts

Use the provided shell scripts for quick access:

```bash
# Generate release notes
./scripts/generate-release-notes.sh SCNT-2025-22 html

# Analyze story points for multiple sprints
./scripts/analyze-story-points.sh "SCNT-2025-20,SCNT-2025-21,SCNT-2025-22"

# Send Teams notification
./scripts/send-teams-notification.sh "Release completed!" "Sprint Release" true

# List all available tools
./scripts/list-tools.sh

# Manage MCP server
./scripts/mcp-server.sh start    # Start server
./scripts/mcp-server.sh stop     # Stop server
./scripts/mcp-server.sh status   # Check status
./scripts/mcp-server.sh restart  # Restart server
```

### Method 3: Direct HTTP API Calls

With your HTTP server running, use curl directly in VS Code terminal:

```bash
# List all tools
curl -s http://localhost:3000/tools | jq '.'

# Generate release notes
curl -X POST http://localhost:3000/tools/generate_release_notes/execute \
  -H "Content-Type: application/json" \
  -d '{"sprintNumber": "SCNT-2025-22", "format": "html"}'

# Analyze story points
curl -X POST http://localhost:3000/tools/analyze_story_points/execute \
  -H "Content-Type: application/json" \
  -d '{"sprintNumbers": ["SCNT-2025-20", "SCNT-2025-21"], "includeTeamMetrics": true}'

# Send Teams notification
curl -X POST http://localhost:3000/tools/send_teams_notification/execute \
  -H "Content-Type: application/json" \
  -d '{"message": "Sprint completed successfully!", "title": "Sprint Update", "isImportant": true}'
```

### Method 4: GitHub Copilot Chat Integration

You can ask GitHub Copilot Chat to help you use your MCP server:

**Example prompts for GitHub Copilot Chat:**

```
@workspace Generate a curl command to call my MCP server's generate_release_notes tool for sprint SCNT-2025-22

@workspace Show me how to use the MCP server running on localhost:3000 to analyze story points

@workspace Create a script that calls my MCP server to send a Teams notification about a release

@workspace List all available endpoints on my MCP server at localhost:3000/tools
```

## Quick Start Guide

### 1. Start Your MCP Server
```bash
npm run mcp-server:http
```

### 2. Verify Server is Running
```bash
curl http://localhost:3000/health
```

### 3. List Available Tools
```bash
./scripts/list-tools.sh
```

### 4. Use VS Code Tasks
- Open Command Palette (`Cmd+Shift+P`)
- Type "Tasks: Run Task"
- Select any MCP task

## Available MCP Tools

Your server provides 23 tools across 4 categories:

### Release Management (6 tools)
- `generate_release_notes` - Generate comprehensive release notes
- `create_release_workflow` - Create complete release workflow
- `generate_comprehensive_sprint_report` - Generate complete sprint reports
- `preview_release_notes` - Preview release notes content
- `publish_to_confluence` - Publish to Confluence
- `comprehensive_release_workflow` - Execute end-to-end workflow

### Analysis & Metrics (5 tools)
- `analyze_story_points` - Analyze story points completion
- `generate_velocity_report` - Generate team velocity report
- `sprint_summary_report` - Generate detailed sprint summary
- `enhanced_story_points_analysis` - Enhanced multi-sprint analysis
- `enhanced_velocity_analysis` - Comprehensive velocity analysis

### Integration & Communication (6 tools)
- `send_teams_notification` - Send Microsoft Teams notifications
- `publish_to_confluence` - Publish content to Confluence
- `generate_html_report` - Generate comprehensive HTML reports
- `generate_pdf_report` - Generate high-quality PDF reports
- `send_release_notification` - Send formatted release notifications
- `enhanced_teams_integration` - Advanced Teams integration

### JIRA Management (6 tools)
- `fetch_jira_issues` - Fetch JIRA issues for sprints
- `bulk_update_jira_issues` - Perform bulk updates on JIRA issues
- `build_jira_query` - Build complex JQL queries
- `advanced_jira_fetch` - Advanced JIRA fetching with filtering
- `analyze_jira_fields` - Analyze JIRA field usage patterns
- `enhanced_jira_fetch` - Enhanced JIRA fetching with caching

## Integration with GitHub Copilot Workflow

### For Release Management:
1. **Ask GitHub Copilot Chat:** "Help me generate release notes for sprint SCNT-2025-22"
2. **Copilot will suggest:** Using your MCP server or direct curl commands
3. **Run the task:** Either through VS Code tasks or helper scripts

### For Sprint Analysis:
1. **Ask GitHub Copilot Chat:** "Analyze the story points for our last 3 sprints"
2. **Use the provided scripts:** `./scripts/analyze-story-points.sh "SCNT-2025-20,SCNT-2025-21,SCNT-2025-22"`

### For Team Communication:
1. **Ask GitHub Copilot Chat:** "Send a Teams notification about the sprint completion"
2. **Use the helper script:** `./scripts/send-teams-notification.sh "Sprint completed!" "Release Update" true`

## Environment Setup

Make sure your `.env` file is configured:

```env
PORT=3000
JIRA_BASE_URL=https://your-jira.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
GITHUB_TOKEN=your-github-token
# Add other required environment variables
```

## Troubleshooting

### Server Not Starting
```bash
# Check if port 3000 is available
lsof -i :3000

# Use server management script
./scripts/mcp-server.sh status
./scripts/mcp-server.sh start
```

### Tasks Not Working in VS Code
1. Make sure the MCP server is running
2. Check VS Code terminal for error messages
3. Verify `.vscode/tasks.json` exists
4. Try running the curl commands directly

### Scripts Not Executing
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Test individual scripts
./scripts/mcp-server.sh status
```

## Advanced Usage

### Custom GitHub Copilot Instructions

Add this to your GitHub Copilot Chat context:

```
I have an MCP server running on http://localhost:3000 with the following tools:
- Release notes generation
- Story points analysis  
- Teams notifications
- JIRA management
- Sprint reporting

When I ask for release management tasks, suggest using the appropriate MCP server endpoint or helper script.
```

### VS Code Snippets

Create custom VS Code snippets for common MCP operations. Go to:
`Preferences > Configure User Snippets > typescript.json`

```json
{
  "MCP Generate Release Notes": {
    "prefix": "mcp-release",
    "body": [
      "curl -X POST http://localhost:3000/tools/generate_release_notes/execute \\",
      "  -H \"Content-Type: application/json\" \\",
      "  -d '{\"sprintNumber\": \"$1\", \"format\": \"$2\"}'"
    ],
    "description": "Generate release notes via MCP server"
  }
}
```

Your MCP server is now fully integrated with GitHub Copilot workflows! 🚀
