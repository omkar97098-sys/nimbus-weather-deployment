# NIMBUS Deployment Guide

Production architecture:

- **Frontend** — React + Vite SPA (Render Static Site)
  - Talks to the backend at `VITE_API_BASE_URL` (fallback: same origin `/api/*`).
- **Backend** — Node + Express REST API (Render Web Service)
  - Calls OpenWeather, serves `/api/*`, persists favorites.
- **Database** — MongoDB Atlas via `MONGO_URI`. If `MONGO_URI` is set, MongoDB is **required** (the app retries, then exits if unreachable). If unset, favorites fall back to a local JSON file (local-dev mode only).

```
GitHub -> Render Static Site (client/)  ->  VITE_API_BASE_URL
                                              |
GitHub -> Render Web Service (server/)  <----/
              |
              +--> OpenWeather API
              +--> MongoDB (optional)
```

## Required environment variables

| Variable | Where | Required | Purpose |
| --- | --- | --- | --- |
| `OPENWEATHER_API_KEY` | Backend only | Yes | OpenWeather Map API key. Never put it in the frontend. |
| `PORT` | Backend | Render sets it | HTTP port the backend listens on (auto-provided by Render). |
| `MONGO_URI` | Backend | No* | MongoDB Atlas connection string. If set, MongoDB is required — the app retries 5× (3s apart) then exits if it cannot connect. If unset, favorites use `server/data/favorites.json` (dev mode). `MONGODB_URI` is accepted as a legacy alias. |
| `CORS_ORIGIN` | Backend | No | Comma-separated list of allowed frontend origins. If unset, all origins are allowed (default). |
| `VITE_API_BASE_URL` | Frontend (build) | Yes* | Base URL of the deployed backend, e.g. `https://nimbus-api.onrender.com`. *Only needed when the frontend is served from a different origin than the backend. |

Real values (API keys, DB URIs) are always set in Render's dashboard or local `.env` files —
they are never committed. See `server/.env.example` and `client/.env.example`.

## Render — Backend (Web Service)

1. New Web Service, connected to the repository.
2. Root directory: `server`
3. Environment: Node
4. Build command: `npm install`
5. Start command: `npm start`
6. Environment variables:
   - `OPENWEATHER_API_KEY` = your OpenWeather key
   - `MONGO_URI` = Mongo Atlas connection string (required for durable favorites)
   - `CORS_ORIGIN` = e.g. `https://your-nimbus-frontend.onrender.com` (must match the deployed frontend URL)

Render injects `PORT` automatically; the app binds to `0.0.0.0` and serves
`GET /api/health`, `/api/weather`, `/api/favorites`, plus a 404 handler and an error-handling middleware.
`GET /api/health` reports `weatherApiKey` (`set`/`missing`), `database` (`connected`/`error`),
`uptime`, and an `ok` flag. The API key and `MONGO_URI` are validated at startup:
if `OPENWEATHER_API_KEY` is missing, or `MONGO_URI` is set but unreachable, the app logs a
clear `FATAL` message and exits with a non-zero code so the Render deploy fails visibly.

## Render — Frontend (Static Site)

1. New Static Site, connected to the repository.
2. Root directory: `client`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Environment variable (click “Add Environment Variable” before build):
   - `VITE_API_BASE_URL` = deployed backend URL, e.g. `https://nimbus-api.onrender.com`

Because the API key lives only in the backend, the frontend bundle never contains secrets.

## Render — Favorites persistence

With `MONGO_URI` set, favorites are stored in MongoDB Atlas (durable across redeploys).
If `MONGO_URI` is unset, the backend stores favorites in `server/data/favorites.json`
(local-dev mode; the disk is ephemeral on Render — wiped on redeploys/restarts).
The fallback is never silent: when `MONGO_URI` is set, the app fails fast if MongoDB is
unreachable, and favorites requests return an error while the database is disconnected.

To use MongoDB Atlas:

1. Create a **free Atlas cluster**.
2. Copy the connection string into the backend `MONGO_URI` env var (never into a committed file).
3. Redeploy. The server retries the connection at startup and keeps durable favorites in Atlas.

## Local development

Backend:

```
cd server
cp .env.example .env      # then fill in OPENWEATHER_API_KEY
npm install
npm start                 # API on http://localhost:5000
```

Frontend (leave `VITE_API_BASE_URL` unset so `/api/*` is proxied to the backend in dev):

```
cd client
npm install
npm run dev               # app on http://localhost:5173
```

## Commands

| Task | Command |
| --- | --- |
| Backend start | `cd server && npm start` |
| Backend dev (watch) | `cd server && npm run dev` |
| Frontend dev | `cd client && npm run dev` |
| Frontend build | `cd client && npm run build` |
| Frontend lint | `cd client && npm run lint` |
| Health check | `GET /api/health` |

## Security notes

- `OPENWEATHER_API_KEY` is read only by the backend from the environment — never hardcoded,
  never in the frontend, never in Vite env vars.
- `.env*` files are git-ignored; only `*.env.example` placeholders are tracked.
- `server/data/` (runtime JSON) is git-ignored.
- No git history contains a real API key (verified).