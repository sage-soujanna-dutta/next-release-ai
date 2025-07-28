#!/usr/bin/env npx tsx

/**
 * Professional Sprint Report PDF Generator
 * Generates high-quality PDF reports with professional layouts
 */

import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { SprintReportHTMLGenerator, SprintReportData } from './HTMLReportGenerator';

interface PDFConfig {
  format: 'A4' | 'Letter' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground: boolean;
  displayHeaderFooter: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  timeout?: number;
}

class SprintReportPDFGenerator {
  private htmlGenerator: SprintReportHTMLGenerator;
  private defaultConfig: PDFConfig;

  constructor() {
    this.htmlGenerator = new SprintReportHTMLGenerator();
    this.defaultConfig = {
      format: 'A4',
      orientation: 'portrait',
      margins: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      timeout: 30000, // 30 seconds timeout
      headerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin-top: 5mm;">
          <span class="title"></span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin-bottom: 5mm;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Generated: ${new Date().toLocaleDateString()}</span>
        </div>
      `
    };
  }

  private async generatePDFBuffer(htmlContent: string, config: PDFConfig = this.defaultConfig): Promise<Buffer> {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        timeout: config.timeout || 30000
      });

      const page = await browser.newPage();
      
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 800 });
      
      // Set content with extended timeout
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: config.timeout || 30000
      });

      // Use delay instead of deprecated waitForTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pdfBuffer = await page.pdf({
        format: config.format,
        landscape: config.orientation === 'landscape',
        margin: config.margins,
        printBackground: config.printBackground,
        displayHeaderFooter: config.displayHeaderFooter,
        headerTemplate: config.headerTemplate,
        footerTemplate: config.footerTemplate,
        preferCSSPageSize: true,
        timeout: config.timeout || 30000
      });

      // Convert Uint8Array to Buffer properly
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      console.error('❌ Error in PDF generation process:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  public async generatePDF(
    data: SprintReportData, 
    outputPath: string, 
    config?: Partial<PDFConfig>
  ): Promise<string> {
    try {
      // Validate input parameters
      if (!data) {
        throw new Error('Sprint report data is required');
      }
      
      if (!outputPath || typeof outputPath !== 'string') {
        throw new Error('Valid output path is required');
      }

      // Validate output path extension
      if (!outputPath.toLowerCase().endsWith('.pdf')) {
        throw new Error('Output path must have .pdf extension');
      }

      const mergedConfig = { ...this.defaultConfig, ...config };
      
      // Generate HTML content
      console.log('📄 Generating HTML content...');
      const htmlContent = this.htmlGenerator.generateHTML(data);
      
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('Failed to generate HTML content');
      }
      
      // Generate PDF buffer
      console.log('📄 Converting HTML to PDF...');
      const pdfBuffer = await this.generatePDFBuffer(htmlContent, mergedConfig);
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        console.log(`📁 Creating directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write PDF to file
      console.log('💾 Writing PDF to file...');
      fs.writeFileSync(outputPath, pdfBuffer);
      
      // Verify file was created successfully
      if (!fs.existsSync(outputPath)) {
        throw new Error('PDF file was not created successfully');
      }

      const fileStats = fs.statSync(outputPath);
      if (fileStats.size === 0) {
        throw new Error('Generated PDF file is empty');
      }
      
      console.log(`✅ PDF report generated successfully: ${outputPath}`);
      console.log(`📊 Report includes: Executive Summary, Work Breakdown, Contributors, Risk Assessment`);
      console.log(`📄 Format: ${mergedConfig.format} ${mergedConfig.orientation}`);
      console.log(`📏 File size: ${Math.round(fileStats.size / 1024)} KB`);
      
      return outputPath;
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      
      // Clean up partially created file if it exists
      if (fs.existsSync(outputPath)) {
        try {
          fs.unlinkSync(outputPath);
          console.log('🗑️ Cleaned up incomplete PDF file');
        } catch (cleanupError) {
          console.warn('⚠️ Could not clean up incomplete file:', cleanupError);
        }
      }
      
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async generateBothFormats(
    data: SprintReportData,
    basePath: string,
    config?: Partial<PDFConfig>
  ): Promise<{ htmlPath: string; pdfPath: string }> {
    try {
      // Validate inputs
      if (!data) {
        throw new Error('Sprint report data is required');
      }
      
      if (!basePath || typeof basePath !== 'string') {
        throw new Error('Valid base path is required');
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const htmlPath = `${basePath}-${timestamp}.html`;
      const pdfPath = `${basePath}-${timestamp}.pdf`;

      console.log('📄 Generating both HTML and PDF formats...');
      console.log(`📁 HTML output: ${htmlPath}`);
      console.log(`📁 PDF output: ${pdfPath}`);

      // Generate HTML
      console.log('🌐 Creating HTML report...');
      const htmlContent = this.htmlGenerator.generateHTML(data);
      
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('Failed to generate HTML content');
      }

      // Ensure output directory exists
      const outputDir = path.dirname(htmlPath);
      if (!fs.existsSync(outputDir)) {
        console.log(`📁 Creating directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(htmlPath, htmlContent, 'utf8');
      
      // Verify HTML file
      if (!fs.existsSync(htmlPath)) {
        throw new Error('HTML file was not created successfully');
      }
      
      console.log(`✅ HTML report generated: ${htmlPath}`);

      // Generate PDF
      console.log('📄 Creating PDF report...');
      await this.generatePDF(data, pdfPath, config);

      // Final verification
      if (!fs.existsSync(pdfPath)) {
        throw new Error('PDF file was not created successfully');
      }

      console.log('🎉 Both formats generated successfully!');
      
      return { htmlPath, pdfPath };
      
    } catch (error) {
      console.error('❌ Error generating reports:', error);
      
      // Clean up any partially created files
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const possibleHtmlPath = `${basePath}-${timestamp}.html`;
      const possiblePdfPath = `${basePath}-${timestamp}.pdf`;
      
      [possibleHtmlPath, possiblePdfPath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Cleaned up incomplete file: ${filePath}`);
          } catch (cleanupError) {
            console.warn(`⚠️ Could not clean up file ${filePath}:`, cleanupError);
          }
        }
      });
      
      throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export { SprintReportPDFGenerator, PDFConfig };
