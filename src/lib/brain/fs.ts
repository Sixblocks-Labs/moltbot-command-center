import fs from 'fs/promises';
import path from 'path';
import { BRAIN_ROOT, BRAIN_FOLDERS, type BrainFolderKey } from './config';

export async function ensureBrainFolders() {
  await fs.mkdir(BRAIN_ROOT, { recursive: true });
  await Promise.all(
    Object.values(BRAIN_FOLDERS).map((p) => fs.mkdir(p, { recursive: true }))
  );
}

export type BrainDocMeta = {
  id: string;
  path: string;
  title: string;
  folder: BrainFolderKey;
  updatedAt: number;
  tag?: string;
};

function safeJoin(root: string, p: string) {
  const rootResolved = path.resolve(root);
  const resolved = path.resolve(rootResolved, p);

  // Prevent path traversal ("..") and prefix tricks (e.g. /root2 matching /root)
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    throw new Error('Invalid path');
  }

  return resolved;
}

export async function listDocs(): Promise<BrainDocMeta[]> {
  await ensureBrainFolders();

  const entries: BrainDocMeta[] = [];

  const folders = Object.entries(BRAIN_FOLDERS) as [BrainFolderKey, string][];

  for (const [key, dir] of folders) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      if (!item.isFile()) continue;
      if (!item.name.endsWith('.md')) continue;

      const rel = path.join(path.relative(BRAIN_ROOT, dir), item.name);
      const abs = safeJoin(BRAIN_ROOT, rel);
      const stat = await fs.stat(abs);
      const title = item.name.replace(/\.md$/, '').replace(/[-_]/g, ' ');

      entries.push({
        id: rel,
        path: rel,
        title,
        folder: key,
        updatedAt: stat.mtimeMs,
      });
    }
  }

  // newest first
  entries.sort((a, b) => b.updatedAt - a.updatedAt);
  return entries;
}

function assertMarkdownDocPath(docPath: string) {
  // We only support markdown docs in the brain.
  // (This also reduces the blast radius of the write endpoint.)
  if (!docPath.toLowerCase().endsWith('.md')) {
    throw new Error('Only .md files are allowed');
  }
}

export async function readDoc(docPath: string): Promise<string> {
  await ensureBrainFolders();
  assertMarkdownDocPath(docPath);
  const abs = safeJoin(BRAIN_ROOT, docPath);
  return fs.readFile(abs, 'utf8');
}

export async function writeDoc(docPath: string, content: string) {
  await ensureBrainFolders();
  assertMarkdownDocPath(docPath);
  const abs = safeJoin(BRAIN_ROOT, docPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, 'utf8');
}

export async function searchDocs(query: string) {
  const docs = await listDocs();
  const q = query.toLowerCase();
  const hits: BrainDocMeta[] = [];

  for (const d of docs) {
    if (d.title.toLowerCase().includes(q)) {
      hits.push(d);
      continue;
    }
    const body = await readDoc(d.path);
    if (body.toLowerCase().includes(q)) hits.push(d);
  }

  return hits;
}
