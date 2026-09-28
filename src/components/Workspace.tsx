import { useEffect, useState } from 'react'
import Header from './Header'
import MainTabs from './MainTabs'
import SubTabs, { type SubTabOption } from './SubTabs'
import ChatPanel from './ChatPanel'
import QuizEngine from './QuizEngine'
import Vocabulary from './english/Vocabulary'
import Roadmap from './architecture/Roadmap'
import { useChat } from '../hooks/useChat'
import { VOCAB_WORDS } from '../data/vocab'
import { ROADMAP_TOPICS } from '../data/roadmap'
import { ARCH_QUIZ, ENGLISH_QUIZ } from '../data/quizzes'
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
  isDark: boolean
  onToggleTheme: () => void
  onSignOut: () => void
}

function Workspace({ isDark, onToggleTheme, onSignOut }: WorkspaceProps) {
  const [mainTab, setMainTab] = useState<MainTab>('english')
  const [englishTab, setEnglishTab] = useState<EnglishSubTab>('chat')
  const [archTab, setArchTab] = useState<ArchSubTab>('roadmap')
  const tutorChat = useChat('tutor')
  const mentorChat = useChat('mentor')

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
          <ChatPanel side="english" messages={tutorChat.messages} onSend={tutorChat.send} />
        </div>
        <div className={visibleIf(englishTab === 'vocab', 'panel')}>
          <Vocabulary words={VOCAB_WORDS} />
        </div>
        <div className={visibleIf(englishTab === 'quiz', 'panel')}>
          <QuizEngine questions={ENGLISH_QUIZ} side="english" onAskMore={askTutor} />
        </div>
      </section>

      <section id="architecture-view" className={visibleIf(mainTab === 'architecture')}>
        <SubTabs tabs={ARCH_TABS} active={archTab} onChange={setArchTab} />
        <div className={visibleIf(archTab === 'roadmap', 'panel')}>
          <Roadmap topics={ROADMAP_TOPICS} onAskMentor={askMentor} />
        </div>
        <div className={visibleIf(archTab === 'mentor', 'panel')}>
          <ChatPanel side="architecture" messages={mentorChat.messages} onSend={mentorChat.send} />
        </div>
        <div className={visibleIf(archTab === 'quiz', 'panel')}>
          <QuizEngine questions={ARCH_QUIZ} side="architecture" onAskMore={askMentor} />
        </div>
      </section>
    </div>
  )
}

export default Workspace
