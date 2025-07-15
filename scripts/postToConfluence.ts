import { fetchJiraIssues } from "./fetchJira";
import { fetchCommits } from "./fetchCommits";
import { formatMarkdown } from "./formatMarkdown";
import { convertMarkdownToHTML } from "./convertToHTML";
import { sendTeamsNotification } from "./teamsNotifier";
import { writeToTxtFile } from "./writeToFile";
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
    `https://${CONFLUENCE_HOST}/rest/api/content`,
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
  const jiraIssues = await fetchJiraIssues();
  const commits = await fetchCommits(date);
  const markdown = formatMarkdown(jiraIssues, commits);
  const html = convertMarkdownToHTML(markdown);
  await postToConfluence(html, sprintNumber);
  await writeToTxtFile(html);
  // await sendTeamsNotification("🚀 New release notes published", markdown);
})();
