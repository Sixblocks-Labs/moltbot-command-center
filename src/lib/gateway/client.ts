import { useEffect, useRef, useState } from 'react';
import type { ChatEvent, ChatMessage, ToolEvent } from './types';
import { BrowserGatewayClient } from './ws-client';

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function extractTextFromChatEventMessage(msg: any): string {
  const content = msg?.content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((c) => c && typeof c === 'object' && c.type === 'text')
    .map((c) => String(c.text ?? ''))
    .join('');
}

export type RunTask = {
  runId: string;
  title: string;
  subtitle?: string;
  status: 'active' | 'done' | 'error';
  updatedAt: number;
};

function parseTaskSummary(input: string): { title: string; subtitle?: string } {
  const lines = String(input ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const first = lines[0] ?? '';

  // Prefer “Job: X” style
  const jobMatch = first.match(/^job:\s*(.+)$/i);
  const title = jobMatch?.[1]?.trim() || first.slice(0, 80) || 'Task';

  // Prefer an “Ask:” or “Success looks like:” line as the one-liner
  const preferred = lines.find((l) => /^ask:\s*/i.test(l)) || lines.find((l) => /^success looks like:\s*/i.test(l));
  if (preferred) {
    return {
      title,
      subtitle: preferred.replace(/^ask:\s*/i, '').replace(/^success looks like:\s*/i, '').slice(0, 120),
    };
  }

  // Fallback: second non-empty line
  const second = lines[1];
  if (second) {
    return { title, subtitle: second.slice(0, 120) };
  }

  return { title };
}

export function useGatewayChat(opts: { url: string; token: string; sessionKey?: string }) {
  const { url, token, sessionKey = 'main' } = opts;

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [tasks, setTasks] = useState<RunTask[]>([]);

  const clientRef = useRef<BrowserGatewayClient | null>(null);

  useEffect(() => {
    if (!url) return;

    const client = new BrowserGatewayClient({
      url,
      token: token || undefined,
      onHelloOk: () => setConnected(true),
      onClose: () => setConnected(false),
      onError: () => setConnected(false),
      onChatEvent: (evt: ChatEvent) => {
        if (!evt) return;

        // Update run tasks state
        setTasks((prev) => {
          const status: RunTask['status'] =
            evt.state === 'delta' ? 'active' : evt.state === 'final' ? 'done' : 'error';

          const idx = prev.findIndex((t) => t.runId === evt.runId);
          if (idx === -1) {
            return [
              {
                runId: evt.runId,
                title: `Run ${evt.runId.slice(0, 8)}`,
                subtitle: 'Live run from gateway',
                status,
                updatedAt: Date.now(),
              },
              ...prev,
            ].slice(0, 10);
          }

          const next = [...prev];
          next[idx] = { ...next[idx], status, updatedAt: Date.now() };
          // move to top
          const [item] = next.splice(idx, 1);
          return [item, ...next].slice(0, 10);
        });

        if (evt.state === 'error') {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'system',
              content: evt.errorMessage ? `Error: ${evt.errorMessage}` : 'Error',
              ts: Date.now(),
              meta: { runId: evt.runId },
            },
          ]);
          return;
        }

        const text = extractTextFromChatEventMessage(evt.message);

        // We keep one assistant message per runId and patch it during deltas.
        setMessages((prev) => {
          const idx = prev.findIndex(
            (m) => m.role === 'assistant' && (m.meta as any)?.runId === evt.runId
          );

          if (idx === -1) {
            if (!text) return prev;
            return [
              ...prev,
              {
                id: uid(),
                role: 'assistant',
                content: text,
                ts: Date.now(),
                meta: { runId: evt.runId, state: evt.state },
              },
            ];
          }

          const next = [...prev];
          next[idx] = {
            ...next[idx],
            content: text || next[idx].content,
            ts: Date.now(),
            meta: { ...(next[idx].meta ?? {}), state: evt.state },
          };
          return next;
        });
      },
    });

    clientRef.current = client;
    client.start();

    return () => {
      client.stop();
      clientRef.current = null;
    };
  }, [url, token]);

  function sendUserMessage(content: string) {
    const msg: ChatMessage = { id: uid(), role: 'user', content, ts: Date.now() };
    setMessages((prev) => [...prev, msg]);

    const client = clientRef.current;
    if (!client || !connected) return;

    const idempotencyKey = uid();

    const summary = parseTaskSummary(content);

    // Create a placeholder task immediately
    setTasks((prev) =>
      [
        {
          runId: idempotencyKey,
          title: summary.title,
          subtitle: summary.subtitle,
          status: 'active' as const,
          updatedAt: Date.now(),
        },
        ...prev.filter((t) => t.runId !== idempotencyKey),
      ].slice(0, 10)
    );

    // Ask gateway to start a run; response includes canonical runId
    client
      .requestAsync('chat.send', {
        sessionKey,
        message: content,
        idempotencyKey,
      })
      .then((res) => {
        const runId = String(res?.runId ?? idempotencyKey);
        setTasks((prev) => {
          const existing = prev.find((t) => t.runId === idempotencyKey);
          const title = existing?.title ?? summary.title ?? `Run ${runId.slice(0, 8)}`;
          const subtitle = existing?.subtitle ?? summary.subtitle;
          const next = prev.filter((t) => t.runId !== idempotencyKey);
          return [{ runId, title, subtitle, status: 'active' as const, updatedAt: Date.now() }, ...next].slice(0, 10);
        });
      })
      .catch(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.runId === idempotencyKey
              ? { ...t, status: 'error' as const, updatedAt: Date.now() }
              : t
          )
        );
      });
  }

  async function request(method: string, params: any) {
    const client = clientRef.current;
    if (!client || !connected) throw new Error('gateway not connected');
    return client.requestAsync(method, params);
  }

  return { connected, messages, toolEvents, tasks, sendUserMessage, request };
}
