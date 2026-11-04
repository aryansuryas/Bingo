import { NextResponse } from 'next/server';
import { createSession, db, normalizeUsername, verifyPassword } from '@/lib/bingo/db';
import { requireSameOrigin, SESSION_COOKIE } from '@/lib/bingo/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = (await request.json()) as Record<string, unknown>;
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const user = db
      .prepare('SELECT * FROM users WHERE username_normalized = ?')
      .get(normalizeUsername(username)) as
      { id: number; username: string; password_hash: string } | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const { token, csrfToken } = createSession(user.id);
    const response = NextResponse.json({ user: { username: user.username }, csrfToken });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to log in right now.' }, { status: 500 });
  }
}
