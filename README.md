# TaskHub (React + TS + Vite)

Aplikacja szkoleniowa do przygotowania do rozmowy na React Developera. Zawiera: React 18, TypeScript, Vite, React Router, Material UI v6, React Hook Form + Zod, Axios (interceptory, refresh), MSW (mock backend), Jest + RTL, ESLint/Prettier, Husky, GitHub Actions, deploy na Vercel.

## Szybki start

- Zależności: Node 18+/22+, npm
- Zainstaluj: `npm install`
- Dev: `npm run dev` (MSW startuje automatycznie w dev)
- Testy: `npm test`
- Lint: `npm run lint`
- Build: `npm run build` i `npm run preview`

## Środowisko

- Zmienna `VITE_API_URL` opcjonalna (domyślnie `/api`). W dev ruch trafia do MSW.

## Struktura

- `src/pages` — ekrany (Home/Tasks/Settings/Login)
- `src/context` — Theme/Session
- `src/api` — axios klient + interceptory
- `src/mocks` — MSW handlers/worker
- `src/test` — setup testów

## Deploy na Vercel

- Framework: Other
- Build Command: `npm run build`
- Output: `dist`