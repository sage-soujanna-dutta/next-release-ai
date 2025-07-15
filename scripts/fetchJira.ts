import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function fetchJiraIssues() {
  const domain = process.env.JIRA_DOMAIN;
  const token = process.env.JIRA_TOKEN;
  const boardId = process.env.JIRA_BOARD_ID;

  const sprintsRes = await axios.get(
    `https://${process.env.JIRA_DOMAIN}/rest/agile/1.0/board/${boardId}/sprint`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const matchedSprint = sprintsRes.data.values.find((s) =>
    s.name.includes(`${process.env.JIRA_SPRINT_NUMBER}`)
  );
  if (!matchedSprint) throw new Error("Sprint not found");

  // Fetch all issues with pagination
  let allIssues: any[] = [];
  let startAt = 0;
  const maxResults = 100; // JIRA API maximum
  let total = 0;

  do {
    const response = await axios.get(
      `https://${domain}/rest/agile/1.0/sprint/${matchedSprint.id}/issue`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          startAt,
          maxResults,
        },
      }
    );
    
    allIssues.push(...response.data.issues);
    total = response.data.total;
    startAt += maxResults;
    
    console.log(`Fetched ${allIssues.length} of ${total} issues...`);
  } while (allIssues.length < total);

  console.log(`✅ Successfully fetched all ${allIssues.length} issues for sprint ${process.env.JIRA_SPRINT_NUMBER}`);
  return allIssues;
}
