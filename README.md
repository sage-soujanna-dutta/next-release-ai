# 🚀 Release Notes MCP Server

> **An enterprise-grade Model Context Protocol (MCP) server for automated release notes generation with VS Code Copilot integration.**

Transform your release process with AI-powered automation that combines JIRA issues, GitHub commits, and team insights into beautiful, comprehensive release notes. Features advanced JIRA analytics, velocity tracking, and seamless integration with Confluence and Microsoft Teams.

## ✨ **What Makes This Special**

- 🤖 **AI-Powered**: Natural language commands through VS Code Copilot
- 📊 **Advanced Analytics**: Deep JIRA insights, risk assessment, and velocity tracking  
- 🎨 **Beautiful Output**: Professional HTML themes and clean Markdown
- 🔄 **Full Automation**: From data collection to publishing and notifications
- 🚀 **Enterprise Ready**: Handles complex workflows with error handling and validation

## 🎯 **Quick Start (2 Minutes)**

### Prerequisites
- VS Code with GitHub Copilot extension
- Node.js 18+ 
- Access to JIRA, GitHub, and optionally Confluence/Teams

### 1. Setup
```bash
git clone <your-repo>
cd next-release-ai
npm install
# Configure your environment - see docs/setup/README_SETUP.md
```

### 2. Start the MCP Server
```bash
npm run mcp-server
```

### 3. Use with VS Code Copilot
Open VS Code and use natural language commands:
- *"Generate release notes for sprint SCNT-2025-20"*
- *"Analyze story points across the last 3 sprints"*  
- *"Create a velocity report and send to Teams"*
- *"Assess risks for tickets in my current sprint"*

## 🗣️ Natural Language Commands for MCP Tools

You can use the following natural language commands in VS Code Copilot, Claude Desktop, or any MCP-compatible client:

### 🚀 Release Management
- Generate release notes for sprint SCNT-2025-20
- Create HTML release notes with modern theme for the current sprint
- Generate markdown release notes for sprint SCNT-2025-21
- Make release notes with minimal theme
- Create a complete release workflow for sprint SCNT-2025-20
- Run the full release process and publish to Confluence
- Generate and publish release notes to both file and Confluence
- Create release workflow without Teams notification
- Preview release notes for sprint SCNT-2025-20
- Show me what the release notes will look like in HTML
- Preview markdown release notes for the current sprint
- Publish this HTML content to Confluence
- Update Confluence page with release notes for sprint SCNT-2025-20
- Create new Confluence page with release content

### 📊 Sprint Analytics
- Analyze story points for the last 3 sprints
- Compare story point completion across sprints SCNT-2025-18, 19, and 20
- Show me story points analysis without sending to Teams
- Generate story points report for our velocity tracking
- Generate velocity report for our team
- Create 6-month velocity analysis and send to Teams
- Show velocity trends without including current sprint
- Generate velocity report for sprints SCNT-2025-15 through 20
- Generate sprint summary for SCNT-2025-20
- Create detailed sprint report with team metrics
- Sprint summary for current sprint without Teams notification
- Show comprehensive sprint analysis for SCNT-2025-21

### 🔍 JIRA Deep Analysis
- Analyze ticket SCNT-2025-123 in detail
- Deep analysis of PROJ-456 with comprehensive insights
- Analyze ticket SCNT-2025-789 and send results to Teams
- Basic analysis of my current ticket
- Bulk analyze all tickets in sprint SCNT-2025-20
- Analyze tickets with JQL: project = SCNT AND status = 'In Progress'
- Bulk analyze high-risk tickets and send to Teams
- Analyze tickets assigned to me with detailed insights
- Generate JIRA report grouped by status for current sprint
- Create comprehensive report with all metrics for my tickets
- Generate risk-based report for project SCNT
- Create JIRA report with cycle time and quality metrics
- Assess risks for tickets in current sprint
- Risk assessment for high-priority tickets with Teams notification
- Evaluate risks for tickets with JQL: assignee = currentUser() AND status != Done
- Risk analysis for tickets in epic SCNT-2025-Epic-1
- Analyze collaboration patterns for tickets in current sprint
- Check team engagement for tickets assigned to frontend team
- Collaboration analysis for tickets with low activity
- Analyze stakeholder engagement for epic tickets

### ⚙️ Utilities
- Validate my configuration
- Check if all API connections are working
- Test my environment setup
- Verify configuration and permissions
- Fetch JIRA issues for sprint SCNT-2025-20
- Get all issues from current sprint
- Show me raw JIRA data for sprint SCNT-2025-21
- Retrieve issues for sprint analysis
- Fetch GitHub commits from last week
- Get all commits since January 1st, 2024
- Show me recent commits for analysis
- Retrieve commits from the last 30 days
- Get status for sprint SCNT-2025-20
- Show me current sprint statistics
- Check sprint health for SCNT-2025-21
- Sprint status overview please

#### You can also chain commands, e.g.:
- First validate my configuration, then generate release notes for sprint SCNT-2025-20, and finally publish to Confluence
- Analyze story points for the last 3 sprints, and if completion rate is below 80%, also run risk assessment

For more, see [docs/guides/MCP_COMMANDS.md](docs/guides/MCP_COMMANDS.md) for the full reference and advanced usage!

## 🛠️ **Core Capabilities**

### 🎯 **Release Generation**
| Tool | Purpose | Key Features |
|------|---------|--------------|
| `generate_release_notes` | Complete release notes | Sprint-aware, Multi-format output, Auto-publishing |
| `preview_release_notes` | Preview before publishing | Safe testing, Format validation |
| `create_release_workflow` | End-to-end automation | File + Confluence + Teams |

### 📊 **Sprint Analytics**  
| Tool | Purpose | Key Features |
|------|---------|--------------|
| `analyze_story_points` | Story point analysis | Multi-sprint comparison, Completion tracking |
| `generate_velocity_report` | Team velocity trends | 6-month analysis, Performance insights |
| `sprint_summary_report` | Comprehensive sprint overview | Team metrics, Issue breakdown |

### 🔍 **JIRA Deep Analytics**
| Tool | Purpose | Key Features |
|------|---------|--------------|
| `analyze_jira_ticket` | Individual ticket insights | Risk assessment, Quality scoring |
| `bulk_analyze_tickets` | Multi-ticket analysis | Batch processing, Advanced filtering |
| `generate_jira_report` | Custom reporting | Grouping, Metrics, Export options |
| `ticket_risk_assessment` | Risk evaluation | Predictive analysis, Mitigation strategies |
| `ticket_collaboration_analysis` | Team collaboration insights | Stakeholder engagement, Activity patterns |

### ⚙️ **Utilities**
| Tool | Purpose | Key Features |
|------|---------|--------------|
| `validate_configuration` | Environment validation | API connectivity, Missing variables |
| `fetch_jira_issues` | Raw data access | Direct JIRA queries |
| `fetch_github_commits` | Raw commit data | Date-based filtering |

## 📚 **Complete Documentation**

For detailed guides, troubleshooting, and advanced features, visit our organized knowledge base:

### 🗂️ [Documentation Hub](./docs/README.md)
- **[Setup & Configuration](./docs/setup/README.md)** - Installation, security, and deployment guides  
- **[User Guides](./docs/guides/README.md)** - Step-by-step instructions and workflows
- **[Templates](./docs/templates/README.md)** - Reusable templates and patterns
- **[Tool References](./docs/summaries/README.md)** - Complete tool listings and capabilities

### 📖 **Quick Reference**
| Document | Purpose | When to Use |
|----------|---------|-------------|
| 📖 **[Quick Start Guide](#quick-start-2-minutes)** | Get running fast | First time setup |
| 🛠️ **[MCP Commands Guide](./docs/guides/MCP_COMMANDS.md)** | Complete command reference | Learning all capabilities |
| 🔧 **[JIRA Tools Guide](./docs/summaries/ENHANCED_JIRA_TOOLS.md)** | Advanced JIRA features | Complex analysis needs |
| 🤖 **[Automation Guide](./docs/setup/AUTOMATION_GUIDE.md)** | GitHub Actions setup | CI/CD integration |
| 🚀 **[Project Showcase](./docs/summaries/project-showcase.md)** | Full feature demo | Understanding capabilities |

## 🏗️ **Architecture Overview**

```
📦 Next Release AI - MCP Server
├── 🧠 MCP Server Core (src/index.ts)
│   ├── 🔧 23+ AI-Accessible Tools
│   └── 🎯 VS Code Copilot Integration
├── 🏢 Services Layer
│   ├── 📋 JIRA Service (Enhanced Analytics)
│   ├── 🐙 GitHub Service (Commit Analysis)  
│   ├── 📝 Confluence Service (Publishing)
│   ├── 💬 Teams Service (Professional Templates)
│   └── 📁 File Service (Export Management)
├── 🎨 Report Generation
│   ├── 🌐 HTML Generator (Professional Themes)
│   ├── 📄 PDF Generator (Multi-format)
│   └── 📋 Markdown Formatter (Clean Output)
├── 🔍 Advanced Analytics
│   ├── 📊 JIRA Extractor (Deep Data Mining)
│   ├── 🎯 JIRA Analyzer (Risk Assessment)
│   └── 👥 Contributors Analyzer (Team Insights)
└── 📚 Documentation (Organized Knowledge Base)
    ├── 🔧 Setup & Configuration Guides
    ├── 📋 User Guides & Workflows  
    ├── 🎨 Templates & Patterns
    └── 📊 Tool References & Summaries
```

### 🚀 **Core Capabilities**
- **23+ MCP Tools**: Complete release management automation
- **Professional Reporting**: HTML, PDF, and Teams-native formats
- **Advanced Analytics**: Risk assessment, velocity tracking, contributor insights
- **Enterprise Ready**: Error handling, validation, and comprehensive documentation

See [docs/summaries/ENHANCED_JIRA_TOOLS.md](./docs/summaries/ENHANCED_JIRA_TOOLS.md) for detailed JIRA tools documentation and [docs/guides/MCP_COMMANDS.md](./docs/guides/MCP_COMMANDS.md) for complete tool reference.

## ⚙️ **Complete Configuration Guide**

### � **Environment Variables Reference**

Create a `.env` file from the template:
```bash
cp .env.example .env
```

#### **Core Services (Required)**
```bash
# JIRA Configuration
JIRA_DOMAIN=your-company.atlassian.net          # Your JIRA domain
JIRA_EMAIL=your.email@company.com               # Your JIRA email
JIRA_TOKEN=ATATT3xFfGF0...                      # JIRA API Token
JIRA_BOARD_ID=6306                              # Board ID from JIRA URL

# GitHub Configuration  
GH_REPOSITORY=owner/repository-name             # GitHub repo (owner/name)
GH_TOKEN=ghp_abcd1234...                        # GitHub Personal Access Token

# Confluence Publishing (Optional)
CONFLUENCE_USERNAME=your.email@company.com      # Confluence email
CONFLUENCE_PAT=ATATT3xFfGF0...                  # Confluence API Token (same as JIRA)
CONFLUENCE_SPACE=SPACE                          # Confluence Space Key
JIRA_CONFLUENCE_DOMAIN=your-company.atlassian.net # Usually same as JIRA

# Teams Notifications (Optional)
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/... # Teams webhook URL
```

#### **Advanced Configuration (Optional)**
```bash
# Output Customization
OUTPUT_DIR=./output                             # Output directory for files
DEFAULT_SPRINT_NUMBER=SCNT-2025-20             # Default sprint if not specified

# Date Filtering
JIRA_FETCH_COMMITS_DATE=2024-01-01T00:00:00Z   # Default commit start date

# Azure DevOps (If using build pipelines)
AZURE_ORG_URL=https://dev.azure.com/YourOrg
AZURE_PROJECT=ProjectName
AZURE_PAT=your_azure_token
```

### 🔑 **API Token Setup Guide**

<details>
<summary><strong>📋 JIRA API Token</strong></summary>

1. **Navigate to Atlassian Account**
   - Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   
2. **Create Token**
   - Click "Create API token"
   - Label: "Release Notes MCP Server"
   - Copy the generated token
   
3. **Test Token**
   ```bash
   curl -H "Authorization: Basic $(echo -n 'your.email@company.com:YOUR_TOKEN' | base64)" \
        "https://your-company.atlassian.net/rest/api/3/myself"
   ```

</details>

<details>
<summary><strong>🐙 GitHub Personal Access Token</strong></summary>

1. **Navigate to GitHub Settings**
   - Go to [github.com/settings/tokens](https://github.com/settings/tokens)
   
2. **Generate New Token (Classic)**
   - Click "Generate new token (classic)"
   - Scopes needed: `repo`, `read:org`
   - Copy the generated token
   
3. **Test Token**
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" \
        "https://api.github.com/repos/owner/repo/commits"
   ```

</details>

<details>
<summary><strong>💬 Teams Webhook URL</strong></summary>

1. **In Microsoft Teams**
   - Go to your target channel
   - Click "..." → "Connectors" → "Incoming Webhook"
   - Configure and copy the webhook URL
   
2. **Test Webhook**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
        -d '{"text":"Test from Release MCP Server"}' \
        "YOUR_WEBHOOK_URL"
   ```

</details>

### 🚀 **Installation & Setup**

```bash
# 1. Clone and Install
git clone <your-repository>
cd next-release-ai
npm install

# 2. Configure Environment
cp .env.example .env
# Edit .env with your tokens

# 3. Build Project
npm run build

# 4. Validate Configuration
npm run mcp-server
# In VS Code Copilot: "validate configuration"

# 5. Test Basic Functionality
# In VS Code Copilot: "generate release notes for sprint SCNT-2025-20"
```

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### ❌ **"Missing required environment variables"**
```bash
# Check which variables are missing
npm run mcp-server
# In VS Code Copilot: "validate configuration"

# Common fixes:
# 1. Ensure .env file exists and has all required variables
# 2. Check for typos in variable names
# 3. Restart VS Code after changing .env
```

#### ❌ **"JIRA authentication failed"**
```bash
# Test your JIRA connection
curl -H "Authorization: Basic $(echo -n 'EMAIL:TOKEN' | base64)" \
     "https://YOUR_DOMAIN.atlassian.net/rest/api/3/myself"

# Common fixes:
# 1. Verify JIRA_EMAIL matches your Atlassian account email
# 2. Regenerate JIRA_TOKEN if it's expired
# 3. Check JIRA_DOMAIN format (don't include https://)
```

#### ❌ **"GitHub API rate limit exceeded"**
```bash
# Check your GitHub token permissions
curl -H "Authorization: token YOUR_TOKEN" \
     "https://api.github.com/rate_limit"

# Common fixes:
# 1. Use GitHub Personal Access Token (not OAuth app token)
# 2. Ensure token has 'repo' scope
# 3. Wait for rate limit reset or use different token
```

#### ❌ **"Sprint not found" errors**
```bash
# Verify sprint number format
# In VS Code Copilot: "get sprint status for SCNT-2025-20"

# Common fixes:
# 1. Check exact sprint name in JIRA (case-sensitive)
# 2. Verify JIRA_BOARD_ID is correct
# 3. Ensure sprint exists and is accessible to your user
```

#### ❌ **"No commits found" warnings**
```bash
# This is often normal if:
# 1. Sprint dates don't align with commit dates
# 2. Repository has no commits in the date range
# 3. GitHub token doesn't have access to the repository

# To debug:
# 1. Check repository permissions
# 2. Verify GH_REPOSITORY format (owner/repo)
# 3. Test with a specific date range
```

### **Debug Mode**

Enable detailed logging by setting environment variable:
```bash
DEBUG=release-mcp-server npm run mcp-server
```

### **Testing Individual Components**

```bash
# Test JIRA connection
npm run story-points

# Test GitHub connection  
npm run velocity

# Test Teams integration
npm run sprint-summary

# Test complete workflow
# In VS Code Copilot: "create release workflow for sprint SCNT-2025-20"
```

## 🎯 **Usage Examples**

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

### **VS Code Copilot Commands (Natural Language)**

```plaintext
# 🎯 Basic Release Generation
"Generate release notes for sprint SCNT-2025-20"
"Create HTML release notes with modern theme for sprint SCNT-2025-21"
"Generate markdown release notes for the current sprint"

# 📊 Sprint Analytics  
"Analyze story points for the last 3 sprints"
"Generate a velocity report for our team"
"Create a comprehensive sprint summary for SCNT-2025-20"

# 🔍 JIRA Deep Analysis
"Analyze the risk factors for tickets in sprint SCNT-2025-20"
"Bulk analyze all tickets with JQL: project = SCNT AND sprint = 'SCNT-2025-20'"
"Check collaboration patterns for tickets assigned to me"

# 🚀 Complete Workflows
"Create a complete release workflow for sprint SCNT-2025-20 and publish to Confluence"
"Generate release notes and send notification to Teams"
"Preview release notes before publishing"

# 🔧 Utilities
"Validate my configuration"
"Check the status of sprint SCNT-2025-20"
"Fetch GitHub commits from the last week"
```

### **NPM Script Commands**

```bash
# 📊 Analytics Commands
npm run story-points    # Analyze story points across sprints
npm run velocity        # Generate velocity trends report  
npm run sprint-summary  # Create detailed sprint summary

# 🚀 Core Commands
npm run mcp-server      # Start MCP server for VS Code
npm run start           # Start MCP server (alternative)
npm run build           # Build TypeScript to JavaScript
npm run release         # Legacy: Use scripts/postToConfluence.ts

# 🔧 Development
npm run dev            # Start server in watch mode
```

### **Advanced Usage Examples**

<details>
<summary><strong>🎯 Multi-Sprint Release Notes</strong></summary>

```javascript
// In VS Code Copilot
"Generate combined release notes for sprints SCNT-2025-19 and SCNT-2025-20"

// The system will:
// 1. Fetch issues from both sprints
// 2. Combine commit history for the date range
// 3. Create unified release notes
// 4. Categorize by sprint for clarity
```

</details>

<details>
<summary><strong>📊 Risk Assessment Workflow</strong></summary>

```javascript
// In VS Code Copilot
"Assess risks for all tickets in our current sprint and send results to Teams"

// The system will:
// 1. Identify current sprint automatically
// 2. Analyze each ticket for risk factors
// 3. Generate mitigation recommendations
// 4. Send formatted report to Teams channel
```

</details>

<details>
<summary><strong>🔍 Custom JQL Analysis</strong></summary>

```javascript
// In VS Code Copilot
"Analyze tickets with JQL: project = SCNT AND status = 'In Progress' AND assignee = currentUser()"

// The system will:
// 1. Execute custom JQL query
// 2. Perform deep analysis on results
// 3. Provide insights and recommendations
// 4. Optionally export detailed report
```

</details>

## 🤖 **GitHub Actions Automation**

Your project includes enterprise-grade automation. See **[Automation Guide](./docs/setup/AUTOMATION_GUIDE.md)** for complete setup.

### **Quick Setup**
1. **Add Secrets**: Configure repository secrets for API tokens
2. **Enable Workflows**: Workflows automatically trigger on schedule
3. **Manual Triggers**: Use workflow dispatch for on-demand generation

```yaml
# Sample workflow trigger (runs every Friday at 5 PM UTC)
on:
  schedule:
    - cron: '0 17 * * 5'
  workflow_dispatch:
    inputs:
      sprint_number:
        description: 'Sprint number'
        required: true
```

## 🎨 **Output Themes & Formats**
### **HTML Themes**
| Theme | Style | Best For |
|-------|-------|----------|
| 🎨 **Modern** | Gradient backgrounds, animations | Executive presentations |
| 🎯 **Minimal** | Clean, professional | Technical documentation |
| 📋 **Default** | Classic, readable | General use |

### **Output Formats**
- **📄 Markdown**: Clean, version-controllable, great for technical teams
- **🌐 HTML**: Rich formatting, perfect for stakeholder presentations
- **📝 Confluence**: Direct publishing with proper formatting

## 🔗 **Related Documentation**

### 📚 **Essential Guides**
| 📚 **Complete Guide** | 🎯 **Purpose** |
|----------------------|----------------|
| **[Documentation Hub](./docs/README.md)** | Central knowledge base and navigation |
| **[MCP Commands Reference](./docs/guides/MCP_COMMANDS.md)** | Detailed command documentation with examples |
| **[Enhanced JIRA Tools](./docs/summaries/ENHANCED_JIRA_TOOLS.md)** | Advanced JIRA analytics and insights |
| **[Automation Guide](./docs/setup/AUTOMATION_GUIDE.md)** | GitHub Actions and CI/CD setup |
| **[Project Showcase](./docs/summaries/project-showcase.md)** | Full feature demonstration |

### 🔧 **Setup & Configuration**
- **[Quick Start](./docs/setup/QUICK_START.md)** - Get running in minutes
- **[Security Setup](./docs/setup/SECURITY-SETUP.md)** - Security configuration and best practices  
- **[Deployment Guide](./docs/setup/DEPLOYMENT_GUIDE.md)** - Production deployment instructions

### 📋 **User Guides**
- **[MCP Server Usage](./docs/guides/HOW_TO_UTILIZE_MCP_SERVER.md)** - Advanced server utilization
- **[Release Workflow](./docs/guides/RELEASE_WORKFLOW_GUIDE.md)** - End-to-end release process
- **[GitHub Copilot Integration](./docs/guides/GITHUB_COPILOT_INTEGRATION.md)** - AI-powered workflows

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

- **📖 Documentation**: Check the guides listed above
- **🐛 Issues**: Create an issue in the GitHub repository
- **💬 Discussions**: Use GitHub Discussions for questions
- **🔧 Troubleshooting**: See the troubleshooting section above

## 🎉 **What's Next?**

1. **🚀 [Quick Start](docs/setup/QUICK_START.md)** - Get running in 2 minutes
2. **📊 [Explore Tools](docs/summaries/MCP_TOOLS_LIST.md)** - Discover all 23+ available tools
3. **🔧 [Advanced JIRA Features](docs/summaries/ENHANCED_JIRA_TOOLS.md)** - Deep analytics and insights
4. **🤖 [Set Up Automation](docs/setup/AUTOMATION_GUIDE.md)** - Configure GitHub Actions
5. **📚 [Browse Documentation](docs/README.md)** - Explore the complete knowledge base

---

> **💡 Pro Tip**: Use VS Code Copilot's natural language interface - it's designed to understand context and handle complex workflows automatically! Start with our [MCP Commands Guide](docs/guides/MCP_COMMANDS.md) for examples.

## 🔧 **Development & Architecture**

### 📁 **Project Structure**
```
next-release-ai/
├── 📚 docs/                    # 📖 Organized Documentation
│   ├── setup/                  # 🔧 Setup & Configuration (5 guides)
│   ├── guides/                 # 📋 User Guides & Workflows (6 guides)
│   ├── templates/              # 🎨 Templates & Patterns (1 template)
│   └── summaries/              # 📊 Tool References & Summaries (3 files)
├── 🏗️ src/                     # 💻 Source Code
│   ├── core/                   # 🧠 MCP Server Core & Factories
│   ├── services/               # 🏢 Business Logic Services
│   ├── tools/                  # 🔧 MCP Tool Implementations
│   ├── generators/             # 🎨 Report Generators (HTML/PDF)
│   └── utils/                  # 🛠️ Utilities & Formatters
├── 📄 README.md                # 📖 Main Project Documentation
├── 📦 package.json             # 📋 Dependencies & Scripts
└── 🔨 tsconfig.json            # ⚙️ TypeScript Configuration
```

### 🚀 **Build Commands**
```bash
npm run build        # 🔨 Compile TypeScript to JavaScript
npm run dev          # 👨‍💻 Development mode with watch
npm run mcp-server   # 🚀 Start MCP server for VS Code
npm run start        # ▶️ Run the built server
```

### 🧪 **Testing & Validation**
```bash
npm run story-points    # 📊 Test JIRA integration
npm run velocity        # 📈 Test analytics capabilities  
npm run sprint-summary  # 📋 Test complete workflow
# In VS Code Copilot: "validate configuration"
```

## 📋 **Requirements**

### 🛠️ **Development Environment**
- **Node.js 18+** - Runtime environment
- **TypeScript 5+** - Language and compiler
- **VS Code + GitHub Copilot** - Recommended development setup

### 🔑 **API Access**  
- **JIRA Cloud** - Sprint and issue management
- **GitHub** - Repository and commit access
- **Confluence Cloud** (optional) - Documentation publishing
- **Microsoft Teams** (optional) - Team notifications

## 🤝 **Contributing**

1. **Fork the repository** and clone your fork
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the docs structure**: Add documentation to appropriate `docs/` subdirectory
4. **Test your changes**: Use validation commands to ensure functionality
5. **Commit changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request** with clear description

## 📄 **License**

This project is licensed under the **MIT License** - see the LICENSE file for details.

## 🆘 **Support & Troubleshooting**

### 📖 **Documentation First**
1. **[Complete Knowledge Base](docs/README.md)** - Start here for all documentation
2. **[Setup Guides](docs/setup/README.md)** - Installation and configuration help
3. **[User Guides](docs/guides/README.md)** - Step-by-step workflows and tutorials

### 🔧 **Common Issues**  
- **Configuration Problems**: Check [Setup Guides](docs/setup/README.md)
- **API Errors**: Review [Security Setup](docs/setup/SECURITY-SETUP.md)  
- **Tool Usage**: Consult [MCP Commands Guide](docs/guides/MCP_COMMANDS.md)

### 🐛 **Still Need Help?**
- **GitHub Issues**: Create an issue with full error details
- **GitHub Discussions**: Ask questions and share experiences
- **Validation Command**: In VS Code Copilot: "validate configuration"

---

> **💡 Ready to Transform Your Release Process?** Start with our [Quick Start Guide](docs/setup/QUICK_START.md) and discover the power of AI-automated release management! 🚀