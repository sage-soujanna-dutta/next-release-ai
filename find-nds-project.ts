#!/usr/bin/env tsx

/**
 * Find Network Directory Service Project
 * Search for the project using different identifiers
 */

import { config } from 'dotenv';
import axios from 'axios';

config();

async function findNetworkDirectoryService() {
  console.log('🔍 Searching for Network Directory Service project...\n');
  
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
    // List all accessible projects and search for Network Directory Service
    console.log('📋 Searching all accessible projects for "Network Directory Service"...');
    const projectsResponse = await axios.get(`${baseURL}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });
    
    console.log(`✅ Found ${projectsResponse.data.length} accessible projects\n`);
    
    // Search for projects containing network, directory, service, or NDS
    const searchTerms = ['network', 'directory', 'service', 'nds'];
    let foundProjects: any[] = [];
    
    console.log('🔍 Searching for related projects:');
    projectsResponse.data.forEach((project: any) => {
      const nameMatch = searchTerms.some(term => 
        project.name.toLowerCase().includes(term) || 
        project.key.toLowerCase().includes(term)
      );
      
      if (nameMatch) {
        foundProjects.push(project);
        console.log(`  🎯 ${project.key}: ${project.name}`);
      } else {
        console.log(`  📊 ${project.key}: ${project.name}`);
      }
    });
    
    console.log(`\n🎯 Found ${foundProjects.length} potentially matching projects:`);
    if (foundProjects.length > 0) {
      foundProjects.forEach((project: any) => {
        console.log(`  • ${project.key}: ${project.name} (ID: ${project.id})`);
      });
      
      // Try to search for sprints in found projects
      console.log('\n📋 Searching for FY25-21 sprints in matching projects...');
      for (const project of foundProjects) {
        try {
          console.log(`\n🔍 Checking ${project.key} (${project.name}):`);
          
          const sprintQueries = [
            `project = "${project.key}" AND sprint ~ "FY25-21"`,
            `project = "${project.key}" AND sprint ~ "21"`,
            `project = "${project.key}" AND sprint is not EMPTY`
          ];
          
          for (const query of sprintQueries) {
            try {
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
                console.log(`   ✅ Query: ${query}`);
                console.log(`   📊 Found: ${response.data.total} issues`);
                
                // Extract sprint names
                const sprints = new Set();
                response.data.issues.forEach((issue: any) => {
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
                
                if (sprints.size > 0) {
                  console.log(`   🎯 Available sprints:`);
                  Array.from(sprints).forEach((sprintName: unknown) => {
                    const sprintStr = String(sprintName);
                    const isTarget = sprintStr.includes('FY25-21') || sprintStr.includes('21') ? '🎯' : '📊';
                    console.log(`     ${isTarget} ${sprintStr}`);
                  });
                }
                break; // Found data, no need to try other queries
              }
            } catch (queryError: any) {
              // Silent fail for individual queries
            }
          }
        } catch (projectError: any) {
          console.log(`   ❌ Cannot access ${project.key}: ${projectError.response?.status}`);
        }
      }
    } else {
      console.log('❌ No projects found matching "Network Directory Service" search terms');
      console.log('\n💡 Possible reasons:');
      console.log('   • Project might have a different name in JIRA');
      console.log('   • Project might not be accessible to your account');
      console.log('   • Project might be archived or disabled');
    }
    
  } catch (error: any) {
    console.error('❌ Search failed:', error.response?.status, error.response?.statusText);
  }
}

// Run the search
findNetworkDirectoryService().then(() => {
  console.log('\n🏁 Network Directory Service search completed');
}).catch((error) => {
  console.error('💥 Search failed:', error);
});
