import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';

export const dynamic = 'force-dynamic';

const FILE_PATH = '/home/clawdbot/.moltbot/arginspo.md';

type Entry = {
  header: string;
  tag?: string;
  body: string;
};

function parseArgInspo(md: string): Entry[] {
  const lines = md.split(/\r?\n/);

  const entries: Entry[] = [];
  let current: Entry | null = null;

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      if (current) entries.push({ ...current, body: current.body.trim() });
      current = { header: m[1], body: '' };
      continue;
    }

    if (!current) continue;

    // Capture Tag: <value> if present (single tag).
    const tagMatch = /^Tag:\s*(.+?)\s*$/.exec(line);
    if (tagMatch && !current.tag) {
      current.tag = tagMatch[1];
    }

    current.body += line + '\n';
  }

  if (current) entries.push({ ...current, body: current.body.trim() });

  // Filter out empty blocks
  return entries.filter((e) => (e.body || '').trim().length > 0);
}

export async function GET() {
  try {
    const content = await readFile(FILE_PATH, 'utf-8');
    const entries = parseArgInspo(content);
    return NextResponse.json({ path: FILE_PATH, entries });
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      return NextResponse.json({ path: FILE_PATH, entries: [] });
    }
    return NextResponse.json({ error: 'Failed to read arginspo' }, { status: 500 });
  }
}
