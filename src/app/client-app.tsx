'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const TAB_STORAGE_KEY = 'cc.activeTab';
const LANE_STORAGE_KEY = 'cc.activeLane';
const LANES_STORAGE_KEY = 'cc.lanes';
const DEFAULT_LANES = ['Command Center', 'ARG', 'BizDev'] as const;

function isAppTab(v: any): v is AppTab {
  return v === 'dashboard' || v === 'chat' || v === 'brain';
}

export default function ClientApp({
  gatewayUrl,
  token,
}: {
  gatewayUrl: string;
  token: string;
}) {
  const router = useRouter();

  const [tab, setTab] = useState<AppTab>('dashboard');

  const [lanes, setLanes] = useState<string[]>([...DEFAULT_LANES]);
  const [lane, setLane] = useState<string>('Command Center');
  const [sessionKey, setSessionKey] = useState('main');

  const {
    connected,
    messages,
    toolEvents,
    tasks,
    sendUserMessage,
    request,
    clearLocalHistory,
  } = useGatewayChat({
    url: gatewayUrl,
    token,
    sessionKey,
  });

  const jobs = useJobs(lane);

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
    return `Lane: ${lane} • Gateway: ${gatewayUrl}`;
  }, [gatewayUrl, lane]);

  const footerRight = useMemo(() => {
    return `Token est: ${tokenEstimate.toLocaleString()} • ${new Date().toLocaleTimeString()}`;
  }, [tokenEstimate]);

  // Restore lanes + lane from localStorage.
  useEffect(() => {
    try {
      const rawLanes = window.localStorage.getItem(LANES_STORAGE_KEY);
      if (rawLanes) {
        const parsed = JSON.parse(rawLanes);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string' && x.trim())) {
          setLanes(parsed);
        }
      }
    } catch {
      // ignore
    }

    try {
      const stored = window.localStorage.getItem(LANE_STORAGE_KEY);
      if (stored && stored.trim()) {
        setLane(stored);
        setSessionKey(`${stored}:main`);
      }
    } catch {
      // ignore
    }
  }, []);

  // Restore active tab from URL (?tab=brain) or localStorage.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('tab');
      if (isAppTab(fromUrl)) {
        setTab(fromUrl);
        window.localStorage.setItem(TAB_STORAGE_KEY, fromUrl);
        return;
      }

      const stored = window.localStorage.getItem(TAB_STORAGE_KEY);
      if (isAppTab(stored)) {
        setTab(stored);
        // Also reflect in URL so refresh preserves state even if storage is cleared.
        params.set('tab', stored);
        router.replace(`/?${params.toString()}`);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const p = job.id === 'coding-assistant'
      ? job.prompt.replace('[LANE]', lane)
      : job.prompt;
    sendUserMessage(p);
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

  function changeTab(next: AppTab) {
    setTab(next);
    try {
      window.localStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      // ignore
    }

    try {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', next);
      router.replace(`/?${params.toString()}`);
    } catch {
      // ignore
    }
  }

  return (
    <Shell
      tab={tab}
      connected={connected}
      lane={lane}
      lanes={lanes}
      onLaneChange={(next) => {
        if (next === '__new__') {
          const name = window.prompt('New lane name?');
          const cleaned = String(name || '').trim();
          if (!cleaned) return;

          setLanes((prev) => {
            const nextLanes = prev.includes(cleaned) ? prev : [...prev, cleaned];
            try {
              window.localStorage.setItem(LANES_STORAGE_KEY, JSON.stringify(nextLanes));
            } catch {}
            return nextLanes;
          });

          setLane(cleaned);
          setSessionKey(`${cleaned}:main`);
          clearLocalHistory();
          try {
            window.localStorage.setItem(LANE_STORAGE_KEY, cleaned);
          } catch {}

          toast.success('Lane created', { description: `Now in: ${cleaned}` });
          return;
        }

        const nextLane = String(next);
        setLane(nextLane);
        setSessionKey(`${nextLane}:main`);
        clearLocalHistory();
        try {
          window.localStorage.setItem(LANE_STORAGE_KEY, String(nextLane));
        } catch {}
        toast.success('Lane switched', { description: `Now in: ${nextLane}` });
      }}
      onTabChange={changeTab}
      left={
        <SidebarTasks
          sessions={sessions}
          tasks={tasks.map((t) => ({
            id: t.runId,
            title: t.title,
            subtitle: t.subtitle,
            status: t.status === 'error' ? 'idle' : t.status,
          }))}
          tokenEstimate={tokenEstimate}
          onClearHistory={() => {
            clearLocalHistory();
            toast.success('Cleared local history', {
              description: 'Transcript + runs cleared in the UI (gateway unchanged).',
            });
          }}
          onRefresh={() => {
            window.location.reload();
          }}
          onNewSession={() => {
            const key = `ui-${Date.now().toString(36)}`;
            setSessionKey(key);
            clearLocalHistory();
            toast.success('New session', {
              description: `Switched to sessionKey: ${key}`,
            });
          }}
          onStopTask={() => {
            toast.message('Stop task not supported yet', {
              description: 'We are not calling gateway stop APIs from the UI yet.',
            });
          }}
        />
      }
      main={main}
      right={<RightToolOutput events={toolEvents} />}
      footerLeft={footerLeft}
      footerRight={footerRight}
    />
  );
}
