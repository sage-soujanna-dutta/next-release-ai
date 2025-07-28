#!/usr/bin/env tsx

/**
 * Teams MessageCard with Facts and Sections for proper display
 * Uses Teams native card structure instead of Markdown for guaranteed rendering
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function sendTeamsStructuredCard() {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('TEAMS_WEBHOOK_URL not configured');
  }

  try {
    // Main card with structured sections and facts
    const mainCard = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: "🎯 Sprint SCNT-2025-20 - Comprehensive Review",
      themeColor: "28A745",
      title: "🎯 **SPRINT SCNT-2025-20 - COMPREHENSIVE REVIEW**",
      text: "**🏆 EXCEPTIONAL PERFORMANCE ACHIEVED - A+ GRADE SPRINT**",
      
      sections: [
        {
          activityTitle: "📊 **KEY PERFORMANCE METRICS**",
          activitySubtitle: "Outstanding results across all sprint objectives",
          facts: [
            { name: "🎯 **Completion Rate**", value: "**94.7%** (107/113 issues) ✅" },
            { name: "⚡ **Velocity Delivered**", value: "**159 Story Points** 🚀" },
            { name: "⏱️ **Average Resolution**", value: "**8.5 Days** ⭐" },
            { name: "🏆 **Overall Grade**", value: "**A+ Performance** 🥇" }
          ]
        },
        
        {
          activityTitle: "📋 **WORK BREAKDOWN ANALYSIS**",
          activitySubtitle: "Comprehensive delivery across all work categories",
          facts: [
            { name: "📚 **User Stories**", value: "68 items (60%) - Feature delivery" },
            { name: "🐛 **Bug Fixes**", value: "25 items (22%) - Quality maintenance" },
            { name: "⚙️ **Technical Tasks**", value: "15 items (13%) - Operations" },
            { name: "🎯 **Epic Items**", value: "3 items (3%) - Strategic initiatives" },
            { name: "🔧 **Improvements**", value: "2 items (2%) - Process enhancement" }
          ]
        },

        {
          activityTitle: "⚡ **PRIORITY DISTRIBUTION**",
          activitySubtitle: "Excellent priority management and resolution",
          facts: [
            { name: "🔴 **Critical Issues**", value: "8 items → **All Resolved** ✅" },
            { name: "🟠 **High Priority**", value: "38 items → **Successfully Delivered** ✅" },
            { name: "🟡 **Medium Priority**", value: "45 items → **Balanced Workload** ✅" },
            { name: "🟢 **Low Priority**", value: "20 items → **Efficient Handling** ✅" },
            { name: "🚫 **Blockers**", value: "2 items → **Quickly Cleared** ✅" }
          ]
        },

        {
          activityTitle: "💡 **STRATEGIC HIGHLIGHTS**",
          activitySubtitle: "Key achievements and team performance insights",
          text: "**Outstanding Performance Indicators:**\n\n" +
                "✨ **94.7% completion rate** exceeds industry standards\n\n" +
                "🤝 **Excellent team collaboration** with 12+ contributors\n\n" +
                "🛡️ **Quality-first approach** with minimal blockers\n\n" +
                "📈 **Strong velocity** of 159 story points maintained"
        },

        {
          activityTitle: "🚀 **IMMEDIATE ACTION ITEMS**",
          activitySubtitle: "High priority tasks requiring attention this week",
          text: "**This Week Priorities:**\n\n" +
                "**1.** 📅 **Sprint Retrospective** - Schedule within 48 hours (Scrum Master)\n\n" +
                "**2.** 🔍 **Incomplete Items Review** - Analyze 6 remaining items (Product Owner)\n\n" +
                "**3.** ✅ **Production Validation** - Verify deployment status (DevOps Team)\n\n" +
                "**4.** 📝 **Documentation Update** - Record lessons learned (Team Leads)\n\n" +
                "**Next Sprint Preparation:**\n\n" +
                "**1.** 🔧 **Automated Testing** - Implement enhancements\n\n" +
                "**2.** 📊 **Process Refinement** - Improve estimation process\n\n" +
                "**3.** 👀 **Code Review Enhancement** - Strengthen procedures\n\n" +
                "**4.** 📋 **Definition of Done** - Establish clearer criteria"
        },

        {
          activityTitle: "🎉 **RECOGNITION & SUCCESS**",
          activitySubtitle: "Outstanding team achievement deserving celebration",
          text: "**🌟 Congratulations to the entire development team!**\n\n" +
                "This sprint demonstrates:\n\n" +
                "🎯 **Excellence in planning and execution**\n\n" +
                "🤝 **Strong team collaboration** (12+ contributors)\n\n" +
                "🛡️ **Quality-focused development approach**\n\n" +
                "📈 **Proactive risk management**\n\n" +
                "**Suggested Recognition:**\n\n" +
                "🎊 Team celebration lunch or event\n\n" +
                "🏆 Individual contributor acknowledgments\n\n" +
                "📖 Success story documentation\n\n" +
                "🤝 Best practices sharing with other teams"
        }
      ],

      potentialAction: [
        {
          "@type": "OpenUri",
          name: "📄 View Full Confluence Report",
          targets: [{ os: "default", uri: "https://confluence.company.com/sprint-scnt-2025-20" }]
        },
        {
          "@type": "OpenUri",
          name: "📊 Open Analytics Dashboard",
          targets: [{ os: "default", uri: "https://analytics.company.com/sprint-metrics" }]
        },
        {
          "@type": "OpenUri",
          name: "📋 Review Sprint Backlog",
          targets: [{ os: "default", uri: "https://jira.company.com/sprint-backlog" }]
        }
      ]
    };

    // Send main card
    await axios.post(webhookUrl, mainCard, {
      headers: { "Content-Type": "application/json" }
    });

    console.log('✅ Main sprint review card sent successfully!');

    // Stakeholder guidance card with structured facts
    const stakeholderCard = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: "👥 Stakeholder Access Guide & Next Steps",
      themeColor: "0078D4",
      title: "👥 **STAKEHOLDER ACCESS GUIDE**",
      text: "**Role-based navigation and next steps for different stakeholders**",
      
      sections: [
        {
          activityTitle: "👔 **FOR EXECUTIVES**",
          activitySubtitle: "Strategic insights and recognition opportunities",
          facts: [
            { name: "🎯 **Key Focus**", value: "94.7% completion rate and A+ performance grade" },
            { name: "💼 **Business Impact**", value: "ROI demonstration and team recognition opportunity" },
            { name: "📋 **Action Required**", value: "Review strategic recommendations and quarterly roadmap" },
            { name: "🔗 **Quick Access**", value: "Executive dashboard in Confluence" }
          ]
        },

        {
          activityTitle: "📋 **FOR PROJECT MANAGERS**",
          activitySubtitle: "Resource optimization and capacity planning insights",
          facts: [
            { name: "⚡ **Performance Data**", value: "159 story points velocity, 8.5 day resolution time" },
            { name: "📊 **Planning Insights**", value: "Capacity planning and resource optimization opportunities" },
            { name: "🎯 **Next Actions**", value: "Update sprint estimates and team allocation plans" },
            { name: "🔗 **Quick Access**", value: "Project metrics dashboard and resource analytics" }
          ]
        },

        {
          activityTitle: "💻 **FOR TECHNICAL LEADERS**",
          activitySubtitle: "Code quality metrics and system performance",
          facts: [
            { name: "🔧 **Technical Status**", value: "Code quality metrics and 4 healthy build pipelines" },
            { name: "🏗️ **System Impact**", value: "Technical debt management and security improvements" },
            { name: "✅ **Required Reviews**", value: "Production validation and performance monitoring" },
            { name: "🔗 **Quick Access**", value: "Technical implementation reports and pipeline status" }
          ]
        },

        {
          activityTitle: "📞 **SUPPORT CONTACTS**",
          activitySubtitle: "Quick access to team leads and technical support",
          facts: [
            { name: "🔧 **Technical Support**", value: "Development Team Leads (< 2 hours response)" },
            { name: "📊 **Metrics Questions**", value: "Scrum Master (< 4 hours response)" },
            { name: "🎯 **Strategic Planning**", value: "Product Owner (< 1 day response)" },
            { name: "📄 **Documentation Access**", value: "DevOps Team (Immediate response)" }
          ]
        },

        {
          activityTitle: "🚀 **NEXT STEPS SUMMARY**",
          activitySubtitle: "Key actions and timeline for sprint follow-up",
          text: "**This Week Actions:**\n\n" +
                "📅 **Sprint Retrospective** - Schedule within 48 hours\n\n" +
                "🔍 **Incomplete Items Review** - Product Owner session\n\n" +
                "✅ **Production Validation** - DevOps deployment check\n\n" +
                "📝 **Documentation Update** - Capture lessons learned\n\n" +
                "**Next Sprint Preparation:**\n\n" +
                "📊 **Capacity Planning** - Use 159 SP velocity baseline\n\n" +
                "📋 **Backlog Refinement** - Include 6 pending items\n\n" +
                "🔧 **Process Implementation** - Apply retrospective insights\n\n" +
                "🎉 **Team Recognition** - Celebrate exceptional achievements"
        }
      ],

      potentialAction: [
        {
          "@type": "OpenUri",
          name: "📅 Schedule Team Meeting",
          targets: [{ os: "default", uri: "https://outlook.office.com/calendar" }]
        },
        {
          "@type": "OpenUri",
          name: "💬 Contact Team Leads",
          targets: [{ os: "default", uri: "https://teams.microsoft.com/l/chat" }]
        }
      ]
    };

    // Send stakeholder card
    await axios.post(webhookUrl, stakeholderCard, {
      headers: { "Content-Type": "application/json" }
    });

    console.log('✅ Stakeholder guidance card sent successfully!');
    console.log('📊 Using MessageCard facts for guaranteed rendering');
    console.log('🔢 Numbered lists in text sections with proper formatting');
    console.log('• Facts display in structured format');
    console.log('📋 No dependency on Markdown rendering');

  } catch (error) {
    console.error('❌ Error sending Teams structured card:', error);
    throw error;
  }
}

// Execute the structured card notification
sendTeamsStructuredCard()
  .then(() => {
    console.log('\n🎉 Teams structured card notification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Teams card notification failed:', error);
    process.exit(1);
  });
