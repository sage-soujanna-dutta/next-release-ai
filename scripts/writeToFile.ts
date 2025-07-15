import fs from "fs";
import path from "path";

export async function writeToTxtFile(html: string) {
  const date = new Date().toISOString().split("T")[0];
  const fileName = `release-notes-${process.env.JIRA_SPRINT_NUMBER}.html`;
  const filePath = path.resolve(__dirname, fileName);

  try {
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`✅ Release notes written to: ${filePath}`);
  } catch (err) {
    console.error("❌ Failed to write release notes to file:", err);
  }
}
