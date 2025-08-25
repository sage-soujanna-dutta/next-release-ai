# NAS Team Secure Reporting Configuration

## Overview
This document provides secure configuration guidance for the NAS team comprehensive reporting system. All credentials use environment variables to ensure GitHub security compliance.

## Team Configuration
- **Team Name**: NAS (Network Account Services)
- **Sprint**: NAS-FY25-23
- **Board ID**: 5466
- **Project Key**: NAS
- **Repository**: Sage/network-account-services

## Environment Variables Setup

### Required Environment Variables
```bash
# JIRA Configuration
export JIRA_USERNAME="your-email@sage.com"
export JIRA_PAT="YOUR_JIRA_PAT_TOKEN"
export JIRA_DOMAIN="your-domain.atlassian.net"

# Azure DevOps Configuration  
export AZURE_ORG_URL="https://dev.azure.com/YourOrg"
export AZURE_PAT="YOUR_AZURE_DEVOPS_TOKEN"
export AZURE_PROJECT="YourProject"

# GitHub Configuration
export GITHUB_TOKEN="YOUR_GITHUB_TOKEN"
export GITHUB_OWNER="YourOrg"
export GITHUB_REPO="YourRepo"
```

## Configuration Templates

### JIRA Settings
```json
{
  "jira": {
    "username": process.env.JIRA_USERNAME,
    "pat": process.env.JIRA_PAT,
    "domain": process.env.JIRA_DOMAIN,
    "boardId": 5466,
    "projectKey": "NAS"
  }
}
```

### Azure DevOps Settings
```json
{
  "azure": {
    "orgUrl": process.env.AZURE_ORG_URL,
    "pat": process.env.AZURE_PAT,
    "project": process.env.AZURE_PROJECT,
    "qaEnvName": "QA",
    "pipelineNames": [
      "GitHub-Sage-Network-App-CD",
      "GitHub-Sage-Network-App-CI"
    ]
  }
}
```

### Teams Integration
```json
{
  "teams": {
    "enabled": true,
    "webhookUrl": process.env.TEAMS_WEBHOOK_URL
  }
}
```

## Report Generation

### Available Scripts
- `generate-nas-reports.js` - Comprehensive secure reporting system
- Generates HTML reports with Sage Connect theme
- Creates markdown documentation
- No hardcoded credentials

### Usage
```bash
cd /path/to/next-release-ai
node scripts/generate-nas-reports.js
```

### Output
Reports are generated in `output/nas-team/` directory:
- `nas-comprehensive-report-secure-YYYY-MM-DD.html`
- `nas-sprint-summary-YYYY-MM-DD.md`

## Security Features
- ✅ No hardcoded tokens or credentials
- ✅ Environment variable-based configuration
- ✅ GitHub secret scanning compliant
- ✅ Professional Sage Connect theme
- ✅ Clean, secure codebase

## Sage Connect Theme
Professional styling includes:
- **Primary Blue**: #4299E1
- **Secondary Blue**: #2B77CB  
- **Typography**: Inter/Segoe UI fonts
- **Layout**: Responsive 80rem containers
- **Interactions**: Collapsible sections with smooth animations

## Troubleshooting

### Common Issues
1. **Missing Environment Variables**: Ensure all required variables are set
2. **API Connection Errors**: Verify token permissions and validity
3. **Missing Data**: Check JIRA board configuration and project access
4. **Theme Issues**: Ensure CSS variables are properly defined

### Support
For assistance with configuration or customization:
- Refer to team documentation in `docs/` directory
- Check setup guides in `docs/setup/`
- Contact the development team for advanced configurations

---
*Last Updated: 2025-08-26*
*Security Status: ✅ Compliant*
