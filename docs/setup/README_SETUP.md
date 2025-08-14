# Environment Setup Instructions

## 🔧 Configuration Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your actual values:**

### Required Variables:
- `JIRA_EMAIL`: Your JIRA login email
- `JIRA_DOMAIN`: Your JIRA domain (e.g., company.atlassian.net)
- `JIRA_TOKEN`: Your JIRA API token
- `JIRA_BOARD_ID`: Your JIRA board ID number
- `GH_REPOSITORY`: Your GitHub repository (org/repo-name)
- `GH_TOKEN`: Your GitHub personal access token

### Optional Variables:
- `CONFLUENCE_USERNAME`: Your Confluence username
- `CONFLUENCE_PAT`: Your Confluence personal access token
- `TEAMS_WEBHOOK_URL`: Your Microsoft Teams webhook URL
- `AZURE_PAT`: Your Azure DevOps personal access token

## 🔐 Security Notes

- Never commit your actual `.env` file to version control
- The `.env.example` file contains placeholder values only
- Keep your API tokens secure and rotate them regularly

## 🚀 Getting Started

After setting up your environment variables:

```bash
npm install
npm run mcp-server
```

Your Next Release AI system will be ready to use!
