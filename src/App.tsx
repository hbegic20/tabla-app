import { useEffect, useState } from 'react'
import Header from './components/Header'
import MainTabs from './components/MainTabs'
import SubTabs, { type SubTabOption } from './components/SubTabs'
import { useTheme } from './hooks/useTheme'
import type { ArchSubTab, EnglishSubTab, MainTab } from './types'

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

function App() {
  const { isDark, toggleTheme } = useTheme()
  const [mainTab, setMainTab] = useState<MainTab>('english')
  const [englishTab, setEnglishTab] = useState<EnglishSubTab>('chat')
  const [archTab, setArchTab] = useState<ArchSubTab>('roadmap')

  useEffect(() => {
    document.body.classList.toggle('side-english', mainTab === 'english')
    document.body.classList.toggle('side-architecture', mainTab === 'architecture')
  }, [mainTab])

  return (
    <div className="wrap">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />
      <MainTabs active={mainTab} onChange={setMainTab} />

      <section id="english-view" className={visibleIf(mainTab === 'english')}>
        <SubTabs tabs={ENGLISH_TABS} active={englishTab} onChange={setEnglishTab} />
        {ENGLISH_TABS.map((tab) => (
          <div key={tab.id} className={visibleIf(englishTab === tab.id, 'panel')}>
            <p className="empty-hint">{tab.label} — coming next</p>
          </div>
        ))}
      </section>

      <section id="architecture-view" className={visibleIf(mainTab === 'architecture')}>
        <SubTabs tabs={ARCH_TABS} active={archTab} onChange={setArchTab} />
        {ARCH_TABS.map((tab) => (
          <div key={tab.id} className={visibleIf(archTab === tab.id, 'panel')}>
            <p className="empty-hint">{tab.label} — coming next</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default App
