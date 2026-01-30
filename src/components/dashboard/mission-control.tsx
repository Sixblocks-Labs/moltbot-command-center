'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function MissionControl() {
  return (
    <Card className="h-[calc(100dvh-140px)] overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Mission Control</div>
          <div className="text-xs text-muted-foreground">
            Morning brief + research rollup.
          </div>
        </div>
        <Badge variant="secondary">Draft</Badge>
      </div>

      <div className="p-4 space-y-4">
        <section className="rounded-xl border bg-card p-4">
          <div className="text-sm font-semibold">Morning Brief</div>
          <Separator className="my-3" />
          <ul className="space-y-2 text-sm">
            <li className="text-muted-foreground">Weather: (wire in weather skill)</li>
            <li className="text-muted-foreground">Today’s tasks: (wire to tasks)</li>
            <li className="text-muted-foreground">Overnight work: (wire to gateway logs)</li>
            <li className="text-muted-foreground">Trending content: (wire to SEO/social)</li>
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-4">
          <div className="text-sm font-semibold">Afternoon Research</div>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">
            Latest research report will render here (from ~/clawdbot-brain/research).
          </p>
        </section>

        <section className="rounded-xl border bg-card p-4">
          <div className="text-sm font-semibold">Action Items</div>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">
            Recommendations + next moves.
          </p>
        </section>
      </div>
    </Card>
  );
}
