# ARCHITECTURE

## Stack choice

- Frontend: React + Vite + TypeScript
- Styling: plain CSS for fast iteration
- Storage: browser localStorage for early persistence

This is a frontend-first MVP designed to prove the audit flow quickly. It avoids backend complexity in the first two days and leaves the next five days for backend integration, lead capture, and deployment.

## Data flow

1. User opens the page.
2. The app reads any saved entries from localStorage.
3. The user adds one or more AI tools, selects plans, enters spend, seats, and use cases.
4. The app saves this state to localStorage immediately.
5. When the user clicks "Review audit summary," the app runs a small rule-based audit function.
6. The UI displays a per-tool recommendation and a top-level spend summary.

## Current implementation

- `src/App.tsx` contains the input form and the audit summary logic.
- `src/styles.css` contains the UI styling.
- The app is a single-page client-side application.

## Why this architecture

This architecture is intentionally narrow for the first two days:
- It allows rapid UX iteration.
- It reduces risk by avoiding backend deployment before we have a stable audit flow.
- It keeps the project aligned with the first-day outcome: a working prototype that can be shown and improved.

## What to add for 10k audits/day

If this had to scale to 10k audits/day, the next steps would be:
- Add a backend API on a serverless platform (e.g. Cloudflare Workers, Vercel Functions, or Supabase edge functions).
- Store each audit in a database with a unique report URL and optional lead capture data.
- Cache pricing metadata and vendor rules in a remote store.
- Add rate limiting and abuse protection for the report creation endpoint.
- Add a real audit engine that can compute savings on every supported AI vendor and plan.

## What I would change next

- Replace localStorage with a backend-backed audit create API.
- Add a shareable report page with hashed public URLs.
- Add Open Graph tags and metadata for clean social previews.
- Add analytics and user funnel tracking for landing page conversions.
