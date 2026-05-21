# Learning project to better understand full stack architecture

## Current Architecture
* Mono Repo: 
    * Frontend - React based with Zustand for state management
    * Backend - Express, Express-Session

## Features
* Can show statistics (Top songs and artists you are listening to)
* Backdrop that shows currently playing Spotify track
* Spotify playlist transfer to Apple Music

## Running application
* Frontend: Navigate to `/frontend` and run `npm run dev`
* Backend: Navigate to `/backend` and run `npm run dev`
## Docker & Redis: 
* To run Docker & Redis - navigate to root and run `docker compose up -d`
*-* To turn off Docker & Redis - navigate to root and run `docker compose down` with optional flag `-v` to remove the volume, hence all session data
*-* To see redis logs - navigate to root and run `docker compose logs -f redis`

## Spotify API notes
* App can't be used by anyone, only 5 users can use app at a time since, and they must be personally added onto an allowlist.