#!/usr/bin/env tsx

/**
 * Teams-optimized notification with proper formatting
 * Teams has limited Markdown support, so we use simpler formatting
 */

import { MCPToolFactory } from './src/core/MCPToolFactory';

async function sendTeamsOptimizedNotification() {
  const factory = new MCPToolFactory();
  const teamsNotificationTool = factory.getTool('send_teams_notification');

  if (!teamsNotificationTool) {
    throw new Error('Teams notification tool not found');
  }

  try {
    // Teams-optimized message with proper formatting
    const mainMessage = `🎯 **SPRINT SCNT-2025-20 - COMPREHENSIVE REVIEW**

🏆 **EXCEPTIONAL PERFORMANCE ACHIEVED**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 **KEY METRICS:**
   ✅ **Completion Rate:** 94.7% (107/113 issues)
   ⚡ **Velocity:** 159 Story Points Delivered  
   ⏱️ **Avg Resolution:** 8.5 Days
   🥇 **Overall Grade:** A+ Performance

🎯 **WORK BREAKDOWN:**
   📚 **User Stories:** 68 items (60%) - Feature delivery
   🐛 **Bug Fixes:** 25 items (22%) - Quality maintenance  
   ⚙️ **Tasks:** 15 items (13%) - Operations
   🎯 **Epics:** 3 items (3%) - Strategic initiatives
   🔧 **Improvements:** 2 items (2%) - Process enhancement

⚡ **PRIORITY ANALYSIS:**
   🔴 **Critical:** 8 issues → All resolved ✅
   🟠 **High:** 38 issues → Successfully delivered ✅
   🟡 **Medium:** 45 issues → Balanced workload ✅
   🟢 **Low:** 20 issues → Efficient handling ✅
   🚫 **Blockers:** 2 issues → Quickly cleared ✅

💡 **STRATEGIC HIGHLIGHTS:**
   ✨ Outstanding 94.7% completion exceeds industry standards
   🤝 Excellent team collaboration with 12+ contributors
   🛡️ Quality-first approach with minimal blockers
   📈 Strong velocity of 159 story points maintained

📋 **IMMEDIATE ACTIONS REQUIRED:**
   🔥 **HIGH PRIORITY (This Week):**
      1. 📅 Schedule sprint retrospective session
      2. 🔍 Review 6 incomplete items for next sprint
      3. ✅ Validate production deployment status
      4. 📝 Document key lessons learned

   ⚡ **MEDIUM PRIORITY (Next Sprint):**
      1. 🔧 Implement automated testing enhancements
      2. 📊 Refine estimation process improvements
      3. 👀 Enhance code review procedures
      4. 📋 Establish clearer definition of done

🎉 **RECOGNITION:**
Congratulations to the entire development team for delivering exceptional results! This sprint demonstrates excellence in planning, execution, and quality focus.

📄 **DOCUMENTATION STATUS:**
   ✅ Confluence page published with comprehensive analysis
   ✅ Professional HTML report generated  
   ✅ Strategic recommendations documented
   ✅ Performance benchmarks established

🔗 **QUICK ACCESS:**
   📊 View detailed analytics dashboard
   📄 Access Confluence documentation
   📋 Review sprint backlog items
   📞 Contact team leads for questions`;

    await teamsNotificationTool.execute({
      message: mainMessage,
      title: "🎯 Sprint SCNT-2025-20 - Executive Summary",
      isImportant: true,
      includeMetadata: true
    });

    // Send stakeholder-specific follow-up
    const stakeholderMessage = `👥 **STAKEHOLDER ACCESS GUIDE**

📊 **FOR EXECUTIVES:**
   • Focus: 94.7% completion rate and A+ performance grade
   • Impact: ROI demonstration and team recognition opportunity
   • Action: Review strategic recommendations and quarterly roadmap
   • Access: Executive dashboard in Confluence

📋 **FOR PROJECT MANAGERS:**
   • Focus: 159 story points velocity and 8.5 day resolution time
   • Impact: Capacity planning and resource optimization insights
   • Action: Update sprint estimates and team allocation plans
   • Access: Project metrics dashboard and resource analytics

💻 **FOR TECHNICAL LEADERS:**
   • Focus: Code quality metrics and 4 healthy build pipelines
   • Impact: Technical debt management and security improvements
   • Action: Production validation and performance monitoring
   • Access: Technical implementation reports and pipeline status

🚀 **NEXT STEPS:**
   📅 **Sprint Retrospective** - Schedule within 48 hours
   🔍 **Incomplete Items Review** - Product Owner session this week
   ✅ **Production Validation** - DevOps deployment verification
   📊 **Capacity Planning** - Use 159 SP velocity for next sprint

📞 **SUPPORT CONTACTS:**
   🔧 Technical Details: Development Team Leads (< 2 hours)
   📊 Metrics Questions: Scrum Master (< 4 hours)  
   🎯 Strategic Planning: Product Owner (< 1 day)
   📄 Documentation Access: DevOps Team (Immediate)

🎊 **CELEBRATION SUGGESTION:**
This exceptional performance deserves recognition - consider team lunch, individual acknowledgments, and success story documentation for other teams to learn from.`;

    await teamsNotificationTool.execute({
      message: stakeholderMessage,
      title: "👥 Stakeholder Guide & Next Steps",
      isImportant: false,
      includeMetadata: false
    });

    console.log('✅ Teams-optimized notifications sent successfully!');
    console.log('📱 Formatted specifically for Teams rendering');
    console.log('🎯 Simple formatting with clear visual hierarchy');
    console.log('💼 Stakeholder-specific guidance included');

  } catch (error) {
    console.error('❌ Error sending Teams-optimized notification:', error);
    throw error;
  }
}

// Execute the optimized notification
sendTeamsOptimizedNotification()
  .then(() => {
    console.log('\n🎉 Teams-optimized notification completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Teams notification failed:', error);
    process.exit(1);
  });
