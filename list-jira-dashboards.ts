#!/usr/bin/env npx tsx

/**
 * JIRA DASHBOARDS LISTER
 * Fetches and displays all available JIRA dashboards with their IDs
 * 
 * FEATURES:
 * - Lists all dashboards accessible to the current user
 * - Shows dashboard IDs, names, descriptions
 * - Displays owner information
 * - Shows view permissions
 * - Provides direct dashboard URLs
 * 
 * USAGE:
 * npx tsx list-jira-dashboards.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ===================================================================
// INTERFACES
// ===================================================================
interface JiraDashboard {
    id: string;
    name: string;
    description?: string;
    owner: {
        key: string;
        name: string;
        displayName: string;
        active: boolean;
    };
    sharePermissions: Array<{
        id: number;
        type: string;
        project?: {
            id: string;
            key: string;
            name: string;
        };
        role?: {
            name: string;
            description: string;
        };
        group?: {
            name: string;
        };
    }>;
    editPermissions: Array<{
        id: number;
        type: string;
    }>;
    isFavourite: boolean;
    popularity: number;
    view: string;
    self: string;
}

// ===================================================================
// JIRA DASHBOARD FETCHER
// ===================================================================
async function fetchJiraDashboards() {
    const domain = process.env.JIRA_DOMAIN;
    const token = process.env.JIRA_TOKEN;

    if (!domain || !token) {
        throw new Error("Missing JIRA environment variables. Please check .env file.");
    }

    try {
        console.log('🔍 Fetching JIRA Dashboards...');
        console.log(`🌐 JIRA Domain: ${domain}`);
        console.log('=' .repeat(80));

        // Fetch all dashboards
        const response = await axios.get(
            `https://${domain}/rest/api/2/dashboard`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                params: {
                    maxResults: 1000, // Get up to 1000 dashboards
                    startAt: 0
                }
            }
        );

        const dashboards: JiraDashboard[] = response.data.dashboards || [];
        
        console.log(`📊 Found ${dashboards.length} dashboards\n`);

        if (dashboards.length === 0) {
            console.log('❌ No dashboards found or no access to dashboards.');
            return;
        }

        // Sort dashboards by popularity (most popular first)
        dashboards.sort((a, b) => b.popularity - a.popularity);

        // Display dashboards in a formatted table
        console.log('📋 JIRA DASHBOARDS LIST');
        console.log('=' .repeat(80));
        console.log();

        dashboards.forEach((dashboard, index) => {
            console.log(`${index + 1}. 📊 ${dashboard.name}`);
            console.log(`   🆔 ID: ${dashboard.id}`);
            
            // Handle owner information safely
            if (dashboard.owner) {
                const ownerName = dashboard.owner.displayName || dashboard.owner.name || 'Unknown';
                const ownerKey = dashboard.owner.name || dashboard.owner.key || 'unknown';
                console.log(`   👤 Owner: ${ownerName} (${ownerKey})`);
            } else {
                console.log(`   👤 Owner: Unknown`);
            }
            
            if (dashboard.description) {
                console.log(`   📝 Description: ${dashboard.description}`);
            }
            
            console.log(`   ⭐ Popularity: ${dashboard.popularity || 0}`);
            console.log(`   💖 Favourite: ${dashboard.isFavourite ? 'Yes' : 'No'}`);
            console.log(`   🔗 URL: https://${domain}/secure/Dashboard.jspa?selectPageId=${dashboard.id}`);
            
            // Show share permissions
            if (dashboard.sharePermissions && dashboard.sharePermissions.length > 0) {
                console.log(`   🔐 Shared with:`);
                dashboard.sharePermissions.slice(0, 3).forEach(permission => {
                    if (permission.type === 'global') {
                        console.log(`      - Everyone (Global)`);
                    } else if (permission.type === 'project' && permission.project) {
                        console.log(`      - Project: ${permission.project.name} (${permission.project.key})`);
                    } else if (permission.type === 'group' && permission.group) {
                        console.log(`      - Group: ${permission.group.name}`);
                    } else {
                        console.log(`      - ${permission.type}`);
                    }
                });
                if (dashboard.sharePermissions.length > 3) {
                    console.log(`      - ... and ${dashboard.sharePermissions.length - 3} more`);
                }
            }
            
            console.log();
        });

        // Summary section
        console.log('📈 DASHBOARD SUMMARY');
        console.log('=' .repeat(80));
        console.log(`📊 Total Dashboards: ${dashboards.length}`);
        console.log(`⭐ Your Favourites: ${dashboards.filter(d => d.isFavourite).length}`);
        console.log(`👤 Owned by You: ${dashboards.filter(d => d.owner && (d.owner.name === process.env.JIRA_EMAIL?.split('@')[0])).length}`);
        
        // Most popular dashboards
        const topDashboards = dashboards.slice(0, 5);
        console.log('\n🏆 TOP 5 MOST POPULAR DASHBOARDS:');
        console.log('-'.repeat(60));
        topDashboards.forEach((dashboard, index) => {
            console.log(`${index + 1}. ${dashboard.name} (ID: ${dashboard.id}) - Popularity: ${dashboard.popularity}`);
        });

        // Quick access section
        console.log('\n🚀 QUICK ACCESS COMMANDS:');
        console.log('-'.repeat(60));
        console.log('To access any dashboard directly, use:');
        console.log(`https://${domain}/secure/Dashboard.jspa?selectPageId=<DASHBOARD_ID>`);
        console.log();
        console.log('Example URLs:');
        topDashboards.slice(0, 3).forEach((dashboard, index) => {
            console.log(`${index + 1}. ${dashboard.name}:`);
            console.log(`   https://${domain}/secure/Dashboard.jspa?selectPageId=${dashboard.id}`);
        });

        // Export dashboard IDs for scripting
        console.log('\n💾 DASHBOARD IDs FOR SCRIPTING:');
        console.log('-'.repeat(60));
        console.log('const DASHBOARD_IDS = {');
        dashboards.forEach(dashboard => {
            const safeName = dashboard.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            console.log(`  ${safeName}: '${dashboard.id}', // ${dashboard.name}`);
        });
        console.log('};');

    } catch (error) {
        console.error('❌ Error fetching JIRA dashboards:', error);
        if (axios.isAxiosError(error)) {
            console.error('🔍 Response status:', error.response?.status);
            console.error('🔍 Response data:', JSON.stringify(error.response?.data, null, 2));
            
            if (error.response?.status === 401) {
                console.error('🔐 Authentication failed. Please check your JIRA token.');
            } else if (error.response?.status === 403) {
                console.error('🚫 Access denied. You may not have permission to view dashboards.');
            } else if (error.response?.status === 404) {
                console.error('🔍 Dashboard API endpoint not found. Check your JIRA domain.');
            }
        }
        throw error;
    }
}

// ===================================================================
// SCRIPT EXECUTION
// ===================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('📊 JIRA Dashboards Lister');
    console.log('🎯 Listing all available dashboards with IDs');
    console.log('📅 Generated on:', new Date().toLocaleString());
    console.log('=' .repeat(80));
    
    fetchJiraDashboards().catch(error => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}
