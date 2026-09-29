# The `ai-chat` Edge Function

`supabase/functions/ai-chat/index.ts` — the only server-side code in Tabla. It
exists so the Anthropic API key stays in Supabase secrets and never reaches the
browser.

## Request and response

```
POST /functions/v1/ai-chat
Authorization: Bearer <your access token>        (added by supabase-js)
{ "mode": "tutor" | "mentor" | "writing-feedback",
  "messages": [{ "role": "user" | "assistant", "content": "…" }, …] }

200 → { "reply": "…" }
4xx/5xx → { "error": "human-readable message" }
```

The frontend calls it through `askAi(mode, messages)` in `src/lib/ai.ts`, which
turns error responses into the message shown in the UI.

## What happens on each request

1. **CORS** — answers only browsers whose `Origin` is in the `ALLOWED_ORIGINS`
   secret (default: `http://localhost:5173`, `http://127.0.0.1:5173`).
2. **API key present?** — if `ANTHROPIC_API_KEY` isn't set: 500 "The AI is not
   configured yet."
3. **Who is calling?** — `auth.getUser()` with the caller's token; no valid
   user → 401. (`verify_jwt = false` in `config.toml`: the gateway's built-in
   check can reject valid tokens with the new publishable keys, so the function
   checks the user itself.)
4. **Validate input** — `mode` must be one of the three; `messages` must be an
   array of `{ role, content }` strings. Anything else → 400.
5. **Tidy the conversation** — keep the last 20 messages, cut each to 4,000
   characters, merge consecutive messages from the same role, drop leading
   assistant messages. The last message must be from the user.
6. **Daily limit** — `consume_ai_quota(mode, 50)`; over the limit → 429
   "You've used all 50 AI messages for today".
7. **Call Claude** — `POST https://api.anthropic.com/v1/messages` with the
   system prompt for the mode, `max_tokens` 600 (chat) or 1000 (writing), and the
   model from `ANTHROPIC_MODEL` (default `claude-haiku-4-5-20251001`).
8. **Reply** — joins the text blocks and returns `{ reply }`. API errors are
   logged (Dashboard → Edge Functions → ai-chat → Logs) and returned as a
   friendly 502.

## The three modes

| Mode | Used by | System prompt in one line |
| --- | --- | --- |
| `tutor` | English → Chat with tutor | Warm English tutor for a Bosnian speaker: correct mistakes gently, short replies, end with a question |
| `mentor` | Architecture → Ask a mentor | Backend mentor for a frontend developer: practical, connects to frontend concepts, concise |
| `writing-feedback` | English → Writing | Corrected version + 2–3 key corrections explained + one sentence of encouragement, plain text |

The prompts live **only** in the function. The browser sends a mode name, never
a prompt, so users can't repurpose your API key.

## Cost and abuse guards

| Guard | Where |
| --- | --- |
| Must be signed in | step 3 |
| 50 AI requests per user per 24 h (chat + writing combined) | `consume_ai_quota()` |
| History capped at 20 messages × 4,000 chars | step 5 |
| Short replies (`max_tokens` 600 / 1000) | step 7 |
| Only your own site's browsers | `ALLOWED_ORIGINS` |
| Hard monthly ceiling | spend limit in the Anthropic Console (set when the key is added) |

## Secrets

| Secret | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes (deferred until the final check) | Claude API key |
| `ALLOWED_ORIGINS` | for production | comma-separated origins allowed by CORS |
| `ANTHROPIC_MODEL` | no | override the default model |

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided to every Edge Function
automatically.

```bash
npx supabase secrets set NAME=value
npx supabase functions deploy ai-chat      # after any change to the function
```
