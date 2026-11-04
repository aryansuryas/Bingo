import { NextResponse } from 'next/server';
import { createSession, db, hashPassword, normalizeUsername } from '@/lib/bingo/db';
import { requireSameOrigin, SESSION_COOKIE } from '@/lib/bingo/api';

export const runtime = 'nodejs';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = (await request.json()) as Record<string, unknown>;
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

    if (username.length < 3 || username.length > 20 || !USERNAME_PATTERN.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3–20 characters using only letters, numbers, or underscores.' },
        { status: 400 }
      );
    }
    if (password.length < MIN_PASSWORD_LENGTH || password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be 8–128 characters long.' },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const normalizedUsername = normalizeUsername(username);
    const existing = db
      .prepare('SELECT id FROM users WHERE username_normalized = ?')
      .get(normalizedUsername);
    if (existing) {
      return NextResponse.json({ error: 'That username is already in use.' }, { status: 409 });
    }

    const result = db
      .prepare(
        `INSERT INTO users (username, username_normalized, password_hash)
         VALUES (?, ?, ?)`
      )
      .run(username, normalizedUsername, hashPassword(password));
    const { token, csrfToken } = createSession(Number(result.lastInsertRowid));
    const response = NextResponse.json({ user: { username }, csrfToken });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to create the account right now.' }, { status: 500 });
  }
}
