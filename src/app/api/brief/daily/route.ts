import { NextResponse } from 'next/server';
import { readDoc } from '@/lib/brain/fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

function extractSection(md: string, heading: string, maxLines = 12) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim().toLowerCase() === heading.trim().toLowerCase());
  if (start === -1) return [];

  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('## ')) break;
    if (!line.trim()) continue;
    out.push(line.trim());
    if (out.length >= maxLines) break;
  }
  return out;
}

export async function GET() {
  const day = todayInTz('America/New_York');
  const path = `journal/brief/${day}-morning-brief.md`;

  try {
    const md = await readDoc(path);

    const priorities = extractSection(md, '## Top 3 priorities', 6);
    const deltas = extractSection(md, '## Overnight deltas', 10);
    const risks = extractSection(md, '## Operational risk', 10);

    return NextResponse.json(
      {
        ok: true,
        day,
        path,
        priorities,
        deltas,
        risks,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        ok: true,
        day,
        path,
        priorities: [],
        deltas: [],
        risks: [],
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
