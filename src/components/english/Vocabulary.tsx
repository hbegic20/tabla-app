import { useState, type KeyboardEvent } from 'react'
import { MAX_BOX } from '../../lib/leitner'
import type { VocabProgress, VocabWord } from '../../types'

interface VocabularyProps {
  due: VocabWord[]
  progress: ReadonlyMap<number, VocabProgress>
  totalWords: number
  nextReviewAt: number | null
  onMark: (wordId: number, correct: boolean) => void
}

function FlipCard({ word }: { word: VocabWord }) {
  const [flipped, setFlipped] = useState(false)

  function flip() {
    setFlipped((f) => !f)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      flip()
    }
  }

  return (
    <div
      className={flipped ? 'flip-card flipped' : 'flip-card'}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onClick={flip}
      onKeyDown={handleKeyDown}
    >
      <div className="flip-inner">
        <div className="flip-face front">{word.en}</div>
        <div className="flip-face back">
          <div className="bs">{word.bs}</div>
          <div className="ex">{word.example}</div>
        </div>
      </div>
    </div>
  )
}

function formatNextReview(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Vocabulary({ due, progress, totalWords, nextReviewAt, onMark }: VocabularyProps) {
  if (due.length === 0) {
    return (
      <div className="score-screen">
        <div className="big">✓</div>
        <p className="muted">
          Nothing due — you're caught up.
          {nextReviewAt !== null && <> Next review: {formatNextReview(nextReviewAt)}.</>}
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="empty-hint" style={{ paddingTop: 0 }}>
        {due.length} of {totalWords} words due today. Flip a card, then mark it — words you know come back
        later and later; words you're learning stay here.
      </p>
      <div className="card-grid">
        {due.map((word) => {
          const box = progress.get(word.id)?.box
          return (
            <div key={word.id} className="vocab-item">
              <FlipCard word={word} />
              <div className="vocab-box muted">{box === undefined ? 'New' : `Box ${box} / ${MAX_BOX}`}</div>
              <div className="vocab-actions" role="group" aria-label={`Mark "${word.en}"`}>
                <button type="button" className="vocab-mark known" onClick={() => onMark(word.id, true)}>
                  Know it
                </button>
                <button type="button" className="vocab-mark unknown" onClick={() => onMark(word.id, false)}>
                  Learning
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Vocabulary
