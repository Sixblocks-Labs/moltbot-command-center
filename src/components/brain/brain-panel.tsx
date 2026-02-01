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
import { TagBadge } from './tag-badge';
import { NewDocSheet } from './new-doc-sheet';
import { yyyyMmDd } from '@/lib/brain/dates';
import { FileText, NotebookPen, Lightbulb, FlaskConical, Zap } from 'lucide-react';

type DocMeta = {
  id: string;
  path: string;
  title: string;
  folder: string;
  updatedAt: number;
};

function folderToTag(folder: string) {
  const f = folder.toLowerCase();
  if (f.includes('journal')) return 'Journal';
  if (f.includes('ideas')) return 'Ideas';
  if (f.includes('notes')) return 'Notes';
  if (f.includes('research')) return 'Research';
  return folder;
}

function TagIcon({ tag }: { tag: string }) {
  const cls = 'h-4 w-4 text-slate-400';
  if (tag === 'Journal') return <NotebookPen className={cls} />;
  if (tag === 'Ideas') return <Lightbulb className={cls} />;
  if (tag === 'Research') return <FlaskConical className={cls} />;
  return <FileText className={cls} />;
}

export function BrainPanel() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [selected, setSelected] = useState<DocMeta | null>(null);
  const [content, setContent] = useState<string>('');
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [sort, setSort] = useState<'date' | 'title' | 'tag'>('date');

  async function refresh() {
    await fetch('/api/brain/ensure', { method: 'POST' });
    const res = await fetch(`/api/brain/docs?ts=${Date.now()}`, { cache: 'no-store' });
    const json = await res.json();
    setDocs(json.docs);
  }

  const viewDocs = useMemo(() => {
    const arr = [...docs];
    if (sort === 'date') {
      arr.sort((a, b) => b.updatedAt - a.updatedAt);
    } else if (sort === 'title') {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      arr.sort((a, b) => a.folder.localeCompare(b.folder));
    }
    return arr;
  }, [docs, sort]);

  useEffect(() => {
    refresh();
  }, []);

  const [dirty, setDirty] = useState(false);

  async function loadDoc(d: DocMeta) {
    setSelected(d);
    setMode('view');
    setDirty(false);
    const res = await fetch(`/api/brain/doc?path=${encodeURIComponent(d.path)}`);
    const json = await res.json();
    setContent(json.content);
  }

  async function quickCapture() {
    const day = yyyyMmDd();
    const docPath = `journal/${day}.md`;

    // Create if missing (but don't clobber if it exists).
    try {
      const res = await fetch(`/api/brain/doc?path=${encodeURIComponent(docPath)}`);
      if (res.ok) {
        const json = await res.json();
        setSelected({
          id: docPath,
          path: docPath,
          title: day,
          folder: 'journal',
          updatedAt: Date.now(),
        });
        setMode('edit');
        setContent(json.content ?? '');
        return;
      }
    } catch {
      // ignore
    }

    const starter = `# Journal — ${day}\n\n## What I’m trying to make progress on\n\n- \n\n## Notes\n\n- \n`;
    await fetch('/api/brain/doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: docPath, content: starter }),
    });

    await refresh();
    await loadDoc({
      id: docPath,
      path: docPath,
      title: day,
      folder: 'journal',
      updatedAt: Date.now(),
    });
    setMode('edit');
  }

  async function save() {
    if (!selected) return;
    await fetch('/api/brain/doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selected.path, content }),
    });
    setMode('view');
    setDirty(false);
    await refresh();
  }

  async function deleteSelected() {
    if (!selected) return;
    if (dirty) return;

    const ok = window.confirm(`Delete "${selected.title}"? This cannot be undone.`);
    if (!ok) return;

    await fetch(`/api/brain/doc?path=${encodeURIComponent(selected.path)}`, {
      method: 'DELETE',
    });

    setSelected(null);
    setContent('');
    setMode('view');
    setDirty(false);
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
    <Card className="min-h-[60vh] md:h-[calc(100dvh-140px)] overflow-hidden">
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">
            Documents from ~/clawdbot-brain
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <Button size="sm" variant="outline" onClick={quickCapture}>
            <Zap className="mr-2 h-4 w-4" /> Quick capture
          </Button>
          <NewDocSheet
            onCreated={async (docPath) => {
              await refresh();
              await loadDoc({
                id: docPath,
                path: docPath,
                title: docPath.split('/').pop()?.replace(/\.md$/, '') ?? docPath,
                folder: docPath.split('/')[0] ?? 'notes',
                updatedAt: Date.now(),
              });
              setMode('edit');
            }}
          />
          <Badge variant="secondary">{docs.length}</Badge>
          <Button size="sm" variant="outline" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid h-full grid-cols-1 md:grid-cols-[320px_1fr]">
        <div className="md:border-r">
          <div className="p-3 space-y-2">
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

            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] text-muted-foreground">Sort</div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sort === 'date' ? 'secondary' : 'outline'}
                  onClick={() => setSort('date')}
                >
                  Date
                </Button>
                <Button
                  size="sm"
                  variant={sort === 'title' ? 'secondary' : 'outline'}
                  onClick={() => setSort('title')}
                >
                  Title
                </Button>
                <Button
                  size="sm"
                  variant={sort === 'tag' ? 'secondary' : 'outline'}
                  onClick={() => setSort('tag')}
                >
                  Tag
                </Button>
              </div>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-auto md:h-[calc(100%-56px)]">
            <div className="p-2">
              {viewDocs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => loadDoc(d)}
                  className={
                    `w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left backdrop-blur-sm transition-all duration-200 hover:bg-white/7 hover:shadow-lg hover:shadow-teal-500/10 ` +
                    (selected?.id === d.id ? 'ring-1 ring-teal-500/30' : '')
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <TagIcon tag={folderToTag(d.folder)} />
                      <div className="truncate text-sm font-medium">{d.title}</div>
                    </div>
                    <TagBadge tag={folderToTag(d.folder)} />
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
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={deleteSelected}
                    disabled={!selected || dirty}
                    title={dirty ? 'Save or discard changes before deleting' : 'Delete this document'}
                  >
                    Delete
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
                    onChange={(e) => {
                      setContent(e.target.value);
                      setDirty(true);
                    }}
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
