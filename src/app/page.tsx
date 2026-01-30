'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shell, type AppTab } from '@/components/app/shell';
import { SidebarTasks } from '@/components/app/sidebar-tasks';
import { RightToolOutput } from '@/components/app/right-tool-output';
import { ChatPanel } from '@/components/chat/chat-panel';
import { BrainPanel } from '@/components/brain/brain-panel';
import { MissionControl } from '@/components/dashboard/mission-control';
import { useGatewayChat } from '@/lib/gateway/client';

export default function Home() {
  const [tab, setTab] = useState<AppTab>('dashboard');

  const gatewayUrl =
    process.env.NEXT_PUBLIC_CLAWDBOT_GATEWAY_URL || 'ws://100.102.236.81:18789';
  const token = process.env.NEXT_PUBLIC_CLAWDBOT_GATEWAY_TOKEN || '';

  const { connected, messages, toolEvents, sendUserMessage } = useGatewayChat({
    url: gatewayUrl,
    token,
  });

  const footerLeft = useMemo(() => {
    return `Token: ${token ? 'set' : 'missing'} • Gateway: ${gatewayUrl}`;
  }, [token, gatewayUrl]);

  const footerRight = useMemo(() => {
    return `Last sync: ${new Date().toLocaleTimeString()}`;
  }, []);

  useEffect(() => {
    // Ensure brain folders exist on first load.
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
      <SidebarTasks />

      {tab === 'dashboard' ? (
        <MissionControl />
      ) : tab === 'chat' ? (
        <ChatPanel connected={connected} messages={messages} onSend={sendUserMessage} />
      ) : (
        <BrainPanel />
      )}

      <RightToolOutput events={toolEvents} />
    </Shell>
  );
}
