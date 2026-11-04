import { NextResponse } from 'next/server';
import { currentSession, sessionResponse } from '@/lib/bingo/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(sessionResponse(await currentSession()), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
