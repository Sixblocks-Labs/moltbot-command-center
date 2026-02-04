'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Markdown } from './markdown';
import type { ChatMessage } from '@/lib/gateway/types';

export function ChatPanel({
  connected,
  messages,
  onSend,
}: {
  connected: boolean;
  messages: ChatMessage[];
  onSend: (text: string) => Promise<boolean>;
}) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const rendered = useMemo(() => messages, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rendered.length]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl+Enter sends
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!text.trim()) return;
      (async () => {
        const ok = await onSend(text.trim());
        if (ok) setText('');
        else toast.error('Send failed', { description: 'Gateway did not accept the message.' });
      })();
      return;
    }

    // Enter inserts newline; Shift+Enter also inserts newline (default behavior)
  }

  return (
    <Card className="min-h-[60vh] md:h-[calc(100dvh-140px)] overflow-visible md:overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Chat</div>
          <div className="text-xs text-muted-foreground">
            {connected ? 'Streaming via WebSocket' : 'Not connected'}
          </div>
        </div>
        <Badge variant={connected ? 'default' : 'secondary'}>
          {connected ? 'Live' : 'Offline'}
        </Badge>
      </div>

      <div className="p-4 flex-1 overflow-visible md:hidden">
        <div className="space-y-4">
          {rendered.map((m) => (
            <div
              key={m.id}
              className={
                m.role === 'user'
                  ? 'ml-auto max-w-[80%]'
                  : 'mr-auto max-w-[80%]'
              }
            >
              <div
                className={
                  'rounded-xl px-4 py-3 transition-all duration-200 ' +
                  (m.role === 'user'
                    ? 'bg-gradient-to-b from-teal-500/90 to-teal-500/70 text-slate-950 shadow-lg shadow-teal-500/15'
                    : m.role === 'tool'
                      ? 'border border-white/10 bg-white/5 backdrop-blur-sm'
                      : 'border border-white/10 bg-white/5 backdrop-blur-sm hover:shadow-lg hover:shadow-violet-500/10')
                }
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-slate-300/90">
                  <span className="font-medium">
                    {m.role === 'user'
                      ? 'Ryan'
                      : m.role === 'assistant'
                        ? 'Peter 💾'
                        : m.role}
                  </span>
                  <span>
                    {new Date(m.ts).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {m.role === 'user' ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-950">
                    {m.content}
                  </div>
                ) : (
                  <Markdown content={m.content} />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <ScrollArea className="hidden md:block h-[calc(100%-140px)] p-4">
        <div className="space-y-4">
          {rendered.map((m) => (
            <div
              key={m.id}
              className={
                m.role === 'user'
                  ? 'ml-auto max-w-[80%]'
                  : 'mr-auto max-w-[80%]'
              }
            >
              <div
                className={
                  'rounded-xl px-4 py-3 transition-all duration-200 ' +
                  (m.role === 'user'
                    ? 'bg-gradient-to-b from-teal-500/90 to-teal-500/70 text-slate-950 shadow-lg shadow-teal-500/15'
                    : m.role === 'tool'
                      ? 'border border-white/10 bg-white/5 backdrop-blur-sm'
                      : 'border border-white/10 bg-white/5 backdrop-blur-sm hover:shadow-lg hover:shadow-violet-500/10')
                }
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-slate-300/90">
                  <span className="font-medium">
                    {m.role === 'user'
                      ? 'Ryan'
                      : m.role === 'assistant'
                        ? 'Peter 💾'
                        : m.role}
                  </span>
                  <span>
                    {new Date(m.ts).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {m.role === 'user' ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-950">
                    {m.content}
                  </div>
                ) : (
                  <Markdown content={m.content} />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Peter…"
            className="min-h-[44px] resize-none"
          />
          <Button
            onClick={async () => {
              if (!text.trim()) return;
              const ok = await onSend(text.trim());
              if (ok) setText('');
              else toast.error('Send failed', { description: 'Gateway did not accept the message.' });
            }}
            disabled={!connected}
          >
            Send
          </Button>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Cmd+Enter (Mac) / Ctrl+Enter (Win/Linux) = send • Enter = newline
        </div>
      </div>
    </Card>
  );
}
