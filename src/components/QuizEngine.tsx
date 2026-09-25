import { useState } from 'react'
import type { MainTab, QuizQuestion } from '../types'

interface QuizEngineProps {
  questions: QuizQuestion[]
  side: MainTab
  onAskMore: (question: string) => void
}

function shuffledOrder(n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = order[i]
    order[i] = order[j]
    order[j] = tmp
  }
  return order
}

function QuizEngine({ questions, side, onAskMore }: QuizEngineProps) {
  const [order, setOrder] = useState(() => shuffledOrder(questions.length))
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [best, setBest] = useState(0)

  const total = questions.length
  const btnClass = side === 'architecture' ? 'btn blue' : 'btn'

  if (total === 0) {
    return <p className="empty-hint">No questions yet.</p>
  }

  function next() {
    setIdx((i) => i + 1)
    setSelected(null)
  }

  function finish() {
    setBest((b) => Math.max(b, Math.round((score / total) * 100)))
    setFinished(true)
  }

  function restart() {
    setOrder(shuffledOrder(total))
    setIdx(0)
    setScore(0)
    setSelected(null)
    setFinished(false)
  }

  if (finished) {
    const pct = Math.round((score / total) * 100)
    return (
      <div className="score-screen">
        <div className="big">
          {score} / {total}
        </div>
        <p className="muted">
          {pct}% correct · best so far: {best}%
        </p>
        <button type="button" className={btnClass} onClick={restart}>
          Try again with new order
        </button>
      </div>
    )
  }

  const item = questions[order[idx]]

  function answer(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === item.correct) setScore((s) => s + 1)
  }

  function optionClass(i: number) {
    if (selected === null) return 'option'
    if (i === item.correct) return 'option correct'
    if (i === selected) return 'option wrong'
    return 'option'
  }

  return (
    <>
      <div className="progress-line">
        <span>
          Question {idx + 1} of {total}
        </span>
        <span>Score: {score}</span>
      </div>
      <div className="q-text">{item.q}</div>
      <div className="options">
        {item.options.map((option, i) => (
          <button
            key={i}
            type="button"
            className={optionClass(i)}
            disabled={selected !== null}
            onClick={() => answer(i)}
          >
            {option}
          </button>
        ))}
      </div>
      {selected !== null && (
        <>
          <div className="explain">{item.explain}</div>
          <div className="quiz-actions">
            {idx < total - 1 ? (
              <button type="button" className={btnClass} onClick={next}>
                Next question
              </button>
            ) : (
              <button type="button" className={btnClass} onClick={finish}>
                See final score
              </button>
            )}
            <button type="button" className="btn ghost" onClick={() => onAskMore(item.q)}>
              {side === 'architecture' ? 'Ask the mentor more' : 'Ask the tutor more'}
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default QuizEngine
