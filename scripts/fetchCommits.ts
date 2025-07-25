import axios from "axios";
import dayjs from "dayjs";
import dotenv from "dotenv";

dotenv.config();

export async function fetchCommits(date: string) {
  const repo = process.env.GH_REPOSITORY!;
  const token = process.env.GH_TOKEN!;

  // Get last Friday (even if today is Friday)
  const today = dayjs(date);
  const lastFriday =
    today.day() >= 5 ? today.day(5) : today.subtract(1, "week").day(5);
  const since = lastFriday.startOf("day").toISOString();

  const res = await axios.get(
    `https://api.github.com/repos/${repo}/commits?since=${since}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  return res.data.map((commit: any) => ({
    sha: commit.sha,
    message: commit.commit.message,
    url: commit.html_url,
  }));
}
