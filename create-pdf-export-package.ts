#!/usr/bin/env npx tsx

/**
 * PDF Generation Guide and Browser-Based PDF Export
 * Provides instructions for converting HTML reports to PDF
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PDFGenerationOptions {
  format: 'A4' | 'Letter' | 'A3';
  orientation: 'portrait' | 'landscape';
  quality: 'high' | 'medium' | 'low';
}

class PDFExportGuide {
  private static readonly SUPPORTED_METHODS = [
    'browser-print',
    'puppeteer',
    'wkhtmltopdf',
    'chrome-headless'
  ];

  /**
   * Browser-based PDF conversion (Recommended)
   */
  static generateBrowserPDFInstructions(htmlPath: string): string {
    return `
🌐 BROWSER PDF CONVERSION (Recommended - No Installation Required)
═══════════════════════════════════════════════════════════════════

📄 HTML Report: ${htmlPath}

🔧 CONVERSION STEPS:
1. Open the HTML file in Google Chrome or Safari
2. Press Ctrl+P (Windows/Linux) or Cmd+P (Mac) to open Print dialog
3. Choose "Save as PDF" as the destination
4. Configure PDF settings:
   - Paper Size: A4 or Letter
   - Margins: Minimum
   - Options: ✅ Background graphics
   - Scale: 100% or fit to page
5. Click "Save" and choose location

📊 OPTIMAL SETTINGS FOR EXECUTIVE REPORTS:
- Paper Size: A4 (210 × 297 mm)
- Orientation: Portrait
- Margins: Minimum (for full content)
- Background Graphics: ENABLED (preserves colors/gradients)
- Scale: 100% (maintains professional layout)

🎯 RESULT: High-quality PDF ready for executive presentation!
    `;
  }

  /**
   * Advanced PDF generation with Puppeteer
   */
  static generatePuppeteerInstructions(): string {
    return `
🤖 ADVANCED PDF GENERATION WITH PUPPETEER
═══════════════════════════════════════════

📦 INSTALLATION:
npm install puppeteer

💻 USAGE CODE:
\`\`\`typescript
import puppeteer from 'puppeteer';

async function generatePDF(htmlPath: string, outputPath: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
  });
  
  await browser.close();
}
\`\`\`

🎯 FEATURES:
- Automated PDF generation
- Programmatic control
- Batch processing capability
- Custom page settings
    `;
  }

  /**
   * Chrome headless PDF generation
   */
  static generateChromeHeadlessInstructions(): string {
    return `
🚀 CHROME HEADLESS PDF GENERATION
═══════════════════════════════════

💻 COMMAND LINE USAGE:
google-chrome --headless --disable-gpu --print-to-pdf=output.pdf --no-margins file://path/to/report.html

🔧 SCRIPT VERSION:
\`\`\`bash
#!/bin/bash
HTML_FILE="$1"
OUTPUT_FILE="$2"
google-chrome --headless --disable-gpu --print-to-pdf="$OUTPUT_FILE" \
  --no-margins --print-to-pdf-no-header "$HTML_FILE"
\`\`\`

📊 ADVANTAGES:
- No additional dependencies
- Uses system Chrome
- Command-line automation
- High fidelity output
    `;
  }

  /**
   * Generate comprehensive PDF export guide
   */
  static generateCompleteGuide(htmlPath: string): string {
    const guide = `
📄 COMPREHENSIVE PDF EXPORT GUIDE
═══════════════════════════════════════════════════════════════════

🎯 EXECUTIVE SPRINT REPORT PDF CONVERSION
Generated HTML Report: ${htmlPath}

${this.generateBrowserPDFInstructions(htmlPath)}

${this.generatePuppeteerInstructions()}

${this.generateChromeHeadlessInstructions()}

🛠️ ALTERNATIVE METHODS:
═══════════════════════════

1. 🌐 ONLINE PDF CONVERTERS:
   - HTML to PDF websites (upload HTML file)
   - Maintains formatting and styling
   - No software installation required

2. 📱 MOBILE BROWSERS:
   - Open HTML in mobile Chrome/Safari
   - Use "Share" > "Print" > "Save as PDF"
   - Perfect for quick conversions

3. 🖥️ DESKTOP APPLICATIONS:
   - Microsoft Edge: Built-in PDF export
   - Firefox: Print to PDF function
   - LibreOffice: Import HTML, export PDF

📊 QUALITY COMPARISON:
═══════════════════════

Method              | Quality | Ease | Speed | Features
--------------------|---------|------|-------|----------
Browser Print       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐
Puppeteer          | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐
Chrome Headless    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐
Online Converters  | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐

🏆 RECOMMENDATION: Start with Browser Print method for immediate results!
    `;

    return guide;
  }

  /**
   * Create PDF export instructions file
   */
  static createExportInstructions(htmlPath: string): string {
    const guide = this.generateCompleteGuide(htmlPath);
    const instructionsPath = htmlPath.replace('.html', '-PDF-EXPORT-GUIDE.txt');
    
    fs.writeFileSync(instructionsPath, guide, 'utf8');
    console.log(`📄 PDF Export Guide created: ${instructionsPath}`);
    
    return instructionsPath;
  }

  /**
   * Try automated PDF generation if Chrome is available
   */
  static async tryAutomatedPDF(htmlPath: string): Promise<string | null> {
    try {
      const outputPath = htmlPath.replace('.html', '.pdf');
      const absoluteHtmlPath = path.resolve(htmlPath);
      
      // Try Chrome headless
      const chromeCommands = [
        'google-chrome',
        'chromium',
        'chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      ];

      for (const chromeCmd of chromeCommands) {
        try {
          execSync(`which ${chromeCmd}`, { stdio: 'ignore' });
          
          const cmd = `"${chromeCmd}" --headless --disable-gpu --print-to-pdf="${outputPath}" --no-margins --print-to-pdf-no-header "file://${absoluteHtmlPath}"`;
          
          execSync(cmd, { stdio: 'pipe' });
          
          if (fs.existsSync(outputPath)) {
            console.log(`✅ PDF generated successfully: ${outputPath}`);
            return outputPath;
          }
        } catch (error) {
          // Continue to next Chrome command
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.log('ℹ️  Automated PDF generation not available, use manual methods');
      return null;
    }
  }
}

async function generatePDFExportPackage(htmlPath: string) {
  try {
    console.log('📄 Creating PDF Export Package...');
    console.log('═══════════════════════════════════════');
    
    // Create export instructions
    const instructionsPath = PDFExportGuide.createExportInstructions(htmlPath);
    
    // Try automated PDF generation
    const pdfPath = await PDFExportGuide.tryAutomatedPDF(htmlPath);
    
    console.log('\n✅ PDF EXPORT PACKAGE COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`📄 HTML Report: ${htmlPath}`);
    console.log(`📋 Export Guide: ${instructionsPath}`);
    
    if (pdfPath) {
      console.log(`📄 Generated PDF: ${pdfPath}`);
      console.log('🎉 Automated PDF generation successful!');
    } else {
      console.log('📖 Use the PDF Export Guide for manual conversion');
      console.log('🌐 Recommended: Open HTML in browser and Print > Save as PDF');
    }
    
    console.log('\n🎯 QUICK PDF GENERATION:');
    console.log('1. Open HTML file in Google Chrome');
    console.log('2. Press Ctrl+P (Cmd+P on Mac)');
    console.log('3. Choose "Save as PDF"');
    console.log('4. Enable "Background graphics"');
    console.log('5. Set margins to "Minimum"');
    console.log('6. Click "Save"');
    
    return {
      htmlPath,
      instructionsPath,
      pdfPath,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Error creating PDF export package:', error);
    throw error;
  }
}

// Get the latest HTML report
function findLatestHtmlReport(): string | null {
  const reportsDir = path.join(process.cwd(), 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    return null;
  }
  
  const sprintDirs = fs.readdirSync(reportsDir).filter(dir => 
    fs.statSync(path.join(reportsDir, dir)).isDirectory()
  );
  
  for (const sprintDir of sprintDirs.reverse()) {
    const sprintPath = path.join(reportsDir, sprintDir);
    const htmlFiles = fs.readdirSync(sprintPath).filter(file => file.endsWith('.html'));
    
    if (htmlFiles.length > 0) {
      // Get the most recent HTML file
      const latestHtml = htmlFiles.sort().reverse()[0];
      return path.join(sprintPath, latestHtml);
    }
  }
  
  return null;
}

// Execute PDF export package creation
if (import.meta.url === `file://${process.argv[1]}`) {
  const htmlPath = findLatestHtmlReport();
  
  if (htmlPath) {
    generatePDFExportPackage(htmlPath)
      .then((result) => {
        console.log('\n🎉 PDF export package created successfully!');
        console.log(`📊 HTML Report: ${result.htmlPath}`);
        console.log(`📋 Instructions: ${result.instructionsPath}`);
        if (result.pdfPath) {
          console.log(`📄 Generated PDF: ${result.pdfPath}`);
        }
      })
      .catch((error) => {
        console.error('💥 PDF export package creation failed:', error);
        process.exit(1);
      });
  } else {
    console.error('❌ No HTML reports found. Generate HTML report first.');
    process.exit(1);
  }
}

export { PDFExportGuide, generatePDFExportPackage };
