# Budgie, modern edition

A responsive personal budgeting app rebuilt with **React, Vite and Supabase**. The original static HTML/JavaScript experience is preserved at the repository root; this implementation lives in `modern/`.

## Features
- Dashboard overview of take-home income, spending, and money left.
- Personalised budget allocation based on 0–10 category priority ratings.
- Budget checker with category-level expense tracking and remaining-income feedback.
- Arithmetic calculator.
- Save budget snapshots in browser storage, or to Supabase for signed-in users.
- Supabase email magic-link authentication and per-user row-level security.
- Responsive layout and keyboard-accessible controls.

## Run locally
Requires Node.js 20.19+ or 22.12+.

```bash
cd modern
npm install
cp .env.example .env.local
npm run dev
```

The app works without Supabase credentials and saves snapshots in the current browser. To enable cloud persistence, create a Supabase project, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`, then run the SQL in `supabase/schema.sql` from the Supabase SQL Editor. Configure email auth and the local/deployed redirect URLs in Supabase Authentication settings.

Only the Supabase publishable/anon key belongs in a frontend environment variable. **Never put a service-role key in this app.** Row-level security ensures users can only access their own rows.

## Stack
- React 18 + Vite
- Supabase JS client (Auth + Postgres)
- Lucide React icons
- CSS with responsive breakpoints

## Notes
- Income periods are used for display and planning labels; enter expenses that correspond to the selected period.
- Budget suggestions distribute the entered income proportionally across non-zero category priorities. They are a planning aid, not financial advice.
