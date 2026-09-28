import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Json } from '../lib/database.types'
import type { QuizKey, QuizQuestion } from '../types'

function isStringArray(value: Json): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export function percent(score: number, total: number) {
  return Math.round((score / total) * 100)
}

export function useQuiz(quizKey: QuizKey) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [best, setBest] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      const [questionsRes, attemptsRes] = await Promise.all([
        supabase
          .from('quiz_questions')
          .select('id, question, options, correct_index, explain')
          .eq('quiz_key', quizKey)
          .order('id'),
        supabase.from('quiz_attempts').select('score, total').eq('quiz_key', quizKey),
      ])

      if (ignore) return
      if (questionsRes.error) {
        setError(questionsRes.error.message)
      } else if (attemptsRes.error) {
        setError(attemptsRes.error.message)
      } else {
        setQuestions(
          questionsRes.data.flatMap((row) =>
            isStringArray(row.options)
              ? [{ id: row.id, q: row.question, options: row.options, correct: row.correct_index, explain: row.explain }]
              : [],
          ),
        )
        const scores = attemptsRes.data.map((a) => percent(a.score, a.total))
        setBest(scores.length ? Math.max(...scores) : null)
      }
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [quizKey])

  async function recordAttempt(score: number, total: number) {
    const { error } = await supabase.from('quiz_attempts').insert({ quiz_key: quizKey, score, total })
    if (error) {
      setError(error.message)
      return
    }
    const pct = percent(score, total)
    setBest((prev) => (prev === null ? pct : Math.max(prev, pct)))
  }

  return { questions, best, loading, error, recordAttempt }
}
