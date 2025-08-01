"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMultiAccount } from '@/hooks/use-multi-account'
import { Card } from '@/components/ui/card'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { EnhancedNotificationCenter } from '@/components/notifications/enhanced-notification-center'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { currentAccount, accounts, isLoading, error } = useMultiAccount()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log('[Admin Layout] Access check - isAdmin:', isInAdminContext, 'hasAdminAccess:', hasAdminAccess, 'accounts:', accounts?.length)
      console.log('[Admin Layout] Available accounts:', accounts?.map(acc => `${acc.account_type} (${acc.profile_data?.display_name || acc.profile_data?.organization_name || 'No name'})`))
      console.log('[Admin Layout] Current account:', currentAccount?.account_type, 'loading:', isLoading)
    }
  }, [mounted, currentAccount, accounts, isLoading])

  // Check if user is in admin account context
  const isInAdminContext = currentAccount?.account_type === 'admin'
  
  // Check if user has any admin accounts available
  const hasAdminAccounts = accounts?.some(acc => acc.account_type === 'admin') || false
  
  // Allow access if user has admin accounts or is in admin context
  const hasAdminAccess = isInAdminContext || hasAdminAccounts

  // Show loading spinner while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-slate-700 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Event & Tour Management</h2>
          <p className="text-slate-400">Setting up your dashboard...</p>
        </Card>
      </div>
    )
  }

  // Show error if there's a critical error and no admin access
  if (error && !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-red-700 text-center max-w-md">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sign In
          </button>
        </Card>
      </div>
    )
  }

  // Redirect to create organizer account if no admin access
  if (!hasAdminAccess && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-amber-700 text-center max-w-md">
          <Shield className="h-8 w-8 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Admin Access Required</h2>
          <p className="text-slate-400 mb-4">You need an organizer account to access this area.</p>
          <button
            onClick={() => router.push('/create?type=admin')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Create Organizer Account
          </button>
        </Card>
      </div>
    )
  }

  // Get display info for admin user
  const adminAccount = accounts?.find(acc => acc.account_type === 'admin')
  const displayUser = {
    email: adminAccount?.profile_data?.email || currentAccount?.profile_data?.email || 'Event & Tour Organizer',
    adminLevel: adminAccount?.account_type || currentAccount?.account_type || 'organizer'
  }

  console.log('[Admin Layout] Allowing access - Admin account found:', !!adminAccount)

  // Render admin content
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Admin content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
} 