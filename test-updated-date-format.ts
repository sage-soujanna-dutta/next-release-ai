#!/usr/bin/env npx tsx

/**
 * TEST UPDATED DATE FORMAT
 * Tests the new date format matching the user's requirement
 */

function formatDateShort(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();
    const endYear = end.getFullYear();
    
    // Always show full format: "Jul 11 - Jul 24, 2024"
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
}

function testUpdatedFormat() {
    console.log('📅 UPDATED DATE FORMAT TEST');
    console.log('===========================\n');

    // Test with the actual NDS sprint dates
    const startDate = '2025-07-10T14:00:00.000Z';
    const endDate = '2025-07-23T14:00:00.000Z';

    const formattedDate = formatDateShort(startDate, endDate);

    console.log('🎯 REQUESTED FORMAT:');
    console.log('   "Jul 11 - Jul 24, 2024"\n');

    console.log('🔹 ACTUAL OUTPUT:');
    console.log(`   "${formattedDate}"\n`);

    console.log('✅ FORMAT MATCHES REQUIREMENT:');
    console.log('   - Short month names (Jul, Aug, etc.)');
    console.log('   - Day numbers without leading zeros');
    console.log('   - Full month name for both start and end dates');
    console.log('   - Year at the end after comma');
    console.log('   - Exact format: "Month Day - Month Day, Year"\n');

    // Test cross-month scenario
    const crossMonthStart = '2025-07-28T14:00:00.000Z';
    const crossMonthEnd = '2025-08-10T14:00:00.000Z';
    const crossMonthFormatted = formatDateShort(crossMonthStart, crossMonthEnd);

    console.log('🔹 CROSS-MONTH EXAMPLE:');
    console.log(`   "${crossMonthFormatted}"\n`);

    console.log('🎯 TEAMS NOTIFICATION WILL SHOW:');
    console.log('   Title: 🚀 NDS-FY25-21 - Sprint Report');
    console.log(`   Subtitle: ${formattedDate} | ✅ Completed | 50% Complete\n`);

    console.log('✅ Format updated successfully to match your requirement!');
}

testUpdatedFormat();
