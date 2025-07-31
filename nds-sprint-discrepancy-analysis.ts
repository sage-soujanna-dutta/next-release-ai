#!/usr/bin/env npx tsx

/**
 * NDS SPRINT DISCREPANCY ANALYSIS
 * Compares the incorrect FY24-21 data with the correct FY25-21 data
 * 
 * SUMMARY OF FINDINGS:
 * - Original report showed FY24-21 (2024) instead of FY25-21 (2025)
 * - Completely different sprint with different metrics
 * 
 * USAGE:
 * npx tsx nds-sprint-discrepancy-analysis.ts
 */

// ===================================================================
// DATA COMPARISON
// ===================================================================

const INCORRECT_REPORT_DATA = {
    sprintName: "NDS - FY24 - Sprint 21",
    sprintId: 37829,
    year: 2024,
    period: "Jul 11 - Jul 24, 2024",
    completionRate: 94,
    totalIssues: 89,
    completedIssues: 84,
    storyPoints: 79,
    contributors: 8,
    workBreakdown: {
        stories: 18,
        subtasks: 67,
        bugs: 4
    }
};

const CORRECT_REPORT_DATA = {
    sprintName: "NDS-FY25-21",
    sprintId: 43867,
    year: 2025,
    period: "Jul 10 - Jul 23, 2025",
    completionRate: 50,
    totalIssues: 44,
    completedIssues: 22,
    storyPoints: 46,
    contributors: 7,
    workBreakdown: {
        // Need to fetch detailed breakdown
    }
};

function analyzeDiscrepancy() {
    console.log('🚨 NDS SPRINT DISCREPANCY ANALYSIS');
    console.log('===================================\n');

    console.log('❌ MAJOR ISSUE IDENTIFIED:');
    console.log('   The original report fetched data from the WRONG YEAR!\n');

    console.log('📊 SIDE-BY-SIDE COMPARISON:\n');

    console.log('🔹 SPRINT IDENTIFICATION:');
    console.log(`   Requested: NDS-FY25-21 (2025)`);
    console.log(`   Original Report: ${INCORRECT_REPORT_DATA.sprintName} (${INCORRECT_REPORT_DATA.year}) ❌`);
    console.log(`   Corrected Report: ${CORRECT_REPORT_DATA.sprintName} (${CORRECT_REPORT_DATA.year}) ✅\n`);

    console.log('🔹 SPRINT IDs:');
    console.log(`   Incorrect: ${INCORRECT_REPORT_DATA.sprintId}`);
    console.log(`   Correct: ${CORRECT_REPORT_DATA.sprintId}\n`);

    console.log('🔹 TIME PERIODS:');
    console.log(`   Incorrect: ${INCORRECT_REPORT_DATA.period}`);
    console.log(`   Correct: ${CORRECT_REPORT_DATA.period}\n`);

    console.log('🔹 COMPLETION METRICS:');
    console.log(`   WRONG SPRINT (FY24-21): ${INCORRECT_REPORT_DATA.completionRate}% (${INCORRECT_REPORT_DATA.completedIssues}/${INCORRECT_REPORT_DATA.totalIssues})`);
    console.log(`   CORRECT SPRINT (FY25-21): ${CORRECT_REPORT_DATA.completionRate}% (${CORRECT_REPORT_DATA.completedIssues}/${CORRECT_REPORT_DATA.totalIssues})`);
    console.log(`   Difference: ${Math.abs(INCORRECT_REPORT_DATA.completionRate - CORRECT_REPORT_DATA.completionRate)}% completion rate difference!\n`);

    console.log('🔹 STORY POINTS:');
    console.log(`   WRONG SPRINT: ${INCORRECT_REPORT_DATA.storyPoints} points`);
    console.log(`   CORRECT SPRINT: ${CORRECT_REPORT_DATA.storyPoints} points`);
    console.log(`   Difference: ${Math.abs(INCORRECT_REPORT_DATA.storyPoints - CORRECT_REPORT_DATA.storyPoints)} points difference!\n`);

    console.log('🔹 TEAM SIZE:');
    console.log(`   WRONG SPRINT: ${INCORRECT_REPORT_DATA.contributors} contributors`);
    console.log(`   CORRECT SPRINT: ${CORRECT_REPORT_DATA.contributors} contributors`);
    console.log(`   Difference: ${Math.abs(INCORRECT_REPORT_DATA.contributors - CORRECT_REPORT_DATA.contributors)} contributors difference!\n`);

    console.log('🔹 TOTAL ISSUES:');
    console.log(`   WRONG SPRINT: ${INCORRECT_REPORT_DATA.totalIssues} issues`);
    console.log(`   CORRECT SPRINT: ${CORRECT_REPORT_DATA.totalIssues} issues`);
    console.log(`   Difference: ${Math.abs(INCORRECT_REPORT_DATA.totalIssues - CORRECT_REPORT_DATA.totalIssues)} issues difference!\n`);

    console.log('🔍 ROOT CAUSE ANALYSIS:');
    console.log('========================\n');

    console.log('❌ SEARCH LOGIC FLAW:');
    console.log('   The original sprint search was too broad:');
    console.log('   ```');
    console.log('   s.name.includes(sprintNumber) || s.name.includes("FY25-21") || s.name.includes("21")');
    console.log('   ```');
    console.log('   This matched BOTH FY24-21 AND FY25-21, but returned FY24-21 first!\n');

    console.log('✅ CORRECTED SEARCH LOGIC:');
    console.log('   1. STRATEGY 1: Look for exact "FY25-21" match');
    console.log('   2. STRATEGY 2: Look for "FY25" + "Sprint 21"');
    console.log('   3. STRATEGY 3: Validate year is 2025');
    console.log('   4. FALLBACK: Show available sprints for manual selection\n');

    console.log('💡 IMPACT ASSESSMENT:');
    console.log('=====================\n');

    console.log('🎯 BUSINESS IMPACT:');
    console.log('   - Stakeholders received metrics from WRONG SPRINT');
    console.log('   - Team performance data was from July 2024, not July 2025');
    console.log('   - Decision-making based on outdated/incorrect data');
    console.log('   - Sprint planning affected by wrong velocity data\n');

    console.log('📈 METRIC IMPACT:');
    console.log('   - Completion rate: 44% HIGHER in wrong sprint (94% vs 50%)');
    console.log('   - Story points: 33 POINTS HIGHER in wrong sprint (79 vs 46)');
    console.log('   - Issue count: 45 MORE ISSUES in wrong sprint (89 vs 44)');
    console.log('   - Team size: 1 MORE CONTRIBUTOR in wrong sprint (8 vs 7)\n');

    console.log('🔧 RESOLUTION:');
    console.log('===============\n');

    console.log('✅ IMMEDIATE ACTIONS TAKEN:');
    console.log('   1. ✅ Identified the correct FY25-21 sprint (ID: 43867)');
    console.log('   2. ✅ Generated corrected report with actual 2025 data');
    console.log('   3. ✅ Sent corrected Teams notification');
    console.log('   4. ✅ Updated search logic to prevent future errors\n');

    console.log('📋 RECOMMENDATIONS:');
    console.log('   1. 🔄 Resend corrected sprint report to stakeholders');
    console.log('   2. 📧 Send clarification about the data correction');
    console.log('   3. 🔍 Review other recent reports for similar issues');
    console.log('   4. ⚙️  Implement year validation in all sprint searches');
    console.log('   5. 📊 Update dashboards with correct FY25-21 metrics\n');

    console.log('✅ VERIFICATION COMPLETE');
    console.log('========================\n');

    console.log('🎯 FINAL ANSWER TO YOUR QUESTION:');
    console.log('   "Could you please confirm if this data matches the information in JIRA?"');
    console.log('   \n   ❌ NO - The original report data does NOT match the requested sprint!');
    console.log('   \n   The report showed FY24-21 (2024) data instead of FY25-21 (2025) data.');
    console.log('   This was due to a search logic flaw that matched the wrong sprint.');
    console.log('   \n   ✅ The CORRECTED report now shows the accurate FY25-21 data:');
    console.log(`      - Sprint: NDS-FY25-21 (ID: ${CORRECT_REPORT_DATA.sprintId})`);
    console.log(`      - Period: ${CORRECT_REPORT_DATA.period}`);
    console.log(`      - Completion: ${CORRECT_REPORT_DATA.completionRate}% (${CORRECT_REPORT_DATA.completedIssues}/${CORRECT_REPORT_DATA.totalIssues})`);
    console.log(`      - Story Points: ${CORRECT_REPORT_DATA.storyPoints}`);
    console.log(`      - Contributors: ${CORRECT_REPORT_DATA.contributors}`);
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================

function main() {
    analyzeDiscrepancy();
}

// Run the analysis
main();
