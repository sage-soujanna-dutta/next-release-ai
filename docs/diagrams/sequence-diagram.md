# Next Release AI MCP Server - Sequence Diagram

This sequence diagram shows the complete flow of a typical release workflow request through the Next Release AI MCP server.

```mermaid
sequenceDiagram
    participant Client as Client<br/>(GitHub Copilot/CLI)
    participant MCP as MCP Server<br/>(dual-server.ts)
    participant Factory as MCPToolFactory
    participant Workflow as ComprehensiveWorkflowTool
    participant JiraService as EnhancedJiraService
    participant GitHub as GitHubService
    participant Analyzer as TopContributorsAnalyzer
    participant Release as ReleaseNotesService
    participant Formatter as HtmlFormatter
    participant FileService as FileService
    participant Teams as TeamsService
    participant Confluence as ConfluenceService

    Note over Client,Confluence: Comprehensive Release Workflow Request
    
    Client->>+MCP: Tool Request: comprehensive_release_workflow<br/>sprintNumber: "SCNT-2025-21"
    MCP->>+Factory: createTool("comprehensive_release_workflow")
    Factory->>+Workflow: new ComprehensiveWorkflowTool()
    Factory-->>-MCP: workflow tool instance
    
    MCP->>+Workflow: execute(args)
    
    Note over Workflow: Phase 1: Data Collection
    
    Workflow->>+JiraService: fetchSprintIssues(sprintNumber)
    JiraService->>JiraService: buildJQLQuery()
    JiraService->>External JIRA: GET /search?jql=...
    External JIRA-->>JiraService: issues data
    JiraService-->>-Workflow: parsed issues with metadata
    
    Workflow->>+GitHub: fetchCommits(repository, dateRange)
    GitHub->>External GitHub: GET /repos/{owner}/{repo}/commits
    External GitHub-->>GitHub: commits data
    GitHub-->>-Workflow: commit history
    
    Note over Workflow: Phase 2: Analysis & Processing
    
    Workflow->>+Analyzer: analyzeContributors(commits, issues)
    Analyzer->>Analyzer: calculateContributions()
    Analyzer->>Analyzer: rankByImpact()
    Analyzer-->>-Workflow: contributor metrics
    
    Workflow->>+Release: generateReleaseNotes(issues, commits, contributors)
    Release->>Release: categorizeIssues()
    Release->>Release: generateSummaries()
    Release->>Release: buildMarkdownContent()
    Release-->>-Workflow: markdown content
    
    Note over Workflow: Phase 3: Formatting & Output
    
    Workflow->>+Formatter: convertToHtml(markdown, theme)
    Formatter->>Formatter: applyTemplates()
    Formatter->>Formatter: generateStyles()
    Formatter-->>-Workflow: styled HTML
    
    Workflow->>+FileService: saveReport(html, outputPath)
    FileService->>FileService: ensureDirectory()
    FileService->>Local File System: write HTML file
    Local File System-->>FileService: file saved
    FileService-->>-Workflow: file path
    
    Note over Workflow: Phase 4: Publishing & Notifications
    
    alt if publishToConfluence
        Workflow->>+Confluence: publishPage(title, content)
        Confluence->>External Confluence: POST /content
        External Confluence-->>Confluence: page created
        Confluence-->>-Workflow: page URL
    end
    
    alt if sendToTeams
        Workflow->>+Teams: sendSprintReport(reportData)
        Teams->>Teams: formatAdaptiveCard()
        Teams->>External Teams: POST webhook
        External Teams-->>Teams: message sent
        Teams-->>-Workflow: notification sent
    end
    
    Workflow-->>-MCP: {success: true, reportPath, confluenceUrl?, teamsNotified?}
    MCP-->>-Client: Tool execution result
    
    Note over Client: Client receives report path and can access generated artifacts
```

## Flow Description

1. **Request Initiation**: Client (GitHub Copilot or CLI) sends a comprehensive release workflow request
2. **Tool Factory**: MCP server uses factory pattern to create appropriate tool instance
3. **Data Collection**: 
   - Fetch JIRA issues for the specified sprint
   - Retrieve GitHub commits for the same time period
4. **Analysis**: 
   - Analyze contributor metrics and impact
   - Process and categorize issues
5. **Content Generation**: 
   - Generate release notes in markdown format
   - Convert to styled HTML
6. **Output**: Save reports to local file system
7. **Publishing**: Optionally publish to Confluence and send Teams notifications
8. **Response**: Return success status and artifact locations to client

## Key Integration Points

- **JIRA Integration**: Fetches sprint issues using JQL queries
- **GitHub Integration**: Retrieves commit history and contributor data
- **Teams Integration**: Sends formatted notifications with adaptive cards
- **Confluence Integration**: Publishes release notes as pages
- **File System**: Saves all generated artifacts locally
