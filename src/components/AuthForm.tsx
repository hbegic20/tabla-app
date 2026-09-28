import { useState, type FormEvent } from 'react'
import type { SignUpResult } from '../hooks/useAuth'

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<string | null>
  onSignUp: (email: string, password: string) => Promise<SignUpResult>
}

type Mode = 'signIn' | 'signUp'

function AuthForm({ onSignIn, onSignUp }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const isSignUp = mode === 'signUp'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    setNotice(null)

    if (isSignUp) {
      const result = await onSignUp(email, password)
      setPending(false)
      if (result.error) setError(result.error)
      else if (result.needsConfirmation) {
        setNotice(`Check ${email} for a confirmation link, then sign in.`)
        setMode('signIn')
      }
      return
    }

    const signInError = await onSignIn(email, password)
    if (signInError) {
      setPending(false)
      setError(signInError)
    }
  }

  function switchMode() {
    setMode(isSignUp ? 'signIn' : 'signUp')
    setError(null)
    setNotice(null)
  }

  return (
    <div className="panel auth-panel">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isSignUp ? 'Create an account' : 'Sign in'}</h2>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        {notice && <p className="auth-notice">{notice}</p>}
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
        </button>
        <p className="muted auth-switch-row">
          {isSignUp ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="auth-switch" onClick={switchMode}>
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </form>
    </div>
  )
}

export default AuthForm
