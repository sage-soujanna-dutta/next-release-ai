#!/usr/bin/env tsx

/**
 * NDS Sprint Diagnostic Script
 * This script helps diagnose why NDS sprints are not accessible
 */

import { config } from 'dotenv';
import axios from 'axios';

config();

async function diagnoseNDSAccess() {
  console.log('🔍 Diagnosing NDS Sprint Access Issues...\n');
  
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraDomain = process.env.JIRA_DOMAIN;
  const jiraToken = process.env.JIRA_TOKEN;
  
  console.log('📋 Current Configuration:');
  console.log(`📧 Email: ${jiraEmail}`);
  console.log(`🌐 Domain: ${jiraDomain}`);
  console.log(`🔑 Token: ${jiraToken ? '***' + jiraToken.slice(-4) : 'NOT SET'}\n`);
  
  if (!jiraEmail || !jiraDomain || !jiraToken) {
    console.error('❌ Missing JIRA configuration variables');
    return;
  }
  
  const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');
  const baseURL = `https://${jiraDomain}`;
  
  try {
    // Test 1: Basic connectivity
    console.log('📋 Test 1: Basic JIRA connectivity...');
    try {
      const response = await axios.get(`${baseURL}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
        timeout: 10000
      });
      console.log('✅ JIRA connection successful');
      console.log(`👤 User: ${response.data.displayName}\n`);
    } catch (error: any) {
      console.error(`❌ JIRA connection failed: ${error.response?.status} ${error.response?.statusText}`);
      console.error('📝 This explains why NDS sprints cannot be accessed\n');
      return;
    }
    
    // Test 2: Check accessible projects
    console.log('📋 Test 2: Checking accessible projects...');
    try {
      const projectsResponse = await axios.get(`${baseURL}/rest/api/3/project`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });
      
      const projects = projectsResponse.data;
      console.log(`✅ Found ${projects.length} accessible projects:`);
      
      const ndsProject = projects.find((p: any) => p.key === 'NDS');
      const scntProject = projects.find((p: any) => p.key === 'SCNT');
      
      projects.forEach((project: any) => {
        const icon = project.key === 'NDS' ? '🎯' : project.key === 'SCNT' ? '✅' : '📊';
        console.log(`  ${icon} ${project.key}: ${project.name}`);
      });
      
      if (!ndsProject) {
        console.error('\n❌ NDS project not found in accessible projects!');
        console.error('💡 This is why NDS-FY25-21 sprint cannot be accessed');
      } else {
        console.log('\n✅ NDS project is accessible');
      }
      
      if (scntProject) {
        console.log('✅ SCNT project is accessible (explains why SCNT sprints work)\n');
      }
      
    } catch (error: any) {
      console.error(`❌ Failed to fetch projects: ${error.response?.status} ${error.response?.statusText}\n`);
    }
    
    // Test 3: Search for NDS sprints (if NDS project exists)
    console.log('📋 Test 3: Searching for NDS sprints...');
    try {
      const sprintSearchQueries = [
        'project = NDS',
        'sprint ~ "FY25-21"',
        'sprint ~ "NDS-FY25-21"',
        'project = NDS AND sprint is not EMPTY'
      ];
      
      for (const query of sprintSearchQueries) {
        try {
          console.log(`   Testing query: ${query}`);
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
          
          console.log(`   ✅ Query successful: ${response.data.total} issues found`);
          
          if (response.data.issues.length > 0) {
            const issue = response.data.issues[0];
            console.log(`   📋 Sample issue: ${issue.key} - ${issue.fields.summary}`);
          }
          
        } catch (queryError: any) {
          console.log(`   ❌ Query failed: ${queryError.response?.status} ${queryError.response?.statusText}`);
        }
      }
      
    } catch (error: any) {
      console.error(`❌ Sprint search failed: ${error.response?.status} ${error.response?.statusText}`);
    }
    
    // Test 4: Check sprint boards
    console.log('\n📋 Test 4: Checking available boards...');
    try {
      const boardsResponse = await axios.get(`${baseURL}/rest/agile/1.0/board`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });
      
      console.log(`✅ Found ${boardsResponse.data.total} boards:`);
      
      const ndsBoards = boardsResponse.data.values.filter((board: any) => 
        board.name.toLowerCase().includes('nds') || 
        board.location?.projectKey === 'NDS'
      );
      
      if (ndsBoards.length > 0) {
        console.log('🎯 NDS-related boards found:');
        ndsBoards.forEach((board: any) => {
          console.log(`   📊 ${board.name} (ID: ${board.id})`);
        });
      } else {
        console.log('❌ No NDS-related boards found');
      }
      
    } catch (error: any) {
      console.error(`❌ Failed to fetch boards: ${error.response?.status} ${error.response?.statusText}`);
    }
    
  } catch (error: any) {
    console.error('💥 Diagnostic failed:', error.message);
  }
}

// Run the diagnostic
diagnoseNDSAccess().then(() => {
  console.log('\n🏁 NDS diagnostic completed');
  console.log('\n💡 Recommendations:');
  console.log('1. If JIRA connection failed: Check server status and credentials');
  console.log('2. If NDS project not found: Request access to NDS project');
  console.log('3. If no sprints found: Verify sprint naming convention');
  console.log('4. Contact JIRA administrator for NDS project access');
}).catch((error) => {
  console.error('💥 Diagnostic script failed:', error);
});
