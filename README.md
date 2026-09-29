# Tabla

A two-sided learning app:

- **English** — AI chat tutor, vocabulary flashcards, grammar quiz
- **Architecture** — backend learning roadmap, AI mentor chat, quiz

Built with React + TypeScript (Vite) on Supabase (Postgres, Auth, Edge
Functions) — see [`TABLA_MVP_PLAN.md`](TABLA_MVP_PLAN.md) for scope and phases.

**How it all works:** start at [`docs/README.md`](docs/README.md) — architecture,
every feature, the database, login, and the AI function.

## Requirements

- **Node.js** `^20.19.0` or `>=22.12.0` (required by Vite 8) — check with `node -v`
- **npm** (comes with Node)

## Getting started

```bash
git clone <repo-url> tabla-app
cd tabla-app
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). Edits to files
in `src/` reload in the browser automatically.

### Environment variables

`.env.local` (gitignored) needs two values from the Supabase dashboard
(**Project Settings → API**, or the **Connect** button):

| Variable                        | Value                                          |
| ------------------------------- | ---------------------------------------------- |
| `VITE_SUPABASE_URL`             | `https://<project-ref>.supabase.co`            |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | the publishable (`sb_publishable_…`) / anon key |

Both are safe in the browser — Row Level Security is what protects the data.
**Never** put the secret / `service_role` key here. Vite only exposes
variables prefixed with `VITE_`; restart `npm run dev` after editing the file.

### Database (Supabase)

The schema lives in `supabase/migrations/` and is applied with the Supabase
CLI (installed as a dev dependency):

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push          # apply new migrations to the remote database
npm run types:db              # regenerate src/lib/database.types.ts
```

Run `npm run types:db` after every schema change so TypeScript matches the
database.

### AI chat (Edge Function)

The tutor and mentor chats call the `ai-chat` Edge Function
(`supabase/functions/ai-chat/`), which calls the Claude API. The Anthropic key
lives only in Supabase secrets — never in `.env.local` or the frontend.

```bash
npx supabase secrets set ANTHROPIC_API_KEY=<your key>   # once
npx supabase functions deploy ai-chat                   # after every change to the function
```

Optional: `npx supabase secrets set ANTHROPIC_MODEL=<model id>` to switch
models without a code change. Each user is limited to 50 AI messages per 24
hours (`DAILY_CAP` in the function, enforced by `consume_ai_quota()` in the
database). Set a monthly spend limit in the Anthropic Console as a backstop.

The function only answers browsers on origins listed in the `ALLOWED_ORIGINS`
secret (comma-separated). If unset, it allows `http://localhost:5173` and
`http://127.0.0.1:5173` only.

## Deploy (Vercel)

The frontend is a static Vite build hosted on Vercel; everything else runs on
Supabase.

1. **Vercel → Add New Project →** import this GitHub repo. The **Vite** preset
   fills in build command `npm run build` and output directory `dist`.
2. **Environment variables** (Production + Preview): `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_PUBLISHABLE_KEY` — same values as `.env.local`. Never add the
   Anthropic key here.
3. **Deploy.** Every push to `main` redeploys automatically; other branches get
   preview URLs.
4. **Supabase → Authentication → URL Configuration:** set Site URL to the
   Vercel URL and keep `http://localhost:5173` under Redirect URLs.
5. **Allow the live origin to call the AI:**

   ```bash
   npx supabase secrets set ALLOWED_ORIGINS=https://<app>.vercel.app,http://localhost:5173
   npx supabase functions deploy ai-chat
   ```

Node is pinned to `22.x` (`engines` in `package.json`) so Vercel builds with
the same major version as local development.

## Scripts

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload                      |
| `npm run build`   | Type-check (`tsc -b`) and build for production to `dist/` |
| `npm run preview` | Serve the production build locally to check it            |
| `npm run lint`    | Run ESLint over the project                               |
| `npm run types:db` | Regenerate Supabase types into `src/lib/database.types.ts` |

`npm run build` fails on any TypeScript error — the project uses
`"strict": true`, so run it (or `npx tsc -b`) before committing.

## Project structure

```
index.html          # page shell, Google Fonts links
src/
  main.tsx          # React entry point
  App.tsx           # root component
  index.css         # all styles, ported from the original HTML version
  types.ts          # shared interfaces (VocabWord, QuizQuestion, RoadmapTopic, ChatMessage)
  components/       # AuthForm, Workspace, Header, MainTabs, SubTabs, QuizEngine, ChatPanel, english/, architecture/
  hooks/            # useAuth, useTheme, useChat, useRoadmap, useQuiz, useVocab, useWriting
  lib/              # Supabase client, generated DB types, askAi, pure quiz/vocab logic
supabase/
  migrations/       # schema, RLS policies, seed data (SQL)
  functions/ai-chat # Edge Function: auth, daily quota, Claude API call
legacy/
  tabla.html        # the original single-file version — reference for the port
```

The full target layout (including Supabase) is in [`CLAUDE.md`](CLAUDE.md).

## Viewing the original version

`legacy/tabla.html` is the pre-React app. Open it directly in a browser to
compare behavior while porting. Its AI chat only works inside Claude (it used
the artifact `sample` capability), so outside Claude the chat shows a fallback
message.

## Status

| Phase | Description                         | Status      |
| ----- | ----------------------------------- | ----------- |
| 0     | React + TypeScript scaffold         | ✅ Done      |
| 1     | Supabase project setup              | ✅ Done      |
| 2     | Wire the frontend to Supabase       | ✅ Done      |
| 3     | AI tutor + mentor via Edge Function | 🟡 Deployed, API key pending |
| 4     | Fix quiz repetition                 | ✅ Done      |
| 5     | Writing practice                    | 🟡 Built, API key pending |
| 6     | Spaced repetition for vocabulary    | 🟡 Built, awaiting your test |
| 7     | Deploy                              | Code prepared, not deployed |
| 8     | Learning memory (post-MVP)          | Planned     |

Details for each phase are in [`TABLA_MVP_PLAN.md`](TABLA_MVP_PLAN.md).
