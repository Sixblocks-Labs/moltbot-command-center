import { NextResponse } from 'next/server';
import { ensureBrainFolders } from '@/lib/brain/fs';

export async function POST() {
  await ensureBrainFolders();
  return NextResponse.json({ ok: true });
}
