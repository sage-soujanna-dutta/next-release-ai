#!/usr/bin/env node

import { TeamsService } from './src/services/TeamsService.js';
import { FileService } from './src/services/FileService.js';
import fs from 'fs';
import path from 'path';

async function sendSprintReviewHtmlToTeams() {
  const teamsService = new TeamsService();
  const fileService = new FileService();
  
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

    if (reviewFiles.length === 0) {
      console.error('❌ No sprint review HTML files found in output directory');
      return;
    }

    const latestFile = reviewFiles[0];
    const filePath = path.join(outputDir, latestFile);
    const fileStats = fs.statSync(filePath);
    const fileSize = (fileStats.size / 1024).toFixed(1); // Size in KB

    console.log(`📄 Found sprint review file: ${latestFile} (${fileSize}KB)`);

    // Read the HTML content to extract key information
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract title and key metrics from HTML
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Sprint Review Report';
    
    // Extract sprints being analyzed
    const sprintsMatch = htmlContent.match(/Sprints: (.*?)<\/h2>/);
    const sprints = sprintsMatch ? sprintsMatch[1] : 'Multiple Sprints';

    // Create an absolute file path for potential file serving
    const absolutePath = path.resolve(filePath);
    
    // Send rich notification to Teams
    await teamsService.sendRichNotification({
      title: "📊 Sprint Review Report - HTML Document Ready",
      summary: `Comprehensive sprint review report generated: ${title}`,
      facts: [
        { name: "📄 Document", value: latestFile },
        { name: "📊 Analysis Scope", value: sprints },
        { name: "💾 File Size", value: `${fileSize}KB` },
        { name: "📅 Generated", value: new Date(fileStats.mtime).toLocaleString() },
        { name: "📁 Location", value: "output/" + latestFile },
        { name: "🔍 Content", value: "Velocity trends, completion rates, risk analysis" }
      ],
      actions: [
        {
          name: "📂 View File Location",
          url: `file://${absolutePath}`
        }
      ]
    });

    // Also send a detailed summary with HTML content preview
    const contentPreview = htmlContent.length > 500 ? htmlContent.substring(0, 500) + '...' : htmlContent;
    
    await teamsService.sendNotification(
      "📊 Sprint Review Report - HTML Content Available",
      `
## 📄 **Sprint Review Report Generated**

**File:** \`${latestFile}\`  
**Size:** ${fileSize}KB  
**Location:** \`output/${latestFile}\`  
**Generated:** ${new Date(fileStats.mtime).toLocaleString()}

---

## 📋 **Report Contents**
This comprehensive HTML report includes:

✅ **Executive Dashboard** - Key performance indicators and metrics  
✅ **Sprint Analysis** - Detailed breakdown for ${sprints}  
✅ **Velocity Trends** - Historical performance tracking  
✅ **Issue Breakdown** - Complete analysis by type and priority  
✅ **Risk Assessment** - Identified factors and recommendations  
✅ **Visual Charts** - Professional formatting with CSS styling  

---

## 🎯 **Key Features**
- **Interactive Design:** Professional HTML layout with responsive styling
- **Comprehensive Data:** All JIRA issues analyzed with story points
- **Trend Analysis:** Historical velocity comparison and projections
- **Executive Ready:** Suitable for stakeholder presentations
- **Audit Trail:** Complete documentation of sprint performance

---

## 📱 **How to Access**
1. **Local Access:** Open file from \`${absolutePath}\`
2. **Web Browser:** File can be opened in any modern browser
3. **Share:** HTML file can be shared via email or collaboration tools
4. **Print:** Report is print-optimized for physical distribution

---

## 🔄 **Next Steps**
- Review the comprehensive analysis in the HTML report
- Share with stakeholders and team leads
- Use insights for sprint retrospectives and planning
- Archive for historical performance tracking

**The detailed HTML sprint review report is ready for use!** 📊✨
      `
    );

    console.log(`✅ Sprint review HTML report notification sent to Teams!`);
    console.log(`📄 File: ${latestFile}`);
    console.log(`💾 Size: ${fileSize}KB`);
    console.log(`📁 Path: ${absolutePath}`);

  } catch (error) {
    console.error('❌ Failed to send HTML report to Teams:', error);
    throw error;
  }
}

sendSprintReviewHtmlToTeams().catch(console.error);
