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

  const response = await axios.get(
    `https://${domain}/rest/agile/1.0/sprint/${matchedSprint.id}/issue`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
  return response.data.issues;
}
