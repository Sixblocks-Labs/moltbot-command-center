'use client';

import { Badge } from '@/components/ui/badge';

const TAG_STYLES: Record<string, string> = {
  Journal: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  Ideas: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
  Notes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  Research: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
};

export function TagBadge({ tag }: { tag: string }) {
  const cls = TAG_STYLES[tag] ?? 'border-border bg-muted text-muted-foreground';
  return (
    <Badge variant="outline" className={`shrink-0 ${cls}`}>
      {tag}
    </Badge>
  );
}
