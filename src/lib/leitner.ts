export const MAX_BOX = 4

export const INTERVAL_DAYS = [1, 3, 7, 14, 30] as const

const DAY_MS = 24 * 60 * 60 * 1000

export interface ReviewResult {
  box: number
  nextReview: number
}

export function review(box: number, correct: boolean, now: number): ReviewResult {
  if (!correct) return { box: 0, nextReview: now }
  const current = Math.min(Math.max(box, 0), MAX_BOX)
  return {
    box: Math.min(current + 1, MAX_BOX),
    nextReview: now + INTERVAL_DAYS[current] * DAY_MS,
  }
}

export function isDue(nextReview: number | undefined, now: number) {
  return nextReview === undefined || nextReview <= now
}
