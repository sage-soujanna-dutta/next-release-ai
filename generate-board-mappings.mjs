#!/usr/bin/env node

// Fetch all JIRA boards and generate static mappings
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_TOKEN = process.env.JIRA_TOKEN;

if (!JIRA_DOMAIN || !JIRA_TOKEN) {
  console.error('❌ Missing JIRA_DOMAIN or JIRA_TOKEN environment variables');
  process.exit(1);
}

async function fetchAllBoards() {
  console.log('🚀 Fetching all JIRA boards...');
  
  try {
    let allBoards = [];
    let startAt = 0;
    const maxResults = 50;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `https://${JIRA_DOMAIN}/rest/agile/1.0/board?startAt=${startAt}&maxResults=${maxResults}`,
        {
          headers: {
            Authorization: `Bearer ${JIRA_TOKEN}`,
            Accept: "application/json",
          }
        }
      );

      if (response.data.values && Array.isArray(response.data.values)) {
        allBoards = allBoards.concat(response.data.values);
        hasMore = response.data.values.length === maxResults;
        startAt += maxResults;
        console.log(`📋 Fetched ${allBoards.length} boards so far...`);
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Total boards fetched: ${allBoards.length}`);

    // Get project information for each board
    console.log('🔍 Enriching boards with project information...');
    const enrichedBoards = [];
    
    for (let i = 0; i < allBoards.length; i++) {
      const board = allBoards[i];
      console.log(`Processing ${i + 1}/${allBoards.length}: ${board.name}`);
      
      try {
        const configResponse = await axios.get(
          `https://${JIRA_DOMAIN}/rest/agile/1.0/board/${board.id}/configuration`,
          {
            headers: {
              Authorization: `Bearer ${JIRA_TOKEN}`,
              Accept: "application/json",
            }
          }
        );

        if (configResponse.data.location && configResponse.data.location.project) {
          board.project = configResponse.data.location.project;
        }
      } catch (error) {
        console.log(`  ⚠️ Could not get project info for board ${board.id}`);
      }
      
      enrichedBoards.push(board);
    }

    return enrichedBoards;
  } catch (error) {
    console.error('❌ Error fetching boards:', error.message);
    throw error;
  }
}

async function generateStaticMappings(boards) {
  console.log('🔧 Generating static mappings...');
  
  // Create board mappings object
  const boardMappings = {};
  const boardNameMappings = {};
  
  boards.forEach(board => {
    const mapping = {
      id: board.id,
      name: board.name,
      type: board.type || 'unknown'
    };
    
    if (board.project) {
      mapping.projectKey = board.project.key;
      mapping.projectName = board.project.name;
      
      // Use project key as primary key
      boardMappings[board.project.key] = mapping;
    } else {
      // Use board name as fallback key for boards without projects
      boardNameMappings[board.name] = mapping;
    }
  });

  // Generate TypeScript file content
  const tsContent = `/**
 * Static JIRA Board Mappings
 * Auto-generated from JIRA API on ${new Date().toISOString()}
 */

export interface BoardMapping {
  id: number;
  name: string;
  type: string;
  projectKey?: string;
  projectName?: string;
}

/**
 * Static mapping of JIRA boards by project key
 * Total boards: ${boards.length}
 */
export const STATIC_BOARD_MAPPINGS: Record<string, BoardMapping> = ${JSON.stringify(boardMappings, null, 2)};

/**
 * Additional board mappings by name (for boards without projects)
 */
export const BOARD_NAME_MAPPINGS: Record<string, BoardMapping> = ${JSON.stringify(boardNameMappings, null, 2)};

/**
 * Quick lookup functions for board mappings
 */
export class BoardLookup {
  
  /**
   * Get board ID by project key
   */
  static getBoardIdByProject(projectKey: string): number | null {
    const board = STATIC_BOARD_MAPPINGS[projectKey.toUpperCase()];
    return board ? board.id : null;
  }
  
  /**
   * Get board info by project key
   */
  static getBoardByProject(projectKey: string): BoardMapping | null {
    return STATIC_BOARD_MAPPINGS[projectKey.toUpperCase()] || null;
  }
  
  /**
   * Get board by name (fallback for boards without projects)
   */
  static getBoardByName(boardName: string): BoardMapping | null {
    return BOARD_NAME_MAPPINGS[boardName] || null;
  }
  
  /**
   * Get all available project keys
   */
  static getAllProjectKeys(): string[] {
    return Object.keys(STATIC_BOARD_MAPPINGS);
  }
  
  /**
   * Get all board IDs
   */
  static getAllBoardIds(): number[] {
    return [
      ...Object.values(STATIC_BOARD_MAPPINGS).map(board => board.id),
      ...Object.values(BOARD_NAME_MAPPINGS).map(board => board.id)
    ];
  }
  
  /**
   * Search boards by name (partial match)
   */
  static searchBoardsByName(searchTerm: string): BoardMapping[] {
    const term = searchTerm.toLowerCase();
    const results = [];
    
    // Search in project-based boards
    Object.values(STATIC_BOARD_MAPPINGS).forEach(board => {
      if (board.name.toLowerCase().includes(term) ||
          board.projectName?.toLowerCase().includes(term) ||
          board.projectKey?.toLowerCase().includes(term)) {
        results.push(board);
      }
    });
    
    // Search in name-based boards
    Object.values(BOARD_NAME_MAPPINGS).forEach(board => {
      if (board.name.toLowerCase().includes(term)) {
        results.push(board);
      }
    });
    
    return results;
  }
  
  /**
   * Add or update a board mapping
   */
  static updateBoardMapping(projectKey: string, boardInfo: BoardMapping): void {
    STATIC_BOARD_MAPPINGS[projectKey.toUpperCase()] = boardInfo;
  }
  
  /**
   * Export current mappings as JSON string
   */
  static exportMappings(): string {
    return JSON.stringify({
      projectMappings: STATIC_BOARD_MAPPINGS,
      nameMappings: BOARD_NAME_MAPPINGS
    }, null, 2);
  }
  
  /**
   * Get total number of boards
   */
  static getTotalBoardCount(): number {
    return Object.keys(STATIC_BOARD_MAPPINGS).length + Object.keys(BOARD_NAME_MAPPINGS).length;
  }
}

/**
 * Reusable JavaScript object for MCPToolFactory.ts
 */
export const BOARD_MAPPINGS_FOR_MCP_FACTORY = {
  // Project-based mappings
  ...STATIC_BOARD_MAPPINGS,
  
  // Helper functions
  getBoardId: (projectKeyOrName: string): number | null => {
    return BoardLookup.getBoardIdByProject(projectKeyOrName) || 
           BoardLookup.getBoardByName(projectKeyOrName)?.id || null;
  },
  
  searchBoards: (term: string): BoardMapping[] => {
    return BoardLookup.searchBoardsByName(term);
  },
  
  getAllBoards: (): BoardMapping[] => {
    return [
      ...Object.values(STATIC_BOARD_MAPPINGS),
      ...Object.values(BOARD_NAME_MAPPINGS)
    ];
  }
};
`;

  // Write to file
  fs.writeFileSync('./src/utils/BoardMappings.ts', tsContent);
  console.log('✅ Generated ./src/utils/BoardMappings.ts');
  
  // Also generate a simple JSON export for easy copy-paste
  const jsonExport = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalBoards: boards.length,
      projectBoards: Object.keys(boardMappings).length,
      orphanBoards: Object.keys(boardNameMappings).length
    },
    projectMappings: boardMappings,
    nameMappings: boardNameMappings
  };
  
  fs.writeFileSync('./board-mappings.json', JSON.stringify(jsonExport, null, 2));
  console.log('✅ Generated ./board-mappings.json');
  
  return jsonExport;
}

async function main() {
  try {
    const boards = await fetchAllBoards();
    const mappings = await generateStaticMappings(boards);
    
    console.log('\n📊 Summary:');
    console.log(`  • Total boards: ${mappings.metadata.totalBoards}`);
    console.log(`  • Project-based boards: ${mappings.metadata.projectBoards}`);
    console.log(`  • Orphan boards (no project): ${mappings.metadata.orphanBoards}`);
    
    console.log('\n🎉 Successfully generated static board mappings!');
    console.log('\n💡 Next steps:');
    console.log('  1. Review ./src/utils/BoardMappings.ts');
    console.log('  2. Build project: npm run build');
    console.log('  3. Test MCP tool: node test-boards-tool.mjs');
    
  } catch (error) {
    console.error('💥 Failed to generate mappings:', error.message);
    process.exit(1);
  }
}

main();
