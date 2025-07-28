import ProfessionalTeamsTemplateService from './src/services/ProfessionalTeamsTemplateService';

async function testMultiSprintEnhancedDesign() {
    console.log('🚀 Testing Enhanced Design with Multiple Sprints...');
    
    try {
        const teamsService = new ProfessionalTeamsTemplateService();
        
        // Test 1: Combined Sprint Report (SCNT-2025-19 & SCNT-2025-20)
        console.log('📊 Creating combined sprint report for SCNT-2025-19 & SCNT-2025-20...');
        
        const combinedSprintData = {
            sprintId: 'SCNT-2025-19 & SCNT-2025-20',
            period: 'Jul 1 - Jul 28, 2025',
            status: 'Completed',
            completionRate: 96,
            completedIssues: 421,
            totalIssues: 438,
            storyPoints: 698,
            contributors: 12,
            commits: 467,
            duration: '4 weeks',
            startDate: '2025-07-01',
            endDate: '2025-07-28',
            reportDate: new Date().toISOString(),
            velocity: 349, // Average velocity
            previousSprintComparison: {
                completionRate: 92,
                velocity: 285,
                trend: 'increasing' as const
            },
            topContributors: [
                // Combined contributions across SCNT-2025-19 & SCNT-2025-20
                { name: 'Sarah Chen', commits: 89, pointsCompleted: 112, issuesResolved: 34 },
                { name: 'Michael Rodriguez', commits: 83, pointsCompleted: 98, issuesResolved: 28 },
                { name: 'Elena Kowalski', commits: 76, pointsCompleted: 89, issuesResolved: 26 },
                { name: 'David Thompson', commits: 71, pointsCompleted: 82, issuesResolved: 24 },
                { name: 'Priya Sharma', commits: 68, pointsCompleted: 76, issuesResolved: 22 }
            ],
            riskAssessment: {
                level: 'medium' as const,
                issues: [
                    'Resource allocation challenges across two concurrent sprints',
                    'Integration complexity between sprint deliverables',
                    'Technical debt accumulation requiring attention'
                ],
                mitigation: [
                    'Implement cross-sprint coordination meetings',
                    'Create unified integration testing framework',
                    'Allocate 20% of next sprint to technical debt resolution'
                ]
            },
            performanceInsights: {
                strengths: [
                    'Consistent high performance across both sprints (96% avg)',
                    'Strong velocity improvement (+22% over 4 weeks)',
                    'Excellent cross-team collaboration and knowledge sharing',
                    'Robust delivery pipeline handling increased load'
                ],
                improvements: [
                    'Standardize cross-sprint communication protocols',
                    'Optimize resource allocation for peak periods',
                    'Enhance automated testing for multi-sprint features'
                ],
                trends: [
                    'Velocity trending upward consistently',
                    'Team satisfaction maintaining high levels (4.3/5.0)',
                    'Code quality metrics improving despite increased pace',
                    'Cross-functional collaboration effectiveness increasing'
                ]
            }
        };
        
        const combinedWorkBreakdown = {
            userStories: { count: 265, percentage: 63 },
            bugFixes: { count: 96, percentage: 23 },
            tasks: { count: 35, percentage: 8 },
            epics: { count: 15, percentage: 4 },
            improvements: { count: 10, percentage: 2 }
        };
        
        const combinedPriorityData = {
            critical: { resolved: 8, total: 8 },
            high: { resolved: 34, total: 36 },
            medium: { resolved: 189, total: 195 },
            low: { resolved: 185, total: 194 },
            blockers: { resolved: 5, total: 5 }
        };
        
        const combinedActionItems = [
            {
                role: 'Development Team',
                action: 'Complete integration testing for all multi-sprint features',
                timeline: 'Sprint 21 Week 1',
                priority: 'critical'
            },
            {
                role: 'Product Owner',
                action: 'Review and validate cross-sprint feature dependencies',
                timeline: 'Before Sprint 21 planning',
                priority: 'high'
            },
            {
                role: 'DevOps Team',
                action: 'Optimize deployment pipeline for multi-sprint releases',
                timeline: 'Sprint 21 Week 2',
                priority: 'high'
            }
        ];
        
        const combinedAchievements = [
            {
                title: 'Multi-Sprint Feature Integration Success',
                description: 'Successfully coordinated and delivered complex features spanning both sprints',
                impact: 'Enabled advanced user workflows and improved product capabilities significantly',
                metrics: '15 integrated features, 0 critical integration bugs, 98% feature compatibility'
            },
            {
                title: 'Performance Optimization Across Sprints',
                description: 'Implemented systematic performance improvements affecting core system components',
                impact: 'Achieved 35% overall system performance improvement and better user experience',
                metrics: 'API response time: 180ms → 117ms, Page load time: 2.1s → 1.4s'
            },
            {
                title: 'Cross-Team Collaboration Excellence',
                description: 'Demonstrated outstanding coordination between multiple teams across both sprints',
                impact: 'Set new standard for multi-sprint project execution and team efficiency',
                metrics: '12 teams coordinated, 4.3/5.0 satisfaction score, 0 major communication gaps'
            }
        ];
        
        console.log('📨 Sending combined sprint report...');
        
        const combinedNotificationData = {
            type: 'sprint-report' as const,
            title: `🏆 Combined Sprint Report: SCNT-2025-19 & SCNT-2025-20`,
            subtitle: `${combinedSprintData.period} | ${combinedSprintData.status} | ${combinedSprintData.completionRate}% Complete`,
            priority: 'high' as const,
            sprintData: combinedSprintData,
            workBreakdown: combinedWorkBreakdown,
            priorityData: combinedPriorityData,
            actionItems: combinedActionItems,
            achievements: combinedAchievements,
            customContent: `
## 🎯 Multi-Sprint Executive Summary

This combined report covers **4 weeks of exceptional performance** across two major sprints, demonstrating our team's ability to handle complex, multi-sprint initiatives while maintaining high quality standards.

### 🌟 Combined Sprint Highlights:
- **🏆 Outstanding Multi-Sprint Performance**: 96% average completion rate (421/438 issues)
- **📈 Significant Velocity Growth**: 22% improvement over the period (698 total points)
- **🤝 Cross-Sprint Coordination**: Seamless integration of 15 complex features
- **👥 Expanded Team Collaboration**: 12 contributors working in perfect harmony
- **🔧 System Performance Boost**: 35% overall performance improvement
- **📊 Consistent Quality**: Zero critical integration bugs across both sprints

### 🚀 Multi-Sprint Key Deliverables:
- Complex feature integrations spanning both sprints
- Systematic performance optimizations
- Enhanced cross-team collaboration frameworks
- Robust testing infrastructure improvements
- Technical debt reduction initiatives

**Strategic Impact**: This multi-sprint execution demonstrates our capability to handle large-scale, coordinated initiatives while maintaining quality and team satisfaction.
            `
        };
        
        await teamsService.sendNotification(combinedNotificationData);
        
        console.log('✅ Combined sprint report sent successfully!');
        console.log('🎉 Enhanced design works perfectly for multi-sprint reports!');
        console.log('\n📊 Multi-Sprint Summary:');
        console.log(`   📈 Combined Completion Rate: ${combinedSprintData.completionRate}% (${combinedSprintData.completedIssues}/${combinedSprintData.totalIssues} issues)`);
        console.log(`   🚀 Total Story Points: ${combinedSprintData.storyPoints} points delivered`);
        console.log(`   👥 Team: ${combinedSprintData.contributors} contributors`);
        console.log(`   💻 Activity: ${combinedSprintData.commits} commits`);
        console.log(`   📊 Velocity Improvement: +22% over 4 weeks`);
        console.log(`   ⚠️ Risk Level: ${combinedSprintData.riskAssessment.level.toUpperCase()}`);
        
        console.log('\n🎯 Enhanced Features in Multi-Sprint Context:');
        console.log('   ✨ Action items scaled appropriately for longer timeframe');
        console.log('   🏆 Achievements reflect multi-sprint coordination');
        console.log('   📊 Velocity shows combined sprint trends');
        console.log('   📈 Comparison data provides meaningful context');
        console.log('   ⚠️ Risk assessment covers multi-sprint challenges');
        console.log('   🌟 Top contributors show cumulative performance');
        console.log('   📋 Performance insights reflect broader trends');
        console.log('   🎯 Strategic recommendations address multi-sprint learnings');
        
    } catch (error) {
        console.error('❌ Error testing multi-sprint enhanced design:', error);
        throw error;
    }
}

// Execute the multi-sprint test
testMultiSprintEnhancedDesign().catch(console.error);
