import { useEffect, useState } from 'react'
import { askAi } from '../lib/ai'
import { supabase } from '../lib/supabase'
import type { WritingEntry } from '../types'

export function useWriting() {
  const [entries, setEntries] = useState<WritingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('writing_entries')
        .select('id, prompt, submission, feedback, created_at')
        .order('created_at', { ascending: false })

      if (ignore) return
      if (error) setError(error.message)
      else setEntries(data.map(({ created_at, ...rest }) => ({ ...rest, createdAt: created_at })))
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  async function submit(prompt: string, submission: string): Promise<string | null> {
    const text = submission.trim()
    if (!text || pending) return null

    setPending(true)
    setError(null)

    const result = await askAi('writing-feedback', [
      { role: 'user', content: `Prompt: ${prompt}\n\nMy text:\n${text}` },
    ])
    if (result.error !== null) {
      setPending(false)
      setError(result.error)
      return null
    }

    const { data, error } = await supabase
      .from('writing_entries')
      .insert({ prompt, submission: text, feedback: result.reply })
      .select('id, prompt, submission, feedback, created_at')
      .single()

    setPending(false)
    if (error) {
      setError(`Feedback received but not saved: ${error.message}`)
      return result.reply
    }

    const { created_at, ...rest } = data
    setEntries((prev) => [{ ...rest, createdAt: created_at }, ...prev])
    return result.reply
  }

  return { entries, loading, pending, error, submit }
}
