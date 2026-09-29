import { useState } from 'react'
import type { WritingEntry } from '../../types'

interface WritingPracticeProps {
  entries: WritingEntry[]
  loading: boolean
  pending: boolean
  error: string | null
  onSubmit: (prompt: string, submission: string) => Promise<string | null>
}

const PROMPTS = [
  'Describe your day.',
  'Explain what you do at work.',
  'Write about a recent problem you solved.',
  "Describe a place you'd like to visit and why.",
  'Explain a tool you use every day to someone who has never used it.',
  'Write about something you learned this week.',
  'Describe your favourite meal and how it is made.',
  'What would you change about your city, and why?',
]

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function WritingPractice({ entries, loading, pending, error, onSubmit }: WritingPracticeProps) {
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length))
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const prompt = PROMPTS[promptIndex]

  function nextPrompt() {
    setPromptIndex((i) => (i + 1) % PROMPTS.length)
    setFeedback(null)
  }

  async function handleSubmit() {
    const reply = await onSubmit(prompt, draft)
    if (reply !== null) {
      setFeedback(reply)
      setDraft('')
    }
  }

  return (
    <>
      <div className="writing-prompt-row">
        <p className="q-text writing-prompt">{prompt}</p>
        <button type="button" className="btn ghost small" onClick={nextPrompt} disabled={pending}>
          Another prompt
        </button>
      </div>
      <textarea
        className="writing-input"
        rows={7}
        placeholder="Write a few sentences in English…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={pending}
      />
      <div className="quiz-actions writing-actions">
        <span className="muted writing-count">{countWords(draft)} words</span>
        <button type="button" className="btn" onClick={handleSubmit} disabled={pending || !draft.trim()}>
          {pending ? 'Getting feedback…' : 'Get feedback'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {feedback && (
        <div className="explain writing-feedback">
          <strong>Feedback</strong>
          <p>{feedback}</p>
        </div>
      )}

      <h3 className="writing-history-title">Past entries</h3>
      {loading ? (
        <p className="empty-hint">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="empty-hint">Your submitted texts and feedback will appear here.</p>
      ) : (
        <div className="writing-history">
          {entries.map((entry) => (
            <details key={entry.id} className="writing-entry">
              <summary>
                <span>{entry.prompt}</span>
                <span className="muted">{formatDate(entry.createdAt)}</span>
              </summary>
              <p className="writing-label muted">Your text</p>
              <p>{entry.submission}</p>
              <p className="writing-label muted">Feedback</p>
              <p>{entry.feedback}</p>
            </details>
          ))}
        </div>
      )}
    </>
  )
}

export default WritingPractice
