import { useState } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { ChatMessage, ChatMode } from '../types'

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

export function useChat(mode: ChatMode) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(text: string) {
    const content = text.trim()
    if (!content || pending) return

    const history: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(history)
    setPending(true)
    setError(null)

    const { data, error } = await supabase.functions.invoke<{ reply: string }>('ai-chat', {
      body: { mode, messages: history },
    })

    setPending(false)
    if (error || !data?.reply) {
      setError(error ? await readErrorMessage(error) : FALLBACK_ERROR)
      return
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
  }

  return { messages, pending, error, send }
}
