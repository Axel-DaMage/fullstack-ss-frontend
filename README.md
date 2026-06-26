# Frontend

[![CI](https://github.com/Axel-DaMage/fullstack-ss-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Axel-DaMage/fullstack-ss-frontend/actions/workflows/ci.yml)
[![Docker](https://github.com/Axel-DaMage/fullstack-ss-frontend/actions/workflows/docker.yml/badge.svg)](https://github.com/Axel-DaMage/fullstack-ss-frontend/actions/workflows/docker.yml)
![Node](https://img.shields.io/badge/node-18+-green)
![React](https://img.shields.io/badge/react-18-blue)

SPA for Sanos y Salvos. Dashboard, pet management, location tracking, and match review.

## Stack

- React 18 + TypeScript + Vite 5
- Vitest + Testing Library
- ESLint
- CSS (Catppuccin Mocha)

## Quick start

```bash
npm install
npm run dev
```

## Tests

```bash
npx vitest run
npx vitest run --coverage
```

## API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | System metrics |
| GET/POST | `/api/pets` | Pet CRUD |
| GET/PUT/DELETE | `/api/pets/{id}` | Single pet |
| GET/POST | `/api/locations` | Location CRUD |
| GET/POST | `/api/matches` | Match CRUD |
| PUT | `/api/matches/{id}/confirm` | Confirm match |
| PUT | `/api/matches/{id}/reject` | Reject match |
| POST | `/api/matches/run-automatic` | Auto matching |

## Deploy

Deployed via api-gateway pipeline to EC2. Frontend serves on port 80 behind nginx, proxying `/api/*` to the API Gateway.
