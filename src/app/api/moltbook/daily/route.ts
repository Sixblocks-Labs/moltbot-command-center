import { NextResponse } from 'next/server';
import { readDoc } from '@/lib/brain/fs';

export const dynamic = 'force-dynamic';

function todayInTz(tz: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;

  return `${y}-${m}-${d}`;
}

function extractTldrBullets(md: string) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim().toLowerCase() === '## tl;dr');
  if (start === -1) return [];

  const bullets: string[] = [];

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('## ')) break;
    const m = line.match(/^\s*-\s+(.*)$/);
    if (!m) continue;
    bullets.push(m[1].trim());
    if (bullets.length >= 5) break;
  }

  return bullets;
}

export async function GET() {
  const day = todayInTz('America/New_York');
  const path = `journal/moltbook/${day}-moltbook-learnings.md`;

  try {
    const md = await readDoc(path);
    return NextResponse.json({ ok: true, day, path, bullets: extractTldrBullets(md) });
  } catch {
    return NextResponse.json({ ok: true, day, path, bullets: [] });
  }
}
