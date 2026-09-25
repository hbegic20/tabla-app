# Tabla

A two-sided learning app:

- **English** — AI chat tutor, vocabulary flashcards, grammar quiz
- **Architecture** — backend learning roadmap, AI mentor chat, quiz

Built with React + TypeScript (Vite). Supabase (Postgres, Auth, Edge Functions)
comes in from Phase 1 onwards — see [`TABLA_MVP_PLAN.md`](TABLA_MVP_PLAN.md).

## Requirements

- **Node.js** `^20.19.0` or `>=22.12.0` (required by Vite 8) — check with `node -v`
- **npm** (comes with Node)

## Getting started

```bash
git clone <repo-url> tabla-app
cd tabla-app
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). Edits to files
in `src/` reload in the browser automatically.

No environment variables are needed yet. Once Supabase is wired up (Phase 2),
the project URL and anon key will go in a `.env.local` file — setup steps will
be added here then.

## Scripts

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload                      |
| `npm run build`   | Type-check (`tsc -b`) and build for production to `dist/` |
| `npm run preview` | Serve the production build locally to check it            |
| `npm run lint`    | Run ESLint over the project                               |

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
  data/             # hardcoded content: vocab, roadmap topics, quizzes, AI system prompts
legacy/
  tabla.html        # the original single-file version — reference for the port
```

Components (`src/components/`) and data hooks (`src/hooks/`) are added as
Phase 0 progresses; the target layout is in [`CLAUDE.md`](CLAUDE.md).

## Viewing the original version

`legacy/tabla.html` is the pre-React app. Open it directly in a browser to
compare behavior while porting. Its AI chat only works inside Claude (it used
the artifact `sample` capability), so outside Claude the chat shows a fallback
message.

## Status

| Phase | Description                         | Status      |
| ----- | ----------------------------------- | ----------- |
| 0     | React + TypeScript scaffold         | In progress |
| 1     | Supabase project setup              | Not started |
| 2     | Wire the frontend to Supabase       | Not started |
| 3     | AI tutor + mentor via Edge Function | Not started |
| 4     | Fix quiz repetition                 | Not started |
| 5     | Writing practice                    | Not started |
| 6     | Spaced repetition for vocabulary    | Not started |
| 7     | Deploy                              | Not started |

Details for each phase are in [`TABLA_MVP_PLAN.md`](TABLA_MVP_PLAN.md).
