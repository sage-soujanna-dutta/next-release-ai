import axios from "axios";
import dayjs from "dayjs";
import dotenv from "dotenv";

dotenv.config();

export interface GitHubCommit {
  sha: string;
  message: string;
  url: string;
  author: string;
  date: string;
}

export class GitHubService {
  private repository: string;
  private token: string;

  constructor() {
    this.repository = process.env.GH_REPOSITORY!;
    this.token = process.env.GH_TOKEN!;

    if (!this.repository || !this.token) {
      throw new Error("Missing required GitHub environment variables");
    }
  }

  // Helper: fetch all pages for a GET on a repos endpoint using page/per_page
  private async fetchAllPages<T = any>(url: string, headers: Record<string, string>, params: Record<string, any> = {}): Promise<T[]> {
    let page = 1;
    const per_page = params.per_page ?? 100;
    let all: T[] = [];

    // Safeguard to avoid infinite loops
    for (;;) {
      const res = await axios.get(url, { headers, params: { ...params, page, per_page } });
      const data = res.data as T[];
      all = all.concat(data);

      const link = res.headers.link as string | undefined;
      const hasNext = link?.includes('rel="next"');
      page++;
      if (!hasNext || page > 50 || data.length === 0) break;
    }

    return all;
  }

  // Helper: resolve a ref (tag or branch) to a commit SHA, handling annotated tags
  private async resolveRefToCommitSha(repo: string, refName: string): Promise<string> {
    const headers = {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const encoded = encodeURIComponent(refName);

    // Try tag ref first
    try {
      const tagRefRes = await axios.get(
        `https://api.github.com/repos/${repo}/git/refs/tags/${encoded}`,
        { headers }
      );
      let sha = tagRefRes.data.object.sha;
      const type = tagRefRes.data.object.type;

      // If annotated tag, dereference to the actual object (usually a commit)
      if (type === 'tag') {
        const tagObjRes = await axios.get(
          `https://api.github.com/repos/${repo}/git/tags/${sha}`,
          { headers }
        );
        sha = tagObjRes.data.object.sha;
      }
      return sha;
    } catch {}

    // Try branch ref
    try {
      const headRefRes = await axios.get(
        `https://api.github.com/repos/${repo}/git/refs/heads/${encoded}`,
        { headers }
      );
      return headRefRes.data.object.sha;
    } catch {}

    // As a last resort, let the commits API resolve the name (may work for short SHAs)
    console.warn(`⚠️ Could not resolve ref via git/refs for '${refName}', falling back to commits API`);
    return refName; // Let the commits API try to resolve it
  }

  async fetchCommits(date?: string, repository?: string): Promise<GitHubCommit[]> {
    try {
      const repo = repository || this.repository;
      // Calculate the date to fetch commits from (last 8 days)
      const targetDate = date ? dayjs(date) : dayjs();
      const since = targetDate.subtract(8, "days").startOf("day").toISOString();

      console.log(`📅 Fetching commits since: ${since} (last 8 days) repo=${repo}`);

      const headers = {
        Authorization: `token ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      const all = await this.fetchAllPages<any>(
        `https://api.github.com/repos/${repo}/commits`,
        headers,
        { since }
      );

      return all.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        url: commit.html_url,
        author: commit.commit.author.name || commit.author?.login || "Unknown",
        date: commit.commit.author.date,
      }));
    } catch (error) {
      console.error("Error fetching GitHub commits:", error);
      throw new Error(`Failed to fetch GitHub commits: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async fetchCommitsForDateRange(startDate: string, endDate: string, repository?: string): Promise<GitHubCommit[]> {
    try {
      const repo = repository || this.repository;
      // Make end date exclusive by subtracting one day
      const exclusiveEndDate = dayjs(endDate).subtract(1, 'day').endOf('day').toISOString();
      
      console.log(`📅 Fetching commits from ${startDate} to ${endDate} (exclusive end date: ${exclusiveEndDate}) repo=${repo}`);

      const headers = {
        Authorization: `token ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      const all = await this.fetchAllPages<any>(
        `https://api.github.com/repos/${repo}/commits`,
        headers,
        { since: startDate, until: exclusiveEndDate }
      );

      console.log(`✅ Fetched all ${all.length} commits for date range`);
      return all.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        url: commit.html_url,
        author: commit.commit.author.name || commit.author?.login || "Unknown",
        date: commit.commit.author.date,
      }));
    } catch (error) {
      console.error("Error fetching GitHub commits for date range:", error);
      throw new Error(`Failed to fetch GitHub commits: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async fetchPullRequests(date?: string) {
    try {
      const targetDate = date ? dayjs(date) : dayjs();
      const since = targetDate.subtract(8, "days").startOf("day").toISOString();

      console.log(`📋 Fetching pull requests since: ${since} (last 8 days)`);

      const response = await axios.get(
        `https://api.github.com/repos/${this.repository}/pulls?state=closed&sort=updated&direction=desc`,
        {
          headers: {
            Authorization: `token ${this.token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      return response.data.filter((pr: any) => 
        dayjs(pr.updated_at).isAfter(since) && pr.merged_at
      );
    } catch (error) {
      console.error("Error fetching GitHub pull requests:", error);
      throw new Error(`Failed to fetch GitHub pull requests: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getRepositoryStats() {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${this.repository}`,
        {
          headers: {
            Authorization: `token ${this.token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      return {
        name: response.data.name,
        description: response.data.description,
        stars: response.data.stargazers_count,
        forks: response.data.forks_count,
        language: response.data.language,
        updatedAt: response.data.updated_at,
      };
    } catch (error) {
      console.error("Error fetching repository stats:", error);
      throw new Error(`Failed to fetch repository stats: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async fetchCommitsFromReleaseTag(tag: string, repository?: string): Promise<GitHubCommit[]> {
    try {
      const repo = repository || this.repository;
      console.log(`🏷️ Fetching commits for release tag: ${tag} from repository: ${repo}`);

      const headers = {
        Authorization: `token ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      // Resolve tag to commit SHA (handles annotated tags)
      const tagSha = await this.resolveRefToCommitSha(repo, tag);
      console.log(`📋 Resolved tag ${tag} to SHA: ${tagSha}`);

      // Get all commits reachable from this SHA
      const all = await this.fetchAllPages<any>(
        `https://api.github.com/repos/${repo}/commits`,
        headers,
        { sha: tagSha }
      );

      const commits = all.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        url: commit.html_url,
        author: commit.commit.author.name || commit.author?.login || "Unknown",
        date: commit.commit.author.date,
      }));

      console.log(`✅ Fetched ${commits.length} commits from release tag ${tag}`);
      return commits;
    } catch (error) {
      console.error(`Error fetching commits from release tag ${tag}:`, error);
      throw new Error(`Failed to fetch commits from release tag ${tag}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async fetchCommitsFromBranchOrTag(branchOrTag: string, repository?: string): Promise<GitHubCommit[]> {
    try {
      const repo = repository || this.repository;
      console.log(`🔍 Fetching commits from branch/tag: ${branchOrTag} in repository: ${repo}`);

      const headers = {
        Authorization: `token ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      // Resolve ref (try tag then branch), then paginate through commits
      const refSha = await this.resolveRefToCommitSha(repo, branchOrTag);

      const all = await this.fetchAllPages<any>(
        `https://api.github.com/repos/${repo}/commits`,
        headers,
        { sha: refSha }
      );

      const commits = all.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        url: commit.html_url,
        author: commit.commit.author.name || commit.author?.login || "Unknown",
        date: commit.commit.author.date,
      }));

      console.log(`✅ Fetched ${commits.length} commits from ${branchOrTag}`);
      return commits;
    } catch (error) {
      console.error(`Error fetching commits from ${branchOrTag}:`, error);
      throw new Error(`Failed to fetch commits from ${branchOrTag}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async listAvailableBranches(repository?: string): Promise<string[]> {
    try {
      const repo = repository || this.repository;
      console.log(`🌿 Listing branches for repository: ${repo}`);

      const headers = {
        Authorization: `token ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      const all = await this.fetchAllPages<any>(
        `https://api.github.com/repos/${repo}/branches`,
        headers,
        { }
      );

      const branches = all.map((branch: any) => branch.name);
      console.log(`✅ Found ${branches.length} branches: ${branches.slice(0, 10).join(', ')}${branches.length > 10 ? '...' : ''}`);
      return branches;
    } catch (error) {
      console.error(`Error fetching branches:`, error);
      throw new Error(`Failed to fetch branches: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async listAvailableTags(repository?: string): Promise<string[]> {
    try {
      const repo = repository || this.repository;
      console.log(`🏷️ Listing tags for repository: ${repo}`);

      const headers = {
        Authorization: `token ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      const all = await this.fetchAllPages<any>(
        `https://api.github.com/repos/${repo}/tags`,
        headers,
        { }
      );

      const tags = all.map((tag: any) => tag.name);
      console.log(`✅ Found ${tags.length} tags: ${tags.slice(0, 10).join(', ')}${tags.length > 10 ? '...' : ''}`);
      return tags;
    } catch (error) {
      console.error(`Error fetching tags:`, error);
      throw new Error(`Failed to fetch tags: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
