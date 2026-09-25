import type { MainTab } from '../types'

interface MainTabsProps {
  active: MainTab
  onChange: (tab: MainTab) => void
}

const TABS: { id: MainTab; label: string; viewBox: string; path: string }[] = [
  {
    id: 'english',
    label: 'English',
    viewBox: '0 0 100 8',
    path: 'M1 4.5 C 20 1.5, 45 6.5, 60 3.5 S 85 1, 99 4',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    viewBox: '0 0 130 8',
    path: 'M1 4.5 C 25 1.5, 55 6.5, 75 3.5 S 110 1, 129 4',
  },
]

function MainTabs({ active, onChange }: MainTabsProps) {
  return (
    <nav className="main-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-main={tab.id}
          className={tab.id === active ? 'active' : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          <svg className="underline" viewBox={tab.viewBox} preserveAspectRatio="none">
            <path d={tab.path} />
          </svg>
        </button>
      ))}
    </nav>
  )
}

export default MainTabs
