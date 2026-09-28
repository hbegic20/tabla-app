import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { VocabResult, VocabWord } from '../types'

function isVocabResult(value: string | null): value is VocabResult {
  return value === 'known' || value === 'unknown'
}

function withResult(
  results: ReadonlyMap<number, VocabResult>,
  wordId: number,
  result: VocabResult | undefined,
) {
  const next = new Map(results)
  if (result) next.set(wordId, result)
  else next.delete(wordId)
  return next
}

export function useVocab(userId: string) {
  const [words, setWords] = useState<VocabWord[]>([])
  const [results, setResults] = useState<ReadonlyMap<number, VocabResult>>(() => new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('vocab_words')
        .select('id, en, bs, example, vocab_progress(last_result)')
        .order('id')

      if (ignore) return
      if (error) {
        setError(error.message)
      } else {
        setWords(data.map(({ id, en, bs, example }) => ({ id, en, bs, example })))
        const loaded = new Map<number, VocabResult>()
        for (const row of data) {
          const progress = row.vocab_progress.at(0)
          if (progress && isVocabResult(progress.last_result)) loaded.set(row.id, progress.last_result)
        }
        setResults(loaded)
      }
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  async function mark(wordId: number, result: VocabResult) {
    const previous = results.get(wordId)
    setResults((prev) => withResult(prev, wordId, result))
    setError(null)

    const { error } = await supabase
      .from('vocab_progress')
      .upsert({ user_id: userId, word_id: wordId, last_result: result }, { onConflict: 'user_id,word_id' })

    if (error) {
      setResults((prev) => withResult(prev, wordId, previous))
      setError(error.message)
    }
  }

  return { words, results, loading, error, mark }
}
