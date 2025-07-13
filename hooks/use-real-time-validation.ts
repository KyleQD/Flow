import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './use-debounce'

interface ValidationResult {
  available: boolean
  message: string
  loading: boolean
  error: string | null
  checked: boolean
}

interface ValidationResponse {
  available: boolean
  message: string
  reason?: string
}

export function useUsernameValidation(username: string, currentUsername?: string) {
  const [result, setResult] = useState<ValidationResult>({
    available: true,
    message: '',
    loading: false,
    error: null,
    checked: false
  })
  
  const debouncedUsername = useDebounce(username, 500)
  
  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value.length < 2) {
      setResult({
        available: true,
        message: '',
        loading: false,
        error: null,
        checked: false
      })
      return
    }
    
    // Don't check if it's the current username
    if (value === currentUsername) {
      setResult({
        available: true,
        message: 'Current username',
        loading: false,
        error: null,
        checked: true
      })
      return
    }
    
    setResult(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(value)}`)
      
      if (!response.ok) {
        throw new Error('Failed to check username availability')
      }
      
      const data: ValidationResponse = await response.json()
      
      setResult({
        available: data.available,
        message: data.message,
        loading: false,
        error: null,
        checked: true
      })
    } catch (error) {
      setResult({
        available: false,
        message: '',
        loading: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        checked: false
      })
    }
  }, [currentUsername])
  
  useEffect(() => {
    checkAvailability(debouncedUsername)
  }, [debouncedUsername, checkAvailability])
  
  return result
}

export function useUrlValidation(url: string, currentUrl?: string) {
  const [result, setResult] = useState<ValidationResult>({
    available: true,
    message: '',
    loading: false,
    error: null,
    checked: false
  })
  
  const debouncedUrl = useDebounce(url, 500)
  
  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value.length < 2) {
      setResult({
        available: true,
        message: '',
        loading: false,
        error: null,
        checked: false
      })
      return
    }
    
    // Don't check if it's the current URL
    if (value === currentUrl) {
      setResult({
        available: true,
        message: 'Current URL',
        loading: false,
        error: null,
        checked: true
      })
      return
    }
    
    setResult(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(`/api/profile/check-url?url=${encodeURIComponent(value)}`)
      
      if (!response.ok) {
        throw new Error('Failed to check URL availability')
      }
      
      const data: ValidationResponse = await response.json()
      
      setResult({
        available: data.available,
        message: data.message,
        loading: false,
        error: null,
        checked: true
      })
    } catch (error) {
      setResult({
        available: false,
        message: '',
        loading: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        checked: false
      })
    }
  }, [currentUrl])
  
  useEffect(() => {
    checkAvailability(debouncedUrl)
  }, [debouncedUrl, checkAvailability])
  
  return result
} 