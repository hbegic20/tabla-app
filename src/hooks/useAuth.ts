import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface SignUpResult {
  error: string | null
  needsConfirmation: boolean
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signUp(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message, needsConfirmation: false }
    return { error: null, needsConfirmation: !data.session }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { session, loading, signIn, signUp, signOut }
}
