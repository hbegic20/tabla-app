# Tabla — documentation

_Last updated 2026-09-29, before the first deploy (Phase 7)._

Tabla is a two-sided learning app: **English** practice (AI tutor, vocabulary
with spaced repetition, grammar quiz, writing feedback) and **software
architecture** learning (roadmap, AI mentor, quiz). It's a React + TypeScript
frontend talking directly to Supabase — there is no custom backend server.

## Read in this order

| Doc | What it answers |
| --- | --- |
| [architecture.md](architecture.md) | How the pieces fit together, the folder layout, and the patterns every feature reuses |
| [features.md](features.md) | Every feature: what you see, how it works, which files and tables it touches |
| [how-login-works.md](how-login-works.md) | Sign-up / sign-in / sessions, and how a login turns into row-level security |
| [database.md](database.md) | Every table, its RLS policies, the database functions, and how migrations work |
| [ai-chat.md](ai-chat.md) | The Edge Function behind the tutor, mentor and writing feedback |

For setup and deploy commands see the root [README](../README.md); for scope
and phase history see [TABLA_MVP_PLAN.md](../TABLA_MVP_PLAN.md).

## Status at a glance

| Area | State |
| --- | --- |
| Accounts, roadmap, quizzes, vocab review | Working, saved per user in Supabase |
| Tutor / mentor chat, writing feedback | Built and deployed; replies "The AI is not configured yet." until `ANTHROPIC_API_KEY` is set (deliberately deferred to the final check) |
| Hosting | Code prepared for Vercel; not deployed yet |
