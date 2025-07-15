# Release Notes MCP Server

An advanced Model Context Protocol (MCP) server for automated release notes generation with VS Code Copilot integration. This tool combines JIRA issues and GitHub commits to create beautiful, comprehensive release notes with support for Confluence publishing and Teams notifications.

## 🚀 Features

- **MCP Server Integration**: Full VS Code Copilot integration via Model Context Protocol
- **Multi-format Output**: Generate HTML and Markdown release notes
- **Beautiful Themes**: Modern, minimal, and default themes for HTML output
- **JIRA Integration**: Fetch and categorize issues by type and status
- **GitHub Integration**: Automatically include commits since last release
- **Confluence Publishing**: Direct publishing to Confluence pages
- **Teams Notifications**: Automated notifications via Microsoft Teams webhooks
- **GitHub Actions**: Complete CI/CD automation workflow
- **CLI Interface**: Standalone command-line interface
- **File Export**: Save release notes as HTML/Markdown files

## 📦 Installation

```bash
npm install
npm run build
```

## 🔧 Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:

```bash
# Required Environment Variables
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_TOKEN=your_jira_api_token
JIRA_BOARD_ID=123
JIRA_SPRINT_NUMBER=Sprint-42

# GitHub Configuration
GH_REPOSITORY=owner/repository-name
GH_TOKEN=ghp_your_github_token

# Confluence Configuration
CONFLUENCE_USERNAME=your-email@company.com
CONFLUENCE_PAT=your_confluence_personal_access_token
CONFLUENCE_SPACE=SPACE_KEY
JIRA_CONFLUENCE_DOMAIN=your-domain.atlassian.net

# Optional Configuration
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url
JIRA_FETCH_COMMITS_DATE=2024-01-01T00:00:00Z
OUTPUT_DIR=./output
```

### 🔑 Getting API Tokens

#### JIRA API Token
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label and copy the token

#### GitHub Token
1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`

#### Confluence PAT
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Use the same token as JIRA (they're unified)

## 🔌 VS Code Copilot Integration

### MCP Server Setup

1. Build the project:
```bash
npm run build
```

2. Add to your VS Code settings or MCP configuration:
```json
{
  "mcpServers": {
    "release-notes": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/your/release-mcp-server"
    }
  }
}
```

### Available MCP Commands

Once integrated with VS Code Copilot, you can use these commands:

#### 🎯 Core Commands

**`generate_release_notes`**
- Generate comprehensive release notes
- Options: `sprintNumber`, `date`, `format` (html/markdown), `theme` (modern/minimal/default)

**`create_release_workflow`**
- Complete automated workflow (generate + publish + notify)
- Options: `sprintNumber`, `date`, `output` (confluence/file/both), `notifyTeams`

**`preview_release_notes`**
- Preview release notes without publishing
- Options: `sprintNumber`, `date`, `format`

#### 📊 Data Commands

**`fetch_jira_issues`**
- Fetch JIRA issues for a specific sprint
- Options: `sprintNumber`

**`fetch_github_commits`**
- Fetch GitHub commits since a date
- Options: `date`

**`get_sprint_status`**
- Get detailed sprint statistics
- Options: `sprintNumber`

#### 🚀 Publishing Commands

**`publish_to_confluence`**
- Publish HTML content to Confluence
- Options: `content`, `sprintNumber`

**`send_teams_notification`**
- Send Teams notification
- Options: `summary`, `content`

#### 🔧 Utility Commands

**`validate_configuration`**
- Validate all environment variables and connections

### Usage Examples in VS Code

Ask VS Code Copilot:

> "Generate release notes for sprint 42 using the modern theme"

> "Create a complete release workflow for the current sprint and publish to both Confluence and file"

> "Preview release notes in markdown format for sprint 41"

> "Validate my release notes configuration"

> "Get the status of sprint 43"

## 💻 CLI Usage

### Available Commands

```bash
# Generate release notes
npm run start generate --sprint "Sprint-42" --format html --theme modern

# Run complete workflow
npm run start workflow --sprint "Sprint-42" --output both --teams

# Preview release notes
npm run start preview --sprint "Sprint-42" --format markdown

# Validate configuration
npm run start validate

# Start MCP server
npm run start server
```

### Command Options

**Generate Command:**
- `--sprint, -s`: Sprint number
- `--date, -d`: Date to fetch commits from (ISO format)
- `--format, -f`: Output format (html|markdown)
- `--theme, -t`: HTML theme (default|modern|minimal)

**Workflow Command:**
- `--sprint, -s`: Sprint number
- `--date, -d`: Date to fetch commits from
- `--output, -o`: Output destination (confluence|file|both)
- `--no-teams`: Skip Teams notification

**Preview Command:**
- `--sprint, -s`: Sprint number
- `--date, -d`: Date to fetch commits from
- `--format, -f`: Preview format (html|markdown)

## 🤖 GitHub Actions Automation

The project includes a complete GitHub Actions workflow for automated release notes generation.

### Workflow Features

- **Scheduled Runs**: Automatically runs every Friday at 5 PM UTC
- **Manual Triggers**: Run on-demand with custom parameters
- **Configuration Validation**: Verify setup before generation
- **Artifact Upload**: Save generated files as artifacts
- **Multiple Outputs**: Support for Confluence, file, or both

### Setup GitHub Secrets

Add these secrets to your GitHub repository:

```
JIRA_DOMAIN
JIRA_TOKEN
JIRA_BOARD_ID
GH_TOKEN (automatically provided)
CONFLUENCE_USERNAME
CONFLUENCE_PAT
CONFLUENCE_SPACE
JIRA_CONFLUENCE_DOMAIN
TEAMS_WEBHOOK_URL (optional)
DEFAULT_SPRINT_NUMBER (optional)
```

### Manual Workflow Trigger

1. Go to Actions tab in your repository
2. Select "Automated Release Notes"
3. Click "Run workflow"
4. Configure parameters:
   - Sprint number
   - Date range
   - Output destination
   - Teams notification preference

## 🎨 HTML Themes

### Modern Theme (Default)
- Gradient headers with modern colors
- Card-based layout with shadows
- Responsive design
- Rich typography and spacing

### Minimal Theme
- Clean, simple design
- Monochromatic color scheme
- Minimal visual elements
- Focus on content

### Default Theme
- Classic blue color scheme
- Standard layout
- Professional appearance

## 📄 Output Examples

### HTML Output Features
- 📊 Interactive summary with statistics
- 🎯 Issue categorization by type and status
- 🔗 Direct links to JIRA issues and GitHub commits
- 👤 Assignee and author information
- 🎨 Priority indicators and status badges
- 📱 Responsive design for mobile viewing

### Markdown Output Features
- Clean, readable format
- Emoji indicators for different types
- Direct links to issues and commits
- Summary statistics
- Structured hierarchy

## 🔧 Development

### Project Structure
```
src/
├── index.ts              # Main MCP server
├── cli.ts                # CLI interface
├── services/             # Core services
│   ├── JiraService.ts    # JIRA API integration
│   ├── GitHubService.ts  # GitHub API integration
│   ├── ConfluenceService.ts # Confluence publishing
│   ├── TeamsService.ts   # Teams notifications
│   ├── FileService.ts    # File operations
│   └── ReleaseNotesService.ts # Main orchestration
└── utils/                # Utilities
    ├── HtmlFormatter.ts  # HTML generation
    └── MarkdownFormatter.ts # Markdown generation
```

### Build Commands
```bash
npm run build    # Compile TypeScript
npm run dev      # Development mode with watch
npm run start    # Run the built server
```

### Testing Configuration
```bash
npm run start validate  # Test all integrations
```

## 🚨 Troubleshooting

### Common Issues

**Authentication Errors:**
- Verify API tokens are correct and not expired
- Check that tokens have required permissions
- Ensure domain names are correct (without https://)

**Sprint Not Found:**
- Verify the sprint number format matches your JIRA setup
- Check the board ID is correct
- Ensure the sprint exists and is accessible

**GitHub Rate Limits:**
- Use a personal access token instead of basic auth
- Check your token permissions include `repo` scope

**Confluence Publishing Fails:**
- Verify space key is correct and accessible
- Check username and PAT combination
- Ensure you have write permissions to the space

### Debug Mode

Set environment variable for verbose logging:
```bash
DEBUG=true npm run start [command]
```

## 📋 Requirements

- Node.js 18+
- TypeScript 5+
- JIRA Cloud access
- GitHub repository access
- Confluence Cloud access (optional)
- Microsoft Teams webhook (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review environment variable configuration
3. Test with the validate command
4. Create an issue with full error details

---

**Happy Release Notes Generation! 🚀**