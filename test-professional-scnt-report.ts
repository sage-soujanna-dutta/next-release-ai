#!/usr/bin/env npx tsx

/**
 * TEST SCNT PROFESSIONAL REPORT - SIMPLIFIED VERSION
 * Testing with smaller content to ensure delivery
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { ProfessionalTeamsTemplateService, SprintData, WorkBreakdown, PriorityBreakdown, TeamNotificationData } from './src/services/ProfessionalTeamsTemplateService.js';

dotenv.config();

async function sendTestProfessionalReport() {
    try {
        console.log('🧪 Testing simplified professional SCNT report...');
        
        const teamsService = new ProfessionalTeamsTemplateService();
        
        // Simple test data
        const sprintData: SprintData = {
            sprintId: 'SCNT-2025-21',
            period: 'Jul 9 - Jul 22, 2025',
            completionRate: 89,
            totalIssues: 66,
            completedIssues: 59,
            storyPoints: 102,
            commits: 213,
            contributors: 16,
            status: 'Completed',
            startDate: '2025-07-09',
            endDate: '2025-07-22',
            duration: '2 weeks',
            reportDate: new Date().toISOString(),
            velocity: 102,
            previousSprintComparison: {
                completionRate: 95,
                velocity: 220,
                trend: 'decreasing' as const
            },
            topContributors: [
                { name: 'Sapan Namdeo', commits: 29, pointsCompleted: 15, issuesResolved: 14 },
                { name: 'Rajesh Kumar', commits: 19, pointsCompleted: 10, issuesResolved: 9 },
                { name: 'Manish B S', commits: 17, pointsCompleted: 8, issuesResolved: 8 }
            ]
        };

        const workBreakdown: WorkBreakdown = {
            userStories: { count: 14, percentage: 21 },
            bugFixes: { count: 19, percentage: 29 },
            tasks: { count: 23, percentage: 35 },
            epics: { count: 10, percentage: 15 },
            improvements: { count: 0, percentage: 0 }
        };

        const priorityBreakdown: PriorityBreakdown = {
            critical: { total: 0, resolved: 0 },
            high: { total: 9, resolved: 8 },
            medium: { total: 51, resolved: 45 },
            low: { total: 6, resolved: 6 },
            blockers: { total: 0, resolved: 0 }
        };

        const notificationData: TeamNotificationData = {
            type: 'sprint-report',
            title: 'SCNT-2025-21 - Professional Sprint Report (Test)',
            subtitle: 'Jul 9 - Jul 22, 2025 | ✅ Completed | 89% Complete',
            priority: 'normal',
            sprintData,
            workBreakdown,
            priorityData: priorityBreakdown,
            customContent: `
## 🧪 Test Report - SCNT-2025-21

This is a simplified test version of the professional sprint report.

### Key Metrics:
- **Completion**: 89% (59/66 tickets)
- **Story Points**: 102 delivered
- **Contributors**: 16 team members
- **Development Activity**: 213 commits

If you can see this message, the professional template is working correctly.
            `
        };

        await teamsService.sendNotification(notificationData);
        
        console.log('✅ Test professional report sent successfully!');
        console.log('📧 Please check your Teams channel for the test message.');
        
    } catch (error) {
        console.error('❌ Error sending test report:', error);
        if (axios.isAxiosError(error)) {
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
        }
    }
}

sendTestProfessionalReport();
