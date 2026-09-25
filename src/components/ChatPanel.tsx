import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { ChatMessage, MainTab } from '../types'

interface ChatPanelProps {
  side: MainTab
  messages: ChatMessage[]
  onSend: (text: string) => void
}

const COPY: Record<MainTab, { assistant: string; placeholder: string; hint: string }> = {
  english: {
    assistant: 'Tutor',
    placeholder: 'Write something in English — a sentence, a question, anything on your mind...',
    hint: 'Say hello, describe your day, or ask about a grammar point — the tutor will jump in.',
  },
  architecture: {
    assistant: 'Mentor',
    placeholder: 'Ask about databases, caching, system design, anything backend...',
    hint: "Ask about anything backend: databases, caching, APIs, scaling, whatever you're curious about.",
  },
}

const MAX_INPUT_HEIGHT = 120

function ChatPanel({ side, messages, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const copy = COPY[side]

  const logStyle = {
    '--msg-user': side === 'english' ? 'var(--accent)' : 'var(--accent2)',
    '--msg-tutor': side === 'english' ? 'var(--accent2)' : 'var(--accent)',
  } as CSSProperties

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages])

  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, MAX_INPUT_HEIGHT)}px`
  }, [draft])

  function submit() {
    onSend(draft)
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <>
      <div className="chat-log" ref={logRef} style={logStyle}>
        {messages.length === 0 ? (
          <div className="empty-hint" style={{ padding: 0 }}>
            {copy.hint}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'msg user' : 'msg tutor'}>
              <span className="role">{m.role === 'user' ? 'You' : copy.assistant}</span>
              <div>{m.content}</div>
            </div>
          ))
        )}
      </div>
      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          rows={1}
          placeholder={copy.placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className={side === 'architecture' ? 'btn blue' : 'btn'} onClick={submit}>
          Send
        </button>
      </div>
    </>
  )
}

export default ChatPanel
