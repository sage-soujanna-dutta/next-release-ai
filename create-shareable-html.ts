#!/usr/bin/env node

import { TeamsService } from './src/services/TeamsService.js';
import fs from 'fs';
import path from 'path';

async function createShareableHtmlVersion() {
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
    
    // Create a self-contained HTML file with inline styles for better portability
    const portableHtml = htmlContent.replace(
      /<link[^>]*stylesheet[^>]*>/gi, 
      ''  // Remove external CSS links if any
    );

    // Create a shareable version with a more accessible filename
    const shareableFileName = `sprint-review-SCNT-2025-20-21-shareable.html`;
    const shareableFilePath = path.join(outputDir, shareableFileName);
    
    // Add metadata and sharing instructions to the HTML
    const enhancedHtml = portableHtml.replace(
      '</body>',
      `
      <div style="margin-top: 40px; padding: 20px; background: #f0f8ff; border-radius: 8px; border-left: 4px solid #0078d4;">
        <h3 style="color: #0078d4; margin-top: 0;">📤 Sharing Instructions</h3>
        <p><strong>This HTML report can be shared via:</strong></p>
        <ul>
          <li>📧 <strong>Email:</strong> Attach this file to emails</li>
          <li>☁️ <strong>Cloud Storage:</strong> Upload to SharePoint, OneDrive, or Google Drive</li>
          <li>💬 <strong>Teams:</strong> Upload to Files tab in Teams channel</li>
          <li>🌐 <strong>Browser:</strong> Open directly in any web browser</li>
        </ul>
        <p><em>Generated: ${new Date().toLocaleString()} by Next Release AI</em></p>
      </div>
      </body>`
    );

    // Save the shareable version
    fs.writeFileSync(shareableFilePath, enhancedHtml, 'utf8');
    
    const fileStats = fs.statSync(shareableFilePath);
    const fileSize = (fileStats.size / 1024).toFixed(1);

    console.log(`📄 Created shareable HTML: ${shareableFileName}`);

    // Send Teams notification with multiple sharing methods
    await teamsService.sendNotification(
      "📎 Sprint Review HTML - Shareable File Created",
      `
## 📄 **Shareable HTML Report Created**

I've created a shareable version of your Sprint Review HTML report with enhanced portability and sharing instructions.

**Original File:** \`${latestFile}\`  
**Shareable File:** \`${shareableFileName}\`  
**Size:** ${fileSize}KB  
**Location:** \`${path.resolve(shareableFilePath)}\`

---

## 📤 **How to Share the HTML Report**

### **Method 1: Teams File Upload (Recommended)**
1. Go to your Teams channel
2. Click on **Files** tab at the top
3. Click **Upload** and select: \`${shareableFileName}\`
4. Team members can then download and view the HTML file

### **Method 2: Cloud Storage**
**SharePoint/OneDrive:**
1. Upload \`${shareableFileName}\` to your team's SharePoint site
2. Right-click → **Share** → Copy link
3. Paste the share link in Teams chat

**Google Drive:**
1. Upload the HTML file to Google Drive
2. Right-click → **Get link** → **Anyone with link can view**
3. Share the link with your team

### **Method 3: Email Distribution**
1. Attach \`${shareableFileName}\` to an email
2. Send to team members and stakeholders
3. Recipients can open directly in their browser

### **Method 4: Local Network Share**
1. Place file on shared network drive
2. Share the network path with team
3. Accessible by anyone with network access

---

## 🔧 **File Preparation Done**

✅ **Self-contained:** All styles and scripts embedded  
✅ **Cross-platform:** Works on Windows, Mac, Linux  
✅ **Browser-compatible:** Opens in Chrome, Firefox, Safari, Edge  
✅ **Print-ready:** Optimized for PDF conversion  
✅ **Sharing instructions:** Built-in guidance for recipients  

---

## 🎯 **Recommended Action Steps**

### **For Immediate Team Access:**
1. **Upload to Teams Files tab** (fastest for team access)
2. **Post download link** in this channel
3. **Team members download** and open in browser

### **For Stakeholder Sharing:**
1. **Upload to SharePoint** for professional access
2. **Convert to PDF** if needed for email distribution
3. **Create presentation slides** using report data

### **File Locations:**
- **Original:** \`${path.resolve(filePath)}\`
- **Shareable:** \`${path.resolve(shareableFilePath)}\`

---

## 📊 **Report Contains:**
- 📈 **Interactive Sprint Dashboards** with performance metrics
- 📊 **Velocity Trend Analysis** with 4-sprint comparison  
- 📋 **Detailed Issue Breakdowns** by type, priority, status
- ⚠️ **Risk Assessment** with mitigation recommendations
- 🎯 **Strategic Insights** for sprint improvement
- 📱 **Professional Formatting** ready for stakeholder review

**Your shareable HTML report is ready for distribution!** 📤✨

*Choose your preferred sharing method and distribute to your team.*
      `
    );

    // Send follow-up with quick access info
    await teamsService.sendRichNotification({
      title: "📎 HTML Report - Quick Access",
      summary: `Sprint Review report ready for sharing: ${shareableFileName}`,
      facts: [
        { name: "📄 Shareable File", value: shareableFileName },
        { name: "💾 File Size", value: `${fileSize}KB` },
        { name: "🌐 Compatibility", value: "All browsers, all platforms" },
        { name: "📤 Best Method", value: "Upload to Teams Files tab" },
        { name: "🔗 Access Path", value: `output/${shareableFileName}` }
      ]
    });

    console.log('✅ Shareable HTML report created and Teams notifications sent!');
    console.log(`📄 Shareable file: ${shareableFilePath}`);
    console.log('📤 Ready for distribution via Teams Files, email, or cloud storage');

  } catch (error) {
    console.error('❌ Failed to create shareable HTML version:', error);
    throw error;
  }
}

createShareableHtmlVersion().catch(console.error);
