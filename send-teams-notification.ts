#!/usr/bin/env tsx

// Send Release Notes to Teams Channel
import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function sendReleaseNotesToTeams() {
  console.log("📢 Sending Release Notes to Teams Channel...");
  
  const factory = new MCPToolFactory({
    enabledCategories: ['integration']
  });

  const teamsNotificationTool = factory.getTool('send_teams_notification');
  if (teamsNotificationTool) {
    try {
      const message = `🎯 **SPRINT SCNT-2025-20 - RELEASE NOTES COMPLETE**

**📊 KEY SPRINT ACHIEVEMENTS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ **Completion Rate:** 95% (107/113 issues)
⚡ **Code Changes:** 71 Git commits with full traceability  
🏗️ **Build Status:** 4 automated pipelines healthy
👥 **Team Contributors:** 12+ developers collaborating

**📈 DELIVERY BREAKDOWN:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐛 **Bug Fixes:** 23 resolved → System stability improved
📚 **User Stories:** 31 delivered → Enhanced user experience  
🔧 **Technical Tasks:** 48 completed → Multi-area coverage
💻 **Development Velocity:** Strong performance maintained

**🎯 TECHNICAL DELIVERY STATUS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ **Build Pipelines:** All 4 systems healthy ✅
📝 **Code Quality:** 71 commits with full review ✅
🤝 **Team Performance:** Excellent collaboration ✅  
⚠️ **Risk Management:** 2 critical issues resolved ✅

**📋 COMPREHENSIVE DOCUMENTATION:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **Issue Tracking:** JIRA integration complete
🔗 **Commit History:** GitHub links and traceability
🏗️ **Pipeline Status:** Deployment readiness verified
📈 **Analytics:** Team performance metrics included
🤖 **AI Analysis:** Sprint insights and recommendations

**📁 Report Available:**
\`output/release-notes-SCNT-2025-20-2025-07-27-13-41-03.html\`

🎉 **Outstanding sprint execution with professional documentation ready for stakeholder review!**

📅 **Generated:** ${new Date().toLocaleString()}
🤖 **Powered by:** Release MCP Server Automation`;

      const result = await teamsNotificationTool.execute({
        message,
        title: "🎯 Sprint SCNT-2025-20 Release Notes Complete",
        isImportant: true,
        includeMetadata: true,
        includeSummary: true
      });
      
      if (result.isError) {
        console.log("❌ Teams notification failed:", result.content);
      } else {
        console.log("✅ Teams notification sent successfully!");
        console.log("📱 Message delivered to Teams channel");
        console.log("🔗 Team members can now access the comprehensive release notes");
        
        // Also send a follow-up with direct links
        const followUpMessage = `📎 **QUICK ACCESS LINKS - SCNT-2025-20**

**🌐 DOCUMENTATION ACCESS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **HTML Report:** Interactive sprint analysis  
📚 **Documentation:** STAKEHOLDER_RELEASE_NOTES_DOCUMENTATION.md
🏗️ **GitHub Repository:** https://github.com/sage-soujanna-dutta/next-release-ai

**💡 FOR STAKEHOLDERS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👔 **Executives:** Key metrics and ROI demonstration
📋 **Project Managers:** Resource optimization insights  
💻 **Technical Leaders:** Code quality and pipeline status
📈 **Analytics Teams:** Performance metrics and trends

**🎯 NEXT STEPS:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 **Sprint Retrospective:** Schedule within 48 hours
🔍 **Risk Assessment:** Review critical items  
✅ **Deployment Verification:** Confirm production status
📝 **Process Documentation:** Capture lessons learned

📞 **Need Details?** Contact the development team for access to the full interactive report and strategic recommendations.`;

        const followUpResult = await teamsNotificationTool.execute({
          message: followUpMessage,
          title: "📎 SCNT-2025-20 Resource Links",
          isImportant: false,
          includeMetadata: false
        });
        
        if (!followUpResult.isError) {
          console.log("✅ Follow-up links sent to Teams");
        }
      }
    } catch (error) {
      console.log("❌ Teams notification error:", error.message);
    }
  } else {
    console.log("❌ Teams notification tool not available");
    console.log("💡 Make sure TEAMS_WEBHOOK_URL is configured in .env file");
  }
}

sendReleaseNotesToTeams().catch(console.error);
