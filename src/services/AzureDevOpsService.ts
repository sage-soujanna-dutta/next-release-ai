import axios from "axios";

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

export class AzureDevOpsService {
  private orgUrl: string;
  private project: string;
  private pat: string;
  private authHeader: Record<string, string>;
  private pipelineNames: string[];
  private releaseBranchPatterns: string[];

  constructor() {
    this.orgUrl = process.env.AZURE_ORG_URL || '';
    this.project = process.env.AZURE_PROJECT || '';
    this.pat = process.env.AZURE_PAT || '';
    
    this.authHeader = {
      Authorization: "Basic " + Buffer.from(":" + this.pat).toString("base64"),
      "Content-Type": "application/json",
    };

    this.pipelineNames = process.env.PIPELINE_NAMES
      ? process.env.PIPELINE_NAMES.split(",").map((s) => s.trim())
      : [];

    this.releaseBranchPatterns = process.env.RELEASE_BRANCH_PATTERNS
      ? process.env.RELEASE_BRANCH_PATTERNS.split(",").map((s) => s.trim())
      : [];
  }

  private async fetchJson(url: string): Promise<any> {
    const response = await axios.get(url, { headers: this.authHeader });
    return response.data;
  }

  private async getAllPipelineDefinitions(): Promise<any[]> {
    const url = `${this.orgUrl}/${this.project}/_apis/pipelines?api-version=7.1-preview.1`;
    const data = await this.fetchJson(url);

    return data?.value?.filter((pipeline: any) =>
      this.pipelineNames.some((name) => pipeline.name.includes(name))
    ) || [];
  }

  private async fetchBuildsForBranch(pipelineId: string, branch: string): Promise<any[]> {
    const encodedBranch = encodeURIComponent(`refs/heads/SNA/${branch}`);
    const url = `${this.orgUrl}/${this.project}/_apis/build/builds?definitions=${pipelineId}&branchName=${encodedBranch}&$top=10&api-version=7.1`;

    try {
      const data = await this.fetchJson(url);
      return (
        data.value?.map((b: any) => ({
          ...b,
          sourceBranch: b.sourceBranch || branch,
        })) || []
      );
    } catch (err) {
      console.warn(`⚠️ Failed to fetch builds for ${branch}:`, (err as Error).message);
      return [];
    }
  }

  private async fetchAllMatchingBuilds(pipelineId: string, sprintNumber: string): Promise<any[]> {
    const allBuilds: any[] = [];

    // Try specific branch patterns first
    for (const branch of this.releaseBranchPatterns) {
      const builds = await this.fetchBuildsForBranch(pipelineId, branch);
      allBuilds.push(...builds);
    }

    // Fallback: fetch all and filter by sprint
    if (allBuilds.length === 0) {
      const url = `${this.orgUrl}/${this.project}/_apis/build/builds?definitions=${pipelineId}&$top=50&api-version=7.1`;

      try {
        const data = await this.fetchJson(url);
        const builds = data.value.filter((b: any) =>
          (b.sourceBranch || "").toLowerCase().includes(sprintNumber.toLowerCase()) ||
          (b.sourceBranch || "").toLowerCase().includes("release")
        );
        allBuilds.push(...builds);
      } catch (err) {
        console.error("❌ Fallback failed:", (err as Error).message);
      }
    }

    // Dedup and sort by most recent
    const unique = Array.from(
      new Map(allBuilds.map((b) => [b.id, b])).values()
    ).sort(
      (a, b) => new Date(b.queueTime).getTime() - new Date(a.queueTime).getTime()
    );

    return unique.slice(0, 5); // Take only the 5 most recent builds per pipeline
  }

  async fetchPipelineData(sprintNumber: string): Promise<PipelineInfo[]> {
    try {
      if (!this.orgUrl || !this.project || !this.pat) {
        console.log('⚠️ Azure DevOps configuration not found, skipping pipeline data');
        return [];
      }

      const pipelines = await this.getAllPipelineDefinitions();
      if (!pipelines || pipelines.length === 0) {
        console.log("⚠️ No matching pipelines found");
        return [];
      }

      console.log(`🔍 Fetching build data for ${pipelines.length} pipelines...`);

      const pipelineData: PipelineInfo[] = [];

      for (const pipeline of pipelines) {
        const builds = await this.fetchAllMatchingBuilds(pipeline.id, sprintNumber);
        
        const buildInfo: BuildInfo[] = builds.map((build: any) => ({
          id: build.id,
          buildNumber: build.buildNumber || build.id,
          status: build.status,
          result: build.result || 'In Progress',
          queueTime: build.queueTime,
          sourceBranch: build.sourceBranch,
          webUrl: build._links?.web?.href || '',
          pipelineName: pipeline.name
        }));

        if (buildInfo.length > 0) {
          pipelineData.push({
            id: pipeline.id,
            name: pipeline.name,
            builds: buildInfo
          });
        }
      }

      console.log(`✅ Fetched build data for ${pipelineData.length} pipelines`);
      return pipelineData;

    } catch (error) {
      console.error('❌ Error fetching pipeline data:', (error as Error).message);
      return [];
    }
  }
}
