import { MarkdownFormatter } from './src/utils/MarkdownFormatter.js';

// Create a simple test
const formatter = new MarkdownFormatter();

// Mock data for testing
const mockJiraIssues = [
  {
    key: 'SCNT-2025-22-001',
    fields: {
      summary: 'Test issue',
      status: { name: 'Done' },
      issuetype: { name: 'Story' },
      assignee: { displayName: 'Test User' },
      priority: { name: 'Medium' },
      customfield_10004: 5,
      storyPoints: 5
    }
  }
];

const mockCommits = [
  {
    sha: 'abc123',
    message: 'Test commit',
    author: 'Test Author',
    date: '2025-08-03T12:00:00Z',
    url: 'https://github.com/test/repo/commit/abc123'
  }
];

console.log('Testing MarkdownFormatter...');
const result = formatter.format(mockJiraIssues as any, mockCommits as any);
console.log('First 500 characters of result:');
console.log(result.substring(0, 500));
console.log('\n--- Full result ---');
console.log(result);
