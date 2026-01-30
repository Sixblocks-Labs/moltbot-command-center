'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shell, type AppTab } from '@/components/app/shell';
import { SidebarTasks } from '@/components/app/sidebar-tasks';
import { RightToolOutput } from '@/components/app/right-tool-output';
import { ChatPanel } from '@/components/chat/chat-panel';
import { BrainPanel } from '@/components/brain/brain-panel';
import { MissionControl } from '@/components/dashboard/mission-control';
import { useGatewayChat } from '@/lib/gateway/client';

function estimateTokens(text: string) {
  // Rough heuristic: ~4 chars/token in English.
  return Math.ceil(text.length / 4);
}

export default function ClientApp({
  gatewayUrl,
  token,
}: {
  gatewayUrl: string;
  token: string;
}) {
  const [tab, setTab] = useState<AppTab>('dashboard');

  const { connected, messages, toolEvents, sendUserMessage } = useGatewayChat({
    url: gatewayUrl,
    token,
  });

  const tokenEstimate = useMemo(() => {
    const combined = messages.map((m) => m.content).join('\n');
    return estimateTokens(combined);
  }, [messages]);

  const sessions = useMemo(() => {
    return [
      {
        id: 'main',
        name: 'Main session',
        status: connected ? ('active' as const) : ('idle' as const),
      },
    ];
  }, [connected]);

  const footerLeft = useMemo(() => {
    return `Gateway: ${gatewayUrl}`;
  }, [gatewayUrl]);

  const footerRight = useMemo(() => {
    return `Token est: ${tokenEstimate.toLocaleString()} • ${new Date().toLocaleTimeString()}`;
  }, [tokenEstimate]);

  useEffect(() => {
    fetch('/api/brain/ensure', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <Shell
      tab={tab}
      connected={connected}
      onTabChange={setTab}
      footerLeft={footerLeft}
      footerRight={footerRight}
    >
      <SidebarTasks sessions={sessions} tokenEstimate={tokenEstimate} />

      {tab === 'dashboard' ? (
        <MissionControl
          connected={connected}
          tokenEstimate={tokenEstimate}
          sessions={sessions}
        />
      ) : tab === 'chat' ? (
        <ChatPanel
          connected={connected}
          messages={messages}
          onSend={sendUserMessage}
        />
      ) : (
        <BrainPanel />
      )}

      <RightToolOutput events={toolEvents} />
    </Shell>
  );
}
