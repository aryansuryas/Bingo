'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './bingo.module.css';

type User = { username: string };
type Move = { number: number; player: 'player' | 'computer' };
type Game = {
  id: number;
  playerBoard: number[];
  computerCells: { index: number; marked: boolean }[];
  markedNumbers: number[];
  moves: Move[];
  turn: 'player' | 'computer';
  status: 'playing' | 'finished';
  winner: 'player' | 'computer' | 'draw' | null;
  playerLines: number;
  computerLines: number;
};

type SessionState = { user: User | null; game: Game | null; csrfToken: string | null };

// AI assistance disclosure: OpenAI Copilot helped draft and review this educational UI.

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? 'Something went wrong.');
  return data;
}

export default function BingoPage() {
  const [session, setSession] = useState<SessionState>({ user: null, game: null, csrfToken: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    const data = await requestJson<SessionState>('/api/bingo/session', { cache: 'no-store' });
    setSession(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setError('Unable to connect to the game server. Please refresh and try again.');
      setLoading(false);
    });
  }, [refresh]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      username: String(form.get('username') ?? ''),
      password: String(form.get('password') ?? ''),
      ...(mode === 'register'
        ? { confirmPassword: String(form.get('confirmPassword') ?? '') }
        : {}),
    };
    try {
      const data = await requestJson<{ user: User; csrfToken: string }>(`/api/bingo/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSession({ user: data.user, game: null, csrfToken: data.csrfToken });
      setNotice(mode === 'register' ? 'Account created. Ready when you are!' : 'Welcome back.');
      formElement.reset();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to authenticate.');
    } finally {
      setBusy(false);
    }
  }

  async function startGame(replaceExisting = false) {
    if (!session.csrfToken) return;
    setBusy(true);
    setError('');
    try {
      const data = await requestJson<{ game: Game }>('/api/bingo/game', {
        method: 'POST',
        body: JSON.stringify({ csrfToken: session.csrfToken, replaceExisting }),
      });
      setSession((current) => ({ ...current, game: data.game }));
      setNotice('');
    } catch (gameError) {
      setError(gameError instanceof Error ? gameError.message : 'Unable to start a game.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (!session.csrfToken) return;
    setBusy(true);
    try {
      await requestJson('/api/bingo/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ csrfToken: session.csrfToken }),
      });
      setSession({ user: null, game: null, csrfToken: null });
      setNotice('You have been logged out.');
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Unable to log out.');
    } finally {
      setBusy(false);
    }
  }

  async function playMove(number: number) {
    if (!session.csrfToken || !session.game || session.game.turn !== 'player' || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const data = await requestJson<{ game: Game }>('/api/bingo/game/move', {
        method: 'POST',
        body: JSON.stringify({ number, gameId: session.game.id, csrfToken: session.csrfToken }),
      });
      await new Promise((resolve) => window.setTimeout(resolve, 750));
      setSession((current) => ({ ...current, game: data.game }));
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'That move could not be played.');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className={styles.loading}>Loading your game…</main>;
  if (!session.user) {
    return (
      <main className={styles.page}>
        <section className={styles.authCard} aria-labelledby="welcome-title">
          <Link className={styles.backLink} href="/">
            ← Bingo home
          </Link>
          <div className={styles.brandMark}>B</div>
          <p className={styles.eyebrow}>CS50 final project</p>
          <h1 id="welcome-title">Bingo, made simple.</h1>
          <p className={styles.lede}>
            Make your mark, one number at a time. Your game saves automatically so you can come back
            whenever you like.
          </p>
          <div className={styles.authTabs} role="tablist" aria-label="Account actions">
            <button
              className={mode === 'login' ? styles.activeTab : ''}
              onClick={() => {
                setMode('login');
                setError('');
              }}
              role="tab"
              aria-selected={mode === 'login'}
            >
              Log in
            </button>
            <button
              className={mode === 'register' ? styles.activeTab : ''}
              onClick={() => {
                setMode('register');
                setError('');
              }}
              role="tab"
              aria-selected={mode === 'register'}
            >
              Create account
            </button>
          </div>
          <form onSubmit={handleAuth} className={styles.form}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
            />
            <span className={styles.hint}>3–20 letters, numbers, or underscores.</span>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              maxLength={128}
            />
            {mode === 'register' && (
              <>
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                />
              </>
            )}
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <button className={styles.primaryButton} disabled={busy} type="submit">
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create my account'}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.logo} href="/bingo">
          <span className={styles.logoDot}>B</span> bingo
        </a>
        <div className={styles.account}>
          <span>Hi, {session.user.username}</span>
          <button onClick={logout} disabled={busy}>
            Log out
          </button>
        </div>
      </header>
      {error && (
        <p className={styles.globalError} role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      {!session.game ? (
        <section className={styles.modeSection} aria-labelledby="mode-title">
          <p className={styles.eyebrow}>Choose your challenge</p>
          <h1 id="mode-title">How do you want to play?</h1>
          <div className={styles.modeGrid}>
            <button className={styles.modeCard} onClick={() => startGame()} disabled={busy}>
              <span className={styles.modeIcon}>✦</span>
              <strong>Play vs Computer</strong>
              <span>Take on a quick, private match.</span>
              <small>{busy ? 'Starting…' : 'Start a game →'}</small>
            </button>
            <button className={`${styles.modeCard} ${styles.disabledCard}`} disabled>
              <span className={styles.modeIcon}>◎</span>
              <strong>Player vs Player</strong>
              <span>Invite someone for a friendly match.</span>
              <small>Coming soon</small>
            </button>
          </div>
          <aside className={styles.tip}>
            <strong>How a round works</strong>
            <span>
              You choose a number on your board, then the computer chooses one. Complete any row,
              column, or diagonal of five marked numbers first to win.
            </span>
          </aside>
        </section>
      ) : (
        <GameBoard
          game={session.game}
          busy={busy}
          onMove={playMove}
          onNewGame={() => startGame(true)}
        />
      )}
    </main>
  );
}

function GameBoard({
  game,
  busy,
  onMove,
  onNewGame,
}: {
  game: Game;
  busy: boolean;
  onMove: (number: number) => void;
  onNewGame: () => void;
}) {
  const marked = useMemo(() => new Set(game.markedNumbers), [game.markedNumbers]);
  const isFinished = game.status === 'finished';
  const resultText =
    game.winner === 'player'
      ? 'You won!'
      : game.winner === 'computer'
        ? 'The computer won this round.'
        : 'It’s a draw.';

  function confirmNewGame() {
    if (!isFinished && !window.confirm('Start a new game? Your current match will be discarded.'))
      return;
    onNewGame();
  }

  return (
    <section className={styles.gameShell} aria-labelledby="game-title">
      <div className={styles.gameHeading}>
        <div>
          <p className={styles.eyebrow}>Player vs Computer</p>
          <h1 id="game-title">Your board, your move.</h1>
        </div>
        <button className={styles.secondaryButton} onClick={confirmNewGame} disabled={busy}>
          {isFinished ? 'New game' : 'New game'}
        </button>
      </div>
      <div className={styles.scoreStrip}>
        <div>
          <span>You</span>
          <strong>{game.playerLines}</strong>
          <small>completed lines</small>
        </div>
        <div className={styles.turnStatus} aria-live="polite">
          {isFinished ? resultText : busy ? 'Computer is thinking…' : 'Your turn — choose a number'}
        </div>
        <div>
          <span>Computer</span>
          <strong>{game.computerLines}</strong>
          <small>completed lines</small>
        </div>
      </div>
      {isFinished && (
        <div
          className={`${styles.result} ${game.winner === 'player' ? styles.resultWin : ''}`}
          role="status"
        >
          <strong>{resultText}</strong>
          <span>
            {game.winner === 'player'
              ? 'Great reading of the board.'
              : 'You can try another round whenever you’re ready.'}
          </span>
        </div>
      )}
      <div className={styles.boards}>
        <div className={styles.boardPanel}>
          <div className={styles.boardLabel}>
            <span className={styles.playerBadge}>YOU</span>
            <span>Pick an unmarked number</span>
          </div>
          <div className={styles.board} aria-label="Your Bingo board">
            {game.playerBoard.map((number) => (
              <button
                key={number}
                className={`${styles.cell} ${marked.has(number) ? styles.marked : ''}`}
                disabled={busy || isFinished || game.turn !== 'player' || marked.has(number)}
                onClick={() => onMove(number)}
                aria-label={`${number}${marked.has(number) ? ', marked' : ', unmarked'}`}
                aria-pressed={marked.has(number)}
              >
                {number}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.boardPanel}>
          <div className={styles.boardLabel}>
            <span className={`${styles.playerBadge} ${styles.computerBadge}`}>COMPUTER</span>
            <span>Numbers hidden</span>
          </div>
          <div
            className={`${styles.board} ${styles.hiddenBoard}`}
            aria-label="Computer board with numbers hidden"
          >
            {game.computerCells.map((cell) => (
              <div
                key={cell.index}
                className={`${styles.cell} ${cell.marked ? styles.marked : ''}`}
                aria-label={cell.marked ? 'Computer marked cell' : 'Hidden computer cell'}
              >
                {cell.marked ? '✓' : '·'}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.bottomGrid}>
        <div className={styles.history}>
          <div className={styles.sectionTitle}>
            Move history <span>{game.moves.length}</span>
          </div>
          {game.moves.length === 0 ? (
            <p>No moves yet. Your board is ready.</p>
          ) : (
            <ol>
              {game.moves.map((move, index) => (
                <li key={`${move.player}-${index}`}>
                  <span>{index + 1}</span>
                  <strong>{move.player === 'player' ? 'You' : 'Computer'}</strong>
                  <em>{move.number}</em>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className={styles.rules}>
          <div className={styles.sectionTitle}>Quick rules</div>
          <p>
            Marking a number marks it on both boards. The first player to complete a row, column, or
            long diagonal of five wins.
          </p>
          <p className={styles.securityNote}>
            Your game is saved to your account. Computer numbers stay hidden.
          </p>
        </div>
      </div>
    </section>
  );
}
