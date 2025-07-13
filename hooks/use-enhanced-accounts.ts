'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { 
  enhancedAccountService, 
  Account, 
  AccountDiscoveryResult, 
  PostWithAccount 
} from '@/lib/services/enhanced-account.service'

interface UseEnhancedAccountsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useEnhancedAccounts(options: UseEnhancedAccountsOptions = {}) {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { autoRefresh = true, refreshInterval = 30000 } = options

  // Load user's accounts
  const loadAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([])
      setCurrentAccount(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const userAccounts = await enhancedAccountService.getUserAccounts()
      setAccounts(userAccounts)
      
      // Set current account to first account if none selected
      if (!currentAccount && userAccounts.length > 0) {
        setCurrentAccount(userAccounts[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }, [user, currentAccount])

  // Switch to a specific account
  const switchAccount = useCallback(async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId)
    if (account) {
      setCurrentAccount(account)
    }
  }, [accounts])

  // Create a new account
  const createAccount = useCallback(async (
    accountType: Account['account_type'],
    profileTable: string,
    profileId: string
  ) => {
    try {
      setError(null)
      const newAccountId = await enhancedAccountService.createAccount(
        accountType,
        profileTable,
        profileId
      )
      
      // Refresh accounts to include the new one
      await loadAccounts()
      
      // Switch to the new account
      await switchAccount(newAccountId)
      
      return newAccountId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      throw err
    }
  }, [loadAccounts, switchAccount])

  // Auto-refresh accounts
  useEffect(() => {
    loadAccounts()
    
    if (autoRefresh) {
      const interval = setInterval(loadAccounts, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [loadAccounts, autoRefresh, refreshInterval])

  return {
    accounts,
    currentAccount,
    loading,
    error,
    switchAccount,
    createAccount,
    refreshAccounts: loadAccounts
  }
}

// Hook for account discovery and search
export function useAccountDiscovery() {
  const [results, setResults] = useState<AccountDiscoveryResult>({
    accounts: [],
    total: 0,
    hasMore: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchAccounts = useCallback(async (
    searchTerm: string = '',
    accountTypes: Account['account_type'][] = ['artist', 'venue', 'primary'],
    limit: number = 20,
    offset: number = 0
  ) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await enhancedAccountService.discoverAccounts(
        searchTerm,
        accountTypes,
        limit,
        offset
      )
      
      if (offset === 0) {
        setResults(result)
      } else {
        // Append to existing results for pagination
        setResults(prev => ({
          ...result,
          accounts: [...prev.accounts, ...result.accounts]
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async (
    searchTerm: string = '',
    accountTypes: Account['account_type'][] = ['artist', 'venue', 'primary'],
    limit: number = 20
  ) => {
    if (results.hasMore && !loading) {
      await searchAccounts(searchTerm, accountTypes, limit, results.accounts.length)
    }
  }, [results.hasMore, results.accounts.length, loading, searchAccounts])

  return {
    results,
    loading,
    error,
    searchAccounts,
    loadMore,
    clearResults: () => setResults({ accounts: [], total: 0, hasMore: false })
  }
}

// Hook for managing account posts
export function useAccountPosts(accountId: string | null) {
  const [posts, setPosts] = useState<PostWithAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = useCallback(async (reset: boolean = false) => {
    if (!accountId) return

    try {
      setLoading(true)
      setError(null)
      
      const offset = reset ? 0 : posts.length
      const newPosts = await enhancedAccountService.getAccountPosts(accountId, 20, offset)
      
      if (reset) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
      
      setHasMore(newPosts.length === 20)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [accountId, posts.length])

  const createPost = useCallback(async (
    content: string,
    options: {
      type?: string
      visibility?: 'public' | 'followers' | 'private'
      media_urls?: string[]
      hashtags?: string[]
      location?: string
    } = {}
  ) => {
    if (!accountId) throw new Error('No account selected')

    try {
      setError(null)
      const postId = await enhancedAccountService.createPost(accountId, content, options)
      
      // Refresh posts to include the new one
      await loadPosts(true)
      
      return postId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
      throw err
    }
  }, [accountId, loadPosts])

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await loadPosts(false)
    }
  }, [hasMore, loading, loadPosts])

  // Load posts when accountId changes
  useEffect(() => {
    if (accountId) {
      loadPosts(true)
    } else {
      setPosts([])
      setHasMore(true)
    }
  }, [accountId, loadPosts])

  return {
    posts,
    loading,
    error,
    hasMore,
    createPost,
    loadMore,
    refreshPosts: () => loadPosts(true)
  }
}

// Hook for account following functionality
export function useAccountFollowing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const followAccount = useCallback(async (accountId: string) => {
    try {
      setLoading(true)
      setError(null)
      await enhancedAccountService.followAccount(accountId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to follow account')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const unfollowAccount = useCallback(async (accountId: string) => {
    try {
      setLoading(true)
      setError(null)
      await enhancedAccountService.unfollowAccount(accountId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unfollow account')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const checkIsFollowing = useCallback(async (accountId: string) => {
    try {
      setError(null)
      return await enhancedAccountService.isFollowing(accountId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check follow status')
      return false
    }
  }, [])

  return {
    loading,
    error,
    followAccount,
    unfollowAccount,
    checkIsFollowing
  }
}

// Hook for account analytics
export function useAccountAnalytics(accountId: string | null) {
  const [analytics, setAnalytics] = useState<{
    totalPosts: number
    totalLikes: number
    totalComments: number
    totalShares: number
    followerGrowth: number
    engagementRate: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    if (!accountId) return

    try {
      setLoading(true)
      setError(null)
      const data = await enhancedAccountService.getAccountAnalytics(accountId)
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: loadAnalytics
  }
}

// Hook for trending accounts
export function useTrendingAccounts(accountType?: Account['account_type']) {
  const [trendingAccounts, setTrendingAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTrendingAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const accounts = await enhancedAccountService.getTrendingAccounts(accountType)
      setTrendingAccounts(accounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending accounts')
    } finally {
      setLoading(false)
    }
  }, [accountType])

  useEffect(() => {
    loadTrendingAccounts()
  }, [loadTrendingAccounts])

  return {
    trendingAccounts,
    loading,
    error,
    refreshTrending: loadTrendingAccounts
  }
} 