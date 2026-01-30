import { NextResponse } from 'next/server';
import { searchDocs } from '@/lib/brain/fs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json({ docs: [] });
  const docs = await searchDocs(q);
  return NextResponse.json({ docs });
}
