import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Json } from '../lib/database.types'
import { pickRound, type QuestionHistory } from '../lib/quizRound'
import type { QuizKey, QuizQuestion } from '../types'

function isStringArray(value: Json): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export function percent(score: number, total: number) {
  return Math.round((score / total) * 100)
}

export function useQuiz(quizKey: QuizKey, userId: string) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [history, setHistory] = useState<ReadonlyMap<number, QuestionHistory>>(() => new Map())
  const [round, setRound] = useState<QuizQuestion[]>([])
  const [roundId, setRoundId] = useState(0)
  const [best, setBest] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      const [questionsRes, attemptsRes] = await Promise.all([
        supabase
          .from('quiz_questions')
          .select('id, question, options, correct_index, explain, quiz_question_history(last_seen, correct)')
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
        const loaded: QuizQuestion[] = []
        const loadedHistory = new Map<number, QuestionHistory>()
        for (const row of questionsRes.data) {
          if (!isStringArray(row.options)) continue
          loaded.push({ id: row.id, q: row.question, options: row.options, correct: row.correct_index, explain: row.explain })
          const seen = row.quiz_question_history.at(0)
          if (seen) loadedHistory.set(row.id, { lastSeen: Date.parse(seen.last_seen), correct: seen.correct })
        }
        setQuestions(loaded)
        setHistory(loadedHistory)
        setRound(pickRound(loaded, loadedHistory))

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

  async function recordAnswer(questionId: number, correct: boolean) {
    const now = new Date()
    setHistory((prev) => new Map(prev).set(questionId, { lastSeen: now.getTime(), correct }))

    const { error } = await supabase
      .from('quiz_question_history')
      .upsert(
        { user_id: userId, question_id: questionId, last_seen: now.toISOString(), correct },
        { onConflict: 'user_id,question_id' },
      )
    if (error) setError(error.message)
  }

  async function recordAttempt(score: number, total: number) {
    const { error } = await supabase.from('quiz_attempts').insert({ quiz_key: quizKey, score, total })
    if (error) {
      setError(error.message)
      return
    }
    const pct = percent(score, total)
    setBest((prev) => (prev === null ? pct : Math.max(prev, pct)))
  }

  function newRound() {
    setRound(pickRound(questions, history))
    setRoundId((id) => id + 1)
  }

  return { round, roundId, best, loading, error, recordAnswer, recordAttempt, newRound }
}
