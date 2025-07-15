import dotenv from "dotenv";

dotenv.config();

export function formatMarkdown(issues, commits) {
  const iconMap = { Bug: "🐛", Story: "✨", Task: "🧹" };
  const grouped: Record<string, any[]> = {};
  for (const issue of issues) {
    const type = issue.fields.issuetype.name;
    grouped[type] = grouped[type] || [];
    grouped[type].push(issue);
  }
  const lines: string[] = ["## 🚀 Release Notes\n"];
  Object.entries(grouped).forEach(([type, issues]) => {
    lines.push(`### ${iconMap[type] || "📌"} ${type}s`);
    for (const issue of issues) {
      lines.push(
        `- ${iconMap[type] || "📌"} [${issue.key}](https://${
          process.env.JIRA_DOMAIN
        }/browse/${issue.key}) — ${issue.fields.summary}`
      );
    }
    lines.push("");
  });
  lines.push("### 📦 Commits");
  for (const commit of commits) {
    lines.push(
      `- 🔧 ${commit.message.split("\n")[0]} ([${commit.sha.slice(0, 7)}](${
        commit.url
      }))`
    );
  }
  return lines.join("\n");
}
