import { NextResponse } from 'next/server';
import { readDoc, writeDoc } from '@/lib/brain/fs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  const content = await readDoc(path);
  return NextResponse.json({ path, content });
}

export async function POST(req: Request) {
  const body = await req.json();
  const path = body?.path;
  const content = body?.content;
  if (!path || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  await writeDoc(path, content);
  return NextResponse.json({ ok: true });
}
