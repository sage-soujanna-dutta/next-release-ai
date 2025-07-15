import { marked } from 'marked';

export function convertMarkdownToHTML(md: string): string {
  return marked(md);
}
