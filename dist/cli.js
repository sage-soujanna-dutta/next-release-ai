#!/usr/bin/env node
import { program } from 'commander';
import { ReleaseMCPServer } from './index.js';
import dotenv from 'dotenv';
dotenv.config();
program
    .name('release-mcp-server')
    .description('Release notes MCP server CLI')
    .version('1.0.0');
program
    .command('generate')
    .description('Generate release notes')
    .option('-s, --sprint <number>', 'Sprint number')
    .option('-d, --date <date>', 'Date to fetch commits from')
    .option('-f, --format <format>', 'Output format (html|markdown)', 'html')
    .option('-t, --theme <theme>', 'HTML theme (default|modern|minimal)', 'modern')
    .action(async (options) => {
    try {
        const server = new ReleaseMCPServer();
        const result = await server.generateReleaseNotesPublic({
            sprintNumber: options.sprint,
            date: options.date,
            format: options.format,
            theme: options.theme,
        });
        console.log(result.content);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('workflow [sprintNumber]')
    .description('Run complete release workflow')
    .option('-d, --date <date>', 'Date to fetch commits from')
    .option('-o, --output <o>', 'Output destination (confluence|file|both)', 'both')
    .option('--no-teams', 'Skip Teams notification')
    .action(async (sprintNumber, options) => {
    try {
        const server = new ReleaseMCPServer();
        const result = await server.createCompleteWorkflowPublic({
            sprintNumber: sprintNumber,
            date: options.date,
            output: options.output,
            notifyTeams: options.teams !== false,
        });
        console.log('✅ Workflow completed successfully!');
        console.log(result.summary);
        console.log('\nSteps completed:');
        result.steps.forEach((step) => console.log(`✅ ${step}`));
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('preview')
    .description('Preview release notes without publishing')
    .option('-s, --sprint <number>', 'Sprint number')
    .option('-d, --date <date>', 'Date to fetch commits from')
    .option('-f, --format <format>', 'Output format (html|markdown)', 'html')
    .option('-t, --theme <theme>', 'HTML theme (default|modern|minimal)', 'modern')
    .action(async (options) => {
    try {
        const server = new ReleaseMCPServer();
        const result = await server.previewReleaseNotesPublic({
            sprintNumber: options.sprint,
            date: options.date,
            format: options.format,
            theme: options.theme,
        });
        console.log(`📋 Release Notes Preview (${result.format})`);
        console.log(`Stats: ${result.stats.jiraIssues} JIRA issues, ${result.stats.commits} commits\n`);
        console.log(result.content);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program
    .command('server')
    .description('Start MCP server in stdio mode')
    .action(async () => {
    const server = new ReleaseMCPServer();
    await server.run();
});
program.parse();
