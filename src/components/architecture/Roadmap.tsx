import { useState } from 'react'
import type { RoadmapTopic } from '../../types'

interface RoadmapProps {
  topics: RoadmapTopic[]
  onAskMentor: (question: string) => void
}

function Roadmap({ topics, onAskMentor }: RoadmapProps) {
  const [done, setDone] = useState<Set<string>>(() => new Set())

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const doneCount = topics.filter((t) => done.has(t.id)).length
  const percent = topics.length ? Math.round((doneCount / topics.length) * 100) : 0

  return (
    <>
      <div className="progress-line">
        <span>
          {doneCount} / {topics.length} topics
        </span>
        <span></span>
      </div>
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${percent}%` }}></div>
      </div>
      <div className="timeline">
        {topics.map((topic, i) => {
          const isDone = done.has(topic.id)
          return (
            <div key={topic.id} className={isDone ? 'topic done' : 'topic'}>
              <button
                type="button"
                className="check-btn"
                aria-label={`Mark ${topic.title} as ${isDone ? 'not done' : 'done'}`}
                onClick={() => toggle(topic.id)}
              >
                <span className="num">{i + 1}</span>
                <svg viewBox="0 0 24 24">
                  <polyline points="4,13 9,18 20,6" />
                </svg>
              </button>
              <div className="topic-body">
                <h3>{topic.title}</h3>
                <p>{topic.note}</p>
                <button
                  type="button"
                  className="ask-link"
                  onClick={() =>
                    onAskMentor(
                      `Can you explain "${topic.title}" in simple, practical terms, and how it connects to what a frontend developer already knows?`,
                    )
                  }
                >
                  Ask the mentor about this →
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Roadmap
