'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import type { SessionRow } from '@/components/app/sidebar-tasks';
import {
  Bolt,
  PenLine,
  Telescope,
  Target,
  ListTodo,
  Sparkles,
  FileText,
} from 'lucide-react';
import type { JobTemplate } from '@/lib/jobs/store';
import { JobsSheet } from './jobs-sheet';

export function MissionControl({
  connected,
  tokenEstimate,
  sessions,
  jobs,
  onHire,
  onCreateJob,
  onUpsertJob,
  onRemoveJob,
  onTogglePin,
}: {
  connected: boolean;
  tokenEstimate: number;
  sessions: SessionRow[];
  jobs: JobTemplate[];
  onHire: (job: { id: string; title: string; prompt: string }) => void;
  onCreateJob: () => JobTemplate;
  onUpsertJob: (job: JobTemplate) => void;
  onRemoveJob: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const activeCount = sessions.filter((s) => s.status === 'active').length;

  const [moltbook, setMoltbook] = useState<{ day: string; path: string; bullets: string[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/moltbook/daily')
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setMoltbook({ day: j.day, path: j.path, bullets: Array.isArray(j.bullets) ? j.bullets : [] });
      })
      .catch(() => {
        if (cancelled) return;
        setMoltbook(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const iconFor = (name?: string) => {
    const cls = 'h-4 w-4';
    if (name === 'Bolt') return <Bolt className={cls} />;
    if (name === 'PenLine') return <PenLine className={cls} />;
    if (name === 'Telescope') return <Telescope className={cls} />;
    if (name === 'Target') return <Target className={cls} />;
    if (name === 'ListTodo') return <ListTodo className={cls} />;
    if (name === 'Sparkles') return <Sparkles className={cls} />;
    return <FileText className={cls} />;
  };

  return (
    <Card className="min-h-[60vh] md:h-[calc(100dvh-140px)] overflow-visible md:overflow-hidden flex flex-col min-h-0">
      <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
        <div>
          <div className="text-sm font-semibold">Dashboard</div>
          <div className="text-xs text-muted-foreground">
            A tiny HQ for hiring Peter 💾 to make progress.
          </div>
        </div>
        <Badge variant={connected ? 'default' : 'secondary'}>
          {connected ? 'Live' : 'Offline'}
        </Badge>
      </div>

      <ScrollArea className="flex-1 min-h-0 h-full">
        <div className="p-4 space-y-4">
          <section className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Morning Brief</div>
            <Badge variant="outline">Today</Badge>
          </div>
          <Separator className="my-3" />
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Connection</span>
              <span className="font-medium">{connected ? 'Connected' : 'Offline'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Active sessions</span>
              <span className="font-medium">{activeCount}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Token usage (est.)</span>
              <span className="font-medium">~{tokenEstimate.toLocaleString()}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Focus</span>
              <span className="font-medium">Pick a job → ship a chunk</span>
            </li>
          </ul>

          <Separator className="my-3" />

          <div>
            <div className="text-xs font-semibold">Daily Moltbook Learnings</div>
            <div className="mt-2 space-y-2 text-sm">
              {(moltbook?.bullets?.length ? moltbook.bullets : []).slice(0, 5).map((b, i) => (
                <div key={i} className="text-muted-foreground">
                  • {b}
                </div>
              ))}
              {!moltbook?.bullets?.length ? (
                <div className="text-muted-foreground">
                  No learnings yet. (Runs tomorrow at 7:00 AM ET.)
                </div>
              ) : null}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              {moltbook?.path
                ? `Full write-up: ~/clawdbot-brain/journal/moltbook/${moltbook.day}-moltbook-learnings.md`
                : 'Full write-up: ~/clawdbot-brain/journal/moltbook/YYYY-MM-DD-moltbook-learnings.md'}
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                Hire Peter <Sparkles className="h-4 w-4 text-teal-300" />
              </div>
              <div className="text-xs text-muted-foreground">
                JTBD mode: you’re not “using an app” — you’re hiring it to make
                specific progress.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{jobs.length} jobs</Badge>
              <JobsSheet
                jobs={jobs}
                onCreate={onCreateJob}
                onUpsert={onUpsertJob}
                onRemove={onRemoveJob}
                onTogglePin={onTogglePin}
              />
            </div>
          </div>
          <Separator className="my-3" />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {jobs.map((j) => (
              <div
                key={j.id}
                className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/3 p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-[1px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-white/10 text-slate-200">
                        {iconFor(j.icon)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {j.title}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {j.progress}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-muted-foreground">
                      <span className="text-slate-200/80">When:</span> {j.when}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="shrink-0"
                    onClick={() => onHire({ id: j.id, title: j.title, prompt: j.prompt })}
                  >
                    Hire
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-muted-foreground">
            Tip: the more “circumstance + constraints” you paste, the better the
            output.
          </div>
        </section>

          <section className="rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold">Task Tracker</div>
            <Separator className="my-3" />
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.name}</span>
                  <Badge
                    variant={
                      s.status === 'active'
                        ? 'default'
                        : s.status === 'done'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </Card>
  );
}
