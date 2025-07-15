# MCP Commands Instruction Set

This document provides a comprehensive guide to all available MCP (Model Context Protocol) commands for the Release Notes MCP Server. These commands can be used with VS Code Copilot for automated release notes generation.

## 🌟 Key Features

- **Sprint-Based Date Fetching**: When a sprint number is provided, the system automatically fetches the actual sprint start and end dates from JIRA and retrieves GitHub commits for that specific period, ensuring accurate commit tracking for the sprint duration.
- **Automatic Fallback**: If sprint dates are unavailable, the system falls back to fetching commits from the last 8 days.
- **Confluence Compatibility**: HTML output is automatically formatted for Confluence's storage format when publishing, with simplified styling that works within Confluence's constraints.
- **Dual Output**: Supports both file-based and Confluence publishing in a single workflow.
- **Rich HTML Formatting**: Generated HTML includes modern CSS styling, responsive design, and detailed statistics for local file viewing.

## 🎯 Core Release Notes Commands

### `generate_release_notes`
**Purpose**: Generate comprehensive release notes combining JIRA issues and GitHub commits. When a sprint number is provided, automatically fetches sprint dates from JIRA and retrieves commits for that specific sprint period.

**Input Schema**:
```json
{
  "sprintNumber": "string (optional) - Sprint number for JIRA issues (will fetch sprint dates and corresponding commits)",
  "date": "string (optional) - Date to fetch commits from (ISO format, defaults to last 8 days if no sprint)",
  "format": "string (optional) - Output format: 'html' | 'markdown' (default: html)",
  "theme": "string (optional) - HTML theme: 'default' | 'modern' | 'minimal' (default: modern)"
}
```

**Example Usage**:
- "Generate release notes for sprint SCNT-2025-20" (fetches sprint dates and commits for that period)
- "Create HTML release notes with modern theme"
- "Generate markdown release notes for the last 8 days"

### `create_release_workflow`
**Purpose**: Execute complete automated release workflow (generate + publish + notify)

**Input Schema**:
```json
{
  "sprintNumber": "string (optional) - Sprint number",
  "date": "string (optional) - Date to fetch commits from",
  "output": "string (optional) - Output destination: 'confluence' | 'file' | 'both' (default: both)",
  "notifyTeams": "boolean (optional) - Whether to send Teams notification (default: true)"
}
```

**Example Usage**:
- "Run complete release workflow for sprint 42"
- "Create and publish release notes to Confluence only"
- "Generate release notes and save to file without Teams notification"

### `preview_release_notes`
**Purpose**: Preview release notes without publishing

**Input Schema**:
```json
{
  "sprintNumber": "string (optional) - Sprint number",
  "date": "string (optional) - Date to fetch commits from",
  "format": "string (optional) - Preview format: 'html' | 'markdown' (default: markdown)"
}
```

**Example Usage**:
- "Preview release notes for sprint 41"
- "Show me a markdown preview of the current sprint"
- "Preview HTML release notes for last week"

## 📊 Data Fetching Commands

### `fetch_jira_issues`
**Purpose**: Fetch JIRA issues for a specific sprint

**Input Schema**:
```json
{
  "sprintNumber": "string (required) - Sprint number to fetch issues for"
}
```

**Example Usage**:
- "Fetch JIRA issues for sprint 42"
- "Get all issues from the current sprint"
- "Show me JIRA issues for sprint 41"

### `fetch_github_commits`
**Purpose**: Fetch GitHub commits since a specific date

**Input Schema**:
```json
{
  "date": "string (optional) - Date to fetch commits from (ISO format, defaults to last 8 days)"
}
```

**Example Usage**:
- "Fetch GitHub commits from last 8 days"
- "Get all commits since January 1st, 2024"
- "Show me recent commits"

### `get_sprint_status`
**Purpose**: Get status and statistics for a specific sprint

**Input Schema**:
```json
{
  "sprintNumber": "string (required) - Sprint number to get status for"
}
```

**Example Usage**:
- "Get status for sprint 42"
- "Show me sprint 41 statistics"
- "What's the breakdown of issues in sprint 43?"

## 🚀 Publishing Commands

### `publish_to_confluence`
**Purpose**: Publish release notes to Confluence

**Input Schema**:
```json
{
  "content": "string (required) - HTML content to publish",
  "sprintNumber": "string (optional) - Sprint number for the page title"
}
```

**Example Usage**:
- "Publish these release notes to Confluence"
- "Create a Confluence page for sprint 42 release notes"

### `send_teams_notification`
**Purpose**: Send a Teams notification about the release

**Input Schema**:
```json
{
  "summary": "string (required) - Summary of the notification",
  "content": "string (required) - Content of the notification"
}
```

**Example Usage**:
- "Send Teams notification about release notes publication"
- "Notify the team about sprint 42 completion"

## 🔧 Utility Commands

### `validate_configuration`
**Purpose**: Validate all required environment variables and configurations

**Input Schema**:
```json
{}
```

**Example Usage**:
- "Validate my release notes configuration"
- "Check if all environment variables are set correctly"
- "Test my API connections"

## 🎨 Command Combinations and Workflows

### Common Workflow Patterns

1. **Quick Release Notes Generation**:
   ```
   "Generate release notes for sprint 42 using the modern theme"
   ```

2. **Complete Automated Workflow**:
   ```
   "Create a complete release workflow for sprint 42, publish to both Confluence and file, and send Teams notification"
   ```

3. **Preview Before Publishing**:
   ```
   "Preview release notes for sprint 42 in markdown format"
   "If that looks good, run the complete workflow"
   ```

4. **Data Analysis First**:
   ```
   "Get the status of sprint 42"
   "Fetch JIRA issues for sprint 42"
   "Now generate release notes with that data"
   ```

5. **Custom Date Range**:
   ```
   "Generate release notes for commits since January 15th, 2024"
   "Include any JIRA issues and format as HTML with minimal theme"
   ```

## 🎯 Advanced Usage Examples

### Sprint-based Workflows
```
"Generate release notes for sprint 42"
→ Automatically fetches JIRA issues for sprint 42 and GitHub commits from the last 8 days

"Get sprint 42 status first, then generate release notes"
→ Shows issue breakdown, then generates comprehensive notes

"Create release notes for sprint 42 and publish only to Confluence"
→ Generates notes and publishes directly to Confluence space
```

### Date-based Workflows
```
"Generate release notes for commits since December 1st, 2024"
→ Fetches commits from specific date, no JIRA integration

"Preview release notes for the last two weeks"
→ Shows preview without publishing

"Create release workflow for commits since last Monday"
→ Complete workflow with recent commits
```

### Format and Theme Customization
```
"Generate HTML release notes with minimal theme for sprint 42"
→ Clean, simple HTML output

"Create markdown release notes for the current sprint"
→ Markdown format, good for GitHub/documentation

"Generate release notes with modern theme and publish to file only"
→ Beautiful HTML saved locally
```

### Publishing Workflows
```
"Generate release notes and publish to both Confluence and file"
→ Dual publishing for backup and distribution

"Create release notes, save to file, but skip Teams notification"
→ Generate and save without team notification

"Publish existing content to Confluence for sprint 42"
→ Direct publishing of prepared content
```

## 🔍 Parameter Details

### Sprint Number Format
- Usually includes sprint identifier: "Sprint-42", "42", "S42"
- Check your JIRA configuration for exact format
- Case-sensitive in most configurations

### Date Format
- ISO 8601 format: "2024-01-15T00:00:00Z"
- Simplified: "2024-01-15"
- Relative terms work in natural language: "last 8 days", "two weeks ago"

### Output Destinations
- `confluence`: Publish directly to Confluence space
- `file`: Save as HTML/Markdown file locally
- `both`: Both Confluence and file output

### Themes
- `modern`: Gradient colors, modern UI elements, shadows
- `minimal`: Clean, simple, monochromatic design
- `default`: Professional blue theme, standard layout

## 🚨 Error Handling

Common error scenarios and solutions:

### Authentication Errors
```
"Validate configuration to check API tokens"
→ Tests all connections and reports issues
```

### Sprint Not Found
```
"Get sprint status for sprint 42"
→ Verifies sprint exists before generating notes
```

### Empty Results
```
"Fetch JIRA issues for sprint 42"
"Fetch GitHub commits since last week"
→ Check data availability before generating
```

## 📋 Best Practices

1. **Always validate configuration first** when setting up
2. **Preview before publishing** for important releases
3. **Use sprint-based workflows** for regular releases
4. **Check sprint status** before generating notes
5. **Save to file as backup** when publishing to Confluence
6. **Use appropriate themes** for your audience
7. **Test with small date ranges** when debugging

## 🤖 Integration Tips

### VS Code Copilot Usage
- Use natural language: "Generate release notes for sprint 42"
- Be specific about output: "Create HTML release notes with modern theme"
- Chain commands: "First show me sprint status, then generate notes"
- Ask for help: "What's the best way to create release notes for sprint 42?"

### Automation Workflows
- Combine with GitHub Actions for scheduled releases
- Use CLI commands for scripting
- Integrate with existing CI/CD pipelines
- Set up environment-specific configurations

## 📚 Additional Resources

- **Environment Setup**: See `.env.example` for all configuration options
- **CLI Interface**: Use `npm run start --help` for command-line usage
- **GitHub Actions**: Pre-configured workflow in `.github/workflows/`
- **Troubleshooting**: Check README.md for common issues and solutions

---

This instruction set covers all available MCP commands and their usage patterns. Use these commands with VS Code Copilot to streamline your release notes generation process!
