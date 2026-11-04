import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export type MatchStatus = 'playing' | 'finished';
export type Winner = 'player' | 'computer' | 'draw' | null;
export type MovePlayer = 'player' | 'computer';

export interface Move {
  number: number;
  player: MovePlayer;
}

export interface MatchRow {
  id: number;
  user_id: number;
  player_board: string;
  computer_board: string;
  marked_numbers: string;
  turn: MovePlayer;
  status: MatchStatus;
  winner: Winner;
  moves: string;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

const databasePath = path.resolve(process.cwd(), process.env.BINGO_DB_PATH ?? 'data/bingo.db');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const globalForBingo = globalThis as typeof globalThis & {
  bingoDatabase?: Database.Database;
};

export const db = globalForBingo.bingoDatabase ?? new Database(databasePath);

if (process.env.NODE_ENV !== 'production') {
  globalForBingo.bingoDatabase = db;
}

const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build';

if (!isProductionBuild) {
  db.pragma('busy_timeout = 5000');
  db.pragma('journal_mode = WAL');
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    username_normalized TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf_token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player_board TEXT NOT NULL,
    computer_board TEXT NOT NULL,
    marked_numbers TEXT NOT NULL DEFAULT '[]',
    turn TEXT NOT NULL CHECK (turn IN ('player', 'computer')),
    status TEXT NOT NULL CHECK (status IN ('playing', 'finished')),
    winner TEXT CHECK (winner IN ('player', 'computer', 'draw') OR winner IS NULL),
    moves TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS one_active_match_per_user
    ON matches(user_id) WHERE status = 'playing';
  `);
}

export function normalizeUsername(username: string) {
  return username.trim().toLocaleLowerCase('en-US');
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [, salt, hash] = storedHash.split('$');
  if (!salt || !hash) return false;

  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

export function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const csrfToken = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

  db.prepare(
    `INSERT INTO sessions (token_hash, user_id, csrf_token, expires_at)
     VALUES (?, ?, ?, ?)`
  ).run(tokenHash, userId, csrfToken, expiresAt);

  return { token, csrfToken };
}

export function getSession(token: string | undefined) {
  if (!token) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const session = db
    .prepare(
      `SELECT sessions.token_hash, sessions.user_id, sessions.csrf_token, sessions.expires_at,
              users.username
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ?`
    )
    .get(tokenHash) as
    | {
        token_hash: string;
        user_id: number;
        csrf_token: string;
        expires_at: string;
        username: string;
      }
    | undefined;

  if (!session) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    return null;
  }
  return session;
}

export function deleteSession(token: string | undefined) {
  if (!token) return;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function validateCsrf(session: ReturnType<typeof getSession>, csrfToken: unknown) {
  if (!session || typeof csrfToken !== 'string') return false;
  const expected = Buffer.from(session.csrf_token);
  const received = Buffer.from(csrfToken);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export function randomBoard() {
  const values = Array.from({ length: 25 }, (_, index) => index + 1);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

export function getActiveMatch(userId: number) {
  return db
    .prepare(`SELECT * FROM matches WHERE user_id = ? AND status = 'playing' LIMIT 1`)
    .get(userId) as MatchRow | undefined;
}

export function getMatchForUser(userId: number, matchId: number) {
  return db.prepare('SELECT * FROM matches WHERE id = ? AND user_id = ?').get(matchId, userId) as
    MatchRow | undefined;
}

export function completeLines(board: number[], marked: number[]) {
  const markedSet = new Set(marked);
  const lines = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];

  return lines.filter((line) => line.every((index) => markedSet.has(board[index]))).length;
}
