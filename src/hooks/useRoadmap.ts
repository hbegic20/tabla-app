import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { RoadmapTopic } from '../types'

function withValue(set: ReadonlySet<string>, id: string, on: boolean) {
  const next = new Set(set)
  if (on) next.add(id)
  else next.delete(id)
  return next
}

export function useRoadmap(userId: string) {
  const [topics, setTopics] = useState<RoadmapTopic[]>([])
  const [done, setDone] = useState<ReadonlySet<string>>(() => new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('roadmap_topics')
        .select('id, title, note, roadmap_progress(done)')
        .order('sort_order')

      if (ignore) return
      if (error) {
        setError(error.message)
      } else {
        setTopics(data.map(({ id, title, note }) => ({ id, title, note })))
        setDone(new Set(data.filter((t) => t.roadmap_progress.some((p) => p.done)).map((t) => t.id)))
      }
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  async function toggle(topicId: string) {
    const next = !done.has(topicId)
    setDone((prev) => withValue(prev, topicId, next))
    setError(null)

    const { error } = await supabase
      .from('roadmap_progress')
      .upsert({ user_id: userId, topic_id: topicId, done: next }, { onConflict: 'user_id,topic_id' })

    if (error) {
      setDone((prev) => withValue(prev, topicId, !next))
      setError(error.message)
    }
  }

  return { topics, done, loading, error, toggle }
}
