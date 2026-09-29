import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { AiMode, ChatMessage } from '../types'

export type AiResult = { reply: string; error: null } | { reply: null; error: string }

const FALLBACK_ERROR = "Couldn't reach the AI just now. Try again in a moment."

async function readErrorMessage(error: unknown): Promise<string> {
  if (!(error instanceof FunctionsHttpError)) return FALLBACK_ERROR
  try {
    const body: unknown = await error.context.json()
    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
      return body.error
    }
    return FALLBACK_ERROR
  } catch {
    return FALLBACK_ERROR
  }
}

export async function askAi(mode: AiMode, messages: ChatMessage[]): Promise<AiResult> {
  const { data, error } = await supabase.functions.invoke<{ reply: string }>('ai-chat', {
    body: { mode, messages },
  })
  if (error) return { reply: null, error: await readErrorMessage(error) }
  if (!data?.reply) return { reply: null, error: FALLBACK_ERROR }
  return { reply: data.reply, error: null }
}
