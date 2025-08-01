"use client"

import { useState } from "react"
import { toast } from "sonner"

interface ApiResponseHandlerOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showToast?: boolean
}

export function useApiResponseHandler() {
  const [isLoading, setIsLoading] = useState(false)

  const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string,
    options: ApiResponseHandlerOptions = {}
  ): Promise<T | null> => {
    const { onSuccess, onError, showToast = true } = options
    
    setIsLoading(true)
    
    try {
      const result = await apiCall()
      
      if (showToast && successMessage) {
        toast.success(successMessage)
      }
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      
      if (showToast) {
        toast.error(errorMessage || errorObj.message || "An error occurred")
      }
      
      if (onError) {
        onError(errorObj)
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleApiCall,
    isLoading
  }
} 