import { useState, type KeyboardEvent } from 'react'
import type { VocabResult, VocabWord } from '../../types'

interface VocabularyProps {
  words: VocabWord[]
  results: ReadonlyMap<number, VocabResult>
  onMark: (wordId: number, result: VocabResult) => void
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

function Vocabulary({ words, results, onMark }: VocabularyProps) {
  const knownCount = words.filter((w) => results.get(w.id) === 'known').length

  return (
    <>
      <p className="empty-hint" style={{ paddingTop: 0 }}>
        Tap a card to flip it, then mark whether you know the word. {knownCount} / {words.length} known.
      </p>
      <div className="card-grid">
        {words.map((word) => {
          const result = results.get(word.id)
          return (
            <div key={word.id} className="vocab-item">
              <FlipCard word={word} />
              <div className="vocab-actions" role="group" aria-label={`Mark "${word.en}"`}>
                <button
                  type="button"
                  className={result === 'known' ? 'vocab-mark known active' : 'vocab-mark known'}
                  aria-pressed={result === 'known'}
                  onClick={() => onMark(word.id, 'known')}
                >
                  Know it
                </button>
                <button
                  type="button"
                  className={result === 'unknown' ? 'vocab-mark unknown active' : 'vocab-mark unknown'}
                  aria-pressed={result === 'unknown'}
                  onClick={() => onMark(word.id, 'unknown')}
                >
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
