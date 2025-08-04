#!/usr/bin/env tsx

/**
 * Focused NDS Sprint Investigation
 * Since JIRA server is running, let's find the specific issue
 */

import { config } from 'dotenv';
import axios from 'axios';

config();

async function investigateNDSIssue() {
  console.log('🔍 Investigating NDS Sprint Access (JIRA Server is Running)...\n');
  
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraDomain = process.env.JIRA_DOMAIN;
  const jiraToken = process.env.JIRA_TOKEN;
  
  if (!jiraEmail || !jiraDomain || !jiraToken) {
    console.error('❌ Missing JIRA configuration variables');
    return;
  }
  
  const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');
  const baseURL = `https://${jiraDomain}`;
  
  try {
    // Test 1: Verify authentication works
    console.log('📋 Test 1: Verifying JIRA authentication...');
    const authResponse = await axios.get(`${baseURL}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });
    console.log('✅ Authentication successful');
    console.log(`👤 Logged in as: ${authResponse.data.displayName} (${authResponse.data.emailAddress})\n`);
    
    // Test 2: List all accessible projects
    console.log('📋 Test 2: Checking accessible projects...');
    const projectsResponse = await axios.get(`${baseURL}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });
    
    console.log(`✅ Found ${projectsResponse.data.length} accessible projects:`);
    let ndsFound = false;
    let scntFound = false;
    
    projectsResponse.data.forEach((project: any) => {
      const status = project.key === 'NDS' ? '🎯 TARGET' : project.key === 'SCNT' ? '✅ WORKING' : '📊';
      console.log(`  ${status} ${project.key}: ${project.name}`);
      if (project.key === 'NDS') ndsFound = true;
      if (project.key === 'SCNT') scntFound = true;
    });
    
    console.log(`\n🎯 NDS Project Access: ${ndsFound ? '✅ AVAILABLE' : '❌ NOT ACCESSIBLE'}`);
    console.log(`✅ SCNT Project Access: ${scntFound ? '✅ AVAILABLE' : '❌ NOT ACCESSIBLE'}\n`);
    
    if (!ndsFound) {
      console.error('❌ ROOT CAUSE: NDS project is not accessible to your account');
      console.error('💡 SOLUTION: Request access to the NDS project from your JIRA administrator\n');
      return;
    }
    
    // Test 3: Search for NDS issues
    console.log('📋 Test 3: Searching for NDS issues...');
    const ndsIssuesResponse = await axios.get(`${baseURL}/rest/api/3/search`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
      params: {
        jql: 'project = NDS ORDER BY created DESC',
        maxResults: 10
      }
    });
    
    console.log(`✅ Found ${ndsIssuesResponse.data.total} NDS issues`);
    if (ndsIssuesResponse.data.issues.length > 0) {
      console.log('📋 Recent NDS issues:');
      ndsIssuesResponse.data.issues.slice(0, 3).forEach((issue: any) => {
        console.log(`  • ${issue.key}: ${issue.fields.summary}`);
      });
    }
    
    // Test 4: Check for sprints in various formats
    console.log('\n📋 Test 4: Searching for FY25-21 sprints in different formats...');
    
    const sprintQueries = [
      'project = NDS AND sprint = "NDS-FY25-21"',
      'project = NDS AND sprint = "FY25-21"', 
      'project = NDS AND sprint ~ "FY25-21"',
      'project = NDS AND sprint ~ "21"',
      'sprint = "NDS-FY25-21"',
      'sprint = "FY25-21"',
      'sprint ~ "FY25-21"'
    ];
    
    for (const query of sprintQueries) {
      try {
        console.log(`   🔍 Testing: ${query}`);
        const response = await axios.get(`${baseURL}/rest/api/3/search`, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          },
          params: {
            jql: query,
            maxResults: 5
          }
        });
        
        if (response.data.total > 0) {
          console.log(`   ✅ FOUND: ${response.data.total} issues in this sprint!`);
          const issue = response.data.issues[0];
          console.log(`   📋 Sample: ${issue.key} - ${issue.fields.summary}`);
          
          // Extract sprint information
          const sprintField = issue.fields.customfield_10020 || issue.fields.sprint;
          if (sprintField) {
            console.log(`   🎯 Sprint Info: ${JSON.stringify(sprintField, null, 2)}`);
          }
        } else {
          console.log(`   ❌ No issues found`);
        }
      } catch (queryError: any) {
        console.log(`   ❌ Query failed: ${queryError.response?.status} - ${queryError.response?.statusText}`);
      }
    }
    
    // Test 5: List all available sprints for NDS
    console.log('\n📋 Test 5: Finding all NDS sprints...');
    try {
      const allSprintsResponse = await axios.get(`${baseURL}/rest/api/3/search`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
        params: {
          jql: 'project = NDS AND sprint is not EMPTY ORDER BY created DESC',
          maxResults: 20
        }
      });
      
      console.log(`✅ Found ${allSprintsResponse.data.total} NDS issues with sprints`);
      
      if (allSprintsResponse.data.issues.length > 0) {
        console.log('🎯 Available NDS sprints detected:');
        const sprints = new Set();
        
        allSprintsResponse.data.issues.forEach((issue: any) => {
          const sprintField = issue.fields.customfield_10020 || issue.fields.sprint;
          if (sprintField) {
            if (Array.isArray(sprintField)) {
              sprintField.forEach((sprint: any) => {
                if (sprint.name) sprints.add(sprint.name);
              });
            } else if (sprintField.name) {
              sprints.add(sprintField.name);
            }
          }
        });
        
        Array.from(sprints).forEach((sprintName: unknown) => {
          const sprintStr = String(sprintName);
          const isTarget = sprintStr.includes('FY25-21') ? '🎯' : '📊';
          console.log(`  ${isTarget} ${sprintStr}`);
        });
      }
      
    } catch (error: any) {
      console.error(`❌ Failed to list NDS sprints: ${error.response?.status} - ${error.response?.statusText}`);
    }
    
  } catch (error: any) {
    console.error('❌ Investigation failed:', error.response?.status, error.response?.statusText);
    if (error.response?.status === 401) {
      console.error('💡 Authentication issue: Check if your JIRA token is valid');
    } else if (error.response?.status === 403) {
      console.error('💡 Permission issue: You may not have access to required projects');
    }
  }
}

// Run the investigation
investigateNDSIssue().then(() => {
  console.log('\n🏁 Investigation completed');
}).catch((error) => {
  console.error('💥 Investigation failed:', error);
});
