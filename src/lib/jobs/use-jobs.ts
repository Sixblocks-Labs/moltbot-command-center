'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadJobs, saveJobs, type JobTemplate, newJobTemplate, PROTECTED_JOB_IDS } from './store';

export function useJobs() {
  const [jobs, setJobs] = useState<JobTemplate[]>([]);

  useEffect(() => {
    setJobs(loadJobs());
  }, []);

  useEffect(() => {
    if (!jobs.length) return;
    saveJobs(jobs);
  }, [jobs]);

  const sorted = useMemo(() => {
    const pinned = jobs.filter((j) => j.pinned);
    const rest = jobs.filter((j) => !j.pinned);

    const byStable = (a: JobTemplate, b: JobTemplate) => {
      const ai = typeof a.sortIndex === 'number' ? a.sortIndex : Number.POSITIVE_INFINITY;
      const bi = typeof b.sortIndex === 'number' ? b.sortIndex : Number.POSITIVE_INFINITY;
      if (ai !== bi) return ai - bi;
      return b.updatedAt - a.updatedAt;
    };

    pinned.sort(byStable);
    rest.sort(byStable);

    return [...pinned, ...rest];
  }, [jobs]);

  function upsert(job: JobTemplate) {
    setJobs((prev) => {
      const now = Date.now();
      const next = prev.some((j) => j.id === job.id)
        ? prev.map((j) => (j.id === job.id ? { ...job, updatedAt: now } : j))
        : [{ ...job, updatedAt: now }, ...prev];
      return next;
    });
  }

  function remove(id: string) {
    if (PROTECTED_JOB_IDS.includes(id as any)) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  function togglePin(id: string) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, pinned: !j.pinned, updatedAt: Date.now() } : j))
    );
  }

  function create() {
    const j = newJobTemplate();
    setJobs((prev) => [j, ...prev]);
    return j;
  }

  function resetDefaults() {
    setJobs(loadJobs());
  }

  return { jobs: sorted, setJobs, upsert, remove, togglePin, create, resetDefaults };
}
