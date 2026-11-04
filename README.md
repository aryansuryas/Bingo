# Aryan Surya S — Portfolio and Bingo

This repository contains my portfolio and a beginner-friendly CS50 Bingo final project at
[`/bingo`](http://localhost:4028/bingo). Bingo uses the existing Next.js stack in this
repository and stores accounts and resumable matches in a local SQLite database.

## Features

- Responsive landing experience
- Project showcase and technology stack sections
- Education and achievements highlights
- Contact form with EmailJS integration
- Resume download and portfolio navigation
- Username/password accounts with secure password hashes
- Resumable Player vs Computer Bingo matches
- A clearly disabled Player vs Player “Coming Soon” mode

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- EmailJS
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

## Environment Variables

Create a local file named `.env.local` with:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

## Deployment

This project is ready for deployment on Vercel.

## Notes

- Keep `.env.local` out of version control.
- The repository uses `.gitignore` to exclude local environment files and build output.

## Bingo setup and database

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

How I Did ?
Intro Idea
genearte prompt form
Generate Images from chatgpt
voleect in order generate video
