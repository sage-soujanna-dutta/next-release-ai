import axios from "axios";
import dayjs from "dayjs";
import dotenv from "dotenv";
dotenv.config();
export class GitHubService {
    repository;
    token;
    constructor() {
        this.repository = process.env.GH_REPOSITORY;
        this.token = process.env.GH_TOKEN;
        if (!this.repository || !this.token) {
            throw new Error("Missing required GitHub environment variables");
        }
    }
    async fetchCommits(date, branch) {
        try {
            // Calculate the date to fetch commits from (last 8 days)
            const targetDate = date ? dayjs(date) : dayjs();
            const since = targetDate.subtract(8, "days").startOf("day").toISOString();
            const targetBranch = branch || process.env.RELEASE_BRANCH || 'main';
            console.log(`📅 Fetching commits since: ${since} (last 8 days)`);
            console.log(`🌿 From branch: ${targetBranch}`);
            let allCommits = [];
            let page = 1;
            let hasMore = true;
            const perPage = 100; // GitHub's max per page
            while (hasMore) {
                const response = await axios.get(`https://api.github.com/repos/${this.repository}/commits`, {
                    headers: {
                        Authorization: `token ${this.token}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                    params: {
                        since: since,
                        sha: targetBranch,
                        page,
                        per_page: perPage,
                    }
                });
                const commits = response.data.map((commit) => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    url: commit.html_url,
                    author: commit.commit.author.name || commit.author?.login || "Unknown",
                    date: commit.commit.author.date,
                }));
                allCommits = allCommits.concat(commits);
                // Check if there are more pages using Link header or if we got less than perPage commits
                const linkHeader = response.headers.link;
                hasMore = linkHeader && linkHeader.includes('rel="next"') && commits.length === perPage;
                page++;
                console.log(`📄 Fetched ${commits.length} commits on page ${page - 1} (total so far: ${allCommits.length})`);
                // Safeguard against infinite loops
                if (page > 100) {
                    console.warn('⚠️ Reached maximum page limit (100), stopping pagination');
                    break;
                }
            }
            console.log(`✅ Fetched all ${allCommits.length} commits from branch ${targetBranch}`);
            return allCommits;
        }
        catch (error) {
            console.error("Error fetching GitHub commits:", error);
            throw new Error(`Failed to fetch GitHub commits: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async fetchAllCommitsFromBranch(branch, maxCommits = 1000) {
        try {
            console.log(`📅 Fetching ALL commits from branch: ${branch} (up to ${maxCommits} commits)`);
            let allCommits = [];
            let page = 1;
            let hasMore = true;
            const perPage = 100; // GitHub's max per page
            while (hasMore && allCommits.length < maxCommits) {
                const response = await axios.get(`https://api.github.com/repos/${this.repository}/commits`, {
                    headers: {
                        Authorization: `token ${this.token}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                    params: {
                        sha: branch,
                        page,
                        per_page: perPage,
                    }
                });
                const commits = response.data.map((commit) => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    url: commit.html_url,
                    author: commit.commit.author.name || commit.author?.login || "Unknown",
                    date: commit.commit.author.date,
                }));
                allCommits = allCommits.concat(commits);
                // Check if there are more pages using Link header or if we got less than perPage commits
                const linkHeader = response.headers.link;
                hasMore = linkHeader && linkHeader.includes('rel="next"') && commits.length === perPage;
                page++;
                console.log(`📄 Fetched ${commits.length} commits on page ${page - 1} (total so far: ${allCommits.length})`);
                // Safeguard against infinite loops and respect maxCommits limit
                if (page > 100 || allCommits.length >= maxCommits) {
                    if (page > 100) {
                        console.warn('⚠️ Reached maximum page limit (100), stopping pagination');
                    }
                    if (allCommits.length >= maxCommits) {
                        console.warn(`⚠️ Reached maximum commit limit (${maxCommits}), stopping pagination`);
                    }
                    break;
                }
            }
            // Trim to maxCommits if we exceeded it
            if (allCommits.length > maxCommits) {
                allCommits = allCommits.slice(0, maxCommits);
            }
            console.log(`✅ Fetched ${allCommits.length} commits from branch ${branch}`);
            return allCommits;
        }
        catch (error) {
            console.error("Error fetching all commits from branch:", error);
            throw new Error(`Failed to fetch commits from branch ${branch}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async fetchCommitsForDateRange(startDate, endDate) {
        try {
            // Make end date exclusive by subtracting one day
            const exclusiveEndDate = dayjs(endDate).subtract(1, 'day').endOf('day').toISOString();
            console.log(`📅 Fetching commits from ${startDate} to ${endDate} (exclusive end date: ${exclusiveEndDate})`);
            let allCommits = [];
            let page = 1;
            let hasMore = true;
            const perPage = 100; // GitHub's max per page
            while (hasMore) {
                const response = await axios.get(`https://api.github.com/repos/${this.repository}/commits`, {
                    headers: {
                        Authorization: `token ${this.token}`,
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                    params: {
                        since: startDate,
                        until: exclusiveEndDate,
                        page,
                        per_page: perPage,
                    }
                });
                const commits = response.data.map((commit) => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    url: commit.html_url,
                    author: commit.commit.author.name || commit.author?.login || "Unknown",
                    date: commit.commit.author.date,
                }));
                allCommits = allCommits.concat(commits);
                // Check if there are more pages using Link header
                const linkHeader = response.headers.link;
                hasMore = linkHeader && linkHeader.includes('rel="next"');
                page++;
                console.log(`📄 Fetched ${commits.length} commits on page ${page - 1} (total so far: ${allCommits.length})`);
                // Safeguard against infinite loops
                if (page > 50) {
                    console.warn('⚠️ Reached maximum page limit (50), stopping pagination');
                    break;
                }
            }
            console.log(`✅ Fetched all ${allCommits.length} commits for date range`);
            return allCommits;
        }
        catch (error) {
            console.error("Error fetching GitHub commits for date range:", error);
            throw new Error(`Failed to fetch GitHub commits: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async fetchPullRequests(date) {
        try {
            const targetDate = date ? dayjs(date) : dayjs();
            const since = targetDate.subtract(8, "days").startOf("day").toISOString();
            console.log(`📋 Fetching pull requests since: ${since} (last 8 days)`);
            const response = await axios.get(`https://api.github.com/repos/${this.repository}/pulls?state=closed&sort=updated&direction=desc`, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            });
            return response.data.filter((pr) => dayjs(pr.updated_at).isAfter(since) && pr.merged_at);
        }
        catch (error) {
            console.error("Error fetching GitHub pull requests:", error);
            throw new Error(`Failed to fetch GitHub pull requests: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getRepositoryStats() {
        try {
            const response = await axios.get(`https://api.github.com/repos/${this.repository}`, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            });
            return {
                name: response.data.name,
                description: response.data.description,
                stars: response.data.stargazers_count,
                forks: response.data.forks_count,
                language: response.data.language,
                updatedAt: response.data.updated_at,
            };
        }
        catch (error) {
            console.error("Error fetching repository stats:", error);
            throw new Error(`Failed to fetch repository stats: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
