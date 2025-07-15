import fs from "fs";
import path from "path";

export class FileService {
  private outputDir: string;

  constructor() {
    this.outputDir = process.env.OUTPUT_DIR || path.resolve(process.cwd(), "output");
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async saveReleaseNotes(content: string, sprintNumber?: string): Promise<string> {
    try {
      const date = new Date().toISOString().split("T")[0];
      const time = new Date().toISOString().split("T")[1].split(".")[0].replace(/:/g, "-");
      
      // Determine file extension based on content
      const isHtml = content.trim().startsWith('<!DOCTYPE html') || content.includes('<html');
      const extension = isHtml ? 'html' : 'md';
      
      const fileName = sprintNumber 
        ? `release-notes-${sprintNumber}-${date}-${time}.${extension}`
        : `release-notes-${date}-${time}.${extension}`;
      
      const filePath = path.join(this.outputDir, fileName);
      
      console.log(`💾 Writing ${extension.toUpperCase()} file to: ${filePath}`);
      fs.writeFileSync(filePath, content, "utf8");
      
      console.log(`✅ Release notes saved successfully: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("❌ Error saving release notes:", error);
      throw new Error(`Failed to save release notes: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async saveMarkdown(content: string, sprintNumber?: string): Promise<string> {
    try {
      const date = new Date().toISOString().split("T")[0];
      const fileName = sprintNumber 
        ? `release-notes-sprint-${sprintNumber}-${date}.md`
        : `release-notes-${date}.md`;
      
      const filePath = path.join(this.outputDir, fileName);
      
      fs.writeFileSync(filePath, content, "utf8");
      
      console.log(`✅ Markdown release notes saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("Error saving markdown release notes:", error);
      throw new Error(`Failed to save markdown release notes: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      console.error("Error reading file:", error);
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async listReleaseNotes(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.outputDir);
      return files.filter(file => file.startsWith("release-notes-"));
    } catch (error) {
      console.error("Error listing release notes:", error);
      return [];
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.outputDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted file: ${filePath}`);
      } else {
        throw new Error("File not found");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
