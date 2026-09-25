interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
}

function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="top">
      <div className="titles">
        <div className="mark-row">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="4" width="15" height="19" rx="1.5" fill="none" stroke="var(--accent)" strokeWidth="2" />
            <line x1="5.5" y1="9" x2="13.5" y2="9" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="5.5" y1="13" x2="13.5" y2="13" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="5.5" y1="17" x2="11" y2="17" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
            <g transform="translate(22,4)">
              <rect x="0" y="0" width="16" height="19" rx="1.5" fill="none" stroke="var(--accent2)" strokeWidth="2" />
              <line x1="3" y1="5" x2="13" y2="5" stroke="var(--accent2)" strokeWidth="1.2" />
              <line x1="3" y1="9" x2="13" y2="9" stroke="var(--accent2)" strokeWidth="1.2" />
              <line x1="3" y1="13" x2="9" y2="13" stroke="var(--accent2)" strokeWidth="1.2" />
              <circle cx="3" cy="5" r="1" fill="var(--accent2)" />
              <circle cx="13" cy="9" r="1" fill="var(--accent2)" />
            </g>
          </svg>
          <h1>
            Tabla
            <svg className="title-underline" viewBox="0 0 132 10" aria-hidden="true">
              <path d="M2 6.5 C 20 2, 40 8.5, 60 5 S 100 2, 130 6" />
            </svg>
          </h1>
        </div>
        <p className="tagline">
          one board for English, one for backend — pick a side, chalk in hand
        </p>
      </div>
      <button
        type="button"
        className="theme-btn"
        title="Toggle theme"
        aria-label="Toggle light/dark theme"
        onClick={onToggleTheme}
      >
        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
          {isDark ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          ) : (
            <path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5z" />
          )}
        </svg>
      </button>
    </header>
  )
}

export default Header
