# Architecture

## The three pieces

```
┌──────────────────────── Browser (Vercel serves the static files) ────────────────────────┐
│                                                                                           │
│  React app                                                                                │
│    App ── useAuth ──► AuthForm (logged out)                                               │
│                  └──► Workspace (logged in, key = user id)                                │
│                         ├─ useRoadmap / useVocab / useQuiz / useWriting  ── data hooks    │
│                         ├─ useChat ×2 (tutor, mentor)                    ── AI hooks      │
│                         └─ components only render what the hooks give them               │
│                                                                                           │
│  supabase-js client (src/lib/supabase.ts) — keeps the session, sends the token           │
└───────────────┬─────────────────────────────────────────────┬─────────────────────────────┘
                │ /rest/v1  (tables)                          │ /functions/v1/ai-chat
                ▼                                             ▼
┌────────────────────────────── Supabase ───────────────────────────────────────────────────┐
│  Auth (who you are)   ·   Postgres + RLS (what you may touch)   ·   Edge Function ai-chat │
│                                                                   └─► Claude API          │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

- **The frontend decides what to show.** It never decides who may see which data.
- **Supabase is the authority.** Auth issues a token; Postgres Row Level Security
  (RLS) checks that token on every row. Anyone can call Supabase with the public
  key — that's fine, because the database enforces the rules.
- **The only server code** is one Edge Function, `ai-chat`, which exists so the
  Anthropic API key never reaches the browser.

## Folder layout

```
src/
  main.tsx, App.tsx       entry point; App is the auth gate
  index.css               all styles (ported from the original HTML version + additions)
  types.ts                shared app-level types (QuizQuestion, VocabWord, QuizKey, …)
  lib/
    supabase.ts           the one shared, typed Supabase client
    database.types.ts     generated from the live schema (npm run types:db) — never edit
    ai.ts                 askAi(): calls ai-chat, turns HTTP errors into readable messages
    quizRound.ts          pickRound(): which quiz questions to show next (pure)
    leitner.ts            review(): vocab spaced-repetition maths (pure)
  hooks/                  one per data domain: useAuth, useRoadmap, useVocab, useQuiz,
                          useWriting, useChat, useTheme
  components/             Workspace (layout + tabs), shared QuizEngine / ChatPanel,
                          english/ and architecture/ feature components
supabase/
  migrations/             every schema change, as SQL, in order
  functions/ai-chat/      the Edge Function (Deno)
legacy/tabla.html         the original single-file app, kept as reference
docs/                     these documents
```

## Patterns used everywhere

Learn these once and every feature reads the same way.

### 1. One hook per data domain

Each hook owns its Supabase calls plus `loading` / `error` state and returns
plain data and actions. Components receive those as props and only render.

```
useRoadmap(userId) → { topics, done, loading, error, toggle }
       │
Workspace ──props──► <Roadmap topics done onToggle />
```

This is why `Roadmap`, `Vocabulary` and `QuizEngine` barely changed when the
data moved from hardcoded files to Supabase: only the hook changed.

### 2. Load with one embedded select

Each hook fetches content **and** your progress in one request by following a
foreign key:

```ts
supabase.from('roadmap_topics').select('id, title, note, roadmap_progress(done)')
```

RLS applies to the nested rows too, so `roadmap_progress` only ever contains
*your* row. Same idea in `useVocab` (`vocab_progress`) and `useQuiz`
(`quiz_question_history`).

### 3. Optimistic updates with rollback

When you tick a topic or mark a word, the UI updates **immediately**, then the
hook saves with `.upsert()`. If the save fails, the hook puts the old value back
and shows the error. Waiting for the network on every click would make the app
feel slow.

### 4. Upsert on a composite key

Progress tables have primary key `(user_id, <thing>_id)`, so "save my progress
on this topic" is one `.upsert(…, { onConflict: 'user_id,topic_id' })` — insert
the first time, update after that, never a duplicate.

### 5. Pure logic in `src/lib/`, tested separately

Anything that is "just maths" lives outside React and Supabase:
`pickRound()` (quiz order) and `review()` (Leitner boxes). They were
unit-tested with plain Node, which is only possible because they import nothing
from React or Supabase.

### 6. Validate data at the boundary

Data from outside the app is checked where it enters instead of cast with `as`:
`options` (jsonb) must really be a `string[]`; the Edge Function checks `mode`
and every message before using them.

### 7. `key` to reset state

- `<Workspace key={user.id}>` — a different user gets a completely fresh
  Workspace, so no one sees the previous user's in-memory chats or quiz.
- `<QuizEngine key={roundId}>` — each new quiz round starts with clean state,
  without a hand-written reset function that could forget a field.

### 8. Views stay mounted

Tabs are hidden with a CSS class, not unmounted, so a half-finished quiz,
flipped cards and chat drafts survive switching tabs (same as the original app).

## Type safety chain

```
SQL migration ──► npm run types:db ──► database.types.ts ──► typed queries + QuizKey
```

Example: `quiz_key` is a Postgres enum, so `QuizKey` in `types.ts` is
`Database['public']['Enums']['quiz_key']`. Add a quiz type in a migration,
regenerate types, and TypeScript knows about it everywhere.

## Key decisions (and why)

| Decision | Why |
| --- | --- |
| No custom backend | Supabase gives auth, database, RLS and functions; the plan scopes a custom Express server to the next project |
| RLS on every table | The public key is in the browser by design; RLS is the real security boundary |
| Content in migrations, not the dashboard | The whole database can be rebuilt from `supabase/migrations/`; changes are reviewable in git |
| System prompts on the server | The browser only picks a mode, so nobody can turn the API key into a general chatbot |
| Daily AI cap in the database | `consume_ai_quota()` counts and records atomically, so parallel requests can't slip past the limit |
| Sorting/filtering in the browser (quiz order, due vocab) | Tiny data sets (24 questions, 14 words); move to SQL if the banks grow to thousands |
| No state library (Redux etc.) | Component state + one hook per domain is enough at this size |
