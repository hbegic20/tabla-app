# Tabla MVP — Supabase Build Plan

## Overview

**Stack:** the Tabla frontend rewritten in React + TypeScript (Vite), talking directly to Supabase (Postgres + Auth + Edge Functions). No custom backend server for this app.

**Scope for this MVP** (everything else is deliberately deferred — see the last section):

- Real accounts, persistent roadmap/vocab/quiz progress
- AI tutor + mentor chat, safely proxied through an Edge Function
- Fixed quiz repetition (no more seeing the same shuffled 12 forever)
- Writing practice (new)
- Spaced repetition for vocabulary (new)

**Approach:** ship Phases 1–4 first — that's "Tabla works for real, with accounts." Only then add Phases 5–6 (the two new features). Get each phase actually working before starting the next; don't parallelize them.

## Phase 0 — React + TypeScript scaffold (do this first)

**Decision:** the frontend is being rewritten in React + TypeScript before any Supabase work starts. This phase only ports the existing UI and behavior into components — no backend changes yet, no Supabase calls yet. Data stays local/in-memory for now, same as the current demo; Phases 1–7 below replace that local state with real Supabase calls once this scaffold exists.

**Set up the project**

- `npm create vite@latest tabla-frontend -- --template react-ts`
- Confirm it runs with `npm run dev`

**Port styling**

- Move the existing CSS (custom properties, fonts, all component styles) into `src/index.css` or `src/App.css`, imported once in `main.tsx` — don't rewrite the design, just relocate it

**Define shared types** (in `src/types.ts`)

- `VocabWord { en: string; bs: string; example: string }`
- `QuizQuestion { q: string; options: string[]; correct: number; explain: string }`
- `RoadmapTopic { id: string; title: string; note: string }`
- `ChatMessage { role: 'user' | 'assistant'; content: string }`

**Break the UI into components**

- `Header.tsx`, `MainTabs.tsx` (English/Architecture switch)
- `english/ChatTutor.tsx`, `english/Vocabulary.tsx`, `english/GrammarQuiz.tsx`
- `architecture/Roadmap.tsx`, `architecture/MentorChat.tsx`, `architecture/ArchQuiz.tsx`
- A shared `QuizEngine.tsx` if the English/architecture quizzes can share one generic component (they follow the same shape in the current version — a good instinct to keep them from diverging)

**Port state to hooks**

- Theme, active tab, and each feature's local state (chat messages, quiz progress, flipped cards, roadmap checked items) become `useState` inside the relevant component, matching the existing per-feature state shape

**Confirm feature parity before moving on**

- Every feature (chat UI shell, flashcard flip, quiz flow, roadmap checklist, theme toggle) should visibly work exactly as it did in the HTML version — just without persistence yet, since that's what Phase 1+ adds back in with Supabase

## Phase 1 — Supabase project setup

**Create the project**

- Sign up at supabase.com, create a new project, note the project URL and the public `anon` key (you'll paste these into the frontend later).

**Create the tables** (via the Table Editor, or the SQL editor if you prefer writing it):

- `roadmap_topics` (id, title, note, sort_order) — seed with the 12 existing topics
- `roadmap_progress` (user_id, topic_id, done boolean, updated_at)
- `vocab_words` (id, en, bs, example) — seed with the existing 14 words
- `vocab_progress` (user_id, word_id, box int default 0, next_review timestamptz, last_result text) — the `box`/`next_review` columns are for Phase 6's spaced repetition, add them now so you don't migrate later
- `quiz_questions` (id, quiz_key, question, options jsonb, correct_index, explain) — seed with the existing English + architecture questions
- `quiz_question_history` (user_id, question_id, last_seen timestamptz, correct boolean)
- `quiz_attempts` (user_id, quiz_key, score, total, taken_at)
- `writing_entries` (user_id, prompt, submission, feedback, created_at) — for Phase 5

**Turn on Auth**

- In Authentication settings, enable email/password sign-in (magic link too, if you want passwordless).

**Set Row Level Security (RLS)**

- Enable RLS on every table above.
- For `roadmap_progress`, `vocab_progress`, `quiz_question_history`, `quiz_attempts`, `writing_entries`: add a policy so a user can only `select`/`insert`/`update` rows where `user_id = auth.uid()`.
- For `roadmap_topics`, `vocab_words`, `quiz_questions`: add a policy allowing any logged-in user to `select` (read-only, shared content, not user-specific).

## Phase 2 — Wire the frontend to Supabase

**Add the client**

- Install with `npm install @supabase/supabase-js`, create a `src/lib/supabase.ts` that exports a typed client initialized with your project URL + anon key, and generate TypeScript types from your schema with `supabase gen types typescript` for autocomplete and compile-time safety on every query.

**Auth UI**

- A small `useAuth` hook wrapping `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()`.
- Show the chat/roadmap/vocab/quiz views only when a user is logged in; show the auth form otherwise.

**Fetch data with hooks instead of local state**

- Roadmap: a `useRoadmap()` hook that loads with `supabase.from('roadmap_topics').select()` joined against the user's `roadmap_progress`; toggle with `.upsert()` on `roadmap_progress`.
- Vocab: a `useVocab()` hook that loads `vocab_words` + the user's `vocab_progress`; mark known/unknown with `.upsert()`.
- Quiz: a `useQuiz(quizKey)` hook that loads questions from `quiz_questions` filtered by `quiz_key`; record each attempt in `quiz_attempts`.

**Test as two different users**

- Sign up with two test accounts and confirm each only ever sees their own progress — this is your proof that RLS is actually working, not just that the UI looks right.

## Phase 3 — AI tutor + mentor via Edge Functions

**Write one Edge Function** (`supabase functions new ai-chat`) that:

- Reads a `messages` array and a `mode` ("tutor" or "mentor") from the request body
- Prepends the matching system prompt (same ones already written for the demo)
- Calls `https://api.anthropic.com/v1/messages` using an `ANTHROPIC_API_KEY` stored as a Supabase secret (`supabase secrets set`), never in frontend code
- Returns the reply as JSON

**Call it from the frontend**

- `supabase.functions.invoke('ai-chat', { body: { messages, mode } })` instead of the artifact's built-in `sample` capability.

**Add basic abuse protection**

- Supabase Edge Functions don't rate-limit for you — add a simple check (e.g. count recent rows in a small `ai_usage` table per user, reject past a daily cap) so one runaway loop can't burn your API budget.

## Phase 4 — Fix quiz repetition

**On each question shown**, upsert a row into `quiz_question_history` (user_id, question_id, last_seen = now(), correct).

**When picking the next quiz's questions**, query with a simple priority order:

1. Questions never seen by this user (no row in `quiz_question_history`)
2. Questions previously answered incorrectly, oldest `last_seen` first
3. Questions previously answered correctly, oldest `last_seen` first

Pull enough from the top of that ordering to fill a quiz (e.g. 12 questions). This alone fixes the "same shuffled 12 forever" problem, and it's the same underlying idea Phase 6 extends to vocabulary.

## Phase 5 — Writing practice (new)

**New sub-tab under English: "Writing"**

- Show a prompt (rotate through a small hardcoded list to start: "Describe your day," "Explain what you do at work," "Write about a recent problem you solved," etc.)
- A textarea for the learner's response, a submit button

**On submit**

- Call the `ai-chat` Edge Function in a new `mode: "writing-feedback"`, sending the prompt + the learner's text
- System prompt: correct grammar/word choice errors inline, explain the 2-3 most important corrections (not every tiny thing), and give one honest sentence of encouragement
- Save the prompt, submission, and feedback to `writing_entries`

**A simple history view**

- List past entries (prompt + your text + the feedback you got) so mistakes you've already had explained don't just vanish — this becomes useful material to reread before a quiz.

## Phase 6 — Spaced repetition for vocabulary (new)

**Use the `box` and `next_review` columns already added to `vocab_progress` in Phase 1** — a simple version of the Leitner system:

- New word starts at `box = 0`, `next_review = now()`
- Get it right → move up a box (0→1→2→3→4), and push `next_review` further out each time (e.g. 1 day, 3 days, 7 days, 14 days, 30 days)
- Get it wrong → drop back to `box = 0`, `next_review = now()` (review again immediately/tomorrow)

**Change the Vocabulary tab's query**

- Instead of showing all 14 words every time, show only words where `next_review <= now()` — this is "today's vocab review," not a static list
- When the due list is empty, show something like "nothing due — you're caught up" rather than an empty screen

**Grow the word bank**

- Since the review system now decides *when* you see a word, it's safe to add many more words to `vocab_words` over time without overwhelming any single session — worth expanding well past the original 14 once this is working.

## Phase 7 — Deploy the MVP

- Push the frontend to a GitHub repo
- Connect it to Netlify or Vercel — static hosting, no build step needed for a single HTML file
- Double-check the Supabase anon key is fine to expose client-side (it is, by design — RLS is what actually protects data, not hiding this key) but the `ANTHROPIC_API_KEY` must only ever live in Supabase secrets, never in the deployed frontend
- Sign up for real, run through roadmap/vocab/quiz/writing/chat once end to end on the live URL

## Deliberately deferred (add later, only if you miss them)

- Streak tracking
- A stats/progress dashboard screen
- Confidence rating (1-5) on roadmap topics
- PWA installability
- "Word/topic of the day" on open
- Any multi-user/sharing features

None of these change how the app works underneath — they're additive, and the schema above doesn't need to anticipate them.