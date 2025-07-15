import { fetchJiraIssues } from "./fetchJira";
import { fetchCommits } from "./fetchCommits";
import { formatMarkdown } from "./formatMarkdown";
import { convertMarkdownToHTML } from "./convertToHTML";
import { sendTeamsNotification } from "./teamsNotifier";
import { writeToTxtFile } from "./writeToFile";
import axios from "axios";

import dotenv from "dotenv";

dotenv.config();

export async function postToConfluence(html: string) {
  const pageTitle = `Release Notes - ${new Date().toLocaleDateString()}`;
  await axios.post(
    `https://${process.env.JIRA_CONFLUENCE_DOMAIN}/rest/api/content`,
    {
      type: "page",
      title: pageTitle,
      space: { key: process.env.CONFLUENCE_SPACE },
      ancestors: [{ id: process.env.CONFLUENCE_PARENT_PAGE_ID }],
      body: {
        storage: {
          value: html,
          representation: "storage",
        },
      },
    },
    {
      auth: {
        username: process.env.JIRA_EMAIL!,
        password: process.env.JIRA_CONFLUENCE_PASSWORD!,
      },
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

(async () => {
  const date = process.env.JIRA_FETCH_COMMITS_DATE || new Date().toISOString();
  const jiraIssues = await fetchJiraIssues();
  const commits = await fetchCommits();
  const markdown = formatMarkdown(jiraIssues, commits);
  const html = convertMarkdownToHTML(markdown);
  // await postToConfluence(html);
  await writeToTxtFile(html);
  // await sendTeamsNotification("New release notes published", markdown);
})();
