import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { mfaService } from '@/lib/services/mfa.service'
import type {
  MFAMethod,
  MFASetupResult,
  MFAVerificationResult
} from '@/lib/services/mfa.service'

// Hook for MFA status and methods
export function useMFA() {
  const { user } = useAuth()
  const [methods, setMethods] = useState<MFAMethod[]>([])
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMFAStatus = useCallback(async () => {
    if (!user?.id) {
      setMethods([])
      setIsEnabled(false)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [userMethods, mfaEnabled] = await Promise.all([
        mfaService.getUserMFAMethods(user.id),
        mfaService.isMFAEnabled(user.id)
      ])

      setMethods(userMethods)
      setIsEnabled(mfaEnabled)
    } catch (err) {
      console.error('Error loading MFA status:', err)
      setError(err instanceof Error ? err.message : 'Failed to load MFA status')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadMFAStatus()
  }, [loadMFAStatus])

  const getMethodsByType = useCallback(
    (type: 'sms' | 'totp' | 'backup_codes') => {
      return methods.filter(method => method.type === type)
    },
    [methods]
  )

  const getPrimaryMethod = useCallback(() => {
    return methods.find(method => method.isPrimary)
  }, [methods])

  const getEnabledMethods = useCallback(() => {
    return methods.filter(method => method.isEnabled)
  }, [methods])

  return {
    methods,
    isEnabled,
    loading,
    error,
    getMethodsByType,
    getPrimaryMethod,
    getEnabledMethods,
    refreshMFAStatus: loadMFAStatus
  }
}

// Hook for TOTP setup
export function useTOTPSetup() {
  const { user } = useAuth()
  const [setupResult, setSetupResult] = useState<MFASetupResult | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startTOTPSetup = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await mfaService.setupTOTP(user.id, 'Tourify')
      setSetupResult(result)
    } catch (err) {
      console.error('Error setting up TOTP:', err)
      setError(err instanceof Error ? err.message : 'Failed to setup TOTP')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const verifyTOTPSetup = useCallback(async (token: string) => {
    if (!user?.id) {
      setError('User not authenticated')
      return false
    }

    try {
      setVerifying(true)
      setError(null)

      const success = await mfaService.verifyTOTPSetup(user.id, token)
      
      if (success) {
        setSetupResult(null) // Clear setup state on success
      } else {
        setError('Invalid verification code')
      }

      return success
    } catch (err) {
      console.error('Error verifying TOTP setup:', err)
      setError(err instanceof Error ? err.message : 'Failed to verify TOTP')
      return false
    } finally {
      setVerifying(false)
    }
  }, [user?.id])

  const cancelSetup = useCallback(() => {
    setSetupResult(null)
    setError(null)
  }, [])

  return {
    setupResult,
    verifying,
    loading,
    error,
    startTOTPSetup,
    verifyTOTPSetup,
    cancelSetup
  }
}

// Hook for SMS setup
export function useSMSSetup() {
  const { user } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [setupInitiated, setSetupInitiated] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startSMSSetup = useCallback(async (phone: string) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await mfaService.setupSMS(user.id, phone)
      setPhoneNumber(phone)
      setSetupInitiated(true)
    } catch (err) {
      console.error('Error setting up SMS:', err)
      setError(err instanceof Error ? err.message : 'Failed to setup SMS')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const verifySMSSetup = useCallback(async (code: string) => {
    if (!user?.id) {
      setError('User not authenticated')
      return false
    }

    try {
      setVerifying(true)
      setError(null)

      const success = await mfaService.verifySMSSetup(user.id, code)
      
      if (success) {
        setSetupInitiated(false)
        setPhoneNumber('')
      } else {
        setError('Invalid verification code')
      }

      return success
    } catch (err) {
      console.error('Error verifying SMS setup:', err)
      setError(err instanceof Error ? err.message : 'Failed to verify SMS')
      return false
    } finally {
      setVerifying(false)
    }
  }, [user?.id])

  const resendSMSCode = useCallback(async () => {
    if (!user?.id || !phoneNumber) {
      setError('Missing user ID or phone number')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await mfaService.setupSMS(user.id, phoneNumber)
    } catch (err) {
      console.error('Error resending SMS code:', err)
      setError(err instanceof Error ? err.message : 'Failed to resend SMS code')
    } finally {
      setLoading(false)
    }
  }, [user?.id, phoneNumber])

  const cancelSetup = useCallback(() => {
    setSetupInitiated(false)
    setPhoneNumber('')
    setError(null)
  }, [])

  return {
    phoneNumber,
    setupInitiated,
    verifying,
    loading,
    error,
    startSMSSetup,
    verifySMSSetup,
    resendSMSCode,
    cancelSetup
  }
}

// Hook for backup codes
export function useBackupCodes() {
  const { user } = useAuth()
  const [codes, setCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCodes = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const backupCodes = await mfaService.generateBackupCodes(user.id)
      setCodes(backupCodes)
    } catch (err) {
      console.error('Error generating backup codes:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate backup codes')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const clearCodes = useCallback(() => {
    setCodes([])
  }, [])

  return {
    codes,
    loading,
    error,
    generateCodes,
    clearCodes
  }
}

// Hook for MFA verification during login
export function useMFAVerification() {
  const [methods, setMethods] = useState<MFAMethod[]>([])
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startVerification = useCallback(async (userId: string, preferredMethod?: string) => {
    try {
      setLoading(true)
      setError(null)

      const result = await mfaService.startMFAVerification(userId, preferredMethod)
      setMethods(result.methods)
      setChallengeId(result.challengeId)
    } catch (err) {
      console.error('Error starting MFA verification:', err)
      setError(err instanceof Error ? err.message : 'Failed to start verification')
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyToken = useCallback(async (
    userId: string,
    token: string,
    methodType: 'sms' | 'totp' | 'backup_codes'
  ): Promise<MFAVerificationResult> => {
    if (!challengeId) {
      throw new Error('No verification challenge active')
    }

    try {
      setVerifying(true)
      setError(null)

      const result = await mfaService.verifyMFAToken(userId, challengeId, token, methodType)
      
      if (!result.success) {
        setError(result.error || 'Verification failed')
      }

      return result
    } catch (err) {
      console.error('Error verifying MFA token:', err)
      const error = err instanceof Error ? err.message : 'Verification failed'
      setError(error)
      return { success: false, error }
    } finally {
      setVerifying(false)
    }
  }, [challengeId])

  const resetVerification = useCallback(() => {
    setMethods([])
    setChallengeId(null)
    setError(null)
  }, [])

  return {
    methods,
    challengeId,
    verifying,
    loading,
    error,
    startVerification,
    verifyToken,
    resetVerification
  }
}

// Hook for MFA management (disable, set primary, etc.)
export function useMFAManagement() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disableMethod = useCallback(async (methodId: string) => {
    if (!user?.id) {
      setError('User not authenticated')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const success = await mfaService.disableMFAMethod(user.id, methodId)
      
      if (!success) {
        setError('Failed to disable MFA method')
      }

      return success
    } catch (err) {
      console.error('Error disabling MFA method:', err)
      setError(err instanceof Error ? err.message : 'Failed to disable method')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const setPrimaryMethod = useCallback(async (methodId: string) => {
    if (!user?.id) {
      setError('User not authenticated')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const success = await mfaService.setPrimaryMFAMethod(user.id, methodId)
      
      if (!success) {
        setError('Failed to set primary MFA method')
      }

      return success
    } catch (err) {
      console.error('Error setting primary MFA method:', err)
      setError(err instanceof Error ? err.message : 'Failed to set primary method')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return {
    loading,
    error,
    disableMethod,
    setPrimaryMethod
  }
}

// Utility hook for MFA status checking
export function useMFAStatus() {
  const { user } = useAuth()
  const [isRequired, setIsRequired] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user?.id) {
        setIsRequired(false)
        setIsEnabled(false)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        const enabled = await mfaService.isMFAEnabled(user.id)
        setIsEnabled(enabled)
        
        // Check if MFA is required based on user role or account type
        // This would be customizable based on business rules
        const methods = await mfaService.getUserMFAMethods(user.id)
        setIsRequired(methods.length > 0) // Simple rule: if any methods exist, MFA may be required
      } catch (error) {
        console.error('Error checking MFA status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkMFAStatus()
  }, [user?.id])

  return {
    isRequired,
    isEnabled,
    loading
  }
} 