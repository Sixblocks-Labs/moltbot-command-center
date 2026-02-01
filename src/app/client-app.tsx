'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Shell, type AppTab } from '@/components/app/shell';
import { SidebarTasks } from '@/components/app/sidebar-tasks';
import { RightToolOutput } from '@/components/app/right-tool-output';
import { ChatPanel } from '@/components/chat/chat-panel';
import { BrainPanel } from '@/components/brain/brain-panel';
import { MissionControl } from '@/components/dashboard/mission-control';
import { useGatewayChat } from '@/lib/gateway/client';
import { useJobs } from '@/lib/jobs/use-jobs';

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

  const { connected, messages, toolEvents, sendUserMessage, request } = useGatewayChat({
    url: gatewayUrl,
    token,
  });

  const jobs = useJobs();

  const tokenEstimate = useMemo(() => {
    const combined = messages.map((m) => m.content).join('\n');
    return estimateTokens(combined);
  }, [messages]);

  const [sessions, setSessions] = useState<{ id: string; name: string; status: 'active' | 'idle' | 'done' }[]>([
    {
      id: 'main',
      name: 'Main session',
      status: connected ? 'active' : 'idle',
    },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      if (!connected) {
        setSessions([
          {
            id: 'main',
            name: 'Main session',
            status: 'idle',
          },
        ]);
        return;
      }

      try {
        const res = await request('sessions.list', {
          limit: 12,
          includeGlobal: false,
          includeUnknown: false,
          includeDerivedTitles: true,
        });

        const rawSessions = (res?.sessions ?? []) as Array<any>;
        const now = Date.now();

        const mapped = rawSessions
          .map((s) => {
            const key = String(s?.key ?? '');
            const displayName = String(
              s?.derivedTitle || s?.displayName || s?.label || s?.subject || s?.sessionId || key
            );
            const updatedAt = typeof s?.updatedAt === 'number' ? s.updatedAt : 0;

            const status: 'active' | 'idle' | 'done' =
              updatedAt && now - updatedAt < 2 * 60_000 ? 'active' : 'idle';

            return {
              id: key || String(s?.sessionId ?? displayName),
              name: displayName,
              status,
            };
          })
          .filter((s) => Boolean(s.id) && Boolean(s.name))
          // Ensure main is visible at top
          .sort((a, b) => (a.id === 'main' ? -1 : b.id === 'main' ? 1 : 0));

        if (!cancelled) {
          setSessions(mapped.length ? mapped : sessions);
        }
      } catch {
        // keep existing sessions
      }
    }

    refresh();
    const t = window.setInterval(refresh, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function hire(job: { id: string; title: string; prompt: string }) {
    setTab('chat');

    if (!connected) {
      toast.error('Gateway offline', {
        description: 'Connect the gateway to hire Peter for work.',
      });
      return;
    }

    sendUserMessage(job.prompt);
    toast.success(`Hired for: ${job.title}`, {
      description: 'Prompt sent to Chat.',
    });
  }

  const main =
    tab === 'dashboard' ? (
      <MissionControl
        connected={connected}
        tokenEstimate={tokenEstimate}
        sessions={sessions}
        jobs={jobs.jobs}
        onHire={hire}
        onCreateJob={jobs.create}
        onUpsertJob={jobs.upsert}
        onRemoveJob={jobs.remove}
        onTogglePin={jobs.togglePin}
      />
    ) : tab === 'chat' ? (
      <ChatPanel connected={connected} messages={messages} onSend={sendUserMessage} />
    ) : (
      <BrainPanel />
    );

  return (
    <Shell
      tab={tab}
      connected={connected}
      onTabChange={setTab}
      left={<SidebarTasks sessions={sessions} tokenEstimate={tokenEstimate} />}
      main={main}
      right={<RightToolOutput events={toolEvents} />}
      footerLeft={footerLeft}
      footerRight={footerRight}
    />
  );
}
