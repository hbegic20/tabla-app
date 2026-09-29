import type { QuizQuestion } from '../types'

export interface QuestionHistory {
  lastSeen: number
  correct: boolean
}

export const ROUND_SIZE = 12

export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = result[i]
    result[i] = result[j]
    result[j] = tmp
  }
  return result
}

export function pickRound(
  questions: QuizQuestion[],
  history: ReadonlyMap<number, QuestionHistory>,
  size = ROUND_SIZE,
): QuizQuestion[] {
  const unseen: QuizQuestion[] = []
  const wrong: { question: QuizQuestion; lastSeen: number }[] = []
  const right: { question: QuizQuestion; lastSeen: number }[] = []

  for (const question of questions) {
    const seen = history.get(question.id)
    if (!seen) unseen.push(question)
    else if (seen.correct) right.push({ question, lastSeen: seen.lastSeen })
    else wrong.push({ question, lastSeen: seen.lastSeen })
  }

  const oldestFirst = (a: { lastSeen: number }, b: { lastSeen: number }) => a.lastSeen - b.lastSeen

  return [
    ...shuffle(unseen),
    ...wrong.sort(oldestFirst).map((w) => w.question),
    ...right.sort(oldestFirst).map((r) => r.question),
  ].slice(0, size)
}
