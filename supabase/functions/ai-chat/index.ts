import { createClient } from 'npm:@supabase/supabase-js@2'

type Mode = 'tutor' | 'mentor' | 'writing-feedback'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPTS: Record<Mode, string> = {
  tutor:
    'You are a warm, encouraging English tutor helping a native Bosnian ' +
    'speaker practise English. Reply mainly in English, at a natural but ' +
    'not overly advanced level. When the learner makes a grammar, ' +
    'word-order, preposition or word-choice mistake, gently show the ' +
    'corrected version and give a one-sentence explanation. If a rule is ' +
    'genuinely confusing, add one short clarifying note in Bosnian in ' +
    'parentheses. Keep replies conversational and fairly short (2-5 ' +
    'sentences), and end with a natural follow-up question to keep the ' +
    'conversation going.',
  mentor:
    'You are an experienced backend and software architecture mentor. You ' +
    'are talking to a developer who is strong on frontend (JS/React-type ' +
    'work) but new to backend and system design. Explain concepts clearly ' +
    'and practically, connect new ideas to frontend concepts they likely ' +
    'already know when it helps, use short concrete examples or tiny code ' +
    'snippets where useful, and avoid unnecessary jargon. Keep answers ' +
    'focused — a few short paragraphs or a short list, not an essay.',
  'writing-feedback':
    'You are an English writing coach for a native Bosnian speaker. The ' +
    'user sends a writing prompt and their response to it. Reply in plain ' +
    'text (no markdown) with exactly three parts:\n' +
    '1. "Corrected version:" followed by their text with grammar, word-order, ' +
    'preposition and word-choice errors fixed, keeping their meaning and voice.\n' +
    '2. "Key corrections:" the 2-3 most important corrections only (not every ' +
    'tiny stylistic point), each with a one-sentence explanation. If a rule ' +
    'is genuinely confusing, add a short note in Bosnian in parentheses.\n' +
    '3. One honest sentence of encouragement.\n' +
    'If the text has no real errors, say so and suggest one way to make it ' +
    'sound more natural.',
}

const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5-20251001'
const DAILY_CAP = 50
const MAX_MESSAGES = 20
const MAX_CHARS = 4000
const MAX_TOKENS: Record<Mode, number> = { tutor: 600, mentor: 600, 'writing-feedback': 1000 }

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function corsHeadersFor(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
  if (origin && ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function isMode(value: unknown): value is Mode {
  return value === 'tutor' || value === 'mentor' || value === 'writing-feedback'
}

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value)) return null
  const parsed: ChatMessage[] = []
  for (const item of value) {
    if (typeof item !== 'object' || item === null) return null
    const { role, content } = item as Record<string, unknown>
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    parsed.push({ role, content: content.slice(0, MAX_CHARS) })
  }
  return parsed
}

function prepareConversation(messages: ChatMessage[]): ChatMessage[] {
  const merged: ChatMessage[] = []
  for (const message of messages.slice(-MAX_MESSAGES)) {
    if (!message.content.trim()) continue
    const last = merged.at(-1)
    if (last && last.role === message.role) last.content += `\n\n${message.content}`
    else merged.push({ ...message })
  }
  while (merged[0]?.role === 'assistant') merged.shift()
  return merged
}

Deno.serve(async (req) => {
  const cors = corsHeadersFor(req.headers.get('Origin'))
  const respond = (body: unknown, status = 200) => json(body, status, cors)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405)

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) return respond({ error: 'The AI is not configured yet.' }, 500)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return respond({ error: 'Not signed in.' }, 401)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (authError || !userData.user) return respond({ error: 'Not signed in.' }, 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return respond({ error: 'Invalid JSON body.' }, 400)
  }
  if (typeof body !== 'object' || body === null) return respond({ error: 'Invalid request.' }, 400)

  const { mode, messages } = body as Record<string, unknown>
  if (!isMode(mode)) return respond({ error: 'Unknown mode.' }, 400)

  const parsed = parseMessages(messages)
  if (!parsed) return respond({ error: 'Invalid messages.' }, 400)

  const conversation = prepareConversation(parsed)
  if (conversation.at(-1)?.role !== 'user') return respond({ error: 'The last message must be from the user.' }, 400)

  const { data: allowed, error: quotaError } = await supabase.rpc('consume_ai_quota', {
    p_mode: mode,
    p_daily_cap: DAILY_CAP,
  })
  if (quotaError) {
    console.error('quota check failed', quotaError)
    return respond({ error: 'Could not check your usage limit.' }, 500)
  }
  if (!allowed) {
    return respond({ error: `You've used all ${DAILY_CAP} AI messages for today — try again tomorrow.` }, 429)
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS[mode],
      system: SYSTEM_PROMPTS[mode],
      messages: conversation,
    }),
  })

  if (!response.ok) {
    console.error('Anthropic API error', response.status, await response.text())
    return respond({ error: "The AI couldn't answer just now. Try again in a moment." }, 502)
  }

  const result = (await response.json()) as { content?: { type: string; text?: string }[] }
  const reply = (result.content ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('')
    .trim()

  if (!reply) return respond({ error: 'The AI returned an empty reply.' }, 502)
  return respond({ reply })
})
