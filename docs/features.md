# Features

Each feature below: **what you see**, **how it works**, and **where it lives**.

---

## Accounts (sign up / sign in)

**What you see:** a sign-in form when logged out; "Create an account" switches
to sign-up. After sign-up (with email confirmation on) you get "Check your email
for a confirmation link". Logged in, the header shows **Sign out**. A reload
keeps you logged in.

**How it works:** `useAuth` listens to Supabase's auth state; `App` shows
`AuthForm` or `Workspace` depending on whether there's a session. Full walkthrough
in [how-login-works.md](how-login-works.md).

**Files:** `hooks/useAuth.ts`, `components/AuthForm.tsx`, `App.tsx` · **Tables:** `auth.users` (managed by Supabase)

---

## Theme and navigation

**What you see:** a sun/moon button toggles light/dark (remembered across
reloads). Two main tabs — **English** (ruled-paper background, yellow accents)
and **Architecture** (blueprint grid, blue accents) — each with sub-tabs.
"Ask the tutor/mentor" links elsewhere in the app jump straight into the right
chat.

**How it works:** `useTheme` stores the choice in `localStorage` and sets
`data-theme` on `<html>`. Tab state lives in `Workspace`; switching main tab also
toggles a class on `<body>` for the background. Views are hidden, not
unmounted, so progress in a tab survives switching away.

**Files:** `hooks/useTheme.ts`, `components/Header.tsx`, `MainTabs.tsx`, `SubTabs.tsx`, `Workspace.tsx` · **Tables:** none

---

## Architecture roadmap

**What you see:** 12 backend topics on a timeline (HTTP & REST → observability),
each with a note. Tick a topic to mark it done; the progress bar and
"X / 12 topics" update. "Ask the mentor about this →" opens the mentor chat with
a question about that topic.

**How it works:** `useRoadmap` loads topics with your progress nested in one
query, then `toggle()` flips the tick immediately and upserts
`roadmap_progress` (rolls back on error). A database trigger keeps `updated_at`
current.

**Files:** `hooks/useRoadmap.ts`, `components/architecture/Roadmap.tsx` · **Tables:** `roadmap_topics` (content), `roadmap_progress` (yours)

---

## Quizzes (grammar + architecture)

**What you see:** 12 questions per round. Pick an answer → it turns green/red and
an explanation appears → "Next question" → final score with "best so far". "Ask
the tutor/mentor more" sends the question to the chat. "Start a new round" puts
questions you've **never seen** first, then ones you **got wrong** (oldest
first), then ones you **got right** (oldest first).

**How it works:**
- Both quizzes use one component, `QuizEngine`, which just plays the questions
  it's given, in order.
- `useQuiz(quizKey, userId)` loads questions with your answer history nested,
  and chooses the round with `pickRound()` (pure function, unit-tested).
- Every answer upserts `quiz_question_history` (`last_seen`, `correct`).
- Every finished round inserts a row into `quiz_attempts`; "best so far" is the
  highest percentage across your attempts.
- A new round remounts `QuizEngine` via `key={roundId}` for clean state.

**Current limitation:** only 12 questions per quiz exist, so a round always
contains all 12 — the priority changes the *order*. It matters more once the
bank grows (see "Deliberately deferred" in the plan: AI-planned questions and
spaced repetition for quizzes).

**Files:** `hooks/useQuiz.ts`, `lib/quizRound.ts`, `components/QuizEngine.tsx` · **Tables:** `quiz_questions`, `quiz_question_history`, `quiz_attempts`

---

## Vocabulary review (spaced repetition)

**What you see:** only the words **due today** ("5 of 14 words due today"). Flip
a card to see the Bosnian translation and an example, then mark **Know it** or
**Learning**. Each card shows "New" or "Box 2 / 4". When nothing is due:
"Nothing due — you're caught up. Next review: …".

**How it works — the Leitner system:**

| Current box | "Know it" → | Next review in |
| --- | --- | --- |
| 0 (new / missed) | box 1 | 1 day |
| 1 | box 2 | 3 days |
| 2 | box 3 | 7 days |
| 3 | box 4 | 14 days |
| 4 | stays 4 | 30 days |

"Learning" always drops the word to box 0, due again now. Five right answers in
a row push a word 55 days out.

- `review()` in `lib/leitner.ts` does the maths (pure, unit-tested).
- `useVocab` works out the due list once when the tab loads: never-reviewed
  words, plus words whose `next_review` has passed.
- "Know it" removes the word from today's list; "Learning" keeps it so you can
  retry this session. Both upsert `vocab_progress` (`box`, `next_review`,
  `last_result`) with rollback on error.

**Files:** `hooks/useVocab.ts`, `lib/leitner.ts`, `components/english/Vocabulary.tsx` · **Tables:** `vocab_words`, `vocab_progress`

---

## Tutor and mentor chat (AI)

**What you see:** a chat per side. The **tutor** replies in simple English,
gently corrects mistakes (with a Bosnian note when a rule is confusing) and asks
a follow-up question. The **mentor** explains backend concepts in terms a
frontend developer knows. While waiting you see "Thinking…" and Send is disabled.
Enter sends; Shift+Enter adds a line.

**How it works:** `useChat(mode)` holds the conversation in memory and sends it
to the `ai-chat` Edge Function via `askAi()`. The function checks you're signed
in, enforces the daily limit (50 AI messages per 24 h, shared with writing
feedback), adds the system prompt and calls Claude. Errors (e.g. limit reached)
are shown in the chat. Conversations are **not** saved — they reset on reload.
Details: [ai-chat.md](ai-chat.md).

**Status:** replies "The AI is not configured yet." until the API key is set.

**Files:** `hooks/useChat.ts`, `lib/ai.ts`, `components/ChatPanel.tsx`, `supabase/functions/ai-chat/` · **Tables:** `ai_usage` (via `consume_ai_quota()`)

---

## Writing practice (AI feedback)

**What you see:** a writing prompt ("Describe your day.", "Explain what you do at
work.", …) with **Another prompt**, a text box with a live word count, and **Get
feedback**. Feedback comes back as a corrected version, the 2–3 most important
corrections explained, and one sentence of encouragement. **Past entries** lists
everything you've submitted; click one to reread your text and its feedback.

**How it works:** `useWriting.submit()` asks `ai-chat` in `writing-feedback`
mode; only when feedback arrives does it insert `{ prompt, submission, feedback }`
into `writing_entries`. Entries are append-only — they can't be edited later, so
they stay an honest record of mistakes to reread.

**Status:** the page works; feedback shows "The AI is not configured yet." until
the API key is set (nothing is saved in that case).

**Files:** `hooks/useWriting.ts`, `lib/ai.ts`, `components/english/WritingPractice.tsx` · **Tables:** `writing_entries`, `ai_usage`
