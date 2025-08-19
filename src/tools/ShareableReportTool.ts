import { TeamsService } from '../services/TeamsService.js';
import fs from 'fs';
import path from 'path';

export class ShareableReportTool {
  private teamsService: TeamsService;

  constructor() {
    this.teamsService = new TeamsService();
  }

  async createShareableReport(options: {
    reportType?: 'latest' | 'sprint-review' | 'release-notes';
    customFileName?: string;
    sendToTeams?: boolean;
  } = {}): Promise<{
    originalFile: string;
    shareableFile: string;
    filePath: string;
    fileSize: string;
  }> {
    const { reportType = 'latest', customFileName, sendToTeams = true } = options;
    
    try {
      // Find the most recent report file
      const outputDir = 'output';
      const files = fs.readdirSync(outputDir);
      
      let targetFiles: string[] = [];
      if (reportType === 'sprint-review') {
        targetFiles = files.filter(file => file.includes('review') && file.endsWith('.html'));
      } else if (reportType === 'release-notes') {
        targetFiles = files.filter(file => file.includes('release-notes') && file.endsWith('.html'));
      } else {
        targetFiles = files.filter(file => file.endsWith('.html'));
      }
      
      if (targetFiles.length === 0) {
        throw new Error(`No ${reportType} files found in output directory`);
      }
      
      // Sort by modification time to get the latest
      targetFiles.sort((a, b) => {
        const statA = fs.statSync(path.join(outputDir, a));
        const statB = fs.statSync(path.join(outputDir, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      });
      
      const latestFile = targetFiles[0];
      const filePath = path.join(outputDir, latestFile);
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      
      // Create shareable version
      const shareableFileName = customFileName || `shareable-${latestFile}`;
      const shareableFilePath = path.join(outputDir, shareableFileName);
      
      // Add sharing instructions to HTML
      const enhancedHtml = htmlContent.replace(
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
      
      fs.writeFileSync(shareableFilePath, enhancedHtml, 'utf8');
      const fileStats = fs.statSync(shareableFilePath);
      const fileSize = (fileStats.size / 1024).toFixed(1);
      
      if (sendToTeams) {
        await this.teamsService.sendRichNotification({
          title: '📎 Shareable Report Created',
          summary: `Enhanced ${reportType} report ready for distribution`,
          facts: [
            { name: '📄 Original File', value: latestFile },
            { name: '📤 Shareable File', value: shareableFileName },
            { name: '💾 File Size', value: `${fileSize}KB` },
            { name: '🌐 Compatibility', value: 'All browsers, all platforms' },
            { name: '📤 Best Method', value: 'Upload to Teams Files tab' }
          ]
        });
      }

      console.log(`📄 Created shareable HTML: ${shareableFileName}`);

      return {
        originalFile: latestFile,
        shareableFile: shareableFileName,
        filePath: shareableFilePath,
        fileSize: `${fileSize}KB`
      };

    } catch (error) {
      console.error('❌ Failed to create shareable HTML version:', error);
      throw error;
    }
  }

  async createHtmlAttachmentAlternative(options: {
    htmlFile?: string;
    distributionMethods?: Array<'teams-files' | 'email-attachment' | 'cloud-storage' | 'direct-link'>;
    createDataUrl?: boolean;
  } = {}): Promise<{
    fileName: string;
    fileSize: string;
    filePath: string;
    dataUrl?: string;
  }> {
    const { 
      htmlFile, 
      distributionMethods = ['teams-files', 'email-attachment', 'cloud-storage'], 
      createDataUrl = false 
    } = options;
    
    // Find HTML file
    let filePath: string;
    if (htmlFile) {
      filePath = htmlFile;
    } else {
      // Find the most recent HTML file
      const outputDir = 'output';
      const files = fs.readdirSync(outputDir);
      const htmlFiles = files.filter(file => file.endsWith('.html'))
                             .sort((a, b) => {
                               const statA = fs.statSync(path.join(outputDir, a));
                               const statB = fs.statSync(path.join(outputDir, b));
                               return statB.mtime.getTime() - statA.mtime.getTime();
                             });
      
      if (htmlFiles.length === 0) {
        throw new Error('No HTML files found in output directory');
      }
      
      filePath = path.join(outputDir, htmlFiles[0]);
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`HTML file not found: ${filePath}`);
    }
    
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const fileStats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const fileSize = (fileStats.size / 1024).toFixed(1);
    
    // Create comprehensive Teams message with distribution options
    let content = `## 📎 HTML Report File - Distribution Options

**File:** \`${fileName}\`  
**Size:** ${fileSize}KB  
**Generated:** ${new Date(fileStats.mtime).toLocaleString()}  
**Format:** Professional HTML document with CSS styling

---

## ⚠️ **Teams Webhook Limitation Notice**

Microsoft Teams webhooks don't support direct file attachments. Here are the recommended distribution methods:

---`;

    if (distributionMethods.includes('teams-files')) {
      content += `

## 🥇 **Method 1: Teams Files Tab (Recommended)**
1. Go to your Teams channel
2. Click **Files** tab at the top
3. Click **Upload** and select: \`${fileName}\`
4. Team members can then download and view the HTML file

---`;
    }

    if (distributionMethods.includes('cloud-storage')) {
      content += `

## 🥈 **Method 2: Cloud Storage**
**SharePoint/OneDrive:**
1. Upload \`${fileName}\` to your team's SharePoint site
2. Right-click → **Share** → Copy link
3. Paste the share link in Teams chat

**Google Drive:**
1. Upload the HTML file to Google Drive
2. Right-click → **Get link** → **Anyone with link can view**
3. Share the link with your team

---`;
    }

    if (distributionMethods.includes('email-attachment')) {
      content += `

## 🥉 **Method 3: Email Distribution**
1. Attach \`${fileName}\` to an email
2. Send to team members and stakeholders
3. Recipients can open directly in their browser

---`;
    }

    content += `

## 📊 **File Contains:**
✅ Interactive charts and visualizations  
✅ Professional CSS styling for presentations  
✅ Complete data analysis and metrics  
✅ Print-optimized formatting  
✅ Cross-platform browser compatibility  

## 🔗 **Direct Access Path:**
\`${path.resolve(filePath)}\`

*Copy this path and open in any web browser for immediate access.*

---

**The HTML report is ready for distribution using your preferred method!** 📤✨`;

    let dataUrl: string | undefined;
    if (createDataUrl) {
      const base64Html = Buffer.from(htmlContent).toString('base64');
      dataUrl = `data:text/html;base64,${base64Html}`;
      content += `

## 🔧 **Base64 Data URL** (for developers):
\`data:text/html;base64,${base64Html.substring(0, 100)}...\`
*Full data URL available in response*`;
    }

    await this.teamsService.sendNotification({
      title: "📎 HTML Report - File Attachment Alternative",
      message: content
    });

    // Also send a quick access card
    await this.teamsService.sendRichNotification({
      title: '📎 HTML Report - Quick Access',
      summary: `HTML report ready for sharing: ${fileName}`,
      facts: [
        { name: '📄 File Name', value: fileName },
        { name: '💾 File Size', value: `${fileSize}KB` },
        { name: '📅 Generated', value: new Date(fileStats.mtime).toLocaleString() },
        { name: '🔗 Methods Available', value: distributionMethods.length.toString() },
        { name: '🌐 Compatibility', value: 'All browsers, all platforms' }
      ]
    });

    return {
      fileName,
      fileSize: `${fileSize}KB`,
      filePath: path.resolve(filePath),
      dataUrl
    };
  }
}
