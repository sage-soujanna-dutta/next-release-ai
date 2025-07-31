#!/usr/bin/env npx tsx

/**
 * TEST SHORT DATE FORMAT
 * Demonstrates the new short date format functionality
 */

// Test the short date format function
function formatDateShort(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();
    
    // If same month, show "Jul 10 - 23", otherwise "Jul 10 - Aug 23"
    if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}`;
    } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
}

function testDateFormats() {
    console.log('📅 DATE FORMAT COMPARISON TEST');
    console.log('==============================\n');

    const startDate = '2025-07-10T14:00:00.000Z';
    const endDate = '2025-07-23T14:00:00.000Z';

    // Current long format
    const longFormat = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    
    // New short format
    const shortFormat = formatDateShort(startDate, endDate);

    console.log('🔹 CURRENT FORMAT (Long):');
    console.log(`   ${longFormat}`);
    console.log('   Example: "7/10/2025 - 7/23/2025"\n');

    console.log('🔹 NEW FORMAT (Short):');
    console.log(`   ${shortFormat}`);
    console.log('   Example: "Jul 10 - 23"\n');

    console.log('✅ BENEFITS OF SHORT FORMAT:');
    console.log('   - Saves space in Teams notifications');
    console.log('   - Cleaner, more readable format');
    console.log('   - Consistent with professional reporting standards');
    console.log('   - Better for mobile viewing\n');

    // Test cross-month scenario
    const crossMonthStart = '2025-07-28T14:00:00.000Z';
    const crossMonthEnd = '2025-08-10T14:00:00.000Z';
    
    const crossMonthLong = `${new Date(crossMonthStart).toLocaleDateString()} - ${new Date(crossMonthEnd).toLocaleDateString()}`;
    const crossMonthShort = formatDateShort(crossMonthStart, crossMonthEnd);

    console.log('🔹 CROSS-MONTH EXAMPLE:');
    console.log(`   Long:  ${crossMonthLong}`);
    console.log(`   Short: ${crossMonthShort}\n`);

    console.log('🎯 TEAMS NOTIFICATION WILL NOW SHOW:');
    console.log('   Title: 🚀 NDS-FY25-21 - Sprint Report');
    console.log(`   Subtitle: ${shortFormat} | ✅ Completed | 50% Complete`);
    console.log('   Instead of the longer date format\n');

    console.log('✅ Short date format implementation completed!');
}

testDateFormats();
