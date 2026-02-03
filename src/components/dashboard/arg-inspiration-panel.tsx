'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export const ARG_TAGS = [
  'Narrative Design',
  'Puzzle Architecture',
  'Character Development',
  'Platform Selection',
  'Community Management',
  'Trail Markers',
  'Rabbit Holes',
  'Asset Creation',
  'Timeline Planning',
  'Player Rewards',
] as const;

type Tag = (typeof ARG_TAGS)[number];

type Entry = {
  header: string;
  tag?: string;
  body: string;
};

function excerpt(s: string, n = 260) {
  const clean = s.replace(/\s+/g, ' ').trim();
  if (clean.length <= n) return clean;
  return clean.slice(0, n).trim() + '…';
}

export function ArgInspirationPanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tagFilter, setTagFilter] = useState<'All' | Tag>('All');
  const [sort, setSort] = useState<'Newest' | 'Oldest'>('Newest');

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/arg/inspo', { cache: 'no-store' });
      const json = await res.json();
      setEntries(Array.isArray(json?.entries) ? json.entries : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (tagFilter !== 'All') {
      list = list.filter((e) => (e.tag || '').trim() === tagFilter);
    }

    // We don’t have guaranteed sortable timestamps; treat file order as chronological.
    // Newest: last blocks first.
    list = sort === 'Newest' ? [...list].reverse() : [...list];
    return list;
  }, [entries, tagFilter, sort]);

  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">ARG Inspiration</div>
          <div className="text-xs text-muted-foreground">
            Tagged inspiration pulled from <code>arginspo.md</code>.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{entries.length} entries</Badge>
          <Button size="sm" variant="outline" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[11px] text-muted-foreground">Tag</label>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value as any)}
        >
          <option value="All">All</option>
          {ARG_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="ml-2 text-[11px] text-muted-foreground">Sort</label>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
        </select>

        {tagFilter !== 'All' ? (
          <Badge variant="outline" className="ml-2">
            Filtering: {tagFilter}
          </Badge>
        ) : null}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-300">Failed to load: {error}</div>
        ) : !filtered.length ? (
          <div className="text-sm text-muted-foreground">
            No entries match this filter yet.
          </div>
        ) : (
          <ScrollArea className="h-[340px]">
            <div className="space-y-3 pr-3">
              {filtered.map((e, idx) => (
                <div
                  key={`${e.header}-${idx}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold truncate">{e.header}</div>
                    {e.tag ? <Badge variant="secondary">{e.tag}</Badge> : null}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground whitespace-pre-wrap">
                    {excerpt(e.body)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground">
        Tip: when you submit inspiration via the job card, include a tag so filtering works.
      </div>
    </section>
  );
}
