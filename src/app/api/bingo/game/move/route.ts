import { NextResponse } from 'next/server';
import { authenticatedRequest, errorResponse, matchResponse } from '@/lib/bingo/api';
import { completeLines, db, getActiveMatch, type MatchRow, type Move } from '@/lib/bingo/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const auth = await authenticatedRequest(request, body);
    if ('response' in auth) return auth.response;

    const number = body.number;
    const gameId = body.gameId;
    if (!Number.isInteger(gameId)) {
      return errorResponse('That game is no longer active.', 409);
    }
    if (!Number.isInteger(number) || Number(number) < 1 || Number(number) > 25) {
      return errorResponse('Choose a valid number from your board.');
    }

    const activeMatch = getActiveMatch(auth.session.user_id);
    if (!activeMatch) return errorResponse('Start a new game before choosing a number.', 404);
    if (activeMatch.id !== Number(gameId))
      return errorResponse('That game is no longer active.', 409);
    if (activeMatch.turn !== 'player') return errorResponse('Please wait for your turn.', 409);

    const result = db.transaction(() => {
      const match = db
        .prepare('SELECT * FROM matches WHERE id = ?')
        .get(activeMatch.id) as MatchRow;
      const playerBoard = JSON.parse(match.player_board) as number[];
      const computerBoard = JSON.parse(match.computer_board) as number[];
      const markedNumbers = JSON.parse(match.marked_numbers) as number[];
      const moves = JSON.parse(match.moves) as Move[];

      if (!playerBoard.includes(Number(number)) || markedNumbers.includes(Number(number))) {
        throw new Error('That number has already been marked or is not on your board.');
      }

      markedNumbers.push(Number(number));
      moves.push({ number: Number(number), player: 'player' });
      let winner: MatchRow['winner'] = null;
      let turn: MatchRow['turn'] = 'computer';
      let status: MatchRow['status'] = 'playing';

      if (completeLines(playerBoard, markedNumbers) > 0) {
        winner = 'player';
        status = 'finished';
      } else {
        const available = Array.from({ length: 25 }, (_, index) => index + 1).filter(
          (value) => !markedNumbers.includes(value)
        );
        if (available.length === 0) {
          winner = 'draw';
          status = 'finished';
        } else {
          const computerNumber = available[Math.floor(Math.random() * available.length)];
          markedNumbers.push(computerNumber);
          moves.push({ number: computerNumber, player: 'computer' });

          if (completeLines(computerBoard, markedNumbers) > 0) {
            winner = 'computer';
            status = 'finished';
          } else if (markedNumbers.length === 25) {
            winner = 'draw';
            status = 'finished';
          } else {
            turn = 'player';
          }
        }
      }

      db.prepare(
        `UPDATE matches
         SET marked_numbers = ?, moves = ?, turn = ?, status = ?, winner = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(JSON.stringify(markedNumbers), JSON.stringify(moves), turn, status, winner, match.id);
      return db.prepare('SELECT * FROM matches WHERE id = ?').get(match.id) as MatchRow;
    })();

    return NextResponse.json({ game: matchResponse(result) });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid request origin') {
      return errorResponse(error.message, 403);
    }
    if (error instanceof Error && error.message.includes('already been marked')) {
      return errorResponse(error.message, 409);
    }
    return errorResponse('Unable to process that move right now.', 500);
  }
}
