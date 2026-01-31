'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { JobTemplate } from '@/lib/jobs/store';

export function JobEditor({
  job,
  onSave,
  onCancel,
}: {
  job: JobTemplate;
  onSave: (job: JobTemplate) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<JobTemplate>(job);

  const valid = useMemo(() => {
    return !!draft.title.trim() && !!draft.prompt.trim();
  }, [draft.title, draft.prompt]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">Edit job</div>
          <div className="text-xs text-muted-foreground">
            Make it specific: progress + circumstance + a good first prompt.
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSave(draft)}>
            Save
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-3">
        <label className="grid gap-1">
          <div className="text-[11px] text-muted-foreground">Title</div>
          <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </label>

        <label className="grid gap-1">
          <div className="text-[11px] text-muted-foreground">Progress statement</div>
          <Input
            value={draft.progress}
            onChange={(e) => setDraft({ ...draft, progress: e.target.value })}
          />
        </label>

        <label className="grid gap-1">
          <div className="text-[11px] text-muted-foreground">When (circumstances)</div>
          <Input value={draft.when} onChange={(e) => setDraft({ ...draft, when: e.target.value })} />
        </label>

        <label className="grid gap-1">
          <div className="text-[11px] text-muted-foreground">Prompt template</div>
          <Textarea
            className="min-h-[240px] font-mono text-xs"
            value={draft.prompt}
            onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
          />
        </label>

        <div className="text-[11px] text-muted-foreground">
          Tip: include a “Success looks like” line and a “Constraints” line.
        </div>
      </div>
    </div>
  );
}
