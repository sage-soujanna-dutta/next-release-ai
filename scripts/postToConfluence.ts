import { fetchJiraIssues } from "./fetchJira";
import { GitHubService } from "../src/services/GitHubService.js";
import { formatMarkdown } from "./formatMarkdown";
import { convertMarkdownToHTML } from "./convertToHTML";
import { sendTeamsNotification } from "./teamsNotifier";
import { writeToTxtFile } from "./writeToFile";
import { HtmlFormatter } from "../src/utils/HtmlFormatter.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CONFLUENCE_HOST = process.env.JIRA_CONFLUENCE_DOMAIN;

async function getConfluenceAuthHeaders() {
  return {
    Authorization:
      "Basic " +
      Buffer.from(
        `${process.env.CONFLUENCE_USERNAME}:${process.env.CONFLUENCE_PAT}`
      ).toString("base64"),
  };
}

export async function postToConfluence(html: string, sprintNumber?: string) {
  const headers = await getConfluenceAuthHeaders();
  const pageTitle = `Release Notes${
    sprintNumber ? " - Sprint " + sprintNumber : ""
  }`;

  await axios.post(
    `https://${CONFLUENCE_HOST}`,
    {
      type: "page",
      title: pageTitle,
      space: { key: process.env.CONFLUENCE_SPACE },
      body: {
        storage: {
          value: html,
          representation: "storage",
        },
      },
    },
    { headers: { ...headers, "Content-Type": "application/json" } }
  );
}

(async () => {
  const date = process.env.JIRA_FETCH_COMMITS_DATE || new Date().toISOString();
  const sprintNumber = process.env.JIRA_SPRINT_NUMBER;
  
  // Fetch JIRA issues and get sprint information
  const jiraIssues = await fetchJiraIssues();
  
  // Get sprint dates from JIRA for proper commit date range
  const domain = process.env.JIRA_DOMAIN;
  const token = process.env.JIRA_TOKEN;
  const boardId = process.env.JIRA_BOARD_ID;

  const sprintsRes = await axios.get(
    `https://${domain}/rest/agile/1.0/board/${boardId}/sprint`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const matchedSprint = sprintsRes.data.values.find((s: any) =>
    s.name.includes(`${sprintNumber}`)
  );

  // Use GitHubService for proper pagination and author information
  const githubService = new GitHubService();
  let commits;
  
  if (matchedSprint && matchedSprint.startDate && matchedSprint.endDate) {
    console.log(`📅 Using sprint date range: ${matchedSprint.startDate} to ${matchedSprint.endDate}`);
    commits = await githubService.fetchCommitsForDateRange(matchedSprint.startDate, matchedSprint.endDate);
  } else {
    console.log(`📅 Sprint dates not available, using fallback date: ${date}`);
    commits = await githubService.fetchCommits(date);
  }
  
  // Use the enhanced HtmlFormatter instead of simple markdown conversion
  const htmlFormatter = new HtmlFormatter("modern");
  const html = htmlFormatter.format(jiraIssues, commits, sprintNumber);
  const confluenceHtml = htmlFormatter.formatForConfluence(jiraIssues, commits, sprintNumber);
  
  await postToConfluence(confluenceHtml, sprintNumber);
  await writeToTxtFile(html);
  // await sendTeamsNotification("🚀 New release notes published", markdown);
})();
