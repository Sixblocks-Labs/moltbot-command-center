'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { JobTemplate } from '@/lib/jobs/store';
import { JobEditor } from './job-editor';
import { Pin, PinOff, Plus, Trash2 } from 'lucide-react';

export function JobsSheet({
  jobs,
  onCreate,
  onUpsert,
  onRemove,
  onTogglePin,
}: {
  jobs: JobTemplate[];
  onCreate: () => JobTemplate;
  onUpsert: (j: JobTemplate) => void;
  onRemove: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = useMemo(() => jobs.find((j) => j.id === editingId) ?? null, [jobs, editingId]);

  function handleCreate() {
    const j = onCreate();
    setEditingId(j.id);
    toast.success('Job created', { description: 'Now edit the prompt and save.' });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          Manage jobs
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[96vw] max-w-2xl p-0 overflow-hidden"
      >
        <SheetHeader className="border-b border-white/10 bg-background/60 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <SheetTitle>Job Library</SheetTitle>
              <div className="text-xs text-muted-foreground">
                Your JTBD templates. Pin the ones you hire weekly.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{jobs.length}</Badge>
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" /> New
              </Button>
            </div>
          </div>
        </SheetHeader>

        {!editing ? (
          <ScrollArea className="h-[calc(100dvh-64px)]">
            <div className="p-4 space-y-3">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold">{j.title}</div>
                        {j.pinned ? <Badge variant="outline">Pinned</Badge> : null}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground truncate">
                        {j.progress}
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        <span className="text-slate-200/80">When:</span> {j.when}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => onTogglePin(j.id)}>
                        {j.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(j.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          onRemove(j.id);
                          toast.success('Job deleted');
                        }}
                        aria-label="Delete job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-3" />
                  <div className="text-[11px] text-muted-foreground whitespace-pre-wrap line-clamp-4">
                    {j.prompt}
                  </div>
                </div>
              ))}

              <div className="pt-2 text-[11px] text-muted-foreground">
                These are stored locally in your browser for now.
              </div>
            </div>
          </ScrollArea>
        ) : (
          <JobEditor
            job={editing}
            onCancel={() => setEditingId(null)}
            onSave={(j) => {
              onUpsert(j);
              setEditingId(null);
              toast.success('Saved', { description: 'Job updated.' });
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
