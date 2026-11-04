import { NextResponse } from 'next/server';
import { currentSession, requireSameOrigin, SESSION_COOKIE } from '@/lib/bingo/api';
import { deleteSession } from '@/lib/bingo/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const session = await currentSession();
    const body = (await request.json()) as Record<string, unknown>;
    if (!session || body.csrfToken !== session.csrf_token) {
      return NextResponse.json({ error: 'Your session token is invalid.' }, { status: 403 });
    }
    const cookieHeader = request.headers.get('cookie') ?? '';
    const token = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
    deleteSession(token);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to log out right now.' }, { status: 500 });
  }
}
