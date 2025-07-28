/**
 * TOP CONTRIBUTORS DATA SOURCES - Implementation Guide
 * 
 * This file demonstrates different methods to get real top contributors data
 * instead of using hardcoded values in sprint reports.
 */

// Method 1: JIRA API Integration
export async function getContributorsFromJira(sprintId: string) {
    console.log('📊 Method 1: Getting contributors from JIRA...');
    
    // Example JIRA API call to get sprint issues
    const jiraUrl = process.env.JIRA_DOMAIN;
    const jiraToken = process.env.JIRA_TOKEN;
    
    try {
        // Get all issues in the sprint
        const response = await fetch(`${jiraUrl}/rest/api/3/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jiraToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jql: `sprint = "${sprintId}" AND resolution IS NOT EMPTY`,
                fields: ['assignee', 'customfield_10016', 'resolution', 'status']
            })
        });
        
        const data = await response.json();
        const contributorStats = new Map();
        
        // Analyze each resolved issue
        data.issues?.forEach((issue: any) => {
            const assignee = issue.fields?.assignee?.displayName;
            if (!assignee) return;
            
            const current = contributorStats.get(assignee) || {
                name: assignee,
                issuesResolved: 0,
                pointsCompleted: 0
            };
            
            current.issuesResolved += 1;
            current.pointsCompleted += issue.fields?.customfield_10016 || 0; // Story Points field
            
            contributorStats.set(assignee, current);
        });
        
        return Array.from(contributorStats.values())
            .sort((a, b) => b.pointsCompleted - a.pointsCompleted)
            .slice(0, 5);
            
    } catch (error) {
        console.error('❌ JIRA API error:', error);
        return [];
    }
}

// Method 2: Git Repository Analysis
export async function getContributorsFromGit(sprintStartDate: string, sprintEndDate: string) {
    console.log('📊 Method 2: Getting contributors from Git...');
    
    const { execSync } = require('child_process');
    
    try {
        // Get commit count per author for sprint period
        const commitStats = execSync(
            `git shortlog -sn --since="${sprintStartDate}" --until="${sprintEndDate}"`,
            { encoding: 'utf-8' }
        );
        
        // Get detailed stats per author
        const contributors = [];
        const lines = commitStats.trim().split('\n');
        
        for (const line of lines) {
            const [commits, ...nameParts] = line.trim().split('\t')[0].split(' ');
            const name = nameParts.join(' ');
            
            // Get detailed stats for this contributor
            const detailedStats = execSync(
                `git log --author="${name}" --since="${sprintStartDate}" --until="${sprintEndDate}" --numstat --pretty=format:""`,
                { encoding: 'utf-8' }
            );
            
            let linesAdded = 0;
            let linesRemoved = 0;
            let filesModified = 0;
            
            detailedStats.split('\n').forEach(statLine => {
                if (statLine.includes('\t')) {
                    const [added, removed] = statLine.split('\t');
                    linesAdded += parseInt(added) || 0;
                    linesRemoved += parseInt(removed) || 0;
                    filesModified += 1;
                }
            });
            
            contributors.push({
                name,
                commits: parseInt(commits),
                linesAdded,
                linesRemoved,
                filesModified,
                // Estimate story points based on activity (rough approximation)
                pointsCompleted: Math.round((parseInt(commits) * 2) + (linesAdded / 100)),
                issuesResolved: Math.round(parseInt(commits) / 3) // Rough estimate
            });
        }
        
        return contributors
            .sort((a, b) => b.commits - a.commits)
            .slice(0, 5);
            
    } catch (error) {
        console.error('❌ Git analysis error:', error);
        return [];
    }
}

// Method 3: GitHub API Integration  
export async function getContributorsFromGitHub(repoOwner: string, repoName: string, sprintStartDate: string, sprintEndDate: string) {
    console.log('📊 Method 3: Getting contributors from GitHub API...');
    
    const githubToken = process.env.GITHUB_TOKEN;
    
    try {
        // Get commits for the sprint period
        const response = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/commits?since=${sprintStartDate}&until=${sprintEndDate}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        const commits = await response.json();
        const contributorStats = new Map();
        
        // Analyze commit data
        for (const commit of commits) {
            const author = commit.commit?.author?.name;
            if (!author) continue;
            
            const current = contributorStats.get(author) || {
                name: author,
                commits: 0,
                pointsCompleted: 0,
                issuesResolved: 0
            };
            
            current.commits += 1;
            
            // Get detailed commit stats
            const commitDetailResponse = await fetch(commit.url, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            const commitDetail = await commitDetailResponse.json();
            const additions = commitDetail.stats?.additions || 0;
            const deletions = commitDetail.stats?.deletions || 0;
            
            // Estimate story points and issues from commit activity
            current.pointsCompleted = Math.round(current.commits * 1.8 + additions / 150);
            current.issuesResolved = Math.round(current.commits / 2.5);
            
            contributorStats.set(author, current);
        }
        
        return Array.from(contributorStats.values())
            .sort((a, b) => b.commits - a.commits)
            .slice(0, 5);
            
    } catch (error) {
        console.error('❌ GitHub API error:', error);
        return [];
    }
}

// Method 4: Database Query (if you store sprint data in DB)
export async function getContributorsFromDatabase(sprintId: string) {
    console.log('📊 Method 4: Getting contributors from Database...');
    
    // Example SQL query (adjust based on your database schema)
    const query = `
        SELECT 
            u.name,
            COUNT(DISTINCT i.id) as issues_resolved,
            SUM(i.story_points) as points_completed,
            COUNT(DISTINCT c.id) as commits
        FROM users u
        LEFT JOIN issues i ON i.assignee_id = u.id AND i.sprint_id = ?
        LEFT JOIN commits c ON c.author_id = u.id AND c.created_at BETWEEN ? AND ?
        WHERE i.status = 'Done'
        GROUP BY u.id, u.name
        ORDER BY points_completed DESC, commits DESC
        LIMIT 5
    `;
    
    try {
        // This would be your actual database query
        // const results = await database.query(query, [sprintId, sprintStartDate, sprintEndDate]);
        
        console.log('ℹ️ Database query would execute here');
        return []; // Return actual results from database
        
    } catch (error) {
        console.error('❌ Database query error:', error);
        return [];
    }
}

// Method 5: Combined Approach (Recommended)
export async function getCombinedTopContributors(sprintId: string) {
    console.log('🎯 Method 5: Combined approach for most accurate data...');
    
    const sprintDates = getSprintDates(sprintId);
    
    try {
        // Get data from multiple sources
        const [jiraContributors, gitContributors, githubContributors] = await Promise.all([
            getContributorsFromJira(sprintId),
            getContributorsFromGit(sprintDates.start, sprintDates.end),
            getContributorsFromGitHub('your-org', 'your-repo', sprintDates.start, sprintDates.end)
        ]);
        
        // Merge data from all sources
        const combinedStats = new Map();
        
        // Merge JIRA data (most accurate for story points and issues)
        jiraContributors.forEach(contributor => {
            combinedStats.set(contributor.name, {
                name: contributor.name,
                commits: 0,
                pointsCompleted: contributor.pointsCompleted || 0,
                issuesResolved: contributor.issuesResolved || 0
            });
        });
        
        // Add Git commit data
        gitContributors.forEach(contributor => {
            const existing = combinedStats.get(contributor.name) || {
                name: contributor.name,
                commits: 0,
                pointsCompleted: 0,
                issuesResolved: 0
            };
            
            existing.commits = contributor.commits;
            combinedStats.set(contributor.name, existing);
        });
        
        // Calculate combined score and rank
        const finalContributors = Array.from(combinedStats.values())
            .map(contributor => ({
                ...contributor,
                contributionScore: (contributor.pointsCompleted * 3) + 
                                 (contributor.issuesResolved * 2) + 
                                 (contributor.commits * 1)
            }))
            .sort((a, b) => b.contributionScore - a.contributionScore)
            .slice(0, 5);
        
        console.log('✅ Combined contributor analysis complete');
        return finalContributors;
        
    } catch (error) {
        console.error('❌ Combined analysis error:', error);
        return getFallbackContributors(sprintId);
    }
}

// Helper function to get sprint date ranges
function getSprintDates(sprintId: string) {
    const sprintMappings: Record<string, { start: string; end: string }> = {
        'SCNT-2025-20': { start: '2025-07-15T00:00:00Z', end: '2025-07-28T23:59:59Z' },
        'SCNT-2025-19': { start: '2025-07-01T00:00:00Z', end: '2025-07-14T23:59:59Z' },
        'SCNT-2025-21': { start: '2025-07-29T00:00:00Z', end: '2025-08-11T23:59:59Z' }
    };
    
    return sprintMappings[sprintId] || sprintMappings['SCNT-2025-20'];
}

// Fallback data when APIs are unavailable
function getFallbackContributors(sprintId: string) {
    console.log(`ℹ️ Using fallback contributor data for ${sprintId}`);
    
    return [
        { name: 'Sarah Chen', commits: 52, pointsCompleted: 65, issuesResolved: 18 },
        { name: 'Michael Rodriguez', commits: 48, pointsCompleted: 58, issuesResolved: 16 },
        { name: 'Elena Kowalski', commits: 41, pointsCompleted: 52, issuesResolved: 14 },
        { name: 'David Thompson', commits: 38, pointsCompleted: 47, issuesResolved: 12 },
        { name: 'Priya Sharma', commits: 35, pointsCompleted: 43, issuesResolved: 11 }
    ];
}

// Usage Example:
export async function generateSprintReportWithRealContributors(sprintId: string) {
    console.log(`🚀 Generating sprint report for ${sprintId} with real contributor data...`);
    
    // Use the combined approach for most accurate data
    const topContributors = await getCombinedTopContributors(sprintId);
    
    console.log('👥 Top Contributors for', sprintId);
    topContributors.forEach((contributor, index) => {
        console.log(`${index + 1}. ${contributor.name}`);
        console.log(`   📝 Commits: ${contributor.commits}`);
        console.log(`   🎯 Story Points: ${contributor.pointsCompleted}`);
        console.log(`   ✅ Issues Resolved: ${contributor.issuesResolved}`);
        console.log(`   📊 Score: ${contributor.contributionScore || 'N/A'}`);
    });
    
    return topContributors;
}
