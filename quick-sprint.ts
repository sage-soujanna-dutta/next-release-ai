#!/usr/bin/env tsx

import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";
dotenv.config();

const factory = new MCPToolFactory();

// Release Notes
console.log("📋 Creating Release Notes...");
const releaseTool = factory.getTool('generate_release_notes');
const releaseResult = await releaseTool.execute({
  sprintNumber: 'SCNT-2025-21',
  includeMetrics: true
});

console.log("✅ Release Notes:", releaseResult.content);x

import { MCPToolFactory } from "./src/core/MCPToolFactory.js";
import dotenv from "dotenv";
dotenv.config();

const factory = new MCPToolFactory();

// Story Points Analysis
console.log("� Analyzing Story Points...");
const storyTool = factory.getTool('analyze_story_points');
const storyResult = await storyTool.execute({
  sprintNumbers: ['SCNT-2025-21'],
  includeTeamMetrics: true
});

console.log("✅ Story Points Analysis:", storyResult.content);
