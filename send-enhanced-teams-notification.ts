#!/usr/bin/env npx tsx

/**
 * Enhanced Teams notification with rich formatting
 * Demonstrates improved layout, visual hierarchy, and action-oriented design
 */

import { MCPToolFactory } from './src/core/MCPToolFactory';
import { TeamsRichFormatter, MetricCard, ActionItem, TableData } from './src/utils/TeamsRichFormatter';

async function sendEnhancedTeamsNotification() {
  const factory = new MCPToolFactory();
  const teamsNotificationTool = factory.getTool('send_teams_notification');

  if (!teamsNotificationTool) {
    throw new Error('Teams notification tool not found');
  }

  try {
    // Define key metrics with visual indicators
    const metrics: MetricCard[] = [
      {
        emoji: '🎯',
        label: 'Completion Rate',
        value: '94.7%',
        status: 'success',
        trend: 'up'
      },
      {
        emoji: '⚡',
        label: 'Velocity',
        value: '159 Story Points',
        status: 'success',
        trend: 'stable'
      },
      {
        emoji: '⏱️',
        label: 'Avg Resolution',
        value: '8.5 Days',
        status: 'success',
        trend: 'down'
      },
      {
        emoji: '🏆',
        label: 'Overall Grade',
        value: 'A+',
        status: 'success',
        trend: 'up'
      }
    ];

    // Issue breakdown table
    const issueBreakdownTable: TableData = {
      headers: ['📋 **Type**', '🔢 **Count**', '📊 **%**', '🎯 **Impact**'],
      rows: [
        ['📚 **Stories**', '**68**', '60%', '🚀 Feature Delivery'],
        ['🐛 **Bug Fixes**', '**25**', '22%', '🛡️ Quality Maintenance'],
        ['⚙️ **Tasks**', '**15**', '13%', '💼 Operations'],
        ['🎯 **Epics**', '**3**', '3%', '📊 Strategic'],
        ['🔧 **Improvements**', '**2**', '2%', '📈 Process']
      ],
      style: 'accent'
    };

    // Priority distribution table
    const priorityTable: TableData = {
      headers: ['🚨 **Priority**', '🔢 **Count**', '📊 **%**', '✅ **Status**'],
      rows: [
        ['🔴 **Critical**', '**8**', '7%', '✅ All Resolved'],
        ['🟠 **High**', '**38**', '34%', '✅ Delivered'],
        ['🟡 **Medium**', '**45**', '40%', '✅ Balanced'],
        ['🟢 **Low**', '**20**', '18%', '✅ Efficient'],
        ['🚫 **Blockers**', '**2**', '2%', '✅ Cleared']
      ],
      style: 'good'
    };

    // Action items with priorities
    const actionItems: ActionItem[] = [
      {
        emoji: '📅',
        title: 'Schedule Sprint Retrospective',
        description: 'Full team session to review process improvements and lessons learned',
        priority: 'high',
        deadline: 'This Week',
        assignee: 'Scrum Master'
      },
      {
        emoji: '🔍',
        title: 'Review Incomplete Items',
        description: 'Analyze 6 remaining issues for next sprint prioritization',
        priority: 'high',
        deadline: 'This Week',
        assignee: 'Product Owner'
      },
      {
        emoji: '🚀',
        title: 'Validate Production Deployment',
        description: 'Ensure all delivered features are functioning correctly in production',
        priority: 'high',
        deadline: 'Immediate',
        assignee: 'DevOps Team'
      },
      {
        emoji: '📈',
        title: 'Update Process Documentation',
        description: 'Document successful practices and improvement opportunities',
        priority: 'medium',
        deadline: 'Next Sprint',
        assignee: 'Team Leads'
      }
    ];

    // Create the rich notification
    const richMessage = TeamsRichFormatter.formatCompleteNotification({
      header: {
        title: '🎯 SPRINT SCNT-2025-20 - COMPREHENSIVE REVIEW',
        subtitle: 'Exceptional Performance Achieved',
        status: '✅ Published Successfully'
      },
      metrics,
      tables: [
        {
          title: '📋 **ISSUE BREAKDOWN ANALYSIS**',
          data: issueBreakdownTable
        },
        {
          title: '⚡ **PRIORITY DISTRIBUTION**',
          data: priorityTable
        }
      ],
      actions: actionItems,
      callToAction: {
        title: '🔗 **QUICK ACCESS LINKS**',
        actions: [
          { text: '📄 View Confluence Report', url: 'https://confluence.company.com/sprint-scnt-2025-20' },
          { text: '📊 Open Analytics Dashboard', url: 'https://analytics.company.com/sprint-metrics' },
          { text: '📋 Access Sprint Backlog', url: 'https://jira.company.com/sprint-backlog' },
          { text: '🎯 Schedule Team Meeting' }
        ]
      },
      footer: {
        generatedBy: 'Release MCP Server',
        timestamp: new Date(),
        version: 'v2.1.0'
      }
    });

    // Send the main rich notification
    await teamsNotificationTool.execute({
      message: TeamsRichFormatter.sanitizeForTeams(richMessage),
      title: '🎯 Sprint SCNT-2025-20 - Executive Dashboard',
      isImportant: true,
      includeMetadata: true
    });

    // Send a follow-up with stakeholder-specific quick access
    const stakeholderGuide = `# 👥 **STAKEHOLDER QUICK ACCESS GUIDE**

---

## 🎯 **ROLE-BASED NAVIGATION**

### 👔 **EXECUTIVES**
| **Focus** | **Key Insight** | **Action** |
|-----------|----------------|------------|
| 📊 **ROI** | 94.7% completion rate | ✅ **Acknowledge team success** |
| 🎯 **Strategy** | A+ performance grade | ✅ **Consider team recognition** |
| 📈 **Growth** | 159 story points delivered | ✅ **Review capacity planning** |

**🔗 Executive Summary:** [View Strategic Analysis](https://confluence.company.com/executive-summary)

---

### 📋 **PROJECT MANAGERS**
| **Area** | **Metric** | **Next Step** |
|----------|------------|---------------|
| 📅 **Planning** | 8.5 day avg resolution | ✅ **Update sprint estimates** |
| 👥 **Resources** | 12+ contributors active | ✅ **Optimize team allocation** |
| 🎯 **Scope** | 6 items for next sprint | ✅ **Prioritize backlog** |

**🔗 Project Dashboard:** [View Resource Analytics](https://analytics.company.com/project-metrics)

---

### 💻 **TECHNICAL LEADERS**
| **Domain** | **Status** | **Review Required** |
|------------|------------|-------------------|
| 🔐 **Security** | Critical fixes deployed | ✅ **Production validation** |
| 🏗️ **Architecture** | 4 healthy pipelines | ✅ **Monitor performance** |
| 📝 **Quality** | 71 commits reviewed | ✅ **Code standards check** |

**🔗 Technical Report:** [View Implementation Details](https://confluence.company.com/technical-analysis)

---

## 🚀 **IMMEDIATE ACTIONS REQUIRED**

### ⚡ **THIS WEEK**
1. **📅 Sprint Retrospective** → Schedule within 48 hours
2. **🔍 Incomplete Items Review** → Product Owner priority session
3. **✅ Production Validation** → DevOps deployment check

### 📋 **NEXT SPRINT PREP**
1. **📊 Capacity Planning** → Based on 159 SP velocity
2. **🎯 Backlog Refinement** → Include 6 pending items
3. **📈 Process Improvements** → Implement retrospective insights

---

## 🎉 **RECOGNITION & CELEBRATION**

> ### 🏆 **OUTSTANDING TEAM ACHIEVEMENT!**
> 
> **This sprint represents exceptional execution:**
> - 🎯 **94.7% completion** - Exceeds industry benchmarks
> - ⚡ **159 story points** - Outstanding team velocity  
> - 🛡️ **Quality focus** - Only 2 blockers, quickly resolved
> - 🤝 **Team collaboration** - 12+ contributors working effectively

**🎊 Suggested Recognition:**
- Team celebration lunch or event
- Individual contributor shout-outs  
- Success story documentation
- Best practices sharing session

---

## 📞 **SUPPORT & CONTACT**

| **Need** | **Contact** | **Response** |
|----------|-------------|-------------|
| 🔧 **Technical Support** | Development Team Leads | **< 2 hours** |
| 📊 **Metrics Questions** | Scrum Master | **< 4 hours** |
| 🎯 **Strategic Planning** | Product Owner | **< 1 day** |
| 📄 **Documentation** | DevOps Team | **Immediate** |

**💬 Questions?** Reply to this message or contact your team leads directly.`;

    await teamsNotificationTool.execute({
      message: TeamsRichFormatter.sanitizeForTeams(stakeholderGuide),
      title: '👥 Stakeholder Access Guide & Next Steps',
      isImportant: false,
      includeMetadata: false
    });

    console.log('✅ Enhanced Teams notifications sent successfully!');
    console.log('📊 Rich formatting applied with:');
    console.log('   • Professional tables and metrics');
    console.log('   • Action items with priorities');
    console.log('   • Stakeholder-specific guidance');
    console.log('   • Clear call-to-action buttons');
    console.log('   • Enhanced visual hierarchy');

  } catch (error) {
    console.error('❌ Error sending enhanced Teams notification:', error);
    throw error;
  }
}

// Execute the enhanced notification
sendEnhancedTeamsNotification()
  .then(() => {
    console.log('\n🎉 Enhanced Teams notification workflow completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Enhanced Teams notification failed:', error);
    process.exit(1);
  });
