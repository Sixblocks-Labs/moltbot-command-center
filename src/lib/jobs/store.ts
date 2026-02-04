'use client';

export const PROTECTED_JOB_IDS = [
  'discipleship',
  'prospect-research',
  'write-publish',
  'arg-inspiration',
  'arg-infrastructure',
] as const;

// Jobs removed from the product (not just unpinned). We filter these out even if
// they exist in older localStorage.
export const REMOVED_JOB_IDS = [
  'ship-it',
  'sensemake',
  'debug-this',
  'morning-brief',
  'overnight-build',
  'wire-it-up',
  'secure-audit',
  'plan-next-chunk',
] as const;

export type ProtectedJobId = (typeof PROTECTED_JOB_IDS)[number];

export type JobTemplate = {
  id: string;
  title: string;
  progress: string;
  when: string;
  prompt: string;
  icon?: string; // lucide icon name (optional)
  pinned?: boolean;
  /**
   * Stable ordering for built-in templates (lower = earlier).
   * Custom jobs can omit this.
   */
  sortIndex?: number;
  updatedAt: number;
};

// Bump version when default job set changes meaningfully.
// (Forcing a refresh so updated baseline copy ships to all devices.)
const STORAGE_KEY_BASE = 'mcc.jobTemplates.v8';

function slugLane(lane?: string) {
  return String(lane || 'global')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function jobsStorageKey(lane?: string) {
  return `${STORAGE_KEY_BASE}.${slugLane(lane)}`;
}

export function defaultJobs(): JobTemplate[] {
  // Use a fixed baseline timestamp to keep ordering stable across reloads.
  const now = Date.now();

  return [
    // 0) Keep this one intact + first.
    {
      id: 'discipleship',
      title: 'Follow Jesus first (2026)',
      progress: 'Rightly ordered loves; obey Jesus today.',
      when: 'My projects (or anything) start feeling too big in my heart.',
      prompt:
        "Job: Follow Jesus first (2026)\n\nContext: I believe in Jesus Christ. I want my heart to belong to Him first. I’m prone to loving things in this world more than Him.\n\nAsk: Help me put things back in order using Scripture (Old + New Testament), with emphasis on who Jesus says He is. If I tell you I’m over-loving a project, respond with gentle, specific perspective + 1-3 practical next steps to obey today (James 1:22).\n\nLens phrase: The Bible as Architecture (help me think in systems while staying faithful).\n\nGuardrails: This isn’t about scrapping projects; it’s about rightly ordered loves.\n\nOutput: (1) Scripture-based perspective, (2) a short prayer/commitment draft (optional), (3) one concrete action for today.",
      icon: 'HeartHandshake',
      pinned: true,
      sortIndex: 0,
      updatedAt: now,
    },

    // 1) Prospect research
    {
      id: 'prospect-research',
      title: 'Prospect research',
      progress: 'Find targets + angles + draft first-touch emails.',
      when: 'I have time for outreach but no list and no angle.',
      prompt:
        "Job: Prospect research\n\nUse Apollo to find 10-20 companies that match my ICP:\n- B2B SaaS\n- Series A-C\n- 50-500 employees\n\nFor each company:\n- Find the VP of Engineering or CTO\n- Research their recent news, product launches, and hiring signals\n- Score each 1-10 on fit\n\nThen:\n- Draft personalized first-touch emails for the top 10\n\nOutput:\n- Save everything to ~/bizdev/prospects/\n- Send me a summary here with the top 5 and why they scored highest",
      icon: 'Target',
      pinned: true,
      sortIndex: 2,
      updatedAt: now,
    },

    // 3) Coding Assistant
    {
      id: 'coding-assistant',
      title: 'Coding Assistant',
      progress: 'Pair program in the current lane: implement, debug, refactor, ship.',
      when: 'I’m coding and want you in the loop (fast, precise, no fluff).',
      prompt:
        "Job: Coding Assistant\n\nLane: [LANE]\n\nContext:\n- I’m working in this lane and I want you as my coding partner.\n\nAsk:\n- Help me implement features, debug issues, write tests, and keep changes shippable.\n\nRules:\n- If requirements are unclear, ask 1–3 clarifying questions (don’t guess).\n- Prefer small diffs, fast feedback loops, and verified steps.\n- When you propose commands, keep them copy/pasteable.\n\nNow here’s what I need:\n[PASTE REQUEST / ERROR / CONTEXT]",
      icon: 'Code',
      pinned: true,
      sortIndex: 3,
      updatedAt: now,
    },

    // 4) Write + publish
    {
      id: 'write-publish',
      title: 'Write + publish',
      progress: 'Research recent takes; draft in Ryan’s voice (short + long).',
      when: 'I have a rough idea for a post but no draft.',
      prompt:
        "Job: Write + publish\n\nI have a rough idea for a post but no draft. Here’s the topic and my take: [DESCRIBE].\n\nInstructions:\n- Research what’s already been said about this in the last 7 days\n- Draft a LinkedIn post in my voice — concise, opinionated, practical\n- No hashtag spam, no fluff\n\nDeliver:\n- two versions: (1) short under 200 words, (2) long-form 500-800 words\n- Save both to ~/clawdbot-brain/ideas/\n- Send me the short version here so I can review on mobile",
      icon: 'PenLine',
      pinned: true,
      sortIndex: 9,
      updatedAt: now,
    },

    // 10) ARG inspiration
    {
      id: 'arg-inspiration',
      title: 'ARG inspiration',
      progress: 'Collect + synthesize ARG design inspiration (weekly).',
      when: 'I share ARG ideas or inspiration and want it captured + turned into actionable direction.',
      prompt:
        "Job: ARG inspiration\n\nContext:\n- I’m building an ARG (design, character development, mechanics, etc.).\n- I will share inspiration snippets throughout the week.\n\nAsk:\n1) Append whatever I share accretively to: ~/clawdbot/.moltbot/arginspo.md (NO edits; keep verbatim).\n2) Each Saturday 10:30 AM ET, review the preceding week only and create a journal entry titled \"ARG Inspiration\" with robust analysis + synthesis.\n\nOutput requirements:\n- Accretive capture: add new inspiration exactly as provided\n- Weekly journal: themes, character angles, mechanics hooks, risks, and 2–5 next experiments\n- Ship the weekly journal entry to me\n\nIf anything is unclear, ask before appending.",
      icon: 'Sparkles',
      pinned: true,
      sortIndex: 10,
      updatedAt: now,
    },

    // 11) ARG infrastructure
    {
      id: 'arg-infrastructure',
      title: 'ARG infrastructure',
      progress: 'Capture + organize ARG infrastructure decisions (tagged).',
      when: 'We’re deciding how the ARG runs: platforms, trail markers, timelines, community ops, etc.',
      prompt:
        "Job: ARG infrastructure\n\nContext:\n- We’re designing the infrastructure layer of an ARG (delivery surfaces, operations, and player journey scaffolding).\n\nAsk:\n- I’ll paste an infrastructure idea or a decision.\n- You will capture it accretively in ~/clawdbot/.moltbot/arginspo.md with a timestamp header and the selected Tag (single tag).\n\nTag: [SELECT_ONE_TAG]\n\nADR-lite (optional, recommended):\n- Decision:\n- Why (1–3 bullets):\n- Tradeoffs (pros/cons):\n- Next test (what we’ll try to validate):\n\nRules:\n- NO edits to my pasted content.\n- Prepend your appended block with:\n  - `## <timestamp ET>`\n  - `Tag: <Tag>`\n\nThen confirm back with the exact header + tag you appended.",
      icon: 'Wrench',
      pinned: true,
      sortIndex: 11,
      updatedAt: now,
    },

    // 12) Plan the next chunk
    {
      id: 'plan-next-chunk',
      title: 'Plan the next chunk',
      progress: 'Decide what to do today vs this week vs drop/delegate.',
      when: 'My brain has too many tabs open.',
      prompt:
        "Job: Plan the next chunk\n\nHere’s everything on my plate right now: [DESCRIBE].\n\nDo:\n- Look at what I’ve been working on in our recent sessions\n- Check ~/clawdbot-brain/tasks/ for open items\n- Review any active GitHub issues in Sixblocks-Labs\n\nThen give me a prioritized plan:\n- what to do today (max 3 things)\n- what to defer to this week\n- what to drop or delegate\n\nBe opinionated — I want your recommendation, not a menu.",
      icon: 'ListTodo',
      pinned: true,
      sortIndex: 12,
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

export function loadJobs(lane?: string): JobTemplate[] {
  if (typeof window === 'undefined') return defaultJobs();

  try {
    const raw = window.localStorage.getItem(jobsStorageKey(lane));
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
        sortIndex: typeof j.sortIndex === 'number' ? j.sortIndex : undefined,
        updatedAt: typeof j.updatedAt === 'number' ? j.updatedAt : now,
      }))
      .filter((j) => j.id && j.title && j.prompt)
      .filter((j) => !REMOVED_JOB_IDS.includes(j.id as any));

    const base = jobs.length ? jobs : defaultJobs();
    const merged = mergeInMissingDefaultJobs(base);
    return merged.filter((j) => !REMOVED_JOB_IDS.includes(j.id as any));
  } catch {
    return defaultJobs();
  }
}

export function saveJobs(jobs: JobTemplate[], lane?: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(jobsStorageKey(lane), JSON.stringify(jobs));
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
    sortIndex: undefined,
    updatedAt: now,
  };
}
