import axios from "axios";
import dayjs from "dayjs";
import dotenv from "dotenv";
dotenv.config();
export class GitHubService {
    repository;
    token;
    constructor() {
        this.repository = process.env.GITHUB_REPOSITORY;
        this.token = process.env.GITHUB_TOKEN;
        if (!this.repository || !this.token) {
            throw new Error("Missing required GitHub environment variables");
        }
    }
    async fetchCommits(date) {
        try {
            // Calculate the date to fetch commits from (last 8 days)
            const targetDate = date ? dayjs(date) : dayjs();
            const since = targetDate.subtract(8, "days").startOf("day").toISOString();
            console.log(`📅 Fetching commits since: ${since} (last 8 days)`);
            const response = await axios.get(`https://api.github.com/repos/${this.repository}/commits?since=${since}`, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            });
            return response.data.map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                url: commit.html_url,
                author: commit.commit.author.name || commit.author?.login || "Unknown",
                date: commit.commit.author.date,
            }));
        }
        catch (error) {
            console.error("Error fetching GitHub commits:", error);
            throw new Error(`Failed to fetch GitHub commits: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async fetchCommitsForDateRange(startDate, endDate) {
        try {
            // Make end date exclusive by subtracting one day
            const exclusiveEndDate = dayjs(endDate).subtract(1, 'day').endOf('day').toISOString();
            console.log(`📅 Fetching commits from ${startDate} to ${endDate} (exclusive end date: ${exclusiveEndDate})`);
            const response = await axios.get(`https://api.github.com/repos/${this.repository}/commits?since=${startDate}&until=${exclusiveEndDate}`, {
                headers: {
                    Authorization: `token ${this.token}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            });
            return response.data.map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                url: commit.html_url,
                author: commit.commit.author.name || commit.author?.login || "Unknown",
                date: commit.commit.author.date,
            }));
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
