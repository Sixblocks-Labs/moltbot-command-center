import { NextResponse } from 'next/server';
import { ensureBrainFolders } from '@/lib/brain/fs';

export const dynamic = 'force-dynamic';

export async function POST() {
  await ensureBrainFolders();
  return NextResponse.json({ ok: true });
}
