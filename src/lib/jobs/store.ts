'use client';

export type JobTemplate = {
  id: string;
  title: string;
  progress: string;
  when: string;
  prompt: string;
  icon?: string; // lucide icon name (optional)
  pinned?: boolean;
  updatedAt: number;
};

const STORAGE_KEY = 'mcc.jobTemplates.v1';

export function defaultJobs(): JobTemplate[] {
  const now = Date.now();
  return [
    {
      id: 'ship',
      title: 'Ship code',
      progress: 'turn ambiguity into a clean, testable PR',
      when: 'When you have an idea + a pile of edge cases',
      prompt:
        "Job: Ship code\nContext: (paste repo + goal + constraints)\nWhat I want: a step-by-step plan, then implement with rigorous tests.\nSuccess looks like: (definition of done)\nOpen questions: (if any)",
      icon: 'Bolt',
      pinned: true,
      updatedAt: now,
    },
    {
      id: 'prospecting',
      title: 'Prospect research',
      progress: 'find high-signal targets + personalization hooks',
      when: 'When you need 10 smart leads, not 100 random ones',
      prompt:
        "Job: Prospect research\nICP: (founders / CS / product / ops)\nIndustry: (optional)\nConstraints: (geo, size, funding stage, tech stack, regulated?)\nOutput: 10 targets + why now + messaging angles + 1 opener each.",
      icon: 'Target',
      pinned: true,
      updatedAt: now,
    },
    {
      id: 'content',
      title: 'Write + publish',
      progress: 'turn raw notes into a sharp post in your voice',
      when: 'When you have opinions but no draft',
      prompt:
        "Job: Write content\nFormat: (LinkedIn post / newsletter / thread)\nRaw material: (paste bullets, links, notes)\nTone: direct, grounded, slightly spicy\nAsk: draft 3 hooks, pick best, then write the full piece + CTA.",
      icon: 'PenLine',
      pinned: true,
      updatedAt: now,
    },
    {
      id: 'plan',
      title: 'Plan the next chunk',
      progress: 'decide what matters now (and what gets ignored)',
      when: 'When your brain has 14 tabs open',
      prompt:
        "Job: Plan my next chunk\nTimebox: (30/60/90 minutes)\nCurrent obligations: (paste)\nCandidate tasks: (paste)\nAsk: pick the highest-leverage next action + a tiny checklist + a stopping rule.",
      icon: 'ListTodo',
      pinned: false,
      updatedAt: now,
    },
    {
      id: 'sensemaking',
      title: 'Sensemake',
      progress: 'turn messy input into a crisp model + next actions',
      when: 'When you read something that should change your strategy',
      prompt:
        "Job: Sensemaking\nInput: (paste article/notes/transcript)\nAsk: extract the core claim, the assumptions, the useful mental models, and 5 concrete actions to try this week.",
      icon: 'Telescope',
      pinned: false,
      updatedAt: now,
    },
  ];
}

export function loadJobs(): JobTemplate[] {
  if (typeof window === 'undefined') return defaultJobs();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultJobs();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultJobs();

    const now = Date.now();
    const jobs: JobTemplate[] = parsed
      .filter((j) => j && typeof j === 'object')
      .map((j: any) => ({
        id: String(j.id ?? ''),
        title: String(j.title ?? ''),
        progress: String(j.progress ?? ''),
        when: String(j.when ?? ''),
        prompt: String(j.prompt ?? ''),
        icon: typeof j.icon === 'string' ? j.icon : undefined,
        pinned: !!j.pinned,
        updatedAt: typeof j.updatedAt === 'number' ? j.updatedAt : now,
      }))
      .filter((j) => j.id && j.title && j.prompt);

    return jobs.length ? jobs : defaultJobs();
  } catch {
    return defaultJobs();
  }
}

export function saveJobs(jobs: JobTemplate[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function newJobTemplate(): JobTemplate {
  const now = Date.now();
  const id = `job-${now}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    title: 'New job',
    progress: 'describe the progress this helps you make',
    when: 'when you are in a specific situation',
    prompt: 'Job: (name)\nContext: ...\nAsk: ...',
    icon: 'Sparkles',
    pinned: false,
    updatedAt: now,
  };
}
