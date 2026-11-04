import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { completeLines, getActiveMatch, getSession, type MatchRow, type Move } from './db';

export const SESSION_COOKIE = 'bingo_session';

export async function currentSession() {
  const cookieStore = await cookies();
  return getSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    throw new Error('Invalid request origin');
  }
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function matchResponse(match: MatchRow | undefined) {
  if (!match) return null;
  const playerBoard = JSON.parse(match.player_board) as number[];
  const computerBoard = JSON.parse(match.computer_board) as number[];
  const markedNumbers = JSON.parse(match.marked_numbers) as number[];
  const moves = JSON.parse(match.moves) as Move[];

  return {
    id: match.id,
    playerBoard,
    computerCells: computerBoard.map((_, index) => ({
      index,
      marked: markedNumbers.includes(computerBoard[index]),
    })),
    markedNumbers,
    moves,
    turn: match.turn,
    status: match.status,
    winner: match.winner,
    playerLines: completeLines(playerBoard, markedNumbers),
    computerLines: completeLines(computerBoard, markedNumbers),
    updatedAt: match.updated_at,
  };
}

export function sessionResponse(session: Awaited<ReturnType<typeof currentSession>>) {
  if (!session) return { user: null, game: null, csrfToken: null };
  return {
    user: { username: session.username },
    game: matchResponse(getActiveMatch(session.user_id)),
    csrfToken: session.csrf_token,
  };
}

export async function authenticatedRequest(request: Request, body: Record<string, unknown>) {
  requireSameOrigin(request);
  const session = await currentSession();
  if (!session) return { response: errorResponse('Please log in to continue.', 401) } as const;
  if (body.csrfToken !== session.csrf_token) {
    return {
      response: errorResponse('Your session token is invalid. Refresh and try again.', 403),
    } as const;
  }
  return { session } as const;
}
