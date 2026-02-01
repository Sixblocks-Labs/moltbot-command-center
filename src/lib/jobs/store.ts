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
      id: 'discipleship',
      title: 'Follow Jesus first (2026)',
      progress: 'keep Jesus as my highest love; put His words into practice',
      when: 'When I feel my projects (or anything) becoming too big in my heart',
      prompt:
        "Job: Follow Jesus first (2026)\n\nContext: I believe in Jesus Christ. I want my heart to belong to Him first. I’m prone to loving things in this world more than Him.\n\nAsk: Help me put things back in order using Scripture (Old + New Testament), with emphasis on who Jesus says He is. If I tell you I’m over-loving a project, respond with gentle, specific perspective + 1-3 practical next steps to obey today (James 1:22).\n\nLens phrase: The Bible as Architecture (help me think in systems while staying faithful).\n\nGuardrails: This isn’t about scrapping projects; it’s about rightly ordered loves.\n\nOutput: (1) Scripture-based perspective, (2) a short prayer/commitment draft (optional), (3) one concrete action for today.",
      icon: 'HeartHandshake',
      pinned: true,
      updatedAt: now,
    },
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

function mergeInMissingDefaultJobs(current: JobTemplate[]): JobTemplate[] {
  const defaults = defaultJobs();
  const existingIds = new Set(current.map((j) => j.id));

  const missing = defaults.filter((d) => !existingIds.has(d.id));
  if (!missing.length) return current;

  // Add missing defaults at the top so they’re visible without disrupting the user’s custom ordering too much.
  return [...missing, ...current];
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

    const base = jobs.length ? jobs : defaultJobs();
    return mergeInMissingDefaultJobs(base);
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
