import { useState } from 'react'
import { percent } from '../hooks/useQuiz'
import type { MainTab, QuizQuestion } from '../types'

interface QuizEngineProps {
  questions: QuizQuestion[]
  best: number | null
  side: MainTab
  onAnswer: (questionId: number, correct: boolean) => void
  onFinish: (score: number, total: number) => void
  onNewRound: () => void
  onAskMore: (question: string) => void
}

function QuizEngine({ questions, best, side, onAnswer, onFinish, onNewRound, onAskMore }: QuizEngineProps) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

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
    onFinish(score, total)
    setFinished(true)
  }

  if (finished) {
    const pct = percent(score, total)
    return (
      <div className="score-screen">
        <div className="big">
          {score} / {total}
        </div>
        <p className="muted">
          {pct}% correct · best so far: {Math.max(best ?? 0, pct)}%
        </p>
        <button type="button" className={btnClass} onClick={onNewRound}>
          Start a new round
        </button>
      </div>
    )
  }

  const item = questions[idx]

  function answer(i: number) {
    if (selected !== null) return
    const correct = i === item.correct
    setSelected(i)
    if (correct) setScore((s) => s + 1)
    onAnswer(item.id, correct)
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
