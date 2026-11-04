# Bingo — CS50 Final Project

A beginner-friendly Player vs Computer Bingo web application built for a CS50 final
project. It uses username/password accounts and a local SQLite database to resume active
matches.

## Features

- Username/password accounts with secure password hashes
- Resumable Player vs Computer Bingo matches
- A clearly disabled Player vs Player “Coming Soon” mode

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- SQLite via `better-sqlite3`

## Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open http://localhost:4028

Open http://localhost:4028/bingo to play Bingo.

## Environment and database

Copy `.env.example` to `.env.local` if you want to configure the database path or
site URL. `.env.local` is ignored and must never be committed.

From the repository root:

```bash
npm install
npm run dev
```

The first request to the Bingo page creates `data/bingo.db` and its tables automatically.
The database contains normalized usernames, salted one-way password hashes, sessions, and
the state needed to resume active games. Set `BINGO_DB_PATH` to an absolute or
repository-relative path if you want to store it elsewhere. Do not commit the database
file or any environment secrets.

## Bingo rules

Each board is a randomized 5×5 arrangement of numbers 1–25. You choose an unmarked number
on your board, which is marked on both boards; the computer then chooses an available
number. The first player to complete a row, column, or either long diagonal of five
marked cells wins. The computer’s numbers and layout remain hidden, while the move history
shows which numbers were selected. Refreshing or logging out does not discard an active
match.

## Project files

- `src/app/page.tsx` — redirects the root URL to Bingo.
- `src/app/bingo/page.tsx` — account screens, mode selection, and accessible game UI.
- `src/app/bingo/bingo.module.css` — responsive Bingo styling.
- `src/app/api/bingo/*` — server-authoritative authentication and game endpoints.
- `src/lib/bingo/db.ts` — SQLite schema, password hashing, session handling, and game rules.
- `data/bingo.db` — generated local database (not committed).

## Limitations and future work

Player vs Player is intentionally disabled and marked “Coming Soon”. The computer uses a
random available number rather than an AI model. The local SQLite setup is intended for
CS50 Codespaces and local demonstrations, not multi-instance production hosting.

## Demo video

Demo video URL: _to be added before submission_

## Demo video

Demo video URL: _to be added before submission_
