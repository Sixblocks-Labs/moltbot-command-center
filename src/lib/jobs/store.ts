'use client';

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
const STORAGE_KEY = 'mcc.jobTemplates.v4';

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

    // 1) Ship it
    {
      id: 'ship-it',
      title: 'Ship it',
      progress: 'Build + deploy something today (fast, correct, shipped).',
      when: 'I need something built and deployed today.',
      prompt:
        "Job: Ship it\n\nI need you to build and deploy something for me today. Here’s what I want: [DESCRIBE].\n\nRequirements:\n- Scaffold it in ~/projects/\n- Use Next.js 14 + Tailwind\n- Use Supabase if needed\n- Push it to Sixblocks-Labs on GitHub\n- Deploy to Vercel\n\nIf anything’s unclear, ask me before you start building — don’t guess.\n\nWhen you’re done:\n- Send me the live URL\n- Send me the repo link",
      icon: 'Bolt',
      pinned: true,
      sortIndex: 1,
      updatedAt: now,
    },

    // 2) Prospect research
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

    // 3) Sensemake
    {
      id: 'sensemake',
      title: 'Sensemake',
      progress: 'Extract the few insights that matter + translate into action.',
      when: 'I just read/watched something that might change my thinking.',
      prompt:
        "Job: Sensemake\n\nHere it is: [URL OR TEXT].\n\nPull out the 3-5 insights that are actually relevant to what I’m building at Sixblocks-Labs.\nFor each one:\n- what it means\n- whether it conflicts with anything I’m currently doing\n- one concrete thing I should consider doing differently\n\nSave your analysis to ~/clawdbot-brain/research/ with today’s date.\nKeep it tight — no filler.",
      icon: 'Telescope',
      pinned: true,
      sortIndex: 3,
      updatedAt: now,
    },

    // 4) Debug this
    {
      id: 'debug-this',
      title: 'Debug this',
      progress: 'Find root cause and fix (no thrash).',
      when: "Something’s broken and I can show you the error + context.",
      prompt:
        "Job: Debug this\n\nSomething’s broken. Here’s the error and what I was doing: [ERROR + CONTEXT].\n\nInstructions:\n- Trace it to the root cause\n- Don’t give me 5 guesses — give me the most likely cause and the exact commands to fix it\n- If you need more info, ask me one specific question before guessing\n- If your first fix doesn’t work, research the issue before suggesting the next one",
      icon: 'Bug',
      pinned: true,
      sortIndex: 4,
      updatedAt: now,
    },

    // 5) Morning brief
    {
      id: 'morning-brief',
      title: 'Morning brief',
      progress: 'Scan the stack; recommend today’s top 3 priorities.',
      when: 'Start of day.',
      prompt:
        "Job: Morning brief\n\nScan my stack and give me a brief:\n- any new GitHub issues or PRs in Sixblocks-Labs\n- Vercel deployment status and any overnight failures\n- ConvertKit new subscribers or unsubscribes since yesterday\n- Airtable pipeline changes\n- the status of any sessions or tasks you were working on overnight\n\nEnd with your top 3 recommended priorities for today.\nKeep the whole thing under 300 words.",
      icon: 'Sun',
      pinned: true,
      sortIndex: 5,
      updatedAt: now,
    },

    // 6) Overnight build
    {
      id: 'overnight-build',
      title: 'Overnight build',
      progress: 'Build overnight in chunks; ship what’s ready by morning.',
      when: 'I’m signing off and want progress by morning.',
      prompt:
        "Job: Overnight build\n\nHere’s what I want built by morning: [DESCRIBE SPEC].\n\nInstructions:\n- Break it into chunks to avoid timeouts\n- Use my standard stack\n- Push to Sixblocks-Labs on GitHub and deploy to Vercel\n- If you hit a blocker, document it in ~/clawdbot-brain/tasks/ and move on to the next chunk — don’t stop entirely\n\nAt 7am, send me a summary with:\n- what’s working\n- what’s not\n- the live URL\n- what still needs my input",
      icon: 'Moon',
      pinned: true,
      sortIndex: 6,
      updatedAt: now,
    },

    // 7) Wire it up
    {
      id: 'wire-it-up',
      title: 'Wire it up',
      progress: 'Connect a new service to the stack (step-by-step + verified).',
      when: 'I just signed up for a new service and need it connected.',
      prompt:
        "Job: Wire it up\n\nThe service is: [NAME].\n\nWalk me through it step by step:\n- where to find the API key\n- the exact export command for ~/.bashrc\n- which skill to install via clawdhub\n- a test command to confirm it’s working\n\nRules:\n- One step at a time\n- Wait for me to say “done” before moving to the next\n- If there’s no existing skill, tell me — don’t install something unvetted.",
      icon: 'Plug',
      pinned: true,
      sortIndex: 7,
      updatedAt: now,
    },

    // 8) Secure + audit
    {
      id: 'secure-audit',
      title: 'Secure + audit',
      progress: 'Audit security posture; output exact remediation commands.',
      when: 'We need to confirm the Moltbot setup is still locked down.',
      prompt:
        "Job: Secure + audit\n\nRun a full security check on my Moltbot setup.\n\nDo:\n- Run: clawdbot security audit –deep\n- Check that the gateway is only accessible via Tailscale\n- Confirm credential files are still 600 permissions\n- Confirm no unapproved skills were added\n- Confirm firewall rules on port 18789 are intact\n\nIf anything needs rotation or fixing, give me the exact commands.\nSave the results to: ~/clawdbot-brain/notes/security-audit-[today’s date].md",
      icon: 'ShieldCheck',
      pinned: true,
      sortIndex: 8,
      updatedAt: now,
    },

    // 9) Write + publish
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

    // 11) Plan the next chunk
    {
      id: 'plan-next-chunk',
      title: 'Plan the next chunk',
      progress: 'Decide what to do today vs this week vs drop/delegate.',
      when: 'My brain has too many tabs open.',
      prompt:
        "Job: Plan the next chunk\n\nHere’s everything on my plate right now: [DESCRIBE].\n\nDo:\n- Look at what I’ve been working on in our recent sessions\n- Check ~/clawdbot-brain/tasks/ for open items\n- Review any active GitHub issues in Sixblocks-Labs\n\nThen give me a prioritized plan:\n- what to do today (max 3 things)\n- what to defer to this week\n- what to drop or delegate\n\nBe opinionated — I want your recommendation, not a menu.",
      icon: 'ListTodo',
      pinned: true,
      sortIndex: 11,
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
        sortIndex: typeof j.sortIndex === 'number' ? j.sortIndex : undefined,
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
    sortIndex: undefined,
    updatedAt: now,
  };
}
