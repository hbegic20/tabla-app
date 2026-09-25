export interface SubTabOption<T extends string> {
  id: T
  label: string
}

interface SubTabsProps<T extends string> {
  tabs: SubTabOption<T>[]
  active: T
  onChange: (tab: T) => void
}

function SubTabs<T extends string>({ tabs, active, onChange }: SubTabsProps<T>) {
  return (
    <nav className="sub-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === active ? 'active' : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default SubTabs
