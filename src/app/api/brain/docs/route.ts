import { NextResponse } from 'next/server';
import { listDocs } from '@/lib/brain/fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
// Ensure Next does not cache this route at build or request time.
export const fetchCache = 'force-no-store';

export async function GET() {
  const docs = await listDocs();
  return NextResponse.json(
    { docs },
    {
      headers: {
        // Avoid any edge/browser caching; the Brain tab expects live updates.
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
