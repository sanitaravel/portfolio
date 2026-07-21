import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

/**
 * Renders a markdown string to HTML using a unified/remark/rehype pipeline.
 *
 * @param content - Raw markdown content (body after frontmatter)
 * @returns HTML string
 */
export function renderMarkdown(content: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(content);

  return String(result);
}
