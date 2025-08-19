# 🚀 Release Workflow Quick Start Guide

## Available Commands

### 📋 **Basic Analysis Commands**
```bash
# Analyze story points for recent sprints
npm run story-points

# Generate velocity report
npm run velocity  

# Generate sprint summary report
npm run sprint-summary
```

### 🎯 **Release Workflow Commands**

#### **Demo Workflow** (Works with current configuration)
```bash
# Run demo workflow for SCNT-2025-20
npm run demo-workflow

# Run demo workflow for different sprint
npm run demo-workflow SCNT-2025-21
```

#### **Full Release Workflow** (Requires complete configuration)
```bash
# Run complete release workflow
npm run release-workflow SCNT-2025-20

# Run with different sprint
npm run release-workflow SCNT-2025-21
```

## 🔧 Configuration Status

### ✅ **Currently Configured**
- **JIRA**: Domain, email, token configured
- **Sprint Analysis**: Full JIRA integration working
- **Story Points Analysis**: Operational
- **Velocity Reporting**: Operational

### ⚙️ **Additional Configuration Needed for Full Workflow**
- **GitHub**: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
- **Confluence**: `CONFLUENCE_BASE_URL`, `CONFLUENCE_EMAIL`, `CONFLUENCE_API_TOKEN`  
- **Teams**: `TEAMS_WEBHOOK_URL`

## 📊 Current Sprint SCNT-2025-20 Status

Based on the demo workflow execution:

- **📈 Completion Rate**: 95% (107/113 issues completed)
- **🎯 Issue Breakdown**: 
  - Stories: 31 issues
  - Tasks: 48 issues  
  - Bugs: 23 issues
  - Sub-tasks: 11 issues
- **⚠️ Risk Assessment**: 2 high-priority issues require monitoring
- **✅ Overall Status**: Excellent sprint execution, ready for release

## 🎯 Workflow Features

### **Demo Workflow Includes:**
1. ✅ Configuration validation
2. ✅ Real JIRA data analysis
3. ✅ Sprint completion metrics
4. ✅ Issue type breakdown
5. ✅ Risk assessment
6. ✅ Release notes preview
7. ✅ Readiness checks

### **Full Workflow Adds:**
1. 📝 Complete release notes generation
2. 📤 Confluence publication
3. 📢 Teams notifications
4. 📊 Post-release reporting
5. 🔍 Advanced risk assessment
6. 💾 Automated backups

## 🚀 Quick Commands Reference

```bash
# Most commonly used commands
npm run demo-workflow SCNT-2025-20    # Demo the release process
npm run story-points                   # Analyze story points
npm run velocity                       # Generate velocity report  
npm run sprint-summary                 # Current sprint summary

# MCP Server (for VS Code Copilot integration)
npm run mcp-server                     # Start MCP server

# Development
npm run dev                           # Development mode with watch
npm start                             # Start the application
```

## 📋 Next Steps

1. **Test Demo Workflow**: Run `npm run demo-workflow SCNT-2025-20`
2. **Review Results**: Check sprint analysis and risk assessment
3. **Configure Services**: Add GitHub, Confluence, Teams configuration
4. **Run Full Workflow**: Execute complete release process
5. **Customize**: Adapt workflow steps to team needs

---

**Ready to release Sprint SCNT-2025-20!** 🎉

The sprint shows excellent completion metrics (95%) with only minor risk factors to monitor. All analysis tools are operational and ready for production use.
