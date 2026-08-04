# Smart Agriculture Copilot

A full-stack SIH-ready agriculture dashboard for crop monitoring, weather insights, irrigation planning, disease checks, and farmer assistance. It runs in public demo mode with no accounts or database required.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts
- Backend: Node.js, Express

## Quick start

1. Install Node.js 18+.
2. Copy `server/.env.example` to `server/.env` (optional; defaults work for local use).
3. From this folder run:

```bash
npm install
npm run install:all
npm run dev
```

4. Open `http://localhost:5173`.

The dashboard opens immediately. It has no sign-in screen or database setup.

## API routes

- `GET /api/dashboard` – public dashboard starter payload
- `GET /api/weather` – public weather payload
- `GET /api/market-prices` – public commodity prices
- `GET /api/recommendations` – public farm recommendations
- `GET /api/health` – service health check

## Connecting live services later

Add server-side services under `server/services/` for weather, satellite, commodity-price, and disease-model providers. Keep provider keys in `server/.env`; the frontend should call the Express API rather than third-party APIs directly. Add a database later only if you need saved farms or user accounts.
