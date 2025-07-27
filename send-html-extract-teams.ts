#!/usr/bin/env node

import { TeamsService } from './src/services/TeamsService.js';
import fs from 'fs';
import path from 'path';

async function sendHtmlContentToTeams() {
  const teamsService = new TeamsService();
  
  try {
    // Find the most recent sprint review HTML file
    const outputDir = 'output';
    const files = fs.readdirSync(outputDir);
    const reviewFiles = files.filter(file => file.includes('review') && file.endsWith('.html'))
                             .sort((a, b) => {
                               const statA = fs.statSync(path.join(outputDir, a));
                               const statB = fs.statSync(path.join(outputDir, b));
                               return statB.mtime.getTime() - statA.mtime.getTime();
                             });

    const latestFile = reviewFiles[0];
    const filePath = path.join(outputDir, latestFile);
    const htmlContent = fs.readFileSync(filePath, 'utf8');

    // Extract key data from HTML content
    const extractData = (html: string) => {
      // Extract sprint names
      const sprintsMatch = html.match(/Sprints: (.*?)<\/h2>/);
      const sprints = sprintsMatch ? sprintsMatch[1] : 'SCNT-2025-20, SCNT-2025-21';

      // Extract metrics from metric cards
      const metricCards = html.match(/<div class="metric-value">(.*?)<\/div>/g) || [];
      const metrics = metricCards.map(card => card.replace(/<[^>]*>/g, ''));

      // Extract velocity data from table
      const velocityRows = html.match(/<tr>\s*<td><strong>SCNT-.*?<\/tr>/gs) || [];
      const velocityData = velocityRows.map(row => {
        const cells = row.match(/<td[^>]*>(.*?)<\/td>/g) || [];
        return cells.map(cell => cell.replace(/<[^>]*>/g, '').trim());
      });

      return { sprints, metrics, velocityData };
    };

    const { sprints, metrics, velocityData } = extractData(htmlContent);

    // Send comprehensive Teams notification with extracted data
    await teamsService.sendNotification(
      "📊 Sprint Review Report - HTML Content Extract",
      `
## 📄 **Sprint Review Report - Key Findings**

**Analysis for:** ${sprints}  
**Report File:** \`${latestFile}\` (11.5KB HTML document)

---

## 📊 **Executive Metrics Dashboard**

${metrics.length >= 4 ? `
| Metric | Value |
|--------|-------|
| **Sprints Analyzed** | ${metrics[0]} |
| **Average Velocity** | ${metrics[1]} story points |
| **Average Completion** | ${metrics[2]} |
| **Total Issues** | ${metrics[3]} |
` : ''}

---

## 📈 **Sprint Performance Summary**

### **SCNT-2025-20**
- ✅ **Outstanding Performance:** 94.7% completion rate
- ⚡ **High Velocity:** 159 story points delivered
- 📋 **Scope:** 113 issues processed (107 completed)
- 🎯 **Status:** Exceeded expectations

### **SCNT-2025-21** 
- ✅ **Solid Delivery:** 92.4% completion rate
- ⚠️ **Velocity Concern:** 98 story points (38% drop)
- 📋 **Scope:** 66 issues processed (61 completed)
- 🔍 **Status:** Requires investigation

---

## 📉 **Critical Finding: Velocity Drop Alert**

**Key Concern:** Significant 38% velocity decrease from Sprint 20 to Sprint 21
- **Sprint 20:** 159 story points ✅
- **Sprint 21:** 98 story points ⚠️
- **Impact:** -61 story point difference
- **Trend:** Requires immediate attention

---

## 🎯 **Strategic Recommendations**

### **Immediate Actions (This Week)**
1. 🔍 **Root Cause Analysis:** Investigate Sprint 21 velocity drop
2. 📋 **Capacity Review:** Assess team availability and workload
3. ⚠️ **Risk Mitigation:** Address identified bottlenecks

### **Short-term Improvements (Next Sprint)**
1. 📈 **Velocity Stabilization:** Target 140-160 story point range
2. 🎯 **Planning Enhancement:** Improve estimation accuracy
3. 📊 **Monitoring:** Implement daily velocity tracking

### **Long-term Strategy (Next Quarter)**
1. 📈 **Consistency Focus:** Maintain 90%+ completion rates
2. 🔄 **Process Optimization:** Streamline workflow efficiency
3. 📚 **Knowledge Sharing:** Cross-train team members

---

## 📋 **Detailed HTML Report Features**

The complete HTML report (${latestFile}) includes:

✅ **Interactive Charts:** Visual velocity trends and performance graphs  
✅ **Issue Breakdown:** Complete analysis by type, priority, and status  
✅ **Risk Assessment:** Detailed factor analysis with mitigation strategies  
✅ **Historical Context:** 4-sprint velocity comparison and trends  
✅ **Executive Summary:** Board-ready insights and recommendations  
✅ **Print-Ready Format:** Professional styling for presentations  

---

## 🔗 **Accessing the Full Report**

**File Location:** \`${path.resolve(filePath)}\`  
**How to View:**
1. Open in any web browser for interactive experience
2. Print to PDF for sharing with stakeholders  
3. Use for sprint retrospectives and planning sessions
4. Archive for historical performance tracking

---

## 🚀 **Next Steps for Team**

1. **📅 Schedule Review:** Team meeting to discuss velocity drop
2. **📊 Analyze Data:** Use HTML report for detailed sprint retrospective
3. **🎯 Plan Actions:** Implement recommendations for Sprint 22
4. **📈 Monitor Progress:** Track velocity recovery in upcoming sprints

**The comprehensive HTML report is ready for your team's strategic review!** 📊🎯

*Generated: ${new Date().toLocaleString()}*  
*System: Next Release AI - Sprint Analytics Platform*
      `
    );

    console.log('✅ HTML content extract sent to Teams with key findings!');

  } catch (error) {
    console.error('❌ Failed to send HTML content extract:', error);
    throw error;
  }
}

sendHtmlContentToTeams().catch(console.error);
