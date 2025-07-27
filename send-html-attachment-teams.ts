#!/usr/bin/env node

import { TeamsService } from './src/services/TeamsService.js';
import fs from 'fs';
import path from 'path';

async function sendHtmlAsAttachmentToTeams() {
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

    if (reviewFiles.length === 0) {
      console.error('❌ No sprint review HTML files found in output directory');
      return;
    }

    const latestFile = reviewFiles[0];
    const filePath = path.join(outputDir, latestFile);
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const fileStats = fs.statSync(filePath);
    const fileSize = (fileStats.size / 1024).toFixed(1);

    console.log(`📄 Processing HTML file: ${latestFile} (${fileSize}KB)`);

    // Extract clean text content from HTML (removing HTML tags)
    const cleanTextContent = htmlContent
      .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove CSS
      .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove JavaScript
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Extract key sections for better formatting
    const extractSection = (content: string, startMarker: string, endMarker: string) => {
      const startIndex = content.indexOf(startMarker);
      if (startIndex === -1) return '';
      const endIndex = content.indexOf(endMarker, startIndex);
      if (endIndex === -1) return content.substring(startIndex);
      return content.substring(startIndex, endIndex);
    };

    // Create base64 encoded version of HTML for potential embedding
    const base64Html = Buffer.from(htmlContent).toString('base64');
    
    // Since Teams webhooks don't support file attachments, we'll create a comprehensive message
    // with the HTML content embedded and multiple sharing options
    
    await teamsService.sendNotification(
      "📎 Sprint Review HTML Report - File Attachment Alternative",
      `
## 📄 **HTML Report File Details**

**File:** \`${latestFile}\`  
**Size:** ${fileSize}KB  
**Generated:** ${new Date(fileStats.mtime).toLocaleString()}  
**Format:** Professional HTML document with CSS styling

---

## ⚠️ **Teams Webhook Limitation Notice**

Microsoft Teams webhooks don't support direct file attachments. Here are alternative methods to share the HTML report:

---

## 🔗 **Method 1: Direct File Access**
**Local Path:** \`${path.resolve(filePath)}\`  
**Usage:** Copy this path and open in any web browser

\`\`\`
file://${path.resolve(filePath)}
\`\`\`

---

## 📧 **Method 2: Email Attachment**
- Attach the HTML file to an email
- Send to team members who need access
- Recipients can open directly in browser

---

## ☁️ **Method 3: Cloud Storage Upload**
- Upload \`${latestFile}\` to SharePoint, OneDrive, or Google Drive
- Share the cloud link in Teams chat
- Team members can download and view

---

## 💾 **Method 4: HTML Content Preview**
Here's a preview of the report content (text-only):

\`\`\`
${cleanTextContent.length > 2000 ? cleanTextContent.substring(0, 2000) + '...\n\n[Content truncated - full HTML file contains complete formatting, charts, and styling]' : cleanTextContent}
\`\`\`

---

## 🎯 **Recommended Actions**

### **For Immediate Access:**
1. Copy the file path above and open in browser
2. Right-click → "Open with" → Your preferred browser

### **For Team Sharing:**
1. Upload HTML file to your team's SharePoint site
2. Create a shared folder link
3. Post the link in this Teams channel

### **For Presentations:**
1. Open HTML file in browser
2. Use browser's "Print to PDF" feature
3. Share PDF version as needed

---

## 📊 **File Contains:**
✅ Interactive sprint performance dashboards  
✅ Velocity trend charts and analysis  
✅ Complete issue breakdowns by type/priority  
✅ Risk assessment and recommendations  
✅ Professional CSS styling for presentations  
✅ Print-optimized formatting  

---

## 🔧 **Alternative: Base64 Embedded Version**

If you need the HTML content in a shareable format, here's the base64 encoded version:

\`\`\`
data:text/html;base64,${base64Html.length > 1000 ? base64Html.substring(0, 1000) + '...' : base64Html}
\`\`\`

*Note: Full base64 encoding available in the actual file*

---

## 🚀 **Next Steps**

1. **Access Report:** Use file path to open HTML report
2. **Share with Team:** Choose preferred sharing method above
3. **Review Content:** Use for sprint retrospectives and planning
4. **Archive:** Save for historical performance tracking

**The HTML report is ready - choose your preferred access method!** 📊✨

*Teams webhook limitations prevent direct file attachments, but multiple access methods are available.*
      `
    );

    // Also create a data URL version that can be opened directly
    const dataUrl = `data:text/html;base64,${base64Html}`;
    
    // Send a second message with actionable links
    await teamsService.sendRichNotification({
      title: "📎 Sprint Review HTML - Access Options",
      summary: `Multiple ways to access ${latestFile}`,
      facts: [
        { name: "📄 File Name", value: latestFile },
        { name: "💾 File Size", value: `${fileSize}KB` },
        { name: "📅 Generated", value: new Date(fileStats.mtime).toLocaleString() },
        { name: "🔗 Access Methods", value: "Local file, Cloud upload, Browser data URL" },
        { name: "📊 Content Type", value: "Interactive HTML with CSS styling" },
        { name: "🎯 Use Case", value: "Sprint retrospective and stakeholder presentation" }
      ]
    });

    console.log('✅ HTML report sharing options sent to Teams!');
    console.log('📄 File path for local access:');
    console.log(`   ${path.resolve(filePath)}`);
    console.log('🔗 Data URL created for browser access');
    console.log('📧 Alternative sharing methods provided');

  } catch (error) {
    console.error('❌ Failed to send HTML attachment alternatives:', error);
    throw error;
  }
}

sendHtmlAsAttachmentToTeams().catch(console.error);
