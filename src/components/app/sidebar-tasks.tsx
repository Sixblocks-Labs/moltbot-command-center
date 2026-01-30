'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export type SessionRow = {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'done';
};

export function SidebarTasks({
  sessions,
  tokenEstimate,
}: {
  sessions: SessionRow[];
  tokenEstimate: number;
}) {
  return (
    <aside className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Task Tracker</div>
          <Badge variant="secondary">Beta</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Sessions + quick controls. (Wiring to gateway events next.)
        </p>

        <Separator className="my-3" />

        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={
                'group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all duration-200 hover:bg-white/7 hover:shadow-lg hover:shadow-teal-500/10 ' +
                (s.status === 'active'
                  ? 'border-l-4 border-l-teal-400/70'
                  : s.status === 'done'
                    ? 'border-l-4 border-l-white/10'
                    : 'border-l-4 border-l-violet-400/30')
              }
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{s.name}</div>
                <div className="truncate text-[11px] text-slate-400">{s.id}</div>
              </div>
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

        <Separator className="my-3" />

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm">
            New session
          </Button>
          <Button variant="destructive" size="sm">
            Stop task
          </Button>
          <Button variant="outline" size="sm">
            Clear history
          </Button>
          <Button variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Usage</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Token usage display will come from gateway stats.
        </p>
        <Separator className="my-3" />
        <div className="text-sm">~{tokenEstimate.toLocaleString()} tokens</div>
      </Card>
    </aside>
  );
}
