import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function sendTeamsNotification(summary: string, markdown: string) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL!;
  const payload = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: summary,
    themeColor: "0076D7",
    title: "🚀 New Release Notes Posted",
    text: markdown,
  };

  await axios.post(webhookUrl, payload, {
    headers: { "Content-Type": "application/json" },
  });
}
