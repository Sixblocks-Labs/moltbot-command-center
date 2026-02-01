import { NextResponse } from 'next/server';
import { restoreDocFromTrash, trashDoc } from '@/lib/brain/fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const action = body?.action;
  const path = body?.path;

  if (!path || typeof path !== 'string') {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  try {
    if (action === 'restore') {
      await restoreDocFromTrash(path);
      return NextResponse.json({ ok: true });
    }

    // Default action: trash
    await trashDoc(path);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
