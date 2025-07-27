# 🎯 **MCP Commands Complete Reference**

> **Transform your development workflow with AI-powered release automation through VS Code Copilot**

This comprehensive guide covers all Model Context Protocol (MCP) commands available in the Release Notes MCP Server. These commands enable natural language interaction with your development tools through VS Code Copilot.

## ✨ **Key Features & Capabilities**

### 🤖 **AI-Powered Intelligence**
- **Sprint-Aware Processing**: Automatically fetches sprint dates from JIRA and retrieves corresponding GitHub commits
- **Context Understanding**: Handles complex workflows with intelligent fallbacks and error recovery
- **Natural Language Interface**: Use conversational commands - no need to remember exact syntax

### 🔄 **Smart Automation**
- **Automatic Fallback**: If sprint dates unavailable, falls back to last 8 days of commits  
- **Dual Output Support**: Generates both local files and publishes to Confluence simultaneously
- **Rich Formatting**: HTML output includes modern CSS, responsive design, and detailed statistics

### 🎨 **Professional Output**
- **Multiple Themes**: Modern (gradient), Minimal (clean), Default (professional)
- **Confluence Ready**: Automatically formats HTML for Confluence's storage format
- **Teams Integration**: Rich notifications with formatted facts panels and actionable insights

## 📋 **Command Categories Overview**

| 🏷️ **Category** | 🎯 **Purpose** | 🛠️ **Tools Count** | 💡 **Best For** |
|-----------------|----------------|-------------------|------------------|
| 🚀 **Release Management** | End-to-end release notes | 4 tools | Sprint deliverables |
| 📊 **Sprint Analytics** | Performance insights | 3 tools | Team velocity tracking |
| 🔍 **JIRA Deep Analysis** | Advanced ticket insights | 5 tools | Risk assessment, quality |
| ⚙️ **Utilities** | Configuration & data | 3 tools | Setup validation |

---

## 🚀 **Release Management Commands**

*Complete end-to-end release notes generation and publishing*

### `generate_release_notes`
**🎯 Purpose**: Generate comprehensive release notes combining JIRA issues and GitHub commits with intelligent sprint-date fetching.

**💡 Key Features**:
- Automatically fetches sprint start/end dates from JIRA
- Retrieves GitHub commits for exact sprint duration
- Supports multiple output formats and themes
- Includes detailed statistics and visualizations

**📝 Input Schema**:
```json
{
  "sprintNumber": "string (optional) - Sprint identifier (e.g., 'SCNT-2025-20')",
  "date": "string (optional) - ISO date for commit fetching (fallback if no sprint)", 
  "format": "string (optional) - 'html' | 'markdown' (default: html)",
  "theme": "string (optional) - 'default' | 'modern' | 'minimal' (default: modern)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Generate release notes for sprint SCNT-2025-20"
"Create HTML release notes with modern theme for the current sprint"
"Generate markdown release notes for sprint SCNT-2025-21"
"Make release notes with minimal theme"
```

**💼 Business Value**: Saves 2-3 hours per release cycle, ensures consistency, includes all relevant changes

---

### `create_release_workflow`
**🎯 Purpose**: Complete automated release workflow - generate, publish, and notify in one command.

**💡 Key Features**:
- Generates release notes automatically
- Publishes to Confluence and/or saves as files
- Sends Teams notifications with rich formatting
- Handles errors gracefully with rollback capabilities

**📝 Input Schema**:
```json
{
  "sprintNumber": "string (optional) - Sprint identifier",
  "date": "string (optional) - ISO date for commit range",
  "output": "string (optional) - 'confluence' | 'file' | 'both' (default: both)",
  "notifyTeams": "boolean (optional) - Send Teams notification (default: true)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Create a complete release workflow for sprint SCNT-2025-20"
"Run the full release process and publish to Confluence"
"Generate and publish release notes to both file and Confluence"
"Create release workflow without Teams notification"
```

**💼 Business Value**: One-click release publishing, reduces manual errors, automatic stakeholder communication

---

### `preview_release_notes`
**🎯 Purpose**: Safe preview of release notes before publishing - test formatting and content.

**💡 Key Features**:
- No publishing or side effects
- Validates data and formatting
- Shows statistics and content preview
- Perfect for review workflows

**📝 Input Schema**:
```json
{
  "sprintNumber": "string (optional) - Sprint identifier",
  "date": "string (optional) - ISO date for commit range", 
  "format": "string (optional) - 'html' | 'markdown' (default: markdown)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Preview release notes for sprint SCNT-2025-20"
"Show me what the release notes will look like in HTML"
"Preview markdown release notes for the current sprint"
```

**💼 Business Value**: Risk-free testing, content validation, stakeholder review capability

---

### `publish_to_confluence`
**🎯 Purpose**: Direct publishing of HTML content to Confluence with proper formatting.

**💡 Key Features**:
- Confluence storage format optimization
- Automatic page creation or updates
- Preserves formatting and styling
- Handles authentication and permissions

**📝 Input Schema**:
```json
{
  "content": "string (required) - HTML content to publish",
  "sprintNumber": "string (optional) - Sprint for page title",
  "confluencePage": "string (optional) - Specific page ID to update"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Publish this HTML content to Confluence"
"Update Confluence page with release notes for sprint SCNT-2025-20"
"Create new Confluence page with release content"
```

**💼 Business Value**: Direct publishing, no manual copy-paste, consistent formatting

---
- "Generate markdown release notes for the last 8 days"

## 📊 **Sprint Analytics Commands**

*Performance insights, velocity tracking, and team metrics*

### `analyze_story_points`
**🎯 Purpose**: Comprehensive story points analysis across multiple sprints with completion tracking.

**💡 Key Features**:
- Multi-sprint comparison and trends
- Completion rate analysis with visual charts
- Team performance benchmarking
- Automatic Teams reporting with rich formatting

**📝 Input Schema**:
```json
{
  "sprintNumbers": "array (optional) - Sprint identifiers (default: recent sprints)",
  "sendToTeams": "boolean (optional) - Send report to Teams (default: true)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Analyze story points for the last 3 sprints"
"Compare story point completion across sprints SCNT-2025-18, 19, and 20"
"Show me story points analysis without sending to Teams"
"Generate story points report for our velocity tracking"
```

**💼 Business Value**: Sprint retrospectives, capacity planning, performance tracking

---

### `generate_velocity_report`
**🎯 Purpose**: Advanced velocity analysis with 6-month trends and predictive insights.

**💡 Key Features**:
- 6-month historical velocity analysis
- Trend identification and forecasting
- Sprint-over-sprint comparison
- Performance anomaly detection

**📝 Input Schema**:
```json
{
  "sprintNumbers": "array (optional) - Specific sprints to analyze (default: last 6 months)",
  "sendToTeams": "boolean (optional) - Send report to Teams (default: true)",
  "includeCurrentSprint": "boolean (optional) - Include active sprint (default: true)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Generate velocity report for our team"
"Create 6-month velocity analysis and send to Teams"
"Show velocity trends without including current sprint"
"Generate velocity report for sprints SCNT-2025-15 through 20"
```

**💼 Business Value**: Sprint planning, resource allocation, delivery predictability

---

### `sprint_summary_report`
**🎯 Purpose**: Detailed sprint overview with team metrics and comprehensive statistics.

**💡 Key Features**:
- Complete sprint breakdown by status and type
- Individual team member contributions
- Completion metrics and quality indicators
- Rich Teams notifications with actionable insights

**📝 Input Schema**:
```json
{
  "sprintNumber": "string (required) - Sprint identifier to analyze",
  "sendToTeams": "boolean (optional) - Send report to Teams (default: true)",
  "includeTeamMetrics": "boolean (optional) - Include individual metrics (default: true)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Generate sprint summary for SCNT-2025-20"
"Create detailed sprint report with team metrics"
"Sprint summary for current sprint without Teams notification"
"Show comprehensive sprint analysis for SCNT-2025-21"
```

**💼 Business Value**: Sprint retrospectives, team performance review, stakeholder updates

---

## 🔍 **JIRA Deep Analysis Commands**

*Advanced ticket insights, risk assessment, and collaboration analytics*

### `analyze_jira_ticket`
**🎯 Purpose**: Deep individual ticket analysis with comprehensive insights and quality scoring.

**💡 Key Features**:
- Complete ticket metadata extraction and analysis
- Risk assessment with multiple factors (complexity, timeline, dependencies)
- Quality scoring (description, acceptance criteria, test cases)
- Collaboration patterns and stakeholder engagement metrics

**📝 Input Schema**:
```json
{
  "ticketKey": "string (required) - JIRA ticket key (e.g., PROJ-123)",
  "analysisDepth": "string (optional) - 'basic' | 'standard' | 'comprehensive' (default: standard)",
  "sendToTeams": "boolean (optional) - Send analysis to Teams (default: false)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Analyze ticket SCNT-2025-123 in detail"
"Deep analysis of PROJ-456 with comprehensive insights"
"Analyze ticket SCNT-2025-789 and send results to Teams"
"Basic analysis of my current ticket"
```

**💼 Business Value**: Quality assurance, risk identification, work optimization

---

### `bulk_analyze_tickets`
**🎯 Purpose**: Multi-ticket analysis with intelligent filtering and batch processing.

**💡 Key Features**:
- Batch processing of multiple tickets
- Advanced filtering by risk level, status, assignee
- Aggregated insights and trend identification
- Bulk reporting with statistical summaries

**📝 Input Schema**:
```json
{
  "ticketKeys": "array (optional) - Array of ticket keys to analyze",
  "jql": "string (optional) - JQL query for dynamic ticket selection",
  "includeInsights": "boolean (optional) - Include detailed insights (default: true)",
  "riskFilter": "array (optional) - Filter by risk levels: ['low', 'medium', 'high']",
  "maxResults": "number (optional) - Maximum tickets to process (default: 50)",
  "sendToTeams": "boolean (optional) - Send summary to Teams (default: false)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Bulk analyze all tickets in sprint SCNT-2025-20"
"Analyze tickets with JQL: project = SCNT AND status = 'In Progress'"
"Bulk analyze high-risk tickets and send to Teams"
"Analyze tickets assigned to me with detailed insights"
```

**💼 Business Value**: Sprint health checks, team performance analysis, proactive risk management

---

### `generate_jira_report`
**🎯 Purpose**: Comprehensive JIRA reporting with custom grouping and advanced metrics.

**💡 Key Features**:
- Flexible grouping (status, assignee, priority, epic, sprint, risk)
- Multiple metrics (cycle time, activity, collaboration, quality, velocity)
- Export capabilities with rich formatting
- Executive summary with actionable insights

**📝 Input Schema**:
```json
{
  "ticketKeys": "array (optional) - Specific tickets to include",
  "jql": "string (optional) - JQL query for ticket selection",
  "groupBy": "string (optional) - 'status' | 'assignee' | 'priority' | 'epic' | 'sprint' | 'risk'",
  "metrics": "array (optional) - ['cycleTime', 'activity', 'collaboration', 'quality', 'velocity']",
  "sendToTeams": "boolean (optional) - Send report to Teams (default: true)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Generate JIRA report grouped by status for current sprint"
"Create comprehensive report with all metrics for my tickets"
"Generate risk-based report for project SCNT"
"Create JIRA report with cycle time and quality metrics"
```

**💼 Business Value**: Executive reporting, process improvement, performance tracking

---

### `ticket_risk_assessment`
**🎯 Purpose**: Advanced risk evaluation with predictive analysis and mitigation strategies.

**💡 Key Features**:
- Multi-factor risk assessment (timeline, complexity, dependencies, team capacity)
- Predictive modeling for completion probability
- Mitigation recommendations with priority ranking
- Risk trend analysis across sprints

**📝 Input Schema**:
```json
{
  "ticketKeys": "array (optional) - Tickets to assess",  
  "jql": "string (optional) - JQL query for ticket selection",
  "riskThreshold": "string (optional) - 'low' | 'medium' | 'high' (default: medium)",
  "sendToTeams": "boolean (optional) - Send assessment to Teams (default: true)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Assess risks for tickets in current sprint"
"Risk assessment for high-priority tickets with Teams notification"
"Evaluate risks for tickets with JQL: assignee = currentUser() AND status != Done"
"Risk analysis for tickets in epic SCNT-2025-Epic-1"
```

**💼 Business Value**: Proactive risk management, sprint planning, resource allocation

---

### `ticket_collaboration_analysis`
**🎯 Purpose**: Deep collaboration insights and team engagement patterns.

**💡 Key Features**:
- Stakeholder engagement scoring
- Communication pattern analysis (comments, handoffs, reviews)
- Activity timeline with peak collaboration periods
- Team dynamics and collaboration bottleneck identification

**📝 Input Schema**:
```json
{
  "ticketKeys": "array (optional) - Tickets to analyze",
  "jql": "string (optional) - JQL query for ticket selection", 
  "includeActivityPatterns": "boolean (optional) - Include time-based analysis (default: true)",
  "sendToTeams": "boolean (optional) - Send analysis to Teams (default: false)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Analyze collaboration patterns for tickets in current sprint"
"Check team engagement for tickets assigned to frontend team"
"Collaboration analysis for tickets with low activity"
"Analyze stakeholder engagement for epic tickets"
## ⚙️ **Utility Commands**

*Configuration validation, data access, and system utilities*

### `validate_configuration`
**🎯 Purpose**: Comprehensive environment validation and API connectivity testing.

**💡 Key Features**:
- Tests all API connections (JIRA, GitHub, Confluence, Teams)
- Validates environment variable completeness
- Provides actionable error messages and setup guidance
- Checks permissions and access levels

**📝 Input Schema**:
```json
{} // No parameters required
```

**🗣️ Natural Language Examples**:
```plaintext
"Validate my configuration"
"Check if all API connections are working"
"Test my environment setup"
"Verify configuration and permissions"
```

**💼 Business Value**: Quick troubleshooting, setup validation, prevents runtime errors

---

### `fetch_jira_issues`
**🎯 Purpose**: Direct JIRA data access for specific sprints with raw issue details.

**💡 Key Features**:
- Raw JIRA issue data retrieval
- Sprint-specific filtering
- Complete field extraction including custom fields
- Useful for debugging and data exploration

**📝 Input Schema**:
```json
{
  "sprintNumber": "string (required) - Sprint identifier to fetch issues for"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Fetch JIRA issues for sprint SCNT-2025-20"
"Get all issues from current sprint"
"Show me raw JIRA data for sprint SCNT-2025-21"
"Retrieve issues for sprint analysis"
```

**💼 Business Value**: Data exploration, debugging, custom analysis

---

### `fetch_github_commits`
**🎯 Purpose**: GitHub commit retrieval with flexible date filtering and detailed metadata.

**💡 Key Features**:
- Flexible date range filtering
- Complete commit metadata (author, files, stats)
- Automatic pagination handling
- Integration-ready JSON output

**📝 Input Schema**:
```json
{
  "date": "string (optional) - ISO date for commit start (default: last 8 days)"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Fetch GitHub commits from last week"
"Get all commits since January 1st, 2024"
"Show me recent commits for analysis"
"Retrieve commits from the last 30 days"
```

**💼 Business Value**: Code analysis, contribution tracking, release preparation

---

### `get_sprint_status`
**🎯 Purpose**: Quick sprint overview with key statistics and health indicators.

**💡 Key Features**:
- Instant sprint health check
- Issue distribution by status and type
- Progress indicators and completion metrics
- Quick decision-making data

**📝 Input Schema**:
```json
{
  "sprintNumber": "string (required) - Sprint identifier to check"
}
```

**🗣️ Natural Language Examples**:
```plaintext
"Get status for sprint SCNT-2025-20"
"Show me current sprint statistics"
"Check sprint health for SCNT-2025-21"
"Sprint status overview please"
```

**💼 Business Value**: Quick health checks, daily standups, progress tracking

---

## 🎯 **Advanced Usage Patterns**

### **Multi-Step Workflows**
```plaintext
"First validate my configuration, then generate release notes for sprint SCNT-2025-20, and finally publish to Confluence"
```

### **Conditional Analysis**
```plaintext
"Analyze story points for the last 3 sprints, and if completion rate is below 80%, also run risk assessment"
```

### **Custom Reporting Chains**
```plaintext
"Generate velocity report, then create comprehensive JIRA report grouped by risk, and send both to Teams"
```

## 🚀 **Best Practices**

### **🎯 For Release Managers**
- Use `create_release_workflow` for consistent, automated releases
- Run `preview_release_notes` before publishing for stakeholder review
- Leverage `validate_configuration` after environment changes

### **📊 For Scrum Masters** 
- Weekly `generate_velocity_report` for sprint planning
- Use `sprint_summary_report` for retrospectives
- `ticket_risk_assessment` for proactive sprint management

### **🔍 For Technical Leads**
- `bulk_analyze_tickets` for code review preparation
- `ticket_collaboration_analysis` for team dynamics insights
- `analyze_jira_ticket` for individual work quality assessment

### **⚙️ For DevOps Teams**
- `validate_configuration` in CI/CD pipelines
- Automated `create_release_workflow` on sprint completion
- `fetch_github_commits` for deployment tracking

---

## 🆘 **Troubleshooting & Support**

### **Common Issues**
- **"Configuration invalid"** → Run `validate_configuration` for specific guidance
- **"Sprint not found"** → Verify sprint name format and permissions  
- **"No commits found"** → Check date ranges and repository access
- **"API rate limit"** → Wait for reset or use different authentication

### **Getting Help**
- **📖 Documentation**: See [README.md](./README.md) for complete setup guide
- **🔧 Advanced Features**: Check [ENHANCED_JIRA_TOOLS.md](./ENHANCED_JIRA_TOOLS.md)
- **🤖 Automation**: Review [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md)

---

> **💡 Pro Tip**: The MCP server understands context between commands. You can reference previous results and build complex workflows through natural conversation!
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
