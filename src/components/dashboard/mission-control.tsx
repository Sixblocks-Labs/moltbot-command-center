'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { SessionRow } from '@/components/app/sidebar-tasks';

export function MissionControl({
  connected,
  tokenEstimate,
  sessions,
}: {
  connected: boolean;
  tokenEstimate: number;
  sessions: SessionRow[];
}) {
  const activeCount = sessions.filter((s) => s.status === 'active').length;

  return (
    <Card className="min-h-[60vh] md:h-[calc(100dvh-140px)] overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Dashboard</div>
          <div className="text-xs text-muted-foreground">
            Morning brief + sessions + usage.
          </div>
        </div>
        <Badge variant={connected ? 'default' : 'secondary'}>
          {connected ? 'Live' : 'Offline'}
        </Badge>
      </div>

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
              <span className="text-muted-foreground">What you’re working on</span>
              <span className="font-medium">(next chunk)</span>
            </li>
          </ul>
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

        <section className="rounded-xl border bg-card p-4">
          <div className="text-sm font-semibold">Notes</div>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">
            Next: plug in weather, trending content, and overnight work summaries.
          </p>
        </section>
      </div>
    </Card>
  );
}
