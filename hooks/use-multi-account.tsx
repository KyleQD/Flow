'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { AccountManagementService, UserAccount, ActiveSession } from '@/lib/services/account-management.service'

interface MultiAccountContextType {
  accounts: UserAccount[]
  activeAccount: UserAccount | null
  activeSession: ActiveSession | null
  isLoading: boolean
  error: string | null
  switchAccount: (profileId: string, accountType: string) => Promise<boolean>
  createArtistAccount: (data: any) => Promise<string>
  createVenueAccount: (data: any) => Promise<string>
  refreshAccounts: () => Promise<void>
  hasAccountType: (accountType: string) => boolean
  currentAccount: UserAccount | null
  userAccounts: UserAccount[]
}

const MultiAccountContext = createContext<MultiAccountContextType | undefined>(undefined)

export function useMultiAccount() {
  const context = useContext(MultiAccountContext)
  if (context === undefined) {
    throw new Error('useMultiAccount must be used within a MultiAccountProvider')
  }
  return context
}

export function useAccountSwitching() {
  const { switchAccount, activeAccount, isLoading } = useMultiAccount()
  return { switchAccount, activeAccount, isLoading }
}

export function useAccountPermissions() {
  const { activeAccount } = useMultiAccount()
  return {
    permissions: activeAccount?.permissions || {},
    canPost: activeAccount?.permissions?.can_post || false,
    canManageSettings: activeAccount?.permissions?.can_manage_settings || false,
    canViewAnalytics: activeAccount?.permissions?.can_view_analytics || false,
    canManageContent: activeAccount?.permissions?.can_manage_content || false
  }
}

export function useAccountCreation() {
  const { createArtistAccount, createVenueAccount, refreshAccounts } = useMultiAccount()
  
  const createAccount = async (type: 'artist' | 'venue', data: any) => {
    try {
      const accountId = type === 'artist' 
        ? await createArtistAccount(data)
        : await createVenueAccount(data)
      
      await refreshAccounts()
      return accountId
    } catch (error) {
      throw error
    }
  }
  
  return { createAccount }
}

export function useAccountPosting() {
  const { activeAccount } = useMultiAccount()
  
  const canPostAs = (accountType: string) => {
    if (!activeAccount) return false
    return activeAccount.account_type === accountType || activeAccount.permissions?.can_post
  }
  
  return {
    activeAccount,
    canPostAs,
    canPostAsArtist: canPostAs('artist'),
    canPostAsVenue: canPostAs('venue'),
    canPostAsGeneral: canPostAs('general')
  }
}

interface MultiAccountProviderProps {
  children: React.ReactNode
}

export function MultiAccountProvider({ children }: MultiAccountProviderProps) {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshAccounts = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)
      
      const userAccounts = await AccountManagementService.getUserAccounts(user.id)
      setAccounts(userAccounts)
      
      // Set active account (general by default, or first account)
      const generalAccount = userAccounts.find(acc => acc.account_type === 'general')
      const defaultActive = generalAccount || userAccounts[0]
      setActiveAccount(defaultActive || null)
      
      // Get active session (gracefully handle if session tables don't exist)
      try {
        const session = await AccountManagementService.getActiveSession(user.id)
        setActiveSession(session)
      } catch (sessionError) {
        console.log('Session management not available:', sessionError)
        setActiveSession(null)
      }
      
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const switchAccount = async (profileId: string, accountType: string): Promise<boolean> => {
    if (!user?.id) return false

    try {
      setError(null)
      const success = await AccountManagementService.switchAccount(user.id, profileId, accountType as any)
      
      if (success) {
        const targetAccount = accounts.find(acc => 
          acc.profile_id === profileId && acc.account_type === accountType
        )
        if (targetAccount) {
          setActiveAccount(targetAccount)
        }
        
        // Refresh session (gracefully handle if session tables don't exist)
        try {
          const session = await AccountManagementService.getActiveSession(user.id)
          setActiveSession(session)
        } catch (sessionError) {
          console.log('Session management not available:', sessionError)
        }
      }
      
      return success
    } catch (err) {
      console.error('Error switching account:', err)
      setError(err instanceof Error ? err.message : 'Failed to switch account')
      return false
    }
  }

  // Check if user has a specific account type
  const hasAccountType = (accountType: string): boolean => {
    return accounts.some(account => 
      account.account_type === accountType && account.is_active
    )
  }

  const createArtistAccount = async (data: {
    artist_name: string
    bio?: string
    genres?: string[]
    social_links?: any
  }): Promise<string> => {
    if (!user?.id) throw new Error('You must be logged in to create an artist account')

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Creating artist account for user:', user.id)
      console.log('Artist data:', data)
      
      const accountId = await AccountManagementService.createArtistAccount(user.id, data)
      console.log('Artist account created successfully:', accountId)
      
      await refreshAccounts()
      return accountId
    } catch (err) {
      console.error('Error creating artist account:', err)
      
      let errorMessage = 'Failed to create artist account'
      
      if (err instanceof Error) {
        // Provide more specific error messages based on the error
        if (err.message.includes('not authenticated')) {
          errorMessage = 'You must be logged in to create an artist account'
        } else if (err.message.includes('artist_profiles table does not exist')) {
          errorMessage = 'Database setup incomplete. Please apply the SQL migration in your Supabase dashboard.'
        } else if (err.message.includes('permission')) {
          errorMessage = 'You do not have permission to create artist accounts'
        } else if (err.message.includes('duplicate')) {
          errorMessage = 'An artist with this name already exists'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const createVenueAccount = async (data: {
    venue_name: string
    description?: string
    address?: string
    capacity?: number
    venue_types?: string[]
    contact_info?: any
    social_links?: any
  }): Promise<string> => {
    if (!user?.id) throw new Error('You must be logged in to create a venue account')

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Creating venue account for user:', user.id)
      console.log('Venue data:', data)
      
      const accountId = await AccountManagementService.createVenueAccount(user.id, data)
      console.log('Venue account created successfully:', accountId)
      
      await refreshAccounts()
      return accountId
    } catch (err) {
      console.error('Error creating venue account:', err)
      
      let errorMessage = 'Failed to create venue account'
      
      if (err instanceof Error) {
        // Provide more specific error messages based on the error
        if (err.message.includes('not authenticated')) {
          errorMessage = 'You must be logged in to create a venue account'
        } else if (err.message.includes('venue_profiles table does not exist')) {
          errorMessage = 'Database setup incomplete. Please apply the SQL migration in your Supabase dashboard.'
        } else if (err.message.includes('permission')) {
          errorMessage = 'You do not have permission to create venue accounts'
        } else if (err.message.includes('duplicate')) {
          errorMessage = 'A venue with this name already exists'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      refreshAccounts()
    } else {
      setAccounts([])
      setActiveAccount(null)
      setActiveSession(null)
    }
  }, [user?.id])

  const contextValue: MultiAccountContextType = {
    accounts,
    activeAccount,
    activeSession,
    isLoading,
    error,
    switchAccount,
    createArtistAccount,
    createVenueAccount,
    refreshAccounts,
    hasAccountType,
    currentAccount: activeAccount, // Alias for compatibility
    userAccounts: accounts // Alias for compatibility
  }

  return (
    <MultiAccountContext.Provider value={contextValue}>
      {children}
    </MultiAccountContext.Provider>
  )
} 