#!/usr/bin/env tsx

// Generate Shareable Professional Report for Presentations
import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function generateShareableReport() {
  console.log("📊 Generating Shareable Professional Report for Presentations...");
  
  const factory = new MCPToolFactory({
    enabledCategories: ['release', 'analysis']
  });

  // Generate a comprehensive shareable report
  const shareableReportTool = factory.getTool('generate_shareable_report');
  if (shareableReportTool) {
    try {
      const result = await shareableReportTool.execute({
        sprintNumbers: ['SCNT-2025-20'],
        format: 'html',
        theme: 'corporate',
        includeExecutiveSummary: true,
        includeVisualCharts: true,
        includeTeamMetrics: true,
        includeRiskAssessment: true,
        outputStyle: 'presentation', // Optimized for presentations
        brandingMode: 'professional'
      });
      
      if (result.isError) {
        console.log("❌ Shareable report generation failed:", result.content);
      } else {
        console.log("✅ Shareable Professional Report Generated!");
        console.log("🎨 Corporate-style presentation ready");
        console.log("📊 Visual charts and executive dashboard included");
        console.log("📱 Mobile-responsive and print-optimized");
        console.log("🖼️ Perfect for PowerPoint integration or standalone presentation");
        
        return result.content;
      }
    } catch (error) {
      console.log("❌ Shareable report generation error:", error.message);
    }
  }
  
  return null;
}

generateShareableReport().catch(console.error);
