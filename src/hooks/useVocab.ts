import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isDue, review } from '../lib/leitner'
import type { VocabProgress, VocabWord } from '../types'

export function useVocab(userId: string) {
  const [words, setWords] = useState<VocabWord[]>([])
  const [progress, setProgress] = useState<ReadonlyMap<number, VocabProgress>>(() => new Map())
  const [dueIds, setDueIds] = useState<readonly number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('vocab_words')
        .select('id, en, bs, example, vocab_progress(box, next_review)')
        .order('id')

      if (ignore) return
      if (error) {
        setError(error.message)
      } else {
        const now = Date.now()
        const loaded = new Map<number, VocabProgress>()
        for (const row of data) {
          const p = row.vocab_progress.at(0)
          if (p) loaded.set(row.id, { box: p.box, nextReview: Date.parse(p.next_review) })
        }
        setWords(data.map(({ id, en, bs, example }) => ({ id, en, bs, example })))
        setProgress(loaded)
        setDueIds(data.filter((row) => isDue(loaded.get(row.id)?.nextReview, now)).map((row) => row.id))
      }
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  async function mark(wordId: number, correct: boolean) {
    const previousProgress = progress
    const previousDue = dueIds
    const next = review(progress.get(wordId)?.box ?? 0, correct, Date.now())

    setProgress((prev) => new Map(prev).set(wordId, next))
    if (correct) setDueIds((prev) => prev.filter((id) => id !== wordId))
    setError(null)

    const { error } = await supabase.from('vocab_progress').upsert(
      {
        user_id: userId,
        word_id: wordId,
        box: next.box,
        next_review: new Date(next.nextReview).toISOString(),
        last_result: correct ? 'known' : 'unknown',
      },
      { onConflict: 'user_id,word_id' },
    )

    if (error) {
      setProgress(previousProgress)
      setDueIds(previousDue)
      setError(error.message)
    }
  }

  const wordsById = new Map(words.map((w) => [w.id, w]))
  const due = dueIds.flatMap((id) => wordsById.get(id) ?? [])
  const upcoming = [...progress.values()].map((p) => p.nextReview).filter((t) => !Number.isNaN(t))
  const nextReviewAt = upcoming.length ? Math.min(...upcoming) : null

  return { due, progress, totalWords: words.length, nextReviewAt, loading, error, mark }
}
