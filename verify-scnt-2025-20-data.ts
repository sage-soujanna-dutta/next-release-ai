#!/usr/bin/env npx tsx

/**
 * SCNT-2025-20 Data Verification Script
 * Cross-checks the Teams report data against actual JIRA data
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    priority?: {
      name: string;
    };
    customfield_10004?: number; // Story Points
    customfield_10002?: number; // Alternative Story Points field  
    customfield_10003?: number; // Another Story Points field
    customfield_10005?: number; // Another Story Points field
  };
}

interface SprintData {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
}

async function verifyJiraData() {
  const domain = process.env.JIRA_DOMAIN;
  const token = process.env.JIRA_TOKEN;
  const boardId = process.env.JIRA_BOARD_ID;

  if (!domain || !token || !boardId) {
    throw new Error("Missing JIRA environment variables");
  }

  try {
    console.log('🔍 Step 1: Finding SCNT-2025-20 Sprint in JIRA');
    console.log('=' .repeat(60));
    
    // Get all sprints to find SCNT-2025-20
    const sprintsRes = await axios.get(
      `https://${domain}/rest/agile/1.0/board/${boardId}/sprint`,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        } 
      }
    );

    const sprint20 = sprintsRes.data.values.find((s: SprintData) =>
      s.name.includes('SCNT-2025-20') || s.name.includes('2025-20')
    );
    
    if (!sprint20) {
      console.log('❌ SCNT-2025-20 sprint not found in JIRA');
      console.log('Available sprints:');
      sprintsRes.data.values.forEach((s: SprintData) => {
        console.log(`  - ${s.name} (ID: ${s.id}, State: ${s.state})`);
      });
      return null;
    }

    console.log(`✅ Found Sprint: ${sprint20.name}`);
    console.log(`   ID: ${sprint20.id}`);
    console.log(`   State: ${sprint20.state}`);
    console.log(`   Start: ${sprint20.startDate || 'Not set'}`);
    console.log(`   End: ${sprint20.endDate || 'Not set'}`);

    console.log('\n📊 Step 2: Fetching Sprint Issues from JIRA');
    console.log('=' .repeat(60));

    // Fetch issues for the sprint
    const issuesRes = await axios.get(
      `https://${domain}/rest/agile/1.0/sprint/${sprint20.id}/issue`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          maxResults: 1000
        }
      }
    );

    const issues: JiraIssue[] = issuesRes.data.issues;
    console.log(`📋 Total Issues Found: ${issues.length}`);

    // Analyze the data
    const completedStatuses = ['Done', 'Resolved', 'Closed', 'Completed'];
    const completedIssues = issues.filter(issue => 
      completedStatuses.includes(issue.fields.status.name)
    );

    const storyPointsTotal = issues.reduce((sum, issue) => {
      const storyPoints = issue.fields.customfield_10004 || 
                         issue.fields.customfield_10002 || 
                         issue.fields.customfield_10003 || 
                         issue.fields.customfield_10005 || 0;
      return sum + storyPoints;
    }, 0);

    const storyPointsCompleted = completedIssues.reduce((sum, issue) => {
      const storyPoints = issue.fields.customfield_10004 || 
                         issue.fields.customfield_10002 || 
                         issue.fields.customfield_10003 || 
                         issue.fields.customfield_10005 || 0;
      return sum + storyPoints;
    }, 0);

    // Issue type breakdown
    const issueTypes = issues.reduce((acc, issue) => {
      const type = issue.fields.issuetype.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority breakdown
    const priorities = issues.reduce((acc, issue) => {
      const priority = issue.fields.priority?.name || 'None';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contributors
    const contributors = issues.reduce((acc, issue) => {
      const assignee = issue.fields.assignee?.displayName || 'Unassigned';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate completion rate
    const completionRate = Math.round((completedIssues.length / issues.length) * 100);

    console.log('\n📈 Step 3: Actual JIRA Data Analysis');
    console.log('=' .repeat(60));
    
    console.log(`📊 Sprint Metrics:`);
    console.log(`   Total Issues: ${issues.length}`);
    console.log(`   Completed Issues: ${completedIssues.length}`);
    console.log(`   Completion Rate: ${completionRate}%`);
    console.log(`   Total Story Points: ${storyPointsTotal}`);
    console.log(`   Completed Story Points: ${storyPointsCompleted}`);
    
    console.log(`\n📋 Issue Types:`);
    Object.entries(issueTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} (${Math.round((count / issues.length) * 100)}%)`);
    });

    console.log(`\n🎯 Priorities:`);
    Object.entries(priorities).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count}`);
    });

    console.log(`\n👥 Contributors (Top 10):`);
    Object.entries(contributors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([name, count]) => {
        console.log(`   ${name}: ${count} issues`);
      });

    console.log('\n🔍 Step 4: Verification vs Teams Report');
    console.log('=' .repeat(60));
    
    // Teams report data from the screenshot
    const teamsReportData = {
      totalIssues: 113,
      completedIssues: 107,
      completionRate: 95,
      storyPoints: 204,
      contributors: 17,
      issueBreakdown: {
        userStories: 31,
        bugFixes: 23,
        tasks: 48,
        epics: 11,
        improvements: 0
      },
      priorityBreakdown: {
        critical: { total: 2, resolved: 2 },
        major: { total: 4, resolved: 4 },
        minor: { total: 96, resolved: 91 },
        low: { total: 0, resolved: 0 },
        blockers: { total: 11, resolved: 10 }
      }
    };

    console.log(`📊 Verification Results:`);
    console.log(`   Total Issues: Teams=${teamsReportData.totalIssues}, JIRA=${issues.length} ${issues.length === teamsReportData.totalIssues ? '✅' : '❌'}`);
    console.log(`   Completed Issues: Teams=${teamsReportData.completedIssues}, JIRA=${completedIssues.length} ${completedIssues.length === teamsReportData.completedIssues ? '✅' : '❌'}`);
    console.log(`   Completion Rate: Teams=${teamsReportData.completionRate}%, JIRA=${completionRate}% ${completionRate === teamsReportData.completionRate ? '✅' : '❌'}`);
    console.log(`   Story Points: Teams=${teamsReportData.storyPoints}, JIRA=${storyPointsTotal} ${storyPointsTotal === teamsReportData.storyPoints ? '✅' : '❌'}`);
    console.log(`   Contributors: Teams=${teamsReportData.contributors}, JIRA=${Object.keys(contributors).length - (contributors['Unassigned'] ? 1 : 0)} ${(Object.keys(contributors).length - (contributors['Unassigned'] ? 1 : 0)) === teamsReportData.contributors ? '✅' : '❌'}`);

    console.log('\n📋 Issue Type Verification:');
    console.log(`   User Stories: Teams=${teamsReportData.issueBreakdown.userStories}, JIRA=${issueTypes['Story'] || 0} ${(issueTypes['Story'] || 0) === teamsReportData.issueBreakdown.userStories ? '✅' : '❌'}`);
    console.log(`   Bug Fixes: Teams=${teamsReportData.issueBreakdown.bugFixes}, JIRA=${issueTypes['Bug'] || 0} ${(issueTypes['Bug'] || 0) === teamsReportData.issueBreakdown.bugFixes ? '✅' : '❌'}`);
    console.log(`   Tasks: Teams=${teamsReportData.issueBreakdown.tasks}, JIRA=${issueTypes['Task'] || 0} ${(issueTypes['Task'] || 0) === teamsReportData.issueBreakdown.tasks ? '✅' : '❌'}`);

    console.log('\n🎯 Priority Verification:');
    console.log(`   Critical: Teams=${teamsReportData.priorityBreakdown.critical.total}, JIRA=${priorities['Critical'] || 0} ${(priorities['Critical'] || 0) === teamsReportData.priorityBreakdown.critical.total ? '✅' : '❌'}`);
    console.log(`   Major: Teams=${teamsReportData.priorityBreakdown.major.total}, JIRA=${priorities['Major'] || 0} ${(priorities['Major'] || 0) === teamsReportData.priorityBreakdown.major.total ? '✅' : '❌'}`);
    console.log(`   Minor: Teams=${teamsReportData.priorityBreakdown.minor.total}, JIRA=${priorities['Minor'] || 0} ${(priorities['Minor'] || 0) === teamsReportData.priorityBreakdown.minor.total ? '✅' : '❌'}`);

    return {
      jiraData: {
        totalIssues: issues.length,
        completedIssues: completedIssues.length,
        completionRate: completionRate,
        storyPoints: storyPointsTotal,
        storyPointsCompleted: storyPointsCompleted,
        contributors: Object.keys(contributors).length - (contributors['Unassigned'] ? 1 : 0),
        issueTypes,
        priorities,
        topContributor: Object.entries(contributors).sort(([,a], [,b]) => b - a)[0]
      },
      teamsData: teamsReportData,
      sprint: sprint20
    };

  } catch (error) {
    console.error('❌ Error fetching JIRA data:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    return null;
  }
}

async function main() {
  console.log('📋 SCNT-2025-20 Data Verification');
  console.log('Cross-checking Teams report against actual JIRA data');
  console.log('=' .repeat(70));
  
  const result = await verifyJiraData();
  
  if (result) {
    console.log('\n✅ Verification Complete');
    console.log('=' .repeat(60));
    
    const jira = result.jiraData;
    const teams = result.teamsData;
    
    if (jira.totalIssues !== teams.totalIssues ||
        jira.completionRate !== teams.completionRate ||
        jira.storyPoints !== teams.storyPoints ||
        jira.contributors !== teams.contributors) {
      console.log('⚠️  DISCREPANCIES FOUND - Some numbers do not match JIRA data');
      console.log('📝 Detailed analysis completed above');
    } else {
      console.log('✅ All major metrics match JIRA data - Report is accurate');
    }
    
    console.log('\n📊 Summary:');
    console.log(`🎯 Sprint: SCNT-2025-20`);
    console.log(`📋 JIRA Issues: ${jira.totalIssues} total, ${jira.completedIssues} completed (${jira.completionRate}%)`);
    console.log(`⚡ JIRA Story Points: ${jira.storyPoints} total, ${jira.storyPointsCompleted} completed`);
    console.log(`👥 JIRA Contributors: ${jira.contributors} active team members`);
    console.log(`🏆 Top Contributor: ${jira.topContributor?.[0]} (${jira.topContributor?.[1]} issues)`);
  } else {
    console.log('\n❌ Verification Failed');
    console.log('Could not fetch JIRA data for comparison');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
