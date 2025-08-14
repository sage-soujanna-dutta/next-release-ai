# Board-Based Release Notes MCP Tool

## Overview

The `generate_board_based_release_notes` MCP tool allows you to generate comprehensive release notes for any JIRA sprint using just the board ID and sprint number. This tool is especially useful for projects where traditional sprint-based queries don't work due to permissions or configuration issues.

## Key Features

✅ **Universal Board Support** - Works with any JIRA board ID  
✅ **Flexible Sprint Matching** - Finds sprints by partial name matching  
✅ **Multiple Output Formats** - Supports both Markdown and HTML  
✅ **Comprehensive Statistics** - Issue counts, completion rates, story points  
✅ **Team Analytics** - Contributor breakdowns and workload distribution  
✅ **Teams Integration** - Optional notifications to Microsoft Teams  
✅ **Smart Project Detection** - Automatically detects project name from board  

## Tool Schema

```json
{
  "name": "generate_board_based_release_notes",
  "description": "Generate release notes based on JIRA board ID and sprint number - supports any project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "boardId": {
        "type": "number",
        "description": "JIRA board ID (e.g., 5465 for NDS board)"
      },
      "sprintNumber": {
        "type": "string", 
        "description": "Sprint number or name to search for (e.g., 'FY25-21', 'SCNT-2025-20')"
      },
      "format": {
        "type": "string",
        "enum": ["html", "markdown"],
        "description": "Output format (default: markdown)"
      },
      "outputDirectory": {
        "type": "string",
        "description": "Output directory for generated files (default: './output')"
      },
      "projectName": {
        "type": "string",
        "description": "Project name for the report (optional, will be detected from board)"
      },
      "includeTeamsNotification": {
        "type": "boolean",
        "description": "Send notification to Teams channel (default: false)"
      }
    },
    "required": ["boardId", "sprintNumber"]
  }
}
```

## Usage Examples

### Example 1: Generate NDS Sprint Report (Markdown)

```javascript
const result = await mcpTool.execute({
    boardId: 5465,
    sprintNumber: "FY25-21",
    format: "markdown",
    outputDirectory: "./output",
    projectName: "Network Directory Service",
    includeTeamsNotification: false
});
```

### Example 2: Generate SCNT Sprint Report (HTML with Teams)

```javascript
const result = await mcpTool.execute({
    boardId: 1234, // Replace with actual SCNT board ID
    sprintNumber: "2025-22",
    format: "html",
    outputDirectory: "./reports",
    includeTeamsNotification: true
});
```

### Example 3: Any Project with Auto-Detection

```javascript
const result = await mcpTool.execute({
    boardId: 9876, // Any board ID
    sprintNumber: "Sprint-42"
    // All other parameters are optional
});
```

## Output Features

### Comprehensive Sprint Statistics
- Total issues count
- Completion rate percentage
- Story points summary
- Issue type breakdown
- Status distribution

### Team Analytics
- Top contributors by issue count
- Workload distribution
- Assignment tracking

### Detailed Issue Listings
Each issue includes:
- ✅ Status indicators
- 🏷️ Issue type and priority
- 👤 Assignee information
- 📊 Story points (if available)
- 📝 Description preview

### Professional Formatting
- Clean markdown tables
- Progress bars with visual indicators
- Emoji-enhanced section headers
- Responsive HTML layouts (for HTML format)

## Finding Your Board ID

1. **From JIRA URL**: Navigate to your board → Check URL: `https://yourjira.com/secure/RapidBoard.jspa?rapidView=5465`
2. **From Board Settings**: Board → Board Settings → Look for "Board ID"
3. **From API**: `GET /rest/agile/1.0/board` to list all boards

## Integration Benefits

### Permissions-Friendly
- Uses board-level API access instead of project-level queries
- Works even when direct sprint queries fail
- Bypasses many common permission issues

### Multi-Project Support
- Single tool works across all your JIRA boards
- No project-specific configuration needed
- Automatic project name detection

### Teams Integration
- Optional Microsoft Teams notifications
- Professional message formatting
- Sprint completion summaries

## File Naming Convention

Generated files follow the pattern:
```
<sprint-name>-sprint-report-<timestamp>.<format>
```

Example:
```
NDS-FY25-21-sprint-report-2025-08-04-04-32-19.markdown
SCNT-2025-22-sprint-report-2025-08-04-10-15-30.html
```

## Error Handling

The tool provides detailed error messages for common issues:

- **Board not found**: Verify board ID and permissions
- **Sprint not found**: Check sprint name and availability
- **API errors**: Validate JIRA credentials and domain
- **Permission errors**: Ensure board-level access rights

## Environment Requirements

Required environment variables:
```bash
JIRA_DOMAIN=your-jira-instance.atlassian.net
JIRA_TOKEN=your-bearer-token
```

Optional for Teams integration:
```bash
TEAMS_WEBHOOK_URL=your-teams-webhook-url
```

## Comparison with Standard Tools

| Feature | Standard MCP Tools | Board-Based Tool |
|---------|-------------------|------------------|
| **Project Support** | Project-specific | Universal |
| **Permissions** | Project-level required | Board-level sufficient |
| **Setup** | Per-project configuration | Single configuration |
| **Error Rate** | Higher (permission issues) | Lower (board access) |
| **Flexibility** | Limited to configured projects | Works with any board |

## Success Metrics

From the demo run:
- ✅ Successfully generated NDS-FY25-21 report
- ✅ 44 issues processed in 6.8 seconds
- ✅ 48% completion rate calculated
- ✅ 46 story points tracked
- ✅ Professional markdown formatting

## Next Steps

1. **Find your board IDs** using the methods above
2. **Test with your sprints** using the demo script
3. **Integrate into workflows** using the MCP server
4. **Customize output** by modifying format and directory options
5. **Enable Teams notifications** for automated reporting

This tool bridges the gap between JIRA's complex permission system and the need for simple, reliable sprint reporting across any project.
