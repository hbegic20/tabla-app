import { useState, type KeyboardEvent } from 'react'
import type { VocabWord } from '../../types'

interface VocabularyProps {
  words: VocabWord[]
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

function Vocabulary({ words }: VocabularyProps) {
  return (
    <>
      <p className="empty-hint" style={{ paddingTop: 0 }}>
        Tap a card to flip it.
      </p>
      <div className="card-grid">
        {words.map((word) => (
          <FlipCard key={word.en} word={word} />
        ))}
      </div>
    </>
  )
}

export default Vocabulary
