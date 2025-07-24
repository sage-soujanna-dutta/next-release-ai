import axios, { AxiosResponse } from "axios";
import { Buffer } from "buffer";

export interface BuildInfo {
  id: string;
  buildNumber: string;
  status: string;
  result: string;
  queueTime: string;
  sourceBranch: string;
  webUrl: string;
  pipelineName: string;
}

export interface PipelineInfo {
  id: string;
  name: string;
  builds: BuildInfo[];
}

interface AzureDevOpsBuild {
  id: string;
  buildNumber?: string;
  status: string;
  result?: string;
  queueTime: string;
  sourceBranch?: string;
  _links?: {
    web?: {
      href: string;
    };
  };
}

interface AzureDevOpsPipeline {
  id: string;
  name: string;
}

interface AzureDevOpsResponse<T> {
  value: T[];
  count?: number;
}

export class AzureDevOpsService {
  private readonly orgUrl: string;
  private readonly project: string;
  private readonly pat: string;
  private readonly authHeader: Record<string, string>;
  private readonly pipelineNames: string[];
  private readonly releaseBranchPatterns: string[];

  constructor() {
    this.orgUrl = process.env.AZURE_ORG_URL || '';
    this.project = process.env.AZURE_PROJECT || '';
    this.pat = process.env.AZURE_PAT || '';
    
    if (!this.orgUrl || !this.project || !this.pat) {
      console.warn('⚠️ Azure DevOps configuration incomplete. Set AZURE_ORG_URL, AZURE_PROJECT, and AZURE_PAT environment variables.');
    }
    
    this.authHeader = {
      Authorization: "Basic " + Buffer.from(":" + this.pat).toString("base64"),
      "Content-Type": "application/json",
    };

    this.pipelineNames = process.env.PIPELINE_NAMES
      ? process.env.PIPELINE_NAMES.split(",").map((s: string) => s.trim())
      : [];

    this.releaseBranchPatterns = process.env.RELEASE_BRANCH_PATTERNS
      ? process.env.RELEASE_BRANCH_PATTERNS.split(",").map((s: string) => s.trim())
      : [];
  }

  private async fetchJson<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(url, { 
        headers: this.authHeader,
        timeout: 30000 // 30 second timeout
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Azure DevOps API request failed: ${error.response?.status} - ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  private async getAllPipelineDefinitions(): Promise<AzureDevOpsPipeline[]> {
    const url = `${this.orgUrl}/${this.project}/_apis/pipelines?api-version=7.1-preview.1`;
    
    try {
      const data = await this.fetchJson<AzureDevOpsResponse<AzureDevOpsPipeline>>(url);
      
      const filteredPipelines = data?.value?.filter((pipeline) =>
        this.pipelineNames.some((name) => pipeline.name.includes(name))
      ) || [];

      console.log(`📋 Found ${filteredPipelines.length} matching pipelines out of ${data?.value?.length || 0} total`);
      return filteredPipelines;
    } catch (error) {
      console.error('❌ Failed to fetch pipeline definitions:', (error as Error).message);
      return [];
    }
  }

  private async fetchBuildsForBranch(pipelineId: string, branch: string): Promise<AzureDevOpsBuild[]> {
    const encodedBranch = encodeURIComponent(`refs/heads/SNA/${branch}`);
    const url = `${this.orgUrl}/${this.project}/_apis/build/builds?definitions=${pipelineId}&branchName=${encodedBranch}&$top=10&api-version=7.1`;

    try {
      const data = await this.fetchJson<AzureDevOpsResponse<AzureDevOpsBuild>>(url);
      return data.value?.map((build) => ({
        ...build,
        sourceBranch: build.sourceBranch || branch,
      })) || [];
    } catch (error) {
      console.warn(`⚠️ Failed to fetch builds for branch ${branch}:`, (error as Error).message);
      return [];
    }
  }

  private async fetchAllMatchingBuilds(pipelineId: string, sprintNumber: string): Promise<AzureDevOpsBuild[]> {
    const allBuilds: AzureDevOpsBuild[] = [];

    // Try specific branch patterns first (parallel execution for better performance)
    if (this.releaseBranchPatterns.length > 0) {
      console.log(`🔍 Searching in ${this.releaseBranchPatterns.length} release branch patterns...`);
      
      const branchBuildPromises = this.releaseBranchPatterns.map(branch => 
        this.fetchBuildsForBranch(pipelineId, branch)
      );
      
      const branchResults = await Promise.allSettled(branchBuildPromises);
      branchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allBuilds.push(...result.value);
        } else {
          console.warn(`⚠️ Failed to fetch builds for pattern ${this.releaseBranchPatterns[index]}:`, result.reason);
        }
      });
    }

    // Fallback: fetch all recent builds and filter by sprint
    if (allBuilds.length === 0) {
      console.log('🔄 No builds found in specific branches, falling back to general search...');
      const url = `${this.orgUrl}/${this.project}/_apis/build/builds?definitions=${pipelineId}&$top=50&api-version=7.1`;

      try {
        const data = await this.fetchJson<AzureDevOpsResponse<AzureDevOpsBuild>>(url);
        const filteredBuilds = data.value?.filter((build) => {
          const sourceBranch = (build.sourceBranch || "").toLowerCase();
          return sourceBranch.includes(sprintNumber.toLowerCase()) ||
                 sourceBranch.includes("release");
        }) || [];
        
        allBuilds.push(...filteredBuilds);
        console.log(`📦 Found ${filteredBuilds.length} builds matching sprint/release criteria`);
      } catch (error) {
        console.error("❌ Fallback search failed:", (error as Error).message);
      }
    }

    // Remove duplicates and sort by most recent
    const uniqueBuilds = Array.from(
      new Map(allBuilds.map((build) => [build.id, build])).values()
    ).sort(
      (a, b) => new Date(b.queueTime).getTime() - new Date(a.queueTime).getTime()
    );

    console.log(`✅ Returning ${Math.min(uniqueBuilds.length, 5)} most recent builds`);
    return uniqueBuilds.slice(0, 5); // Take only the 5 most recent builds per pipeline
  }

  async fetchPipelineData(sprintNumber: string): Promise<PipelineInfo[]> {
    if (!sprintNumber?.trim()) {
      throw new Error('Sprint number is required');
    }

    try {
      if (!this.orgUrl || !this.project || !this.pat) {
        console.log('⚠️ Azure DevOps configuration not found, skipping pipeline data');
        return [];
      }

      console.log(`🚀 Starting pipeline data fetch for sprint: ${sprintNumber}`);
      
      const pipelines = await this.getAllPipelineDefinitions();
      if (!pipelines || pipelines.length === 0) {
        console.log("⚠️ No matching pipelines found");
        return [];
      }

      console.log(`🔍 Fetching build data for ${pipelines.length} pipelines...`);

      // Process pipelines in parallel for better performance
      const pipelinePromises = pipelines.map(async (pipeline): Promise<PipelineInfo | null> => {
        try {
          const builds = await this.fetchAllMatchingBuilds(pipeline.id, sprintNumber);
          
          const buildInfo: BuildInfo[] = builds.map((build): BuildInfo => ({
            id: build.id,
            buildNumber: build.buildNumber || build.id,
            status: build.status,
            result: build.result || 'In Progress',
            queueTime: build.queueTime,
            sourceBranch: build.sourceBranch || 'Unknown',
            webUrl: build._links?.web?.href || '',
            pipelineName: pipeline.name
          }));

          return buildInfo.length > 0 ? {
            id: pipeline.id,
            name: pipeline.name,
            builds: buildInfo
          } : null;
        } catch (error) {
          console.error(`❌ Error processing pipeline ${pipeline.name}:`, (error as Error).message);
          return null;
        }
      });

      const pipelineResults = await Promise.allSettled(pipelinePromises);
      const pipelineData: PipelineInfo[] = pipelineResults
        .filter((result): result is PromiseFulfilledResult<PipelineInfo> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      console.log(`✅ Successfully fetched build data for ${pipelineData.length} pipelines`);
      return pipelineData;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error fetching pipeline data:', errorMessage);
      throw new Error(`Failed to fetch pipeline data: ${errorMessage}`);
    }
  }

  // Health check method
  async validateConnection(): Promise<boolean> {
    if (!this.orgUrl || !this.project || !this.pat) {
      return false;
    }

    try {
      const url = `${this.orgUrl}/${this.project}/_apis/pipelines?$top=1&api-version=7.1-preview.1`;
      await this.fetchJson(url);
      return true;
    } catch {
      return false;
    }
  }
}
