import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../../src/lib/markdown';

describe('renderMarkdown', () => {
  it('converts a heading to HTML', () => {
    const result = renderMarkdown('# Hello World');
    expect(result).toBe('<h1>Hello World</h1>');
  });

  it('converts a paragraph to HTML', () => {
    const result = renderMarkdown('This is a paragraph.');
    expect(result).toBe('<p>This is a paragraph.</p>');
  });

  it('converts inline formatting', () => {
    const result = renderMarkdown('**bold** and *italic*');
    expect(result).toBe('<p><strong>bold</strong> and <em>italic</em></p>');
  });

  it('converts a list to HTML', () => {
    const result = renderMarkdown('- item 1\n- item 2\n- item 3');
    expect(result).toBe('<ul>\n<li>item 1</li>\n<li>item 2</li>\n<li>item 3</li>\n</ul>');
  });

  it('converts a link to HTML', () => {
    const result = renderMarkdown('[click here](https://example.com)');
    expect(result).toBe('<p><a href="https://example.com">click here</a></p>');
  });

  it('handles empty string input', () => {
    const result = renderMarkdown('');
    expect(result).toBe('');
  });

  it('converts code blocks to HTML', () => {
    const result = renderMarkdown('```\nconst x = 1;\n```');
    expect(result).toBe('<pre><code>const x = 1;\n</code></pre>');
  });
});
