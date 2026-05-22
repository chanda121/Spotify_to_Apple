# Learning project to better understand full stack architecture
Spotify → Apple Music — transfer playlists with ISRC + fuzzy catalog matching. Full-stack monorepo (React, Express, Redis). Personal/learning project — local use only due to Spotify API limits.

## Demo

<!-- Replace the link below when your video is uploaded (YouTube, Loom, etc.) -->
**[Watch demo]()** _(coming soon)_

Walkthrough covers:

1. Spotify login and session flow
2. Stats page — top tracks and artists
3. Backdrop — currently playing track
4. Transfer page — link Apple Music, select playlists, confirm transfer
5. Results — matched, fuzzy, and unmatched tracks per playlist

<!-- Optional: add screenshots or a GIF after recording -->
<!--
![Transfer results](docs/demo-transfer.png)
![Stats page](docs/demo-stats.png)
-->

## Architecture

- **frontend/** — React 19, Vite, Zustand, Tailwind
- **backend/** — Express 5, express-session, Redis session store
- **backend/src/app.ts** — Express app factory (`createApp`) with routes and middleware
- **backend/src/server.ts** — entry point: Redis connection, session store, server listen
- **shared/** — TypeScript types shared between frontend and backend

OAuth: Spotify (PKCE) + Apple Music (developer token + Music User Token).  
Sessions stored in Redis; API routes proxied through Vite in dev.

## Features

* Statistics — top songs and artists from Spotify
* Backdrop — currently playing Spotify track
* Playlist transfer — Spotify → Apple Music with ISRC matching and fuzzy search fallback
* Transfer UI — select up to 5 playlists, confirmation modal, per-playlist match stats (exact / fuzzy / unmatched)

## How matching works

1. **ISRC match** — batch lookup on Apple Music when Spotify provides an ISRC
2. **Search fallback** — Apple Music search by track, artist, and album name
3. **Scoring** — normalized title, artist, album comparison plus duration tolerance
4. **Confidence** — tracks below the fuzzy threshold are skipped rather than added incorrectly

## Prerequisites

* Node.js and npm
* Docker (for Redis)
* [Spotify Developer](https://developer.spotify.com/dashboard) account — app owner needs **Spotify Premium**
* [Apple Developer Program](https://developer.apple.com/programs/) membership — user needs an **Apple Music** subscription to link their library

## Setup

### Spotify Developer App

1. Log in to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app.
2. Open the app → **Settings**.
3. Under **Redirect URIs**, add:
   ```
   http://127.0.0.1:3000/api/spotify/auth/callback
   ```
   OAuth callbacks hit the **backend** directly (port 3000), not the Vite dev server.
4. Save settings and copy the **Client ID** into `backend/.env` as `SPOTIFY_CLIENT_ID`.
5. Go to **User Management** and add each Spotify user who should use the app (Development mode allowlist, max 5 users).
6. Set `SPOTIFY_REDIRECT_URI` in `.env` to the same redirect URI you registered above.

### Apple Music API

1. Log in to [Apple Developer](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles** (requires a **paid** Apple Developer account).
2. **Identifiers** → create a **Media ID** (MusicKit) identifier for the app.
3. **Keys** → create a new key, enable **MusicKit**, download the `.p8` file (only available once).
4. Note your **Key ID** (`APPLE_KID`) and **Team ID** (`APPLE_TEAM_ID` from Membership details).
5. Add to `backend/.env`:
   * `APPLE_KID` — Key ID from step 3
   * `APPLE_TEAM_ID` — Team ID
   * `APPLE_PRIVATE_KEY` — contents of the `.p8` file (use `\n` for line breaks if putting it on one line)
6. In the app, Apple Music login uses [MusicKit JS](https://developer.apple.com/documentation/musickitjs) in the browser. The backend signs the developer token; the user authorizes with their Apple ID on the Transfer page. Apple link status is restored from the session on login.

### Environment variables

Copy the example env file and fill in your credentials:

```bash
cp backend/.env.example backend/.env
```

See [`backend/.env.example`](backend/.env.example) for all required variables. The backend loads this file automatically via `tsx watch --env-file=.env`.

## Startup order

Run these from the repo root:

1. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in `SESSION_SECRET`, Spotify, and Apple values (see [Setup](#setup) above).

2. **Install and start the backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   This starts Redis via Docker Compose, then runs `server.ts` on `http://127.0.0.1:3000`. The backend exits on startup if Redis is unavailable.

3. **Install and start the frontend** (separate terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs at `http://127.0.0.1:5173` and proxies `/api` requests to the backend.

4. **Open the app** at [http://127.0.0.1:5173](http://127.0.0.1:5173) — log in with Spotify, then link Apple Music on the Transfer page.

### Docker & Redis commands

Redis is started automatically by `npm run dev` in `backend/`. To manage it manually from the repo root:

* Start Redis: `docker compose up -d`
* Stop Redis: `docker compose down` (add `-v` to remove the volume and clear session data)
* Redis logs: `docker compose logs -f redis`

## Pitfalls

* **Spotify Development mode only** — max 5 allowlisted users; Extended Quota requires a company application
* **Local use only** — not deployed; requires your own API credentials
* **Spotify Premium** — app owner must have Premium for the dev app to work
* **Transfer limits** — up to 5 playlists per transfer; playlist names/descriptions must fit Apple Music limits (200 / 500 characters)
* **Not all tracks match** — catalog differences, missing ISRCs, and fuzzy search limits mean some songs won't transfer

## Possible next steps

* Vitest + Supertest for transfer matching and auth flows (using `createApp` for route tests)
* Production deploy (Vercel + Fly.io) — deprioritized due to Spotify public access limits
