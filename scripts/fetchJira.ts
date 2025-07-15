import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
export async function fetchJiraIssues() {
  const domain = process.env.JIRA_DOMAIN;
  const token = process.env.JIRA_TOKEN;
  const boardId = process.env.JIRA_BOARD_ID;
  const response = await axios.get(
    `https://${domain}/rest/agile/1.0/board/${boardId}/issue`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
  return response.data.issues;
}
