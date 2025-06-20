"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>
  signUp: (email: string, password: string, metadata?: { full_name?: string; username?: string }) => Promise<{ error?: AuthError }>
  signOut: () => Promise<{ error?: AuthError }>
  resetPassword: (email: string) => Promise<{ error?: AuthError }>
  updateProfile: (updates: { full_name?: string; username?: string; avatar_url?: string }) => Promise<{ error?: string }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true) // Start with true to wait for initial auth check
  const router = useRouter()

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        setLoading(true)
        console.log('[Auth] Checking initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth] Session check error:', error)
        } else {
          console.log('[Auth] Initial session check:', session ? `User ${session.user?.id} authenticated` : 'No session')
        }
        
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('[Auth] Session check failed:', error)
      } finally {
        setLoading(false) // Always set loading to false after initial check
      }
    }

    checkSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] State change:', event, session ? `User ${session.user?.id}` : 'No session')
      
      setSession(session)
      setUser(session?.user ?? null)

      // Don't automatically redirect on sign in - let components handle this
      // The middleware will handle protecting routes and the login page will redirect after successful sign in

      if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out, clearing local data')
        // Clear any local storage
        localStorage.removeItem('onboardingData')
        router.push('/login')
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('[Auth] Token refreshed successfully')
      }

      if (event === 'SIGNED_IN') {
        console.log('[Auth] User signed in successfully')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('[Auth] Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('[Auth] Sign in error:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        return { error }
      }
      
      console.log('[Auth] Sign in successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmed: data.user?.email_confirmed_at ? 'Yes' : 'No'
      })
      return { error: undefined }
    } catch (error) {
      console.error('[Auth] Sign in failed with exception:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; username?: string }
  ) => {
    try {
      setLoading(true)
      console.log('[Auth] Attempting sign up for:', email, 'with metadata:', metadata)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name,
            username: metadata?.username,
          },
        },
      })
      
      if (error) {
        console.error('[Auth] Sign up error:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        return { error }
      }
      
      console.log('[Auth] Sign up successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        needsConfirmation: !data.session ? 'Yes' : 'No'
      })
      return { error: undefined }
    } catch (error) {
      console.error('[Auth] Sign up failed with exception:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('[Auth] Attempting sign out')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[Auth] Sign out error:', error)
        return { error }
      }
      
      console.log('[Auth] Sign out successful')
      return { error: undefined }
    } catch (error) {
      console.error('[Auth] Sign out failed with exception:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      console.log('[Auth] Attempting password reset for:', email)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) {
        console.error('[Auth] Reset password error:', error)
        return { error }
      }
      
      console.log('[Auth] Reset password email sent successfully')
      return { error: undefined }
    } catch (error) {
      console.error('[Auth] Reset password failed with exception:', error)
      return { error: error as AuthError }
    }
  }

  const updateProfile = async (updates: { 
    full_name?: string
    username?: string
    avatar_url?: string 
  }) => {
    try {
      if (!user) {
        console.warn('[Auth] Update profile called without authenticated user')
        return { error: 'No user logged in' }
      }

      console.log('[Auth] Updating profile for user:', user.id, 'with updates:', updates)

      const { error } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (error) {
        console.error('[Auth] Update profile error:', error)
        return { error: error.message }
      }
      
      // Also update the profiles table if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: updates.full_name,
          username: updates.username,
          avatar_url: updates.avatar_url,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('[Auth] Update profiles table error:', profileError)
        // Don't return error here as the main auth update succeeded
        console.warn('[Auth] Profiles table update failed, but auth update succeeded')
      } else {
        console.log('[Auth] Profile updated successfully in both auth and profiles table')
      }
      
      return { error: undefined }
    } catch (error) {
      console.error('[Auth] Update profile failed with exception:', error)
      return { error: 'Failed to update profile' }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 