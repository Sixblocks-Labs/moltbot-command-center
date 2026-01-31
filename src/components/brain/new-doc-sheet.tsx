'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const FOLDERS = ['journal', 'notes', 'ideas', 'research', 'tasks'] as const;

type Folder = (typeof FOLDERS)[number];

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function NewDocSheet({
  onCreated,
}: {
  onCreated: (docPath: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [folder, setFolder] = useState<Folder>('notes');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const path = useMemo(() => {
    const base = slugify(title) || 'untitled';
    return `${folder}/${base}.md`;
  }, [folder, title]);

  async function create() {
    if (!title.trim()) {
      toast.error('Add a title');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/brain/doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          content: content?.trim()
            ? content
            : `# ${title.trim()}\n\n`,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? `Create failed (${res.status})`);
      }

      toast.success('Created', { description: path });
      setOpen(false);
      setTitle('');
      setContent('');
      onCreated(path);
    } catch (e: any) {
      toast.error('Could not create doc', { description: String(e?.message || e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> New
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[96vw] max-w-xl p-0 overflow-hidden">
        <SheetHeader className="border-b border-white/10 bg-background/60 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <SheetTitle>New Brain Doc</SheetTitle>
              <div className="text-xs text-muted-foreground">
                Create a markdown file in ~/clawdbot-brain.
              </div>
            </div>
            <Badge variant="secondary">.md</Badge>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {FOLDERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={folder === f ? 'secondary' : 'outline'}
                onClick={() => setFolder(f)}
              >
                {f}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-muted-foreground">Title</div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. moltbot command center roadmap" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] text-muted-foreground">Path</div>
              <Badge variant="outline" className="truncate max-w-[70%]">{path}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-muted-foreground">Starter content (optional)</div>
            <Textarea
              className="min-h-[220px] font-mono text-xs"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Title\n\n- bullets..."
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={create}>
              Create
            </Button>
          </div>

          <div className="text-[11px] text-muted-foreground">
            Note: existing files with the same path will be overwritten.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
