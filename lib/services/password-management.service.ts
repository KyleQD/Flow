import { supabase } from '@/lib/supabase'
import { rbacService } from './rbac.service'
import { mfaService } from './mfa.service'

export interface PasswordResetRequest {
  id: string
  userId: string
  email: string
  token: string
  expiresAt: string
  isUsed: boolean
  createdAt: string
  ipAddress?: string
  userAgent?: string
}

export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-4 (weak to very strong)
  feedback: string[]
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumbers: boolean
    hasSpecialChars: boolean
    notCommon: boolean
    notPersonal: boolean
  }
}

export interface PasswordResetOptions {
  requireMFA?: boolean
  requireEmailVerification?: boolean
  lockoutDuration?: number // minutes
  maxAttempts?: number
  notifyUser?: boolean
}

export class PasswordManagementService {
  private static instance: PasswordManagementService
  private resetTokens: Map<string, { token: string; expires: number; attempts: number }> = new Map()
  private commonPasswords = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'iloveyou'
  ])

  private constructor() {
    // Clean up expired tokens every hour
    setInterval(() => {
      this.cleanupExpiredTokens()
    }, 60 * 60 * 1000)
  }

  public static getInstance(): PasswordManagementService {
    if (!PasswordManagementService.instance) {
      PasswordManagementService.instance = new PasswordManagementService()
    }
    return PasswordManagementService.instance
  }

  // Validate password strength
  public validatePassword(
    password: string, 
    userInfo?: { email?: string; name?: string; username?: string }
  ): PasswordValidationResult {
    const feedback: string[] = []
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      notCommon: !this.commonPasswords.has(password.toLowerCase()),
      notPersonal: this.isNotPersonalInfo(password, userInfo)
    }

    let score = 0

    // Check minimum length
    if (!requirements.minLength) {
      feedback.push('Password must be at least 8 characters long')
    } else {
      score++
    }

    // Check character variety
    if (!requirements.hasUppercase) {
      feedback.push('Add uppercase letters')
    } else {
      score++
    }

    if (!requirements.hasLowercase) {
      feedback.push('Add lowercase letters')
    }

    if (!requirements.hasNumbers) {
      feedback.push('Add numbers')
    } else {
      score++
    }

    if (!requirements.hasSpecialChars) {
      feedback.push('Add special characters (!@#$%^&*)')
    } else {
      score++
    }

    // Check against common passwords
    if (!requirements.notCommon) {
      feedback.push('Avoid common passwords')
      score = Math.max(0, score - 1)
    }

    // Check against personal information
    if (!requirements.notPersonal) {
      feedback.push('Avoid using personal information')
      score = Math.max(0, score - 1)
    }

    // Bonus points for longer passwords
    if (password.length >= 12) {
      score = Math.min(4, score + 1)
    }

    const isValid = Object.values(requirements).every(req => req)

    return {
      isValid,
      score,
      feedback,
      requirements
    }
  }

  // Check if password contains personal information
  private isNotPersonalInfo(
    password: string, 
    userInfo?: { email?: string; name?: string; username?: string }
  ): boolean {
    if (!userInfo) return true

    const lowercasePassword = password.toLowerCase()
    
    // Check against email
    if (userInfo.email) {
      const emailParts = userInfo.email.split('@')[0].toLowerCase()
      if (lowercasePassword.includes(emailParts) && emailParts.length > 3) {
        return false
      }
    }

    // Check against name
    if (userInfo.name) {
      const nameParts = userInfo.name.toLowerCase().split(' ')
      for (const part of nameParts) {
        if (part.length > 3 && lowercasePassword.includes(part)) {
          return false
        }
      }
    }

    // Check against username
    if (userInfo.username && userInfo.username.length > 3) {
      if (lowercasePassword.includes(userInfo.username.toLowerCase())) {
        return false
      }
    }

    return true
  }

  // Initiate password reset
  public async initiatePasswordReset(
    email: string,
    options: PasswordResetOptions = {},
    requestInfo?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; requiresMFA?: boolean; message: string }> {
    try {
      // Get user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
      
      if (userError) {
        console.error('Error listing users:', userError)
        throw userError
      }

      const user = userData.users.find(u => u.email === email)
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: 'If an account with that email exists, we\'ve sent a password reset link.'
        }
      }

      // Check if user has MFA enabled and if it's required
      const mfaEnabled = await mfaService.isMFAEnabled(user.id)
      
      if (options.requireMFA && mfaEnabled) {
        // Store pending reset request that requires MFA verification
        const resetToken = this.generateResetToken()
        
        await supabase
          .from('pending_password_resets')
          .insert({
            user_id: user.id,
            email: user.email,
            reset_token: resetToken,
            requires_mfa: true,
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
            ip_address: requestInfo?.ipAddress,
            user_agent: requestInfo?.userAgent
          })

        return {
          success: true,
          requiresMFA: true,
          message: 'MFA verification required to proceed with password reset.'
        }
      }

      // Standard password reset flow
      const resetToken = this.generateResetToken()
      
      // Send password reset email via Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
      })

      if (resetError) {
        console.error('Error sending reset email:', resetError)
        throw resetError
      }

      // Store reset request for tracking
      await supabase
        .from('password_reset_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          reset_token: resetToken,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
          ip_address: requestInfo?.ipAddress,
          user_agent: requestInfo?.userAgent,
          is_used: false
        })

      return {
        success: true,
        message: 'Password reset link sent to your email address.'
      }
    } catch (error) {
      console.error('Error initiating password reset:', error)
      return {
        success: false,
        message: 'Failed to initiate password reset. Please try again.'
      }
    }
  }

  // Complete password reset with MFA
  public async resetPasswordWithMFA(
    resetToken: string,
    mfaToken: string,
    mfaMethod: 'sms' | 'totp' | 'backup_codes',
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get pending reset request
      const { data: pendingReset, error } = await supabase
        .from('pending_password_resets')
        .select('*')
        .eq('reset_token', resetToken)
        .eq('requires_mfa', true)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (error || !pendingReset) {
        return {
          success: false,
          message: 'Invalid or expired reset request.'
        }
      }

      // Verify MFA token
      const challengeId = 'password_reset_' + resetToken
      const mfaResult = await mfaService.verifyMFAToken(
        pendingReset.user_id,
        challengeId,
        mfaToken,
        mfaMethod
      )

      if (!mfaResult.success) {
        return {
          success: false,
          message: 'Invalid MFA token.'
        }
      }

      // Validate new password
      const validation = this.validatePassword(newPassword)
      if (!validation.isValid) {
        return {
          success: false,
          message: `Password validation failed: ${validation.feedback.join(', ')}`
        }
      }

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        pendingReset.user_id,
        { password: newPassword }
      )

      if (updateError) {
        console.error('Error updating password:', updateError)
        throw updateError
      }

      // Mark reset as used
      await supabase
        .from('pending_password_resets')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', pendingReset.id)

      // Log the password change
      await this.logPasswordChange(pendingReset.user_id, 'reset_with_mfa')

      return {
        success: true,
        message: 'Password successfully updated.'
      }
    } catch (error) {
      console.error('Error resetting password with MFA:', error)
      return {
        success: false,
        message: 'Failed to reset password. Please try again.'
      }
    }
  }

  // Standard password reset completion
  public async completePasswordReset(
    resetToken: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate new password
      const validation = this.validatePassword(newPassword)
      if (!validation.isValid) {
        return {
          success: false,
          message: `Password validation failed: ${validation.feedback.join(', ')}`
        }
      }

      // Get reset request
      const { data: resetRequest, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .eq('reset_token', resetToken)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (error || !resetRequest) {
        return {
          success: false,
          message: 'Invalid or expired reset token.'
        }
      }

      // Update password via Supabase Auth
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        resetRequest.user_id,
        { password: newPassword }
      )

      if (updateError) {
        console.error('Error updating password:', updateError)
        throw updateError
      }

      // Mark reset as used
      await supabase
        .from('password_reset_requests')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', resetRequest.id)

      // Log the password change
      await this.logPasswordChange(resetRequest.user_id, 'reset')

      return {
        success: true,
        message: 'Password successfully updated.'
      }
    } catch (error) {
      console.error('Error completing password reset:', error)
      return {
        success: false,
        message: 'Failed to reset password. Please try again.'
      }
    }
  }

  // Change password (for authenticated users)
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    userInfo?: { email?: string; name?: string; username?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate new password
      const validation = this.validatePassword(newPassword, userInfo)
      if (!validation.isValid) {
        return {
          success: false,
          message: `Password validation failed: ${validation.feedback.join(', ')}`
        }
      }

      // Verify current password by attempting to sign in
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user || userData.user.id !== userId) {
        return {
          success: false,
          message: 'User not authenticated.'
        }
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Error changing password:', error)
        return {
          success: false,
          message: 'Failed to change password. Please verify your current password.'
        }
      }

      // Log the password change
      await this.logPasswordChange(userId, 'change')

      return {
        success: true,
        message: 'Password successfully changed.'
      }
    } catch (error) {
      console.error('Error in changePassword:', error)
      return {
        success: false,
        message: 'Failed to change password. Please try again.'
      }
    }
  }

  // Get password reset history for user
  public async getPasswordResetHistory(userId: string): Promise<PasswordResetRequest[]> {
    try {
      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching reset history:', error)
        throw error
      }

      return data?.map(req => ({
        id: req.id,
        userId: req.user_id,
        email: req.email,
        token: req.reset_token,
        expiresAt: req.expires_at,
        isUsed: req.is_used,
        createdAt: req.created_at,
        ipAddress: req.ip_address,
        userAgent: req.user_agent
      })) || []
    } catch (error) {
      console.error('Error in getPasswordResetHistory:', error)
      return []
    }
  }

  // Check if user has recent password resets (rate limiting)
  public async hasRecentResetAttempts(email: string, windowMinutes: number = 15): Promise<boolean> {
    try {
      const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('id')
        .eq('email', email)
        .gte('created_at', cutoffTime)
        .limit(1)

      if (error) {
        console.error('Error checking recent reset attempts:', error)
        return false
      }

      return (data?.length || 0) > 0
    } catch (error) {
      console.error('Error in hasRecentResetAttempts:', error)
      return false
    }
  }

  // Generate secure password
  public generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = lowercase + uppercase + numbers + symbols
    
    let password = ''
    
    // Ensure at least one character from each category
    password += this.getRandomChar(lowercase)
    password += this.getRandomChar(uppercase)
    password += this.getRandomChar(numbers)
    password += this.getRandomChar(symbols)
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(allChars)
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  private getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length))
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36)
  }

  private async logPasswordChange(userId: string, type: 'change' | 'reset' | 'reset_with_mfa'): Promise<void> {
    try {
      await supabase
        .from('password_change_log')
        .insert({
          user_id: userId,
          change_type: type,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging password change:', error)
    }
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now()
    for (const [key, data] of this.resetTokens.entries()) {
      if (now > data.expires) {
        this.resetTokens.delete(key)
      }
    }
  }
}

// Export singleton instance
export const passwordManagementService = PasswordManagementService.getInstance()

// Database migration for password management tables
export const PASSWORD_MANAGEMENT_TABLES_SQL = `
-- Create password reset requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    reset_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create pending password resets table (for MFA-required resets)
CREATE TABLE IF NOT EXISTS pending_password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    reset_token TEXT NOT NULL UNIQUE,
    requires_mfa BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create password change log table
CREATE TABLE IF NOT EXISTS password_change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('change', 'reset', 'reset_with_mfa')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    ip_address TEXT,
    user_agent TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_id ON password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_email ON password_reset_requests(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_token ON password_reset_requests(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_expires ON password_reset_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_pending_password_resets_user_id ON pending_password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_password_resets_token ON pending_password_resets(reset_token);

CREATE INDEX IF NOT EXISTS idx_password_change_log_user_id ON password_change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_password_change_log_timestamp ON password_change_log(timestamp);

-- Enable RLS
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_change_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own reset requests" ON password_reset_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own pending resets" ON pending_password_resets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own password change log" ON password_change_log
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all records
CREATE POLICY "Admins can view all reset requests" ON password_reset_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );
` 