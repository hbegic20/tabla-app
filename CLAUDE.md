# Tabla (React + TypeScript + Supabase) — Project Memory

## ⚠️ Rule zero — git

**Never run `git commit`, `git push`, or `git merge`. Never stage and commit
changes on my behalf, even if I ask you to "save progress" or "wrap up" —
that means work locally, not commit it.** I review every diff and commit it
myself. You may run `git status`, `git diff`, and `git log` freely (read-only
is fine) to understand the current state, and you may suggest a commit
message for me to use — but the action of committing or pushing is always
mine.

If you're ever unsure whether an action is a write, treat it as one and ask
first (this applies to git specifically, but the instinct is right generally).

## What this project is

Tabla is a dual-purpose learning app: English practice (AI chat tutor,
vocabulary with spaced repetition, grammar quiz, writing practice) and
software-architecture learning (roadmap, AI mentor chat, quiz) for a frontend
developer picking up backend skills. The frontend was originally a single
vanilla HTML/CSS/JS file; it's being rewritten in React + TypeScript
(Phase 0), then wired to Supabase (Phases 1–7).

`TABLA_MVP_PLAN.md` in this repo is the source of truth for scope and order —
**Phase 0 (React/TS scaffold) happens first, before any Supabase work.**

@TABLA_MVP_PLAN.md

## Stack

- **Frontend:** React + TypeScript, built with Vite, no CSS framework — the
  existing hand-written CSS is ported in as-is
- **Backend:** Supabase — Postgres (with Row Level Security), Auth, Edge
  Functions
- **AI:** Claude API, called only from an Edge Function (`ai-chat`), never
  from the browser — the Anthropic key lives in Supabase secrets
- **Types:** shared interfaces in `src/types.ts`; Supabase schema types
  generated via `supabase gen types typescript` once Phase 1 exists, imported
  wherever a query result is typed
- **Hosting:** static frontend (Vite build output) on Netlify or Vercel;
  Supabase hosts everything else

## Repo structure

The Vite app lives at the repo root (no `tabla-frontend/` subfolder);
`supabase/` sits alongside `src/`.

```
tabla-app/                   # repo root = Vite project root
  index.html
  package.json
  vite.config.ts
  tsconfig.json              # references tsconfig.app.json + tsconfig.node.json
  tsconfig.app.json          # src/ — "strict": true
  tsconfig.node.json         # vite.config.ts — "strict": true
  public/
  src/
    main.tsx
    App.tsx
    index.css                  # ported from the original vanilla version
    types.ts                   # shared interfaces (VocabWord, QuizQuestion, etc.)
    lib/
      supabase.ts              # typed Supabase client
    hooks/
      useAuth.ts
      useRoadmap.ts
      useVocab.ts
      useQuiz.ts
    components/
      Header.tsx
      MainTabs.tsx
      english/
        ChatTutor.tsx
        Vocabulary.tsx
        GrammarQuiz.tsx
        WritingPractice.tsx
      architecture/
        Roadmap.tsx
        MentorChat.tsx
        ArchQuiz.tsx
  supabase/
    functions/
      ai-chat/
        index.ts
    migrations/                # SQL for tables + RLS policies, in version control
```

## Conventions

- **Strict TypeScript** — no `any` without a comment explaining why it's
  unavoidable; prefer explicit interfaces over inferred shapes for anything
  crossing a component boundary or coming back from Supabase
- **Function components + hooks only** — no class components
- **One hook per data domain** (`useRoadmap`, `useVocab`, `useQuiz`, `useAuth`)
  encapsulating its own Supabase calls and loading/error state, so components
  stay focused on rendering
- All schema changes go through a migration file in `supabase/migrations/`,
  not just clicked into existence in the dashboard and forgotten
- RLS on every table that holds user data — no table ships without a policy
- No secrets in frontend code, ever — the Supabase anon key is fine
  client-side (that's what it's for), the Anthropic key is not
- Prefer `.upsert()` over separate insert/update branches where the data model
  allows it (roadmap progress, vocab progress)

## How to work with me on this project

**I'm using this project to learn, not just to finish it.** Please:

1. **Follow `TABLA_MVP_PLAN.md` in order**, starting with Phase 0 (React/TS
   scaffold) — don't touch Supabase until Phase 0's feature parity is
   confirmed working.
2. **Explain before you build.** Before generating a component, hook, or SQL,
   say what it's for and why it's shaped that way — a sentence or two, not a
   lecture.
3. **Let me drive the Supabase dashboard myself** for things like creating the
   project, enabling Auth providers, and pasting in secrets — walk me through
   it rather than assuming you can do it, since a lot of this is UI-based.
4. **Review code like a senior engineer**, not a linter: call out real bugs,
   type-safety gaps, RLS/security issues, anything that works but isn't
   idiomatic React/TypeScript, and what's genuinely good — and explain *why*.
5. **Mark phases done** in `TABLA_MVP_PLAN.md` as we complete them, so it
   stays an accurate log — but leave the actual git commit to me (see rule
   zero).
6. **Flag scope creep.** If a request would pull in something from the
   "deliberately deferred" list at the bottom of the plan, say so before
   building it.

## Non-goals for now

- No custom Express/Node backend for this app — that's the *next* project
  (a separate webshop repo), not this one
- No state-management library (Redux, Zustand, etc.) — component state +
  custom hooks are enough at this size; don't introduce one preemptively
- No CSS framework/component library — the existing hand-styled look is
  intentional