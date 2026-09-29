import { useEffect, useState } from 'react'
import Header from './Header'
import MainTabs from './MainTabs'
import SubTabs, { type SubTabOption } from './SubTabs'
import ChatPanel from './ChatPanel'
import QuizEngine from './QuizEngine'
import Vocabulary from './english/Vocabulary'
import Roadmap from './architecture/Roadmap'
import { useChat } from '../hooks/useChat'
import { useQuiz } from '../hooks/useQuiz'
import { useRoadmap } from '../hooks/useRoadmap'
import { useVocab } from '../hooks/useVocab'
import type { ArchSubTab, EnglishSubTab, MainTab } from '../types'

const ENGLISH_TABS: SubTabOption<EnglishSubTab>[] = [
  { id: 'chat', label: 'Chat with tutor' },
  { id: 'vocab', label: 'Vocabulary' },
  { id: 'quiz', label: 'Grammar quiz' },
]

const ARCH_TABS: SubTabOption<ArchSubTab>[] = [
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'mentor', label: 'Ask a mentor' },
  { id: 'quiz', label: 'Quiz' },
]

function visibleIf(visible: boolean, className = '') {
  return visible ? className || undefined : `${className} hidden`.trim()
}

interface WorkspaceProps {
  userId: string
  isDark: boolean
  onToggleTheme: () => void
  onSignOut: () => void
}

function Workspace({ userId, isDark, onToggleTheme, onSignOut }: WorkspaceProps) {
  const [mainTab, setMainTab] = useState<MainTab>('english')
  const [englishTab, setEnglishTab] = useState<EnglishSubTab>('chat')
  const [archTab, setArchTab] = useState<ArchSubTab>('roadmap')
  const tutorChat = useChat('tutor')
  const mentorChat = useChat('mentor')
  const roadmap = useRoadmap(userId)
  const vocab = useVocab(userId)
  const englishQuiz = useQuiz('english', userId)
  const archQuiz = useQuiz('architecture', userId)

  useEffect(() => {
    document.body.classList.toggle('side-english', mainTab === 'english')
    document.body.classList.toggle('side-architecture', mainTab === 'architecture')
  }, [mainTab])

  function askTutor(question: string) {
    setMainTab('english')
    setEnglishTab('chat')
    tutorChat.send(question)
  }

  function askMentor(question: string) {
    setMainTab('architecture')
    setArchTab('mentor')
    mentorChat.send(question)
  }

  return (
    <div className="wrap">
      <Header isDark={isDark} onToggleTheme={onToggleTheme} onSignOut={onSignOut} />
      <MainTabs active={mainTab} onChange={setMainTab} />

      <section id="english-view" className={visibleIf(mainTab === 'english')}>
        <SubTabs tabs={ENGLISH_TABS} active={englishTab} onChange={setEnglishTab} />
        <div className={visibleIf(englishTab === 'chat', 'panel')}>
          <ChatPanel
            side="english"
            messages={tutorChat.messages}
            pending={tutorChat.pending}
            error={tutorChat.error}
            onSend={tutorChat.send}
          />
        </div>
        <div className={visibleIf(englishTab === 'vocab', 'panel')}>
          {vocab.loading ? (
            <p className="empty-hint">Loading vocabulary…</p>
          ) : (
            <Vocabulary words={vocab.words} results={vocab.results} onMark={vocab.mark} />
          )}
          {vocab.error && <p className="error-text">{vocab.error}</p>}
        </div>
        <div className={visibleIf(englishTab === 'quiz', 'panel')}>
          {englishQuiz.loading ? (
            <p className="empty-hint">Loading quiz…</p>
          ) : (
            <QuizEngine
              key={englishQuiz.roundId}
              questions={englishQuiz.round}
              best={englishQuiz.best}
              side="english"
              onAnswer={englishQuiz.recordAnswer}
              onFinish={englishQuiz.recordAttempt}
              onNewRound={englishQuiz.newRound}
              onAskMore={askTutor}
            />
          )}
          {englishQuiz.error && <p className="error-text">{englishQuiz.error}</p>}
        </div>
      </section>

      <section id="architecture-view" className={visibleIf(mainTab === 'architecture')}>
        <SubTabs tabs={ARCH_TABS} active={archTab} onChange={setArchTab} />
        <div className={visibleIf(archTab === 'roadmap', 'panel')}>
          {roadmap.loading ? (
            <p className="empty-hint">Loading roadmap…</p>
          ) : (
            <Roadmap
              topics={roadmap.topics}
              done={roadmap.done}
              onToggle={roadmap.toggle}
              onAskMentor={askMentor}
            />
          )}
          {roadmap.error && <p className="error-text">{roadmap.error}</p>}
        </div>
        <div className={visibleIf(archTab === 'mentor', 'panel')}>
          <ChatPanel
            side="architecture"
            messages={mentorChat.messages}
            pending={mentorChat.pending}
            error={mentorChat.error}
            onSend={mentorChat.send}
          />
        </div>
        <div className={visibleIf(archTab === 'quiz', 'panel')}>
          {archQuiz.loading ? (
            <p className="empty-hint">Loading quiz…</p>
          ) : (
            <QuizEngine
              key={archQuiz.roundId}
              questions={archQuiz.round}
              best={archQuiz.best}
              side="architecture"
              onAnswer={archQuiz.recordAnswer}
              onFinish={archQuiz.recordAttempt}
              onNewRound={archQuiz.newRound}
              onAskMore={askMentor}
            />
          )}
          {archQuiz.error && <p className="error-text">{archQuiz.error}</p>}
        </div>
      </section>
    </div>
  )
}

export default Workspace
