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

export async function writeDoc(docPath: string, content: string) {
  const supabase = getSupabaseClient();

  const folder = (docPath.split('/')[0] || 'notes') as BrainFolderKey;
  const title = docPath
    .split('/')
    .pop()!
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ');

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

export async function searchDocs(query: string): Promise<BrainDocMeta[]> {
  const supabase = getSupabaseClient();
  const q = query.toLowerCase();

  const { data, error } = await supabase
    .from('brain_docs')
    .select('id, path, title, folder, content, updated_at');

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
