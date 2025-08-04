import { MCPTool, MCPToolCategory, BaseMCPTool, MCPToolResult } from "../BaseMCPTool.js";
import { ServiceRegistry } from "../MCPToolFactory.js";

export class JiraToolsFactory {
  constructor(
    private services: ServiceRegistry,
    private toolInstances: Map<string, any>
  ) {}

  createCategory(): MCPToolCategory {
    return {
      name: "JIRA Management",
      description: "Tools for JIRA issue management, fetching, and analysis",
      tools: [
        this.createFetchJiraIssuesTool(),
        this.createFindBoardByProjectTool(),
        this.createBulkJiraUpdateTool(),
        this.createJiraQueryBuilderTool(),
        this.createAdvancedJiraFetchTool(),
        this.createJiraFieldAnalyzerTool(),
        this.createEnhancedJiraFetchTool()
      ]
    };
  }

  private createFetchJiraIssuesTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "fetch_jira_issues";
      description = "Fetch JIRA issues for a specific sprint or query";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number to fetch issues for (e.g., 'SCNT-2025-20')"
          },
          jqlQuery: {
            type: "string",
            description: "Custom JQL query (alternative to sprintNumber)"
          },
          includeSubtasks: {
            type: "boolean",
            description: "Include subtasks in results (default: true)"
          },
          fields: {
            type: "array",
            items: { type: "string" },
            description: "Specific fields to fetch (optional, fetches all if not specified)"
          }
        }
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          if (!args.sprintNumber && !args.jqlQuery) {
            return this.createErrorResponse("Either sprintNumber or jqlQuery must be provided");
          }

          const jiraService = this.services.get<any>('jiraService');
          let issues;

          if (args.sprintNumber) {
            issues = await jiraService.fetchIssues(args.sprintNumber, {
              includeSubtasks: args.includeSubtasks !== false,
              fields: args.fields
            });
          } else {
            issues = await jiraService.fetchIssuesByJQL(args.jqlQuery, {
              includeSubtasks: args.includeSubtasks !== false,
              fields: args.fields
            });
          }

          const issueTypes = this.groupBy(issues, issue => issue.fields?.issuetype?.name || 'Unknown');
          const statuses = this.groupBy(issues, issue => issue.fields?.status?.name || 'Unknown');

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📋 JIRA Issues Fetched Successfully!\n\n` +
            `📊 Total Issues: ${issues.length}\n` +
            `🔍 Query: ${args.sprintNumber || args.jqlQuery}\n` +
            `📝 Subtasks Included: ${args.includeSubtasks !== false ? 'Yes' : 'No'}\n\n` +
            `📊 Issue Types:\n${Object.entries(issueTypes).map(([type, count]) => `  • ${type}: ${count}`).join('\n')}\n\n` +
            `📈 Status Distribution:\n${Object.entries(statuses).map(([status, count]) => `  • ${status}: ${count}`).join('\n')}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to fetch JIRA issues: ${error.message}`);
        }
      }

      private groupBy(items: any[], keyFn: (item: any) => string): Record<string, number> {
        const groups: Record<string, number> = {};
        items.forEach(item => {
          const key = keyFn(item);
          groups[key] = (groups[key] || 0) + 1;
        });
        return groups;
      }
    })(this.services);
  }

  private createBulkJiraUpdateTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "bulk_update_jira_issues";
      description = "Perform bulk updates on JIRA issues based on criteria";
      inputSchema = {
        type: "object",
        properties: {
          jqlQuery: {
            type: "string",
            description: "JQL query to identify issues to update"
          },
          updates: {
            type: "object",
            description: "Field updates to apply (e.g., {status: 'Done', assignee: 'user@example.com'})"
          },
          dryRun: {
            type: "boolean",
            description: "Preview changes without applying them (default: true)"
          },
          batchSize: {
            type: "number",
            description: "Number of issues to update in each batch (default: 10)"
          }
        },
        required: ["jqlQuery", "updates"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["jqlQuery", "updates"]);

          const jiraService = this.services.get<any>('jiraService');
          const isDryRun = args.dryRun !== false;
          
          // First, fetch issues to update
          const issues = await jiraService.fetchIssuesByJQL(args.jqlQuery);
          
          if (issues.length === 0) {
            return this.createSuccessResponse(
              `🔍 No issues found matching query: ${args.jqlQuery}`
            );
          }

          let result;
          if (isDryRun) {
            result = {
              previewCount: issues.length,
              updates: args.updates,
              affectedIssues: issues.slice(0, 5).map((i: any) => i.key) // Show first 5 as preview
            };
          } else {
            result = await jiraService.bulkUpdateIssues(issues, args.updates, {
              batchSize: args.batchSize || 10
            });
          }

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🔄 Bulk JIRA Update ${isDryRun ? 'Preview' : 'Complete'}!\n\n` +
            `📊 Issues Found: ${issues.length}\n` +
            `🔍 JQL Query: ${args.jqlQuery}\n` +
            `📝 Updates: ${Object.keys(args.updates).join(', ')}\n` +
            `${isDryRun ? '🔍 DRY RUN - No changes applied\n' : '✅ Updates applied successfully\n'}` +
            `${isDryRun ? `📋 Sample Issues: ${result.affectedIssues.join(', ')}` : `📈 Success Rate: ${((result.successful || 0) / issues.length * 100).toFixed(1)}%`}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to perform bulk update: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createJiraQueryBuilderTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "build_jira_query";
      description = "Build complex JQL queries using natural language criteria";
      inputSchema = {
        type: "object",
        properties: {
          criteria: {
            type: "object",
            description: "Query criteria (e.g., {project: 'SCNT', sprint: '2025-20', status: ['Done', 'In Progress']})"
          },
          orderBy: {
            type: "string",
            description: "Field to order results by (default: 'created')"
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results (default: 100)"
          },
          returnJQL: {
            type: "boolean",
            description: "Return the JQL query instead of executing it (default: false)"
          }
        },
        required: ["criteria"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["criteria"]);

          const jiraService = this.services.get<any>('jiraService');
          
          const jqlQuery = jiraService.buildJQLQuery({
            criteria: args.criteria,
            orderBy: args.orderBy || 'created',
            maxResults: args.maxResults || 100
          });

          if (args.returnJQL) {
            this.logExecution({ toolName: this.name, startTime, args });
            return this.createSuccessResponse(
              `🔍 JQL Query Generated!\n\n` +
              `📝 Query: ${jqlQuery}\n` +
              `📊 Criteria Applied:\n${Object.entries(args.criteria).map(([key, value]) => `  • ${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n')}`
            );
          }

          // Execute the query
          const issues = await jiraService.fetchIssuesByJQL(jqlQuery);

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🔍 JQL Query Executed Successfully!\n\n` +
            `📝 Generated Query: ${jqlQuery}\n` +
            `📊 Results Found: ${issues.length}\n` +
            `🔄 Order: ${args.orderBy || 'created'}\n` +
            `📋 Sample Issues: ${issues.slice(0, 3).map((i: any) => i.key).join(', ')}${issues.length > 3 ? '...' : ''}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to build/execute JQL query: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createAdvancedJiraFetchTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "advanced_jira_fetch";
      description = "Advanced JIRA fetching with filtering, pagination, and custom field extraction";
      inputSchema = {
        type: "object",
        properties: {
          fetchConfig: {
            type: "object",
            properties: {
              sprintNumber: { type: "string" },
              jqlQuery: { type: "string" },
              dateRange: {
                type: "object",
                properties: {
                  from: { type: "string" },
                  to: { type: "string" }
                }
              }
            },
            description: "Fetch configuration with multiple options"
          },
          filters: {
            type: "object",
            description: "Additional filters to apply post-fetch"
          },
          pagination: {
            type: "object",
            properties: {
              startAt: { type: "number" },
              maxResults: { type: "number" }
            },
            description: "Pagination options"
          },
          customFields: {
            type: "array",
            items: { type: "string" },
            description: "Custom field IDs to extract"
          }
        },
        required: ["fetchConfig"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["fetchConfig"]);

          const jiraService = this.services.get<any>('jiraService');
          
          const fetchResult = await jiraService.advancedFetch({
            config: args.fetchConfig,
            filters: args.filters || {},
            pagination: {
              startAt: args.pagination?.startAt || 0,
              maxResults: args.pagination?.maxResults || 50
            },
            customFields: args.customFields || []
          });

          const stats = {
            totalFetched: fetchResult.issues.length,
            hasMore: fetchResult.hasMore,
            customFieldsExtracted: (args.customFields || []).length,
            filtersApplied: Object.keys(args.filters || {}).length
          };

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🔍 Advanced JIRA Fetch Complete!\n\n` +
            `📊 Issues Retrieved: ${stats.totalFetched}\n` +
            `📄 Has More Pages: ${stats.hasMore ? 'Yes' : 'No'}\n` +
            `🏷️  Custom Fields: ${stats.customFieldsExtracted}\n` +
            `🔧 Filters Applied: ${stats.filtersApplied}\n` +
            `📋 Config: ${JSON.stringify(args.fetchConfig, null, 2).substring(0, 100)}...\n` +
            `🕐 Fetched: ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to perform advanced JIRA fetch: ${error.message}`);
        }
      }
    })(this.services);
  }

  private createJiraFieldAnalyzerTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "analyze_jira_fields";
      description = "Analyze JIRA field usage, patterns, and data quality across issues";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumber: {
            type: "string",
            description: "Sprint number to analyze fields for"
          },
          fieldsToAnalyze: {
            type: "array",
            items: { type: "string" },
            description: "Specific fields to analyze (optional, analyzes all if not specified)"
          },
          includeCustomFields: {
            type: "boolean",
            description: "Include custom field analysis (default: true)"
          },
          generateReport: {
            type: "boolean",
            description: "Generate detailed field usage report (default: false)"
          }
        },
        required: ["sprintNumber"]
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumber"]);

          const jiraService = this.services.get<any>('jiraService');
          const issues = await jiraService.fetchIssues(args.sprintNumber);

          const fieldAnalysis = jiraService.analyzeFields(issues, {
            fieldsToAnalyze: args.fieldsToAnalyze,
            includeCustomFields: args.includeCustomFields !== false
          });

          const summary: {
            totalIssues: number;
            fieldsAnalyzed: number;
            mostPopulatedField: { name: string; coverage: number };
            leastPopulatedField: { name: string; coverage: number };
            reportPath?: string;
          } = {
            totalIssues: issues.length,
            fieldsAnalyzed: Object.keys(fieldAnalysis).length,
            mostPopulatedField: this.getMostPopulatedField(fieldAnalysis),
            leastPopulatedField: this.getLeastPopulatedField(fieldAnalysis)
          };

          if (args.generateReport) {
            const fileService = this.services.get<any>('fileService');
            const reportPath = await fileService.saveFieldAnalysisReport(
              `field_analysis_${args.sprintNumber}_${Date.now()}.json`,
              fieldAnalysis
            );
            summary.reportPath = reportPath;
          }

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `📊 JIRA Field Analysis Complete!\n\n` +
            `🔍 Sprint: ${args.sprintNumber}\n` +
            `📊 Issues Analyzed: ${summary.totalIssues}\n` +
            `🏷️  Fields Analyzed: ${summary.fieldsAnalyzed}\n` +
            `📈 Most Populated: ${summary.mostPopulatedField.name} (${summary.mostPopulatedField.coverage}%)\n` +
            `📉 Least Populated: ${summary.leastPopulatedField.name} (${summary.leastPopulatedField.coverage}%)\n` +
            `🏷️  Custom Fields: ${args.includeCustomFields !== false ? 'Included' : 'Excluded'}\n` +
            `${args.generateReport ? `📄 Report Saved: ${summary.reportPath}` : ''}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to analyze JIRA fields: ${error.message}`);
        }
      }

      private getMostPopulatedField(analysis: any): { name: string; coverage: number } {
        let max = { name: 'None', coverage: 0 };
        Object.entries(analysis).forEach(([field, data]: [string, any]) => {
          if (data.coverage > max.coverage) {
            max = { name: field, coverage: Math.round(data.coverage) };
          }
        });
        return max;
      }

      private getLeastPopulatedField(analysis: any): { name: string; coverage: number } {
        let min = { name: 'None', coverage: 100 };
        Object.entries(analysis).forEach(([field, data]: [string, any]) => {
          if (data.coverage < min.coverage) {
            min = { name: field, coverage: Math.round(data.coverage) };
          }
        });
        return min;
      }
    })(this.services);
  }

  private createEnhancedJiraFetchTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "enhanced_jira_fetch";
      description = "Enhanced JIRA fetching with intelligent preprocessing, caching, and comprehensive data enrichment";
      inputSchema = {
        type: "object",
        properties: {
          sprintNumbers: {
            type: "array",
            items: { type: "string" },
            description: "Sprint numbers to fetch (supports multiple sprints)"
          },
          enrichmentOptions: {
            type: "object",
            properties: {
              includeHistory: { type: "boolean" },
              includeComments: { type: "boolean" },
              includeAttachments: { type: "boolean" },
              includeWorklog: { type: "boolean" }
            },
            description: "Data enrichment options"
          },
          cacheStrategy: {
            type: "string",
            enum: ["none", "memory", "persistent"],
            description: "Caching strategy for performance (default: memory)"
          },
          preprocessingOptions: {
            type: "object",
            description: "Options for data preprocessing and normalization"
          }
        },
        required: ["sprintNumbers"]
      };

      constructor(
        private services: ServiceRegistry,
        private toolInstances: Map<string, any>
      ) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          this.validateRequiredArgs(args, ["sprintNumbers"]);

          const enhancedJiraFetchTool = this.toolInstances.get('enhancedJiraFetchTool');
          
          const result = await enhancedJiraFetchTool.fetchWithEnrichment({
            sprintNumbers: args.sprintNumbers,
            enrichment: args.enrichmentOptions || {},
            caching: args.cacheStrategy || 'memory',
            preprocessing: args.preprocessingOptions || {}
          });

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🚀 Enhanced JIRA Fetch Complete!\n\n` +
            `📊 Sprints Processed: ${args.sprintNumbers.length}\n` +
            `📋 Total Issues: ${result.totalIssues}\n` +
            `⚡ Cache Strategy: ${args.cacheStrategy || 'memory'}\n` +
            `🔍 Enriched Data: ${Object.keys(args.enrichmentOptions || {}).filter(k => args.enrichmentOptions[k]).join(', ') || 'Basic'}\n` +
            `📈 Processing Time: ${result.processingTime}ms\n` +
            `💾 Cache Hits: ${result.cacheHits || 0}\n` +
            `🔄 Data Quality Score: ${result.dataQualityScore || 'N/A'}\n` +
            `🕐 Completed: ${new Date().toLocaleString()}`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to perform enhanced JIRA fetch: ${error.message}`);
        }
      }
    })(this.services, this.toolInstances);
  }

  private createFindBoardByProjectTool(): MCPTool {
    return new (class extends BaseMCPTool {
      name = "find_board_by_project";
      description = "Find JIRA board ID based on project name or key";
      inputSchema = {
        type: "object",
        properties: {
          projectName: {
            type: "string",
            description: "Project name to search for (e.g., 'Network Directory Service', 'SCNT')"
          },
          projectKey: {
            type: "string",
            description: "Project key to search for (e.g., 'NDS', 'SCNT')"
          },
          boardId: {
            type: "number",
            description: "Direct board ID to verify (e.g., 5465)"
          },
          exactMatch: {
            type: "boolean",
            description: "Whether to perform exact match or partial match (default: false)"
          },
          includeInactive: {
            type: "boolean",
            description: "Include inactive/archived boards (default: false)"
          }
        }
      };

      constructor(private services: ServiceRegistry) {
        super();
      }

      async execute(args: any): Promise<MCPToolResult> {
        const startTime = Date.now();
        try {
          if (!args.projectName && !args.projectKey && !args.boardId) {
            return this.createErrorResponse("Either projectName, projectKey, or boardId must be provided");
          }

          const domain = process.env.JIRA_DOMAIN;
          const token = process.env.JIRA_TOKEN;

          if (!domain || !token) {
            return this.createErrorResponse("Missing JIRA environment variables (JIRA_DOMAIN, JIRA_TOKEN)");
          }

          // Import axios dynamically
          const axios = await import('axios');

          let matchingBoards: any[] = [];

          // If boardId is provided, try direct access first
          if (args.boardId) {
            console.log(`🎯 Checking specific board ID: ${args.boardId}...`);
            try {
              const directBoardRes = await axios.default.get(
                `https://${domain}/rest/agile/1.0/board/${args.boardId}`,
                { 
                  headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  } 
                }
              );

              const board = directBoardRes.data;
              console.log(`✅ Found board ${args.boardId}: "${board.name}"`);
              
              // Try to get project information for this board
              try {
                const projectRes = await axios.default.get(
                  `https://${domain}/rest/agile/1.0/board/${args.boardId}/project`,
                  { 
                    headers: { 
                      Authorization: `Bearer ${token}`,
                      Accept: "application/json",
                    } 
                  }
                );
                board.projects = projectRes.data.values;
              } catch (projectError) {
                console.log("⚠️ Could not fetch project info for this board");
                board.projects = [];
              }

              matchingBoards = [board];
            } catch (directError: any) {
              console.log(`❌ Board ${args.boardId} not accessible: ${directError.message}`);
            }
          }

          // If no direct board found, or if searching by name/key, search all boards
          if (matchingBoards.length === 0 && (args.projectName || args.projectKey)) {
            console.log(`🔍 Searching for boards by project: ${args.projectName || args.projectKey}...`);

            // Search through paginated results
            let startAt = 0;
            const maxResults = 50;
            const maxBoards = 500; // Limit total search to avoid timeout

            while (startAt < maxBoards) {
              const boardsRes = await axios.default.get(
                `https://${domain}/rest/agile/1.0/board?startAt=${startAt}&maxResults=${maxResults}`,
                { 
                  headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  } 
                }
              );

              const boards = boardsRes.data.values;
              if (boards.length === 0) break;

              console.log(`📋 Searching boards ${startAt + 1} to ${startAt + boards.length}...`);

              // Search by board name first
              const nameMatches = boards.filter((board: any) => {
                const boardName = board.name?.toLowerCase();
                const searchName = args.projectName?.toLowerCase();
                const searchKey = args.projectKey?.toLowerCase();

                if (!boardName) return false;

                if (args.exactMatch) {
                  return (searchName && boardName === searchName) ||
                         (searchKey && boardName.includes(searchKey?.toLowerCase()));
                } else {
                  return (searchName && boardName.includes(searchName)) ||
                         (searchKey && boardName.includes(searchKey?.toLowerCase()));
                }
              });

              matchingBoards.push(...nameMatches);

              // If we found matches, we can stop (unless we want all matches)
              if (matchingBoards.length > 0 && args.exactMatch) {
                break;
              }

              startAt += maxResults;
              if (boards.length < maxResults) break; // End of results
            }

            console.log(`📊 Found ${matchingBoards.length} matching boards by name`);
          }

          if (matchingBoards.length === 0) {
            return this.createErrorResponse(
              `No boards found for project "${args.projectName || args.projectKey}". ` +
              `Try using partial matching (exactMatch: false) or check the project name.`
            );
          }

          // Sort by relevance (exact matches first, then by name)
          matchingBoards.sort((a: any, b: any) => {
            const aName = a.name?.toLowerCase() || '';
            const bName = b.name?.toLowerCase() || '';
            const searchTerm = (args.projectName || args.projectKey)?.toLowerCase();
            
            // Prioritize exact name matches
            if (aName.includes(searchTerm) && !bName.includes(searchTerm)) return -1;
            if (bName.includes(searchTerm) && !aName.includes(searchTerm)) return 1;
            
            return aName.localeCompare(bName);
          });

          // Generate detailed results
          const boardDetails = matchingBoards.map((board: any) => {
            // Handle both name-matched boards and project-matched boards
            const projectInfo = board.projects && board.projects[0] ? board.projects[0] : null;
            
            return {
              id: board.id,
              name: board.name,
              type: board.type,
              projectName: projectInfo?.name || 'Unknown',
              projectKey: projectInfo?.key || 'Unknown',
              projectId: projectInfo?.id || 'Unknown',
              url: `https://${domain}/secure/RapidBoard.jspa?rapidView=${board.id}`,
              matchType: board.projects ? 'project' : 'name'
            };
          });

          const primaryBoard = boardDetails[0];

          this.logExecution({ toolName: this.name, startTime, args });

          return this.createSuccessResponse(
            `🎯 Found ${matchingBoards.length} Board(s) for Project "${args.projectName || args.projectKey}"!\n\n` +
            `🏆 **Primary Board (Recommended):**\n` +
            `  📋 Board ID: ${primaryBoard.id}\n` +
            `  📝 Board Name: ${primaryBoard.name}\n` +
            `  🏷️ Board Type: ${primaryBoard.type}\n` +
            `  🏢 Project: ${primaryBoard.projectName} (${primaryBoard.projectKey})\n` +
            `  🔗 URL: ${primaryBoard.url}\n\n` +
            (boardDetails.length > 1 ? 
              `📋 **All Matching Boards:**\n` +
              boardDetails.map((board: any) => 
                `  • ${board.id}: ${board.name} (${board.type}) - ${board.projectName}`
              ).join('\n') + '\n\n'
              : '') +
            `🎯 **Quick Usage:**\n` +
            `  Use Board ID ${primaryBoard.id} with the board-based release notes tool:\n` +
            `  \`generate_board_based_release_notes({ boardId: ${primaryBoard.id}, sprintNumber: "YOUR_SPRINT" })\`\n\n` +
            `📊 **Search Results:**\n` +
            `  • Total Boards Found: ${boardDetails.length}\n` +
            `  • Search Term: ${args.projectName || args.projectKey}\n` +
            `  • Match Type: ${args.exactMatch ? 'Exact' : 'Partial'}\n` +
            `  • Primary Project: ${primaryBoard.projectName} (${primaryBoard.projectKey})\n` +
            `⚡ **Search Time:** ${Date.now() - startTime}ms`
          );
        } catch (error: any) {
          return this.createErrorResponse(`Failed to find boards: ${error.message}`);
        }
      }
    })(this.services);
  }
}
