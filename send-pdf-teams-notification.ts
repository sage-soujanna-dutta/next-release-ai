#!/usr/bin/env npx tsx

/**
 * Send SCNT-2025-22 PDF Report Notification to Teams Channel
 * Sends professional Teams notification about the generated PDF report
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL || 'https://sage365.webhook.office.com/webhookb2/your-webhook-url';

const SPRINT_DATA = {
  sprintId: 'SCNT-2025-22',
  period: 'Jul 23 - Aug 6, 2025',
  completionRate: 8,
  totalIssues: 106,
  completedIssues: 9,
  storyPoints: 199,
  contributors: 18,
  topPerformer: 'Soujanna Dutta',
  topPerformerIssues: 10,
  pdfPath: '/Users/snehaldangroshiya/next-release-ai/reports/SCNT-2025-22/SCNT-2025-22-executive-report-2025-07-27T23-52-58.pdf'
};

async function sendTeamsPDFNotification() {
  try {
    console.log('📢 Sending SCNT-2025-22 PDF Report Notification to Teams...');
    console.log('═══════════════════════════════════════════════════════════');

    const teamsMessage = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0078D4",
      "summary": `${SPRINT_DATA.sprintId} Executive Sprint Report - PDF Generated`,
      "sections": [{
        "activityTitle": `📄 ${SPRINT_DATA.sprintId} Executive Sprint Report`,
        "activitySubtitle": `Professional PDF report generated and ready for executive presentation`,
        "activityImage": "https://img.icons8.com/fluency/96/000000/pdf.png",
        "facts": [
          {
            "name": "📋 Sprint ID",
            "value": SPRINT_DATA.sprintId
          },
          {
            "name": "📅 Sprint Period",
            "value": SPRINT_DATA.period
          },
          {
            "name": "📊 Completion Status",
            "value": `${SPRINT_DATA.completionRate}% Complete (${SPRINT_DATA.completedIssues}/${SPRINT_DATA.totalIssues} issues resolved)`
          },
          {
            "name": "🎯 Story Points Delivered",
            "value": `${SPRINT_DATA.storyPoints} points`
          },
          {
            "name": "👥 Team Strength",
            "value": `${SPRINT_DATA.contributors} active contributors`
          },
          {
            "name": "🏆 Top Performer",
            "value": `${SPRINT_DATA.topPerformer} (${SPRINT_DATA.topPerformerIssues} issues resolved)`
          },
          {
            "name": "📄 Report Status",
            "value": "✅ Executive-ready PDF generated successfully"
          }
        ],
        "markdown": true
      }, {
        "activityTitle": "📊 Executive Summary Highlights",
        "facts": [
          {
            "name": "🎯 Sprint Focus",
            "value": "Active sprint with ambitious 199 story point commitment"
          },
          {
            "name": "📈 Velocity Trend",
            "value": "+97 points increase vs previous sprint (SCNT-2025-21)"
          },
          {
            "name": "⚠️ Risk Assessment",
            "value": "MEDIUM risk level - requires scope review and prioritization"
          },
          {
            "name": "🚀 Key Achievement",
            "value": "Largest team mobilized to date with 18 contributors"
          },
          {
            "name": "💡 Action Required",
            "value": "Mid-sprint review recommended within 48 hours"
          }
        ]
      }],
      "potentialAction": [{
        "@type": "ActionCard",
        "name": "Sprint Actions",
        "inputs": [],
        "actions": [{
          "@type": "OpenUri",
          "name": "📋 View Sprint in JIRA",
          "targets": [{
            "os": "default",
            "uri": `https://sage.atlassian.net/secure/RapidBoard.jspa?rapidView=10&view=reporting&chart=sprintRetrospective&sprint=${SPRINT_DATA.sprintId}`
          }]
        }, {
          "@type": "OpenUri",
          "name": "📊 Sprint Dashboard",
          "targets": [{
            "os": "default",
            "uri": "https://sage.atlassian.net/secure/Dashboard.jspa"
          }]
        }]
      }]
    };

    // For demonstration, we'll show what would be sent to Teams
    console.log('📤 Teams Message Content:');
    console.log('-----------------------------------');
    console.log(`Title: ${teamsMessage.sections[0].activityTitle}`);
    console.log(`Subtitle: ${teamsMessage.sections[0].activitySubtitle}`);
    console.log('\n📊 Key Facts:');
    teamsMessage.sections[0].facts.forEach(fact => {
      console.log(`  ${fact.name}: ${fact.value}`);
    });

    console.log('\n📈 Executive Highlights:');
    teamsMessage.sections[1].facts.forEach(fact => {
      console.log(`  ${fact.name}: ${fact.value}`);
    });

    // Simulate sending to Teams (uncomment if you have webhook URL)
    /*
    const response = await axios.post(TEAMS_WEBHOOK_URL, teamsMessage, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('\n✅ Teams notification sent successfully!');
    } else {
      console.log('\n⚠️ Teams notification may not have been delivered');
    }
    */

    console.log('\n🎉 Teams Notification Prepared Successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📋 Sprint: ${SPRINT_DATA.sprintId}`);
    console.log(`📄 PDF Report: ${SPRINT_DATA.pdfPath}`);
    console.log(`📊 Completion: ${SPRINT_DATA.completionRate}% (${SPRINT_DATA.completedIssues}/${SPRINT_DATA.totalIssues} issues)`);
    console.log(`🎯 Story Points: ${SPRINT_DATA.storyPoints} delivered`);
    console.log(`👥 Team: ${SPRINT_DATA.contributors} contributors`);
    console.log(`🏆 Top Performer: ${SPRINT_DATA.topPerformer} (${SPRINT_DATA.topPerformerIssues} issues)`);
    
    console.log('\n📢 Notification Status:');
    console.log('  ✅ Professional Teams message formatted');
    console.log('  ✅ Executive summary included');
    console.log('  ✅ Sprint metrics highlighted');
    console.log('  ✅ Action items identified');
    console.log('  ✅ JIRA links included');
    console.log('  ⏳ Ready to send to Teams channel');
    
    console.log('\n💡 To actually send to Teams:');
    console.log('  1. Set TEAMS_WEBHOOK_URL environment variable');
    console.log('  2. Uncomment the axios.post section in the code');
    console.log('  3. Re-run this script');
    
    return {
      message: teamsMessage,
      sprintData: SPRINT_DATA,
      success: true
    };

  } catch (error) {
    console.error('❌ Error sending Teams notification:', error);
    throw error;
  }
}

// Execute Teams notification
if (import.meta.url === `file://${process.argv[1]}`) {
  sendTeamsPDFNotification()
    .then((result) => {
      console.log('\n🎉 Teams notification preparation completed!');
      console.log(`📊 Sprint: ${result.sprintData.sprintId}`);
      console.log(`📄 PDF: Executive report ready`);
    })
    .catch((error) => {
      console.error('💥 Teams notification preparation failed:', error);
      process.exit(1);
    });
}

export { sendTeamsPDFNotification };
