#!/usr/bin/env tsx

// Generate Release Notes v2.1.0
import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";

dotenv.config();

async function generateReleaseNotes() {
  console.log("📋 Generating Release Notes for Sprint SCNT-2025-20");
  
  const factory = new MCPToolFactory({
    enabledCategories: ['release']
  });

  const releaseNotesTool = factory.getTool('generate_release_notes');
  if (releaseNotesTool) {
    try {
      const result = await releaseNotesTool.execute({
        sprintNumber: 'SCNT-2025-20',  // Use sprintNumber instead of sprintNumbers
        version: '2.0.0',
        includeMetrics: true
      });
      
      if (result.isError) {
        console.log("❌ Release notes generation failed:", result.content);
      } else {
        const releaseNotes = typeof result.content === 'string' ? result.content : result.content[0]?.text || '';
        console.log("✅ Release Notes Generated for Sprint SCNT-2025-20!");
        console.log(releaseNotes);
        return releaseNotes;
      }
    } catch (error) {
      console.log("❌ Release notes generation error:", error.message);
    }
  }
  return null;
}

generateReleaseNotes().catch(console.error);
