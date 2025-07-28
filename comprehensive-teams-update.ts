#!/usr/bin/env tsx

// Comprehensive Teams Integration for Release Notes
import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function sendComprehensiveTeamsUpdate() {
  console.log("📢 Sending Comprehensive Teams Update...");
  
  const factory = new MCPToolFactory({
    enabledCategories: ['integration']
  });

  const teamsNotificationTool = factory.getTool('send_teams_notification');
  if (teamsNotificationTool) {
    
    // Send executive summary
    console.log("📊 Sending Executive Summary...");
    const executiveSummary = `🎯 **EXECUTIVE SUMMARY - Sprint SCNT-2025-20**

**🏆 EXCEPTIONAL PERFORMANCE ACHIEVED**

**Key Metrics:**
• **Success Rate:** 95% (107/113 issues completed)
• **Quality:** 4 build pipelines healthy ✅
• **Velocity:** 71 commits with full traceability
• **Team Size:** 12+ contributors

**Business Impact:**
• 🐛 **System Stability:** 23 bugs resolved
• 📈 **User Experience:** 31 stories delivered  
• 🔧 **Operational Excellence:** 48 tasks completed
• ⚡ **Critical Issues:** 2 blockers cleared

**Risk Assessment:** ✅ **LOW RISK** - All critical items resolved

**Recommendation:** Excellent execution warrants recognition and process replication across teams.`;

    await teamsNotificationTool.execute({
      message: executiveSummary,
      title: "🎯 Executive Summary - SCNT-2025-20",
      isImportant: true,
      includeMetadata: true
    });

    // Send technical summary  
    console.log("💻 Sending Technical Summary...");
    const technicalSummary = `⚙️ **TECHNICAL DELIVERY - Sprint SCNT-2025-20**

**Development Metrics:**
• **Commits:** 71 code changes with GitHub integration
• **Top Contributors:** 
  - Vikash Chauhan (13 commits)
  - Rajesh Kumar (8 commits)
  - Arun Ghante (6 commits)

**Build Pipeline Health:**
• **4 Pipelines Active:** All showing green status
• **Deployment Ready:** Quality gates passed
• **Code Quality:** Automated testing validated

**Technical Achievements:**
• 🔐 Security fixes implemented (SCNT-4481)
• 🎨 UI/UX improvements delivered
• 🔧 Infrastructure optimizations
• 📱 Mobile responsiveness enhanced

**Documentation:** Comprehensive HTML report generated with full traceability.`;

    await teamsNotificationTool.execute({
      message: technicalSummary,
      title: "⚙️ Technical Delivery - SCNT-2025-20", 
      isImportant: false,
      includeMetadata: true
    });

    // Send stakeholder action items
    console.log("📋 Sending Stakeholder Action Items...");
    const actionItems = `📋 **STAKEHOLDER ACTION ITEMS - SCNT-2025-20**

**For Project Managers:**
• ✅ Review comprehensive HTML report
• ✅ Validate 95% completion rate
• ✅ Plan next sprint capacity based on velocity

**For Technical Leaders:**
• ✅ Review build pipeline health metrics
• ✅ Assess code quality from 71 commits
• ✅ Validate security fix implementations

**For Product Owners:**
• ✅ Confirm 31 user stories meet acceptance criteria
• ✅ Review customer impact of 23 bug fixes  
• ✅ Plan feature prioritization for next sprint

**For Executives:**
• ✅ Note exceptional 95% delivery rate
• ✅ Consider team recognition for performance
• ✅ Review risk mitigation effectiveness

**Next Steps:**
1. Sprint retrospective scheduled
2. Stakeholder demo preparation
3. Production deployment planning`;

    await teamsNotificationTool.execute({
      message: actionItems,
      title: "📋 Action Items - SCNT-2025-20",
      isImportant: true,
      includeMetadata: false
    });

    console.log("✅ All Teams notifications sent successfully!");
    console.log("📱 Executive, Technical, and Action Item summaries delivered");
    console.log("🎯 Stakeholders now have comprehensive sprint visibility");

  } else {
    console.log("❌ Teams integration not available");
    console.log("💡 Configure TEAMS_WEBHOOK_URL in .env file");
  }
}

sendComprehensiveTeamsUpdate().catch(console.error);
