'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Markdown } from '@/components/chat/markdown';

type DocMeta = {
  id: string;
  path: string;
  title: string;
  folder: string;
  updatedAt: number;
};

export function BrainPanel() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selected, setSelected] = useState<DocMeta | null>(null);
  const [content, setContent] = useState<string>('');
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  async function refresh() {
    await fetch('/api/brain/ensure', { method: 'POST' });
    const res = await fetch('/api/brain/docs');
    const json = await res.json();
    setDocs(json.docs);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function loadDoc(d: DocMeta) {
    setSelected(d);
    setMode('view');
    const res = await fetch(`/api/brain/doc?path=${encodeURIComponent(d.path)}`);
    const json = await res.json();
    setContent(json.content);
  }

  async function save() {
    if (!selected) return;
    await fetch('/api/brain/doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selected.path, content }),
    });
    setMode('view');
    await refresh();
  }

  async function search() {
    if (!q.trim()) return refresh();
    const res = await fetch(`/api/brain/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    setDocs(json.docs);
  }

  const title = useMemo(
    () => (selected ? `${selected.title}` : 'Second Brain'),
    [selected]
  );

  return (
    <Card className="h-[calc(100dvh-140px)] overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">
            Documents from ~/clawdbot-brain
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{docs.length}</Badge>
          <Button size="sm" variant="outline" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid h-full grid-cols-[320px_1fr]">
        <div className="border-r">
          <div className="p-3">
            <div className="flex gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search docs…"
              />
              <Button size="sm" onClick={search}>
                Search
              </Button>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100%-56px)]">
            <div className="p-2">
              {docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => loadDoc(d)}
                  className={`w-full rounded-md border px-3 py-2 text-left hover:bg-muted/50 ${
                    selected?.id === d.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">{d.title}</div>
                    <Badge variant="outline" className="shrink-0">
                      {d.folder}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(d.updatedAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="relative">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a document.
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="text-xs text-muted-foreground truncate">
                  {selected.path}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMode((m) => (m === 'view' ? 'edit' : 'view'))}
                  >
                    {mode === 'view' ? 'Edit' : 'Preview'}
                  </Button>
                  <Button size="sm" onClick={save}>
                    Save
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-full p-4">
                {mode === 'edit' ? (
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[65dvh] font-mono text-xs"
                  />
                ) : (
                  <Markdown content={content} />
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
