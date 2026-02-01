import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function deriveTitleFromContent(content: string): string | null {
  const lines = String(content ?? '').split(/\r?\n/);
  for (const line of lines) {
    const l = line.trim();
    const m = l.match(/^#\s+(.+)$/);
    if (m?.[1]) return m[1].trim();
    if (l.length) break;
  }
  return null;
}

/**
 * One-time migration: retitle docs based on first H1, without changing updated_at.
 * Safe: only updates when an H1 exists and differs from current title.
 */
export async function POST() {
  const supabase = getSupabaseClient();

  let offset = 0;
  const limit = 200;

  let scanned = 0;
  let updated = 0;
  const changes: Array<{ path: string; from: string; to: string }> = [];

  while (true) {
    const { data, error } = await supabase
      .from('brain_docs')
      .select('path, title, content')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []) as Array<{ path: string; title: string; content: string }>;
    if (!rows.length) break;

    scanned += rows.length;

    for (const row of rows) {
      const desired = deriveTitleFromContent(row.content);
      if (!desired) continue;
      if (String(row.title || '').trim() === desired) continue;

      const { error: updErr } = await supabase
        .from('brain_docs')
        .update({ title: desired })
        .eq('path', row.path);

      if (!updErr) {
        updated += 1;
        if (changes.length < 50) {
          changes.push({ path: row.path, from: row.title, to: desired });
        }
      }
    }

    offset += limit;

    // Safety cap so we don't run forever.
    if (scanned > 5000) break;
  }

  return NextResponse.json({ ok: true, scanned, updated, sample: changes });
}
