import { useState } from 'react'
import type { ChatMessage, ChatMode } from '../types'

const NOT_CONNECTED: Record<ChatMode, string> = {
  tutor: "The AI tutor isn't connected yet — replies arrive once the ai-chat Edge Function exists (Phase 3).",
  mentor: "The AI mentor isn't connected yet — replies arrive once the ai-chat Edge Function exists (Phase 3).",
}

export function useChat(mode: ChatMode) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  function send(text: string) {
    const content = text.trim()
    if (!content) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', content },
      { role: 'assistant', content: NOT_CONNECTED[mode] },
    ])
  }

  return { messages, send }
}
