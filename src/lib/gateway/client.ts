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

export function useGatewayChat(opts: { url: string; token: string; sessionKey?: string }) {
  const { url, token, sessionKey = 'main' } = opts;

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);

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

    client.request('chat.send', {
      sessionKey,
      message: content,
      idempotencyKey: uid(),
    });
  }

  async function request(method: string, params: any) {
    const client = clientRef.current;
    if (!client || !connected) throw new Error('gateway not connected');
    return client.requestAsync(method, params);
  }

  return { connected, messages, toolEvents, sendUserMessage, request };
}
