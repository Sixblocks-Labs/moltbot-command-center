import { getSupabaseClient } from '@/lib/supabase';
import { BRAIN_FOLDERS, type BrainFolderKey } from './config';

export type BrainDocMeta = {
  id: string;
  path: string;
  title: string;
  folder: BrainFolderKey;
  updatedAt: number;
  tag?: string;
};

// Supabase-backed brain: no local folders to ensure.
export async function ensureBrainFolders() {
  return;
}

export async function listDocs(): Promise<BrainDocMeta[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('brain_docs')
    .select('id, path, title, folder, updated_at')
    .neq('folder', 'trash')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listDocs error:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: String(row.path),
    path: String(row.path),
    title: String(row.title),
    folder: row.folder as BrainFolderKey,
    updatedAt: new Date(row.updated_at).getTime(),
  }));
}

export async function readDoc(docPath: string): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('brain_docs')
    .select('content')
    .eq('path', docPath)
    .single();

  if (error || !data) {
    const e: any = new Error(`Document not found: ${docPath}`);
    e.code = error?.code;
    throw e;
  }

  return String((data as any).content ?? '');
}

function deriveTitleFromContent(content: string): string | null {
  const lines = String(content ?? '').split(/\r?\n/);
  for (const line of lines) {
    const l = line.trim();
    // First H1 becomes the doc title.
    const m = l.match(/^#\s+(.+)$/);
    if (m?.[1]) return m[1].trim();
    // Skip empty lines and continue scanning until we hit real content.
    if (l.length) break;
  }
  return null;
}

function deriveTitleFromPath(docPath: string): string {
  const filename = docPath.split('/').pop()!.replace(/\.md$/, '');

  // Special-case date journals so the list is human-friendly.
  // journal/2026-02-01.md → "Journal — 2026-02-01"
  const isJournal = docPath.startsWith('journal/');
  const isDate = /^\d{4}-\d{2}-\d{2}$/.test(filename);
  if (isJournal && isDate) return `Journal — ${filename}`;

  return filename.replace(/[-_]/g, ' ');
}

export async function writeDoc(docPath: string, content: string) {
  const supabase = getSupabaseClient();

  const folder = (docPath.split('/')[0] || 'notes') as BrainFolderKey;
  const title = deriveTitleFromContent(content) ?? deriveTitleFromPath(docPath);

  const { error } = await supabase.from('brain_docs').upsert(
    {
      path: docPath,
      title,
      folder,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'path' }
  );

  if (error) {
    throw new Error(`Failed to write document: ${error.message}`);
  }
}

function encodeTrashKey(docPath: string): string {
  // Base64url for safe path segment.
  return Buffer.from(docPath, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

type TrashEnvelope = {
  originalPath: string;
  originalTitle: string;
  originalFolder: string;
  originalUpdatedAt: string;
  deletedAt: string;
  content: string;
};

/**
 * Soft delete: move doc into a hidden "trash/" doc inside the same table.
 * This avoids schema changes while still enabling undo.
 */
export async function trashDoc(docPath: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('brain_docs')
    .select('path, title, folder, content, updated_at')
    .eq('path', docPath)
    .single();

  if (error || !data) {
    throw new Error(`Failed to load document for trash: ${error?.message ?? 'not found'}`);
  }

  const trashPath = `trash/${encodeTrashKey(docPath)}.json`;
  const envelope: TrashEnvelope = {
    originalPath: String(data.path),
    originalTitle: String(data.title ?? ''),
    originalFolder: String(data.folder ?? 'notes'),
    originalUpdatedAt: String(data.updated_at ?? new Date().toISOString()),
    deletedAt: new Date().toISOString(),
    content: String(data.content ?? ''),
  };

  const { error: insErr } = await supabase.from('brain_docs').upsert(
    {
      path: trashPath,
      title: `TRASH: ${envelope.originalTitle || envelope.originalPath}`,
      folder: 'trash',
      content: JSON.stringify(envelope),
      // keep trash item's updated_at as deletion time
      updated_at: envelope.deletedAt,
    },
    { onConflict: 'path' }
  );

  if (insErr) {
    throw new Error(`Failed to write trash record: ${insErr.message}`);
  }

  const { error: delErr } = await supabase.from('brain_docs').delete().eq('path', docPath);
  if (delErr) {
    // Best-effort cleanup if delete fails.
    await supabase.from('brain_docs').delete().eq('path', trashPath);
    throw new Error(`Failed to trash document: ${delErr.message}`);
  }
}

export async function restoreDocFromTrash(originalPath: string) {
  const supabase = getSupabaseClient();
  const trashPath = `trash/${encodeTrashKey(originalPath)}.json`;

  const { data, error } = await supabase
    .from('brain_docs')
    .select('content')
    .eq('path', trashPath)
    .single();

  if (error || !data) {
    throw new Error(`Trash record not found for: ${originalPath}`);
  }

  let env: TrashEnvelope;
  try {
    env = JSON.parse(String((data as any).content ?? ''));
  } catch {
    throw new Error('Trash record is corrupted (invalid JSON)');
  }

  const { error: restoreErr } = await supabase.from('brain_docs').upsert(
    {
      path: env.originalPath,
      title: env.originalTitle,
      folder: env.originalFolder,
      content: env.content,
      // Preserve original updated_at so subtitle stays the same.
      updated_at: env.originalUpdatedAt,
    },
    { onConflict: 'path' }
  );

  if (restoreErr) {
    throw new Error(`Failed to restore doc: ${restoreErr.message}`);
  }

  await supabase.from('brain_docs').delete().eq('path', trashPath);
}

export async function searchDocs(query: string): Promise<BrainDocMeta[]> {
  const supabase = getSupabaseClient();
  const q = query.toLowerCase();

  const { data, error } = await supabase
    .from('brain_docs')
    .select('id, path, title, folder, content, updated_at')
    .neq('folder', 'trash');

  if (error || !data) return [];

  return (data as any[])
    .filter(
      (row) =>
        String(row.title ?? '').toLowerCase().includes(q) ||
        String(row.content ?? '').toLowerCase().includes(q)
    )
    .map((row) => ({
      id: String(row.path),
      path: String(row.path),
      title: String(row.title),
      folder: row.folder as BrainFolderKey,
      updatedAt: new Date(row.updated_at).getTime(),
    }));
}

export function folderToTag(folder: BrainFolderKey) {
  // Map folders to UI tag label.
  const f = String(folder);
  return (BRAIN_FOLDERS as any)[f] ? f : f;
}
