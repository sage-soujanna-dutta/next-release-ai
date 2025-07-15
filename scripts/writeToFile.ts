import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function writeToTxtFile(html: string) {
  const date = new Date().toISOString().split("T")[0];
  const fileName = `release-notes-${process.env.JIRA_SPRINT_NUMBER}.html`;
  const outputDir = path.resolve(__dirname, "../output");
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filePath = path.resolve(outputDir, fileName);

  try {
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`✅ Release notes written to: ${filePath}`);
  } catch (err) {
    console.error("❌ Failed to write release notes to file:", err);
  }
}
