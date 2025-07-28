#!/usr/bin/env npx tsx

/**
 * SCNT-2025-19 Data Verification Script
 * Cross-checks mock data against actual JIRA data
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

async function fetchJiraData() {
  const domain = process.env.JIRA_DOMAIN;
  const token = process.env.JIRA_TOKEN;
  const boardId = process.env.JIRA_BOARD_ID;

  if (!domain || !token || !boardId) {
    throw new Error("Missing JIRA environment variables");
  }

  try {
    console.log('🔍 Step 1: Finding SCNT-2025-19 Sprint');
    console.log('=' .repeat(50));
    
    // Get all sprints to find SCNT-2025-19
    const sprintsRes = await axios.get(
      `https://${domain}/rest/agile/1.0/board/${boardId}/sprint`,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        } 
      }
    );

    const sprint19 = sprintsRes.data.values.find((s: SprintData) =>
      s.name.includes('SCNT-2025-19') || s.name.includes('2025-19')
    );
    
    if (!sprint19) {
      console.log('❌ SCNT-2025-19 sprint not found in JIRA');
      console.log('Available sprints:');
      sprintsRes.data.values.forEach((s: SprintData) => {
        console.log(`  - ${s.name} (ID: ${s.id}, State: ${s.state})`);
      });
      return null;
    }

    console.log(`✅ Found Sprint: ${sprint19.name}`);
    console.log(`   ID: ${sprint19.id}`);
    console.log(`   State: ${sprint19.state}`);
    console.log(`   Start: ${sprint19.startDate || 'Not set'}`);
    console.log(`   End: ${sprint19.endDate || 'Not set'}`);

    console.log('\n📊 Step 2: Fetching Sprint Issues');
    console.log('=' .repeat(50));

    // Fetch issues for the sprint
    const issuesRes = await axios.get(
      `https://${domain}/rest/agile/1.0/sprint/${sprint19.id}/issue`,
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
    const completedIssues = issues.filter(issue => 
      issue.fields.status.name === 'Done' || 
      issue.fields.status.name === 'Resolved' ||
      issue.fields.status.name === 'Closed'
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

    console.log('\n📈 Step 3: Actual JIRA Data Analysis');
    console.log('=' .repeat(50));
    
    console.log(`📊 Sprint Metrics:`);
    console.log(`   Total Issues: ${issues.length}`);
    console.log(`   Completed Issues: ${completedIssues.length}`);
    console.log(`   Completion Rate: ${Math.round((completedIssues.length / issues.length) * 100)}%`);
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

    console.log(`\n👥 Contributors:`);
    Object.entries(contributors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([name, count]) => {
        console.log(`   ${name}: ${count} issues`);
      });

    console.log('\n🔍 Step 4: Comparison with Mock Data');
    console.log('=' .repeat(50));
    
    // Mock data from current script
    const mockData = {
      totalIssues: 180,
      completedIssues: 153,
      completionRate: 85,
      storyPoints: 264,
      contributors: 7
    };

    console.log(`📊 Comparison Results:`);
    console.log(`   Total Issues: Mock=${mockData.totalIssues}, Actual=${issues.length} ${issues.length === mockData.totalIssues ? '✅' : '❌'}`);
    console.log(`   Completed Issues: Mock=${mockData.completedIssues}, Actual=${completedIssues.length} ${completedIssues.length === mockData.completedIssues ? '✅' : '❌'}`);
    console.log(`   Completion Rate: Mock=${mockData.completionRate}%, Actual=${Math.round((completedIssues.length / issues.length) * 100)}% ${Math.round((completedIssues.length / issues.length) * 100) === mockData.completionRate ? '✅' : '❌'}`);
    console.log(`   Story Points: Mock=${mockData.storyPoints}, Actual=${storyPointsTotal} ${storyPointsTotal === mockData.storyPoints ? '✅' : '❌'}`);

    return {
      actual: {
        totalIssues: issues.length,
        completedIssues: completedIssues.length,
        completionRate: Math.round((completedIssues.length / issues.length) * 100),
        storyPoints: storyPointsTotal,
        storyPointsCompleted: storyPointsCompleted,
        issueTypes,
        priorities,
        contributors: Object.keys(contributors).length
      },
      mock: mockData,
      sprint: sprint19
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
  console.log('📋 SCNT-2025-19 Data Verification');
  console.log('Cross-checking mock data against actual JIRA data');
  console.log('=' .repeat(70));
  
  const result = await fetchJiraData();
  
  if (result) {
    console.log('\n✅ Verification Complete');
    console.log('=' .repeat(50));
    
    if (result.actual.totalIssues !== result.mock.totalIssues ||
        result.actual.completionRate !== result.mock.completionRate ||
        result.actual.storyPoints !== result.mock.storyPoints) {
      console.log('⚠️  DISCREPANCIES FOUND - Mock data does not match JIRA data');
      console.log('📝 Recommendation: Update sprint report with actual JIRA data');
    } else {
      console.log('✅ Mock data matches JIRA data - No changes needed');
    }
  } else {
    console.log('\n❌ Verification Failed');
    console.log('Could not fetch JIRA data for comparison');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
