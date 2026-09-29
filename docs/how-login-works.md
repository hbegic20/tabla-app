# How login works in Tabla (frontend + Supabase)

_Written 2026-09-28 during Phase 2; section 7 updated 2026-09-29. Sections 1–6
describe the auth flow, which hasn't changed since._

## 1. The big picture

There are three pieces, and each has one job:

```
┌─────────────────────────── Browser ───────────────────────────┐
│                                                                │
│  React app (your code)                                         │
│    App ─ gate ─► AuthForm   (logged out)                        │
│              └─► Workspace  (logged in)                         │
│         ▲                                                      │
│         │ session changes (onAuthStateChange)                  │
│         │                                                      │
│  supabase-js client  (src/lib/supabase.ts)                     │
│    • stores the session in localStorage                        │
│    • attaches the access token to every request                │
│    • refreshes the token before it expires                     │
└─────────┬──────────────────────────────────────────────────────┘
          │ HTTPS
          ▼
┌─────────────────────── Supabase (cloud) ───────────────────────┐
│  Auth (GoTrue)            /auth/v1/...                          │
│    • auth.users table — accounts + hashed passwords            │
│    • issues sessions: access token (JWT) + refresh token       │
│                                                                │
│  Data API (PostgREST)     /rest/v1/...                          │
│    • turns .from('table').select() into SQL                    │
│    • runs it as the `authenticated` role with your JWT         │
│                                                                │
│  Postgres + RLS                                                 │
│    • policies check auth.uid() = user_id on every row          │
└────────────────────────────────────────────────────────────────┘
```

- **The React app** decides *what to show*. It never checks passwords and
  never decides who may see which data.
- **supabase-js** is the messenger: it talks HTTP to Supabase, keeps the
  session, and tells React when it changes.
- **Supabase** is the authority: Auth decides *who you are*, Postgres RLS
  decides *what you may touch*.

The most important idea: **the frontend is not a security boundary.** Anyone
can open DevTools and call Supabase directly with the public key. That's fine,
because the database itself enforces the rules (RLS).

## 2. Frontend side — files and their jobs

| File | Job |
| --- | --- |
| `src/lib/supabase.ts` | Creates the single shared client: `createClient<Database>(url, publishableKey)`. Throws on startup if the env vars are missing. |
| `src/lib/database.types.ts` | Generated TypeScript description of the schema (`npm run types:db`). Makes queries type-safe. |
| `src/env.d.ts` | Types `import.meta.env.VITE_SUPABASE_*`. |
| `src/hooks/useAuth.ts` | Holds `session` and `loading`; exposes `signIn`, `signUp`, `signOut`. Subscribes to `supabase.auth.onAuthStateChange`. |
| `src/App.tsx` | The gate: `loading` → render nothing; no session → `AuthForm`; session → `<Workspace key={user.id} />`. |
| `src/components/AuthForm.tsx` | Email + password form, sign-in/sign-up switch, error and "check your email" messages. |
| `src/components/Workspace.tsx` | The real app (tabs, panels, chats). Only mounted when logged in. |
| `src/components/Header.tsx` | Shows "Sign out" when an `onSignOut` handler is passed. |

### `useAuth` in one paragraph

```ts
useEffect(() => {
  const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
    setSession(nextSession)
    setLoading(false)
  })
  return () => data.subscription.unsubscribe()
}, [])
```

On subscribe, supabase-js immediately fires `INITIAL_SESSION` with whatever it
found in localStorage (or `null`). After that it fires `SIGNED_IN`,
`SIGNED_OUT`, `TOKEN_REFRESHED`, etc. One listener keeps React in sync with all
of them — no separate `getSession()` call needed. The cleanup function
unsubscribes when the component unmounts.

Rule: keep this callback **synchronous and state-only**. Awaiting other
`supabase` calls inside it can deadlock the client.

### Why `key={session.user.id}` on Workspace

When a `key` changes, React treats it as a brand-new component and throws
away all its state. So if user A signs out and user B signs in, B gets a
fresh Workspace — not A's chat history or half-finished quiz that was still in
memory. RLS protects the database; `key` protects what's already in React state.

## 3. Supabase side

### Auth

- Accounts live in **`auth.users`** (a schema Supabase manages — you don't
  write migrations for it). Passwords are stored hashed, never in plain text.
- Settings (dashboard → **Authentication**):
  - Email provider: **on**
  - Confirm email: **on** — sign-up sends a link; no session until confirmed
  - Site URL: where the confirmation link sends you — should be
    `http://localhost:5173` in development
- A successful sign-in returns a **session**:
  - **access token** — a signed JWT, valid ~1 hour. Contains your user id in
    the `sub` claim and `role: authenticated`.
  - **refresh token** — long-lived, used only to get a new access token.

### Database (from `supabase/migrations/`)

**Shared content** — readable by any logged-in user, writable by nobody from
the browser:

- `roadmap_topics`, `vocab_words`, `quiz_questions`
- Policy: `for select to authenticated using (true)`

**Per-user data** — each row has `user_id uuid default auth.uid()`:

| Table | Policies |
| --- | --- |
| `roadmap_progress` | select / insert / update own rows |
| `vocab_progress` | select / insert / update own rows |
| `quiz_question_history` | select / insert / update own rows |
| `quiz_attempts` | select / insert own rows (append-only) |
| `writing_entries` | select / insert own rows (append-only) |

"Own rows" means the policy condition `(select auth.uid()) = user_id`.
With RLS enabled, **anything without a matching policy is denied** — e.g.
there are no delete policies, so deletes silently affect 0 rows.

## 4. The flows, step by step

### Page load

1. `App` renders; `useAuth` subscribes. `loading = true` → App renders nothing.
2. supabase-js looks in localStorage for a saved session.
3. It fires `INITIAL_SESSION`:
   - session found (and refreshed if expired) → `Workspace`
   - nothing found → `AuthForm`

This is why a reload keeps you logged in.

### Sign up

1. `AuthForm` → `signUp(email, password)` → `POST /auth/v1/signup`.
2. Supabase creates the row in `auth.users` (unconfirmed) and emails a link.
3. Because Confirm email is on, the response has **no session** →
   `needsConfirmation: true` → the form shows "Check your email…" and switches
   to sign-in mode.
4. Clicking the link confirms the account (redirects to the Site URL).

### Sign in

1. `AuthForm` → `signIn(email, password)` → `POST /auth/v1/token?grant_type=password`.
2. Wrong password → error message shown in the form.
3. Correct → Supabase returns the session; supabase-js saves it to
   localStorage and fires `SIGNED_IN`.
4. `useAuth` sets `session` → `App` re-renders → `AuthForm` is replaced by
   `Workspace`.

The form never navigates anywhere itself. **Supabase's auth state is the single
source of truth, and the UI follows it.**

### While logged in

supabase-js refreshes the access token in the background shortly before it
expires (`TOKEN_REFRESHED`). You stay logged in without doing anything.

### Sign out

1. Header "Sign out" → `signOut()` → Supabase revokes the session; supabase-js
   clears localStorage and fires `SIGNED_OUT`.
2. `session = null` → `App` shows `AuthForm`.
3. `Workspace` unmounts, and all its in-memory state goes with it.

## 5. How a data request is protected

Example (this is what step 3, `useRoadmap`, will do):

```ts
supabase.from('roadmap_progress').select('topic_id, done')
```

1. supabase-js sends `GET /rest/v1/roadmap_progress?select=topic_id,done`
   with two headers:
   - `apikey: <publishable key>` — identifies the *project*
   - `Authorization: Bearer <access token>` — identifies the *user*
2. PostgREST verifies the JWT signature, switches to the `authenticated`
   role, and makes the token's claims available to Postgres.
3. Postgres runs `select topic_id, done from roadmap_progress` and, because
   RLS is on, silently adds the policy condition:
   `where (select auth.uid()) = user_id`
4. `auth.uid()` reads `sub` from the token → your user id → you get only
   your rows.

Consequences:

- **Logged out** → no user token → role `anon` → no policy matches → `[]`.
  (Verified: a logged-out request to `roadmap_topics` returned `[]`.)
- **Faking `user_id` on insert** → the `with check` clause compares it to
  `auth.uid()` → rejected with "new row violates row-level security policy".
  (Verified in the local migration test.)
- **Upsert** works because progress tables have a composite primary key
  `(user_id, topic_id)`: the second write for the same topic updates instead
  of inserting a duplicate.

## 6. Keys and security

| Key | Where | Safe in the browser? |
| --- | --- | --- |
| Project URL | `.env.local` → `VITE_SUPABASE_URL` | Yes — public |
| Publishable / anon key (`sb_publishable_…`) | `.env.local` → `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes — it only identifies the project; RLS protects data |
| Secret / `service_role` key | **nowhere in the frontend** | **No** — it bypasses RLS entirely |
| Anthropic API key (Phase 3) | Supabase secrets, used only by the Edge Function | **No** |

- Vite only exposes env vars prefixed `VITE_` to the browser — and anything it
  exposes ends up in the built JS, readable by anyone. So only public values
  get that prefix.
- `.env.local` is gitignored; `.env.example` (committed) shows the names.

## 7. What the login unlocks (updated 2026-09-29)

Every data hook now runs with your session, so everything below is saved per
user and protected by RLS — the two-user test at the end of Phase 2 confirmed
each account only sees its own data:

| Hook | Reads | Writes |
| --- | --- | --- |
| `useRoadmap` | topics + your `roadmap_progress` | upsert `roadmap_progress` |
| `useQuiz` | questions + your `quiz_question_history`, your `quiz_attempts` | upsert history, insert attempts |
| `useVocab` | words + your `vocab_progress` | upsert `vocab_progress` |
| `useWriting` | your `writing_entries` | insert `writing_entries` |
| `useChat` / `askAi` | — | calls `ai-chat`, which checks your token itself |

See [features.md](features.md) and [database.md](database.md) for details.
