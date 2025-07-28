# 🔐 Important Security Reminder

## ⚠️ Environment Setup Required

After cloning this repository, you need to set up your environment variables:

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Replace placeholder values in `.env` with your actual credentials:**
   - JIRA_TOKEN: Get from JIRA → Profile → Personal Access Tokens
   - GH_TOKEN: Get from GitHub → Settings → Developer settings → Personal access tokens
   - CONFLUENCE_PAT: Get from Confluence → Profile → Personal Access Tokens  
   - TEAMS_WEBHOOK_URL: Get from Teams → Channel → Connectors → Incoming Webhook
   - AZURE_PAT: Get from Azure DevOps → User settings → Personal access tokens

3. **Never commit your actual `.env` file** - it's already in `.gitignore`

## 🚀 Quick Start

Once your environment is configured:

```bash
npm install
npm run mcp-server
```

Your Next Release AI system will be ready to use with VS Code Copilot!
