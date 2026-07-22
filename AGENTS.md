# DocuFlow

DocuFlow is a minimal single-page document workflow tracker. Documents move through a `Draft → Review → Approved` flow and are persisted in the browser's `localStorage`.

## Stack

- Vanilla JS + Vite (no framework). Entry points: `index.html` (root), `src/main.js`, `src/style.css`.

## Commands

- Install: `npm install`
- Dev server: `npm run dev` (defined as `vite --host`)
- Build: `npm run build`
- Preview production build: `npm run preview`

There is no lint or automated test setup yet.

## Cursor Cloud specific instructions

- The `dev` script uses `vite --host` on purpose so the server binds to the local network IP (for testing from a phone / other devices). Vite prints both `Local:` and `Network:` URLs on startup.
- Vite uses port `5173` by default but auto-increments (e.g. `5174`) if it is already in use — always read the actual URL from the dev server output rather than assuming `5173`.
- State is stored in `localStorage` under the key `docuflow.documents`; clear site data to reset the app to its empty state.
