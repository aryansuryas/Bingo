import { NextResponse } from 'next/server';
import {
  authenticatedRequest,
  currentSession,
  errorResponse,
  matchResponse,
} from '@/lib/bingo/api';
import { db, getActiveMatch, randomBoard } from '@/lib/bingo/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await currentSession();
  if (!session) return errorResponse('Please log in to continue.', 401);
  return NextResponse.json({ game: matchResponse(getActiveMatch(session.user_id)) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const auth = await authenticatedRequest(request, body);
    if ('response' in auth) return auth.response;

    const replaceExisting = body.replaceExisting === true;
    const existing = getActiveMatch(auth.session.user_id);
    if (existing && !replaceExisting) return NextResponse.json({ game: matchResponse(existing) });
    if (existing) {
      db.prepare(
        `UPDATE matches
         SET status = 'finished', winner = 'draw', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(existing.id);
    }

    const playerBoard = randomBoard();
    const computerBoard = randomBoard();
    const result = db
      .prepare(
        `INSERT INTO matches
          (user_id, player_board, computer_board, marked_numbers, turn, status, winner, moves)
         VALUES (?, ?, ?, '[]', 'player', 'playing', NULL, '[]')`
      )
      .run(auth.session.user_id, JSON.stringify(playerBoard), JSON.stringify(computerBoard));
    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ game: matchResponse(match as typeof existing) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid request origin') {
      return errorResponse(error.message, 403);
    }
    return errorResponse('Unable to start a new game right now.', 500);
  }
}
