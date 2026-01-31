import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, ToolEvent } from './types';

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useGatewayChat(opts: {
  url: string;
  token: string;
}) {
  const { url, token } = opts;

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const authPayload = useMemo(
    () => ({ type: 'auth', token }),
    [token]
  );

  useEffect(() => {
    if (!url || !token) return;

    let ws: WebSocket;
    try {
      const wsUrl = new URL(url); wsUrl.searchParams.set("token", token); ws = new WebSocket(wsUrl.toString());
    } catch {
      // e.g. Mixed content (https page trying ws://) can throw synchronously.
      setConnected(false);
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data as string);

        // Generic mapping: accept both {role, content} and tool-ish payloads.
        if (data?.type === 'tool' || data?.tool) {
          setToolEvents((prev) => [
            {
              id: uid(),
              tool: data.tool ?? data.name ?? 'tool',
              status: data.status ?? 'running',
              output: data.output ?? data.result ?? data.text ?? '',
              ts: Date.now(),
            },
            ...prev,
          ]);
          return;
        }

        if (data?.role && data?.content) {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: data.role,
              content: data.content,
              ts: data.ts ?? Date.now(),
              meta: data.meta,
            },
          ]);
          return;
        }

        if (typeof data === 'string') {
          setMessages((prev) => [
            ...prev,
            { id: uid(), role: 'system', content: data, ts: Date.now() },
          ]);
        }
      } catch {
        // ignore
      }
    };

    return () => {
      ws.close();
    };
  }, [url, token, authPayload]);

  function sendUserMessage(content: string) {
    const ws = wsRef.current;
    const msg: ChatMessage = { id: uid(), role: 'user', content, ts: Date.now() };
    setMessages((prev) => [...prev, msg]);

    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'message', role: 'user', content }));
  }

  return { connected, messages, toolEvents, sendUserMessage };
}
