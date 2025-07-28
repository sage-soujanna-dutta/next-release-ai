#!/usr/bin/env tsx

/**
 * Teams native formatting with proper bullets and numbering
 * Uses Teams-specific formatting that actually renders correctly
 */

import { MCPToolFactory } from './src/core/MCPToolFactory';

async function sendTeamsNativeFormatNotification() {
  const factory = new MCPToolFactory();
  const teamsNotificationTool = factory.getTool('send_teams_notification');

  if (!teamsNotificationTool) {
    throw new Error('Teams notification tool not found');
  }

  try {
    // Teams native format message with proper bullets and lists
    const mainMessage = `# 🎯 SPRINT SCNT-2025-20 - COMPREHENSIVE REVIEW

## 🏆 EXCEPTIONAL PERFORMANCE ACHIEVED

### 📊 KEY METRICS
- 🎯 **Completion Rate**: 94.7% (107/113 issues) ✅
- ⚡ **Velocity**: 159 Story Points Delivered 🚀
- ⏱️ **Average Resolution**: 8.5 Days ⭐
- 🏆 **Overall Grade**: A+ Performance 🥇

### 📋 WORK BREAKDOWN
- 📚 **User Stories**: 68 items (60%) - Feature delivery
- 🐛 **Bug Fixes**: 25 items (22%) - Quality maintenance
- ⚙️ **Technical Tasks**: 15 items (13%) - Operations
- 🎯 **Epic Items**: 3 items (3%) - Strategic initiatives
- 🔧 **Process Improvements**: 2 items (2%) - Enhancement

### ⚡ PRIORITY DISTRIBUTION
- 🔴 **Critical**: 8 items → All Resolved ✅
- 🟠 **High**: 38 items → Successfully Delivered ✅
- 🟡 **Medium**: 45 items → Balanced Workload ✅
- 🟢 **Low**: 20 items → Efficient Handling ✅
- 🚫 **Blockers**: 2 items → Quickly Cleared ✅

### 💡 STRATEGIC HIGHLIGHTS
- ✨ Outstanding 94.7% completion exceeds industry standards
- 🤝 Excellent team collaboration with 12+ contributors
- 🛡️ Quality-first approach with minimal blockers
- 📈 Strong velocity of 159 story points maintained

### 🚀 IMMEDIATE ACTIONS (This Week)
1. 📅 **Sprint Retrospective** - Schedule within 48 hours
2. 🔍 **Incomplete Items Review** - Analyze 6 remaining items
3. ✅ **Production Validation** - Verify deployment status
4. 📝 **Documentation Update** - Record lessons learned

### ⚡ MEDIUM PRIORITY (Next Sprint)
1. 🔧 **Automated Testing** - Implement enhancements
2. 📊 **Process Refinement** - Improve estimation process
3. 👀 **Code Review Enhancement** - Strengthen procedures
4. 📋 **Definition of Done** - Establish clearer criteria

### 🎉 RECOGNITION
**Congratulations to the entire development team!**

This sprint demonstrates:
- 🎯 Excellence in planning and execution
- 🤝 Strong team collaboration (12+ contributors)
- 🛡️ Quality-focused development approach
- 📈 Proactive risk management

### 📄 DOCUMENTATION STATUS
- ✅ Confluence page published with comprehensive analysis
- ✅ Professional HTML report generated
- ✅ Strategic recommendations documented
- ✅ Performance benchmarks established`;

    await teamsNotificationTool.execute({
      message: mainMessage,
      title: "🎯 Sprint SCNT-2025-20 - Executive Summary",
      isImportant: true,
      includeMetadata: true
    });

    // Follow-up with stakeholder guidance using proper formatting
    const stakeholderMessage = `# 👥 STAKEHOLDER ACCESS GUIDE

## 📊 ROLE-BASED NAVIGATION

### 👔 FOR EXECUTIVES
**Key Focus Areas:**
- 📈 94.7% completion rate and A+ performance grade
- 💼 ROI demonstration and team recognition opportunity
- 🎯 Strategic recommendations and quarterly roadmap review

**Quick Actions:**
- View executive dashboard in Confluence
- Consider team recognition initiatives
- Review strategic recommendations

### 📋 FOR PROJECT MANAGERS
**Performance Data:**
- ⚡ 159 story points velocity achieved
- ⏱️ 8.5 day average resolution time
- 👥 12+ contributors working effectively

**Planning Insights:**
- Capacity planning optimization opportunities
- Resource allocation recommendations  
- Sprint estimation improvements

**Next Actions:**
- Update sprint capacity estimates
- Optimize team allocation plans
- Review resource utilization metrics

### 💻 FOR TECHNICAL LEADERS
**Technical Status:**
- 🔧 Code quality metrics exceed standards
- 🏗️ 4 build pipelines running healthy
- 🔐 Security enhancements implemented

**System Impact:**
- Technical debt management improvements
- Security vulnerability resolutions
- Performance optimization opportunities

**Required Reviews:**
- Production deployment validation
- System performance monitoring
- Code quality standards assessment

## 🚀 NEXT STEPS

### ⚡ THIS WEEK PRIORITIES
1. **Sprint Retrospective**
   - Schedule within 48 hours
   - Full team participation required
   - Focus on process improvements

2. **Incomplete Items Review**
   - Product Owner led session
   - 6 items need prioritization
   - Next sprint planning input

3. **Production Validation**
   - DevOps team verification
   - Deployment status confirmation
   - Performance metrics review

4. **Documentation Update**
   - Lessons learned capture
   - Best practices documentation
   - Process improvement notes

### 📅 NEXT SPRINT PREPARATION
1. **Capacity Planning** - Use 159 SP baseline
2. **Backlog Refinement** - Include pending items
3. **Process Implementation** - Apply retrospective insights
4. **Team Recognition** - Celebrate achievements

## 📞 SUPPORT CONTACTS

### 🔧 Technical Support
- **Contact**: Development Team Leads
- **Response Time**: Less than 2 hours
- **Best For**: Code issues, technical questions

### 📊 Metrics & Planning
- **Contact**: Scrum Master
- **Response Time**: Less than 4 hours  
- **Best For**: Sprint metrics, process questions

### 🎯 Strategic Planning
- **Contact**: Product Owner
- **Response Time**: Less than 1 day
- **Best For**: Roadmap, prioritization, scope

### 📄 Documentation Access
- **Contact**: DevOps Team
- **Response Time**: Immediate
- **Best For**: Report access, technical documentation

## 🎊 CELEBRATION SUGGESTION
This exceptional performance deserves recognition:
- Team celebration lunch or event
- Individual contributor acknowledgments
- Success story documentation
- Best practices sharing with other teams`;

    await teamsNotificationTool.execute({
      message: stakeholderMessage,
      title: "👥 Stakeholder Guide & Next Steps",
      isImportant: false,
      includeMetadata: false
    });

    console.log('✅ Teams native format notifications sent!');
    console.log('📋 Using proper Markdown headers and lists');
    console.log('🔢 Numbered lists should display correctly');
    console.log('• Bullet points should render properly');
    console.log('📊 Clear section organization maintained');

  } catch (error) {
    console.error('❌ Error sending Teams native format notification:', error);
    throw error;
  }
}

// Execute the native format notification
sendTeamsNativeFormatNotification()
  .then(() => {
    console.log('\n🎉 Teams native format notification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Teams notification failed:', error);
    process.exit(1);
  });
