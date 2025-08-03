import { useState, useCallback, useRef, useEffect } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

export interface SearchResult {
  id: string
  username: string
  account_type: 'artist' | 'venue' | 'general'
  profile_data?: any
  avatar_url?: string
  verified?: boolean
  bio?: string
  location?: string
  stats?: {
    followers?: number
    following?: number
  }
}

interface SearchResponse {
  artists: SearchResult[]
  venues: SearchResult[]
  users: SearchResult[]
  total: number
}

interface UseAccountSearchReturn {
  query: string
  setQuery: (query: string) => void
  results: SearchResult[]
  isLoading: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  searchInputRef: React.RefObject<HTMLInputElement>
  clearSearch: () => void
  hasResults: boolean
}

export function useAccountSearch(): UseAccountSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const debouncedQuery = useDebounce(query, 300)

  const searchAccounts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: 'all',
        limit: '10'
      })
      
      // Try unified search first, fallback to original search
      let response = await fetch(`/api/search/unified?${params}`)
      
      if (!response.ok) {
        // Fallback to original search API
        response = await fetch(`/api/search?${params}`)
        if (!response.ok) {
          throw new Error('Search failed')
        }
      }
      
      const data: any = await response.json()
      
      // Handle both unified and legacy response formats
      let allResults: SearchResult[] = []
      
      if (data.unified_results) {
        // New unified search response
        allResults = data.unified_results
      } else if (data.results) {
        // Legacy search response - combine all account types
        allResults = [
          ...data.results.artists || [],
          ...data.results.venues || [],
          ...data.results.users || []
        ]
      }
      
      setResults(allResults)
    } catch (error) {
      console.error('Account search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    searchAccounts(debouncedQuery)
  }, [debouncedQuery, searchAccounts])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }, [])

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    searchInputRef,
    clearSearch,
    hasResults: results.length > 0
  }
}