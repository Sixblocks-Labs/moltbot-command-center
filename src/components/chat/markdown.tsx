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

export function Markdown({ content }: { content: string }) {
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
