#!/usr/bin/env tsx

// Professional Release Notes Generator with Enhanced Presentation
import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function generateProfessionalReleaseNotes() {
  console.log("🎨 Generating Professional Release Notes with Enhanced Presentation...");
  
  const factory = new MCPToolFactory({
    enabledCategories: ['release']
  });

  const releaseNotesTool = factory.getTool('generate_release_notes');
  if (releaseNotesTool) {
    try {
      const result = await releaseNotesTool.execute({
        sprintNumber: 'SCNT-2025-20',
        version: '2.0.0',
        includeMetrics: true,
        includeBuildPipeline: true,
        includeDetailedCommits: true,
        includeTeamMetrics: true,
        format: 'html',
        theme: 'professional', // Using professional theme
        layout: 'executive',    // Executive-friendly layout
        presentation: 'stakeholder' // Stakeholder presentation mode
      });
      
      if (result.isError) {
        console.log("❌ Professional release notes generation failed:", result.content);
      } else {
        console.log("✅ Professional Release Notes Generated!");
        console.log("🎨 Enhanced with executive-level presentation styling");
        console.log("📊 Stakeholder-friendly layout with professional design");
        console.log("🖼️ Ready for boardroom presentations and client showcases");
        
        return result.content;
      }
    } catch (error) {
      console.log("❌ Professional release notes generation error:", error.message);
    }
  }
  return null;
}

generateProfessionalReleaseNotes().catch(console.error);
