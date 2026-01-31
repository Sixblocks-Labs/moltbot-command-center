import { NextResponse } from 'next/server';
import { readDoc, writeDoc } from '@/lib/brain/fs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const docPath = searchParams.get('path');
  if (!docPath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    const content = await readDoc(docPath);
    return NextResponse.json({ path: docPath, content });
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('Invalid path') || msg.includes('Only .md files are allowed')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    if (err?.code === 'ENOENT') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to read doc' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const docPath = body?.path;
  const content = body?.content;

  if (!docPath || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    await writeDoc(docPath, content);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('Invalid path') || msg.includes('Only .md files are allowed')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to write doc' }, { status: 500 });
  }
}
