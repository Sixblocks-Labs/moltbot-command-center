'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { ToolEvent } from '@/lib/gateway/types';

export function RightToolOutput({ events }: { events: ToolEvent[] }) {
  const [open, setOpen] = useState(true);

  const grouped = useMemo(() => events.slice(0, 30), [events]);

  return (
    <aside>
      <Card className="min-h-[60vh] md:h-[calc(100dvh-140px)] overflow-hidden">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle tool output"
            >
              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="text-sm font-semibold">Live Tool Output</div>
          </div>
          <Badge variant="secondary">{events.length}</Badge>
        </div>

        <div
          className={
            'grid transition-all duration-200 ' +
            (open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-80')
          }
        >
          <div className="overflow-hidden">
            <ScrollArea className="h-full p-3">
            <div className="space-y-2">
              {grouped.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No tool events yet.
                </div>
              ) : (
                grouped.map((e) => (
                  <div key={e.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{e.tool}</div>
                      <Badge
                        variant={
                          e.status === 'done'
                            ? 'default'
                            : e.status === 'error'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {e.status}
                      </Badge>
                    </div>
                    {e.output ? (
                      <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-2 font-mono text-[11px] leading-snug text-slate-200">
                        {e.output}
                      </pre>
                    ) : null}
                  </div>
                ))
              )}
            </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </aside>
  );
}
