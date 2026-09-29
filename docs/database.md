# Database

Postgres on Supabase. Every change lives in `supabase/migrations/` and is applied
with `npx supabase db push`; then `npm run types:db` regenerates
`src/lib/database.types.ts`.

## Migrations

| File | What it does |
| --- | --- |
| `20260926160106_create_schema.sql` | The 8 core tables, constraints, indexes, `updated_at` trigger, RLS + policies |
| `20260926160108_seed_content.sql` | Content: 12 roadmap topics, 14 vocab words, 24 quiz questions (generated from the original app's data) |
| `20260928115913_quiz_key_enum.sql` | Turns `quiz_key` from text + check into a real `quiz_key` enum, so generated types say `'english' \| 'architecture'` |
| `20260928140000_ai_usage.sql` | `ai_usage` table + `consume_ai_quota()` for the AI daily limit |

Content is seeded by a **migration**, not `seed.sql`, because `seed.sql` only runs
on a local `db reset` and would never reach the live project.

## Tables

### Shared content — any signed-in user can read, nobody can write from the browser

| Table | Key columns |
| --- | --- |
| `roadmap_topics` | `id text` (e.g. `'http'`), `title`, `note`, `sort_order` |
| `vocab_words` | `id` (auto), `en` (unique), `bs`, `example` |
| `quiz_questions` | `id` (auto), `quiz_key` (enum), `question`, `options jsonb` (must be an array), `correct_index` (must point inside `options`), `explain` |

Policy: `for select to authenticated using (true)`.

### Your data — every row has `user_id uuid default auth.uid()`

| Table | Primary key | Browser may | Used by |
| --- | --- | --- | --- |
| `roadmap_progress` | `(user_id, topic_id)` | select / insert / update | roadmap ticks |
| `vocab_progress` | `(user_id, word_id)` | select / insert / update | Leitner `box` (0–4), `next_review`, `last_result` |
| `quiz_question_history` | `(user_id, question_id)` | select / insert / update | `last_seen`, `correct` — quiz round order |
| `quiz_attempts` | `id` | select / insert (append-only) | one row per finished round → "best so far" |
| `writing_entries` | `id` | select / insert (append-only) | prompt, submission, feedback |
| `ai_usage` | `id` | **nothing** (no policies) | written only by `consume_ai_quota()` |

Every "own rows" policy is `(select auth.uid()) = user_id`. Wrapping
`auth.uid()` in `select` makes Postgres evaluate it once per query instead of
once per row.

`user_id` references `auth.users … on delete cascade`: deleting an account
deletes all its rows.

## How RLS decides

- **No policy = denied.** There are no delete policies anywhere, so deletes from
  the browser affect 0 rows.
- **`using (…)`** filters which existing rows you can see / update.
- **`with check (…)`** validates rows you write — inserting a row with someone
  else's `user_id` fails with "new row violates row-level security policy".
- **Logged out** requests run as `anon`, which has no policies → empty results.

These were tested: in a throwaway local Postgres before each push (two fake
users, cross-user reads/writes, constraint violations), and for real with two
accounts at the end of Phase 2.

## Database functions

### `set_updated_at()` (trigger)

Runs `before update on roadmap_progress` and sets `updated_at = now()`.

### `consume_ai_quota(p_mode text, p_daily_cap int) → boolean`

Called by the `ai-chat` Edge Function before every AI request.

1. Reads the caller's id with `auth.uid()` — raises "not authenticated" if none.
2. Takes a per-user advisory lock, so two simultaneous requests are handled one
   after the other.
3. Counts that user's `ai_usage` rows from the last 24 hours.
4. At or over the cap → returns `false` (the function answers 429).
   Otherwise inserts a row and returns `true`.

It's `security definer` (runs with the owner's rights, so it can write
`ai_usage` even though users can't) with `set search_path = ''` (so it can't be
tricked into using a look-alike table). `anon` has no execute permission.

## Handy commands

```bash
npx supabase migration new <name>        # create a timestamped migration file
npx supabase migration list              # local vs remote migration history
npx supabase db push                     # apply new migrations to the live DB
npm run types:db                         # regenerate TypeScript types
```
