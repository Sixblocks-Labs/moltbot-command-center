'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const mockSessions = [
  { id: 'main', name: 'Main session', status: 'active' as const },
  { id: 'research', name: 'Research sweep', status: 'idle' as const },
  { id: 'build', name: 'Build: saas-starter', status: 'done' as const },
];

export function SidebarTasks() {
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
          {mockSessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div>
                <div className="text-sm">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.id}</div>
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
        <div className="text-sm">0 tokens</div>
      </Card>
    </aside>
  );
}
