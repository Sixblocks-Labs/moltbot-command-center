'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Button } from '@/components/ui/button';

function CopyButton({ text }: { text: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      className="h-7 px-2 text-[11px]"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      Copy
    </Button>
  );
}

function sanitizeForDisplay(raw: string): string {
  const s = String(raw ?? '');

  // Strip Clawdbot routing tags that may show up in assistant output.
  // Examples:
  // - [[reply_to_current]]
  // - [[reply_to:123]]
  // Sometimes these tags can be malformed/unterminated; strip those too.
  return s
    // well-formed tags
    .replace(/\[\[\s*reply_to(?:_current|:[^\]]+)\s*\]\]/gi, '')
    // unterminated tags: remove from tag start to end of line/string
    .replace(/\[\[\s*reply_to(?:_current|:[^\]]*)/gi, '')
    .trim();
}

export function Markdown({ content }: { content: string }) {
  const safe = sanitizeForDisplay(content);

  return (
    <div className="prose prose-invert max-w-none prose-pre:relative prose-pre:border prose-pre:bg-muted prose-pre:p-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children, ...props }) {
            const code =
              typeof children === 'string'
                ? children
                : // @ts-expect-error - react-markdown typing
                  children?.props?.children ?? '';

            return (
              <pre {...props}>
                <div className="absolute right-2 top-2">
                  <CopyButton text={String(code)} />
                </div>
                {children}
              </pre>
            );
          },
        }}
      >
        {safe}
      </ReactMarkdown>
    </div>
  );
}
