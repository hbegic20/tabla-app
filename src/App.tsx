import AuthForm from './components/AuthForm'
import Header from './components/Header'
import Workspace from './components/Workspace'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'

function App() {
  const { isDark, toggleTheme } = useTheme()
  const { session, loading, signIn, signUp, signOut } = useAuth()

  if (loading) return null

  if (!session) {
    return (
      <div className="wrap">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />
        <AuthForm onSignIn={signIn} onSignUp={signUp} />
      </div>
    )
  }

  return (
    <Workspace
      key={session.user.id}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      onSignOut={signOut}
    />
  )
}

export default App
