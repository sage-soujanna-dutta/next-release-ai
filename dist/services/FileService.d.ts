export declare class FileService {
    private outputDir;
    constructor();
    private ensureOutputDir;
    saveReleaseNotes(content: string, sprintNumber?: string): Promise<string>;
    saveMarkdown(content: string, sprintNumber?: string): Promise<string>;
    readFile(filePath: string): Promise<string>;
    listReleaseNotes(): Promise<string[]>;
    deleteFile(fileName: string): Promise<void>;
}
