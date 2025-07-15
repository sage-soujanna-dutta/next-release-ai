# 🤖 GitHub Actions Automation Guide

## Overview

Your Release Notes MCP Server project now includes comprehensive GitHub Actions automation with multiple workflows for different scenarios. This guide explains how to set up, configure, and use the automation effectively.

## 📁 Workflow Files

### 1. **Continuous Integration** (`ci.yml`)
- **Triggers**: Push to main/develop, Pull Requests
- **Purpose**: Validates code quality, builds project, runs tests
- **Matrix Testing**: Tests on Node.js 18 and 20

### 2. **Release Notes Generation** (`release-notes.yml`) ✨ *Main Workflow*
- **Triggers**: 
  - Scheduled: Every Friday at 5 PM UTC
  - Manual: With configurable parameters
- **Purpose**: Generates and publishes release notes automatically

### 3. **Deployment** (`deploy.yml`)
- **Triggers**: Version tags (v*.*.*), Manual deployment
- **Purpose**: Creates releases, packages artifacts

### 4. **Security & Dependencies** (`security.yml`)
- **Triggers**: Daily at 2 AM UTC, Push to main, PRs
- **Purpose**: Security audits, dependency updates, code quality checks

### 5. **Environment Management** (`environment.yml`)
- **Triggers**: Manual workflow dispatch
- **Purpose**: Deploy to different environments, test connections, validate secrets

## 🔧 Setup Instructions

### Step 1: Configure Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

#### Required Secrets:
```
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_TOKEN=your_jira_api_token
JIRA_BOARD_ID=123
GITHUB_TOKEN=ghp_your_github_token (usually auto-provided)
```

#### Optional Secrets:
```
DEFAULT_SPRINT_NUMBER=current
CONFLUENCE_USERNAME=your-email@company.com
CONFLUENCE_PAT=your_confluence_personal_access_token
CONFLUENCE_SPACE=SPACE_KEY
JIRA_CONFLUENCE_DOMAIN=your-domain.atlassian.net
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url
```

### Step 2: Enable GitHub Actions

1. Go to your repository → Actions tab
2. Enable Actions if not already enabled
3. All workflows will be available automatically

### Step 3: Set Up Environments (Optional)

Create GitHub environments for better control:

1. Go to Settings → Environments
2. Create environments: `development`, `staging`, `production`
3. Configure environment-specific secrets if needed

## 🚀 How to Use the Automation

### 1. **Automated Release Notes** (Main Feature)

#### Scheduled Generation:
- Runs automatically every Friday at 5 PM UTC
- Uses default sprint number and current date
- Publishes to both Confluence and files
- Sends Teams notification

#### Manual Generation:
1. Go to Actions → "Automated Release Notes"
2. Click "Run workflow"
3. Configure parameters:
   - **Sprint Number**: Specific sprint (optional)
   - **Date**: Custom date for commits (optional)
   - **Output**: Choose confluence, file, or both
   - **Teams Notification**: Enable/disable

### 2. **Environment Deployment**

Test your configuration on different environments:

1. Go to Actions → "Environment Management"
2. Select target environment
3. Choose action:
   - **deploy**: Deploy and test release notes generation
   - **test-connection**: Verify API connections
   - **validate-secrets**: Check if all secrets are configured

### 3. **Manual Releases**

Create tagged releases:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers:
- Automated build and packaging
- GitHub release creation
- Artifact upload

### 4. **Security Monitoring**

The security workflow automatically:
- Runs daily security audits
- Checks for outdated dependencies
- Creates PRs for dependency updates
- Monitors code quality

## 📊 Monitoring and Troubleshooting

### View Workflow Status

1. Go to Actions tab in your repository
2. Click on any workflow run to see details
3. Check individual job logs for troubleshooting

### Common Issues and Solutions

#### 1. **Authentication Errors**
- **Problem**: 401/403 errors from JIRA/GitHub/Confluence
- **Solution**: Check and refresh API tokens in repository secrets

#### 2. **Missing Secrets**
- **Problem**: Workflow fails with undefined environment variables
- **Solution**: Verify all required secrets are configured in repository settings

#### 3. **Sprint Not Found**
- **Problem**: JIRA sprint number doesn't exist
- **Solution**: Use the manual trigger with a valid sprint number

#### 4. **Build Failures**
- **Problem**: TypeScript compilation errors
- **Solution**: Fix TypeScript errors locally and push changes

### Debug Mode

Enable debug logging by adding this secret:
```
ACTIONS_STEP_DEBUG=true
```

## 🔄 Workflow Customization

### Modify Schedule

Edit `.github/workflows/release-notes.yml`:

```yaml
schedule:
  # Change to run every Monday at 9 AM UTC
  - cron: '0 9 * * 1'
```

### Add More Environments

Edit `.github/workflows/environment.yml` to add new environment options:

```yaml
options:
  - development
  - staging
  - production
  - your-new-environment
```

### Custom Notification Channels

Extend the Teams notification to support Slack or other services by:
1. Adding new secrets for webhook URLs
2. Modifying the notification step in workflows
3. Adding conditional logic for different notification types

## 📈 Advanced Features

### 1. **Dependency Updates**

The security workflow automatically:
- Scans for outdated packages daily
- Creates PRs with dependency updates
- Runs tests to ensure compatibility

### 2. **Multi-Node Testing**

CI workflow tests on multiple Node.js versions:
- Node.js 18 (LTS)
- Node.js 20 (Current)

### 3. **Artifact Management**

All workflows store artifacts:
- Release notes: 30 days retention
- Build artifacts: 90 days retention
- Environment deployments: 7 days retention

### 4. **Environment-Specific Configuration**

Use GitHub environments to:
- Set different secrets per environment
- Require approvals for production deployments
- Add environment-specific protection rules

## 🎯 Best Practices

### 1. **Secrets Management**
- Use environment-specific secrets when possible
- Rotate API tokens regularly
- Use least privilege principle for tokens

### 2. **Workflow Maintenance**
- Review generated dependency update PRs weekly
- Monitor workflow success rates
- Update Node.js versions in CI as needed

### 3. **Release Management**
- Use semantic versioning for tags
- Write descriptive commit messages
- Test releases in staging environment first

### 4. **Monitoring**
- Set up GitHub notifications for workflow failures
- Review artifact downloads periodically
- Monitor API rate limits for external services

## 🔗 Integration with VS Code

The MCP server integration with VS Code Copilot works alongside GitHub Actions:

1. **Local Development**: Use MCP server for interactive development
2. **Automated Production**: Use GitHub Actions for scheduled/automated releases
3. **Testing**: Use environment workflows to validate changes

## 📞 Support

If you encounter issues:

1. Check the workflow logs in the Actions tab
2. Verify all secrets are properly configured
3. Test API connections using the environment workflow
4. Review the troubleshooting section above

---

*This automation setup provides a complete CI/CD pipeline for your Release Notes MCP Server, ensuring reliable, automated release note generation with proper testing and deployment procedures.*
