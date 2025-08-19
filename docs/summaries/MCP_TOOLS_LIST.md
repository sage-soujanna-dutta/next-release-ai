# 🛠️ Complete List of MCP Tools

## 📋 Overview
Your MCP server has **23 total tools** organized into **4 categories**:

---

## 🚀 **Release Management Category** (6 tools)
*Tools for generating release notes, managing workflows, and publishing content*

1. **`generate_release_notes`**
   - Generate comprehensive release notes with JIRA issues and GitHub commits
   - **Parameters**: sprintNumber (required), format (html/markdown), theme

2. **`create_release_workflow`** 
   - Create complete release workflow with multiple automation steps
   - **Parameters**: sprintNumber (required), output, notifyTeams

3. **`generate_comprehensive_sprint_report`**
   - Generate complete sprint reports with HTML, PDF, and Teams notification in one command
   - **Parameters**: sprintNumber (required), formats, outputDirectory, sendToTeams, reportConfig

4. **`preview_release_notes`**
   - Preview release notes content before publishing
   - **Parameters**: sprintNumber (required), format

5. **`publish_to_confluence`**
   - Publish content to Confluence pages
   - **Parameters**: title (required), content (required), spaceKey, parentPageId

6. **`comprehensive_release_workflow`**
   - Execute complete end-to-end release workflow with all analysis tools, reporting, and notifications
   - **Parameters**: sprintNumber (required), generateAllReports, includeReleaseNotes, etc.

---

## 📊 **Analysis & Metrics Category** (5 tools)
*Tools for sprint analysis, velocity tracking, and performance metrics*

7. **`analyze_story_points`**
   - Analyze story points completion and trends across sprints
   - **Parameters**: sprintNumbers (required), includeTeamMetrics

8. **`generate_velocity_report`**
   - Generate team velocity report with trends and predictions
   - **Parameters**: sprintNumbers (required), includeCurrentSprint

9. **`sprint_summary_tool`**
   - Generate comprehensive sprint summary and analysis
   - **Parameters**: sprintNumber (required), includeMetrics, format

10. **`enhanced_story_points_analysis`**
    - Enhanced multi-sprint story points analysis with trends, Teams integration, and HTML reports
    - **Parameters**: sprintNumbers (required), generateHtmlReport, includeTeamsNotification

11. **`enhanced_velocity_analysis`**
    - Comprehensive velocity analysis with predictive analytics, trends, and consistency metrics
    - **Parameters**: numberOfSprints, generateHtmlReport, includePredictiveAnalysis

---

## 🔗 **Integration & Communication Category** (6 tools)
*Tools for Teams notifications, Confluence publishing, and external integrations*

12. **`send_teams_notification`**
    - Send notifications to Microsoft Teams channels
    - **Parameters**: message (required), channel, urgency

13. **`publish_confluence_page`**
    - Publish content to Confluence pages with formatting
    - **Parameters**: title (required), content (required), spaceKey

14. **`generate_html_report`**
    - Generate comprehensive HTML reports from analysis data
    - **Parameters**: reportType (required), data (required), includeCharts, templateStyle

15. **`generate_pdf_report`**
    - Generate high-quality PDF reports from sprint data with professional layouts
    - **Parameters**: reportData (required), reportType (required), config, outputPath

16. **`teams_release_notification`**
    - Send release notifications to Teams with adaptive cards
    - **Parameters**: releaseData (required), channel, customMessage

17. **`enhanced_teams_integration`**
    - Advanced Teams integration with adaptive cards, workflow notifications, and interactive features
    - **Parameters**: integrationType (required), data (required), includeInteractiveElements

---

## 🎯 **JIRA Management Category** (6 tools)
*Tools for JIRA issue management, fetching, and analysis*

18. **`fetch_jira_issues`**
    - Fetch JIRA issues for a specific sprint or query
    - **Parameters**: sprintNumber OR jqlQuery, fields, includeSubtasks

19. **`bulk_update_jira_issues`**
    - Perform bulk updates on JIRA issues based on criteria
    - **Parameters**: jqlQuery (required), updates (required), batchSize, dryRun

20. **`build_jira_query`**
    - Build complex JQL queries using natural language criteria
    - **Parameters**: criteria (required), maxResults, orderBy, returnJQL

21. **`advanced_jira_fetch`**
    - Advanced JIRA fetching with filtering, pagination, and custom field extraction
    - **Parameters**: fetchConfig (required), customFields, filters, pagination

22. **`analyze_jira_fields`**
    - Analyze JIRA field usage, patterns, and data quality across issues
    - **Parameters**: sprintNumber (required), fieldsToAnalyze, generateReport

23. **`enhanced_jira_fetch`**
    - Enhanced JIRA fetching with intelligent preprocessing, caching, and comprehensive data enrichment
    - **Parameters**: sprintNumbers (required), cacheStrategy, enrichmentOptions

---

## 🔧 **Tool Status & Configuration**

- **Server File**: `/src/dual-server.ts`
- **Factory File**: `/src/core/MCPToolFactory.ts`
- **Categories**: 4 active categories (release, analysis, integration, jira)
- **Professional Template**: ✅ Integrated (uses `/output/SCNT-2025-21-sprint-report.md`)

---

## 🚨 **Common Issues & Troubleshooting**

If you're getting errors like "Invalid ChatMessage child", it's likely due to:
1. **MCP Server not running** - Start with `npm run mcp-server:stdio`
2. **TypeScript compilation errors** - Run `npm run build`
3. **Missing environment variables** - Check `.env` file for JIRA/Teams configs
4. **Tool parameter validation** - Ensure required parameters are provided

---

## 🎯 **Most Used Tools for Sprint Reports**

For generating sprint reports like SCNT-2025-20, you would typically use:
- `generate_release_notes` (for basic markdown/html reports)
- `generate_comprehensive_sprint_report` (for full HTML/PDF with Teams)
- `fetch_jira_issues` (to get raw sprint data first)
- `enhanced_jira_fetch` (for enriched sprint data)
