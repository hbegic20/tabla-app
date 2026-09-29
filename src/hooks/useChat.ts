import { useState } from 'react'
import { askAi } from '../lib/ai'
import type { ChatMessage, ChatMode } from '../types'

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

    const result = await askAi(mode, history)

    setPending(false)
    if (result.error !== null) {
      setError(result.error)
      return
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
  }

  return { messages, pending, error, send }
}
