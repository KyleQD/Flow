"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/auth/admin'
import { useMultiAccount } from '@/hooks/use-multi-account'
import { Card } from '@/components/ui/card'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { adminUser, loading, error, isAdmin } = useAdminAuth()
  const { currentAccount, accounts } = useMultiAccount()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log('[Admin Layout] Authentication Status:')
      console.log('- isAdmin:', isAdmin)
      console.log('- adminUser:', adminUser)
      console.log('- currentAccount:', currentAccount)
      console.log('- available accounts:', accounts?.map(acc => `${acc.account_type} (${acc.profile_data?.display_name || acc.profile_data?.organization_name || 'No name'})`))
      console.log('- loading:', loading)
      console.log('- error:', error)
    }
  }, [mounted, isAdmin, adminUser, currentAccount, accounts, loading, error])

  // Check if user is in admin account context
  const isInAdminContext = currentAccount?.account_type === 'admin'
  
  // TEMPORARILY ALLOW ALL AUTHENTICATED USERS - Remove restrictions for now
  // Allow access if user exists (either through adminUser or having any accounts)
  const hasAdminAccess = !!adminUser || !!accounts?.length || isAdmin || isInAdminContext

  console.log('[Admin Layout] Access check - isAdmin:', isAdmin, 'isInAdminContext:', isInAdminContext, 'hasAdminAccess:', hasAdminAccess, 'adminUser:', !!adminUser, 'accounts:', accounts?.length)

  // Show loading spinner while checking auth
  if (!mounted || loading) {
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

  // Show error only if there's a critical authentication error AND no fallback access
  if (error && !hasAdminAccess && !adminUser) {
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

  // TEMPORARILY DISABLED - Always allow access for authenticated users
  // We're keeping the account type identification but removing access restrictions
  console.log('[Admin Layout] Allowing access - Restrictions temporarily disabled')

  // Get display info for admin user
  const displayUser = adminUser || {
    email: currentAccount?.profile_data?.email || 'Event & Tour Organizer',
    adminLevel: currentAccount?.account_type || 'organizer'
  }

  // Render admin content for all authenticated users (restrictions removed)
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Admin header bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-purple-500" />
            <span className="text-white font-medium">Event & Tour Management</span>
            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
              {displayUser.adminLevel?.toUpperCase() || 'ORGANIZER'}
            </span>
          </div>
          <div className="text-sm text-slate-400">
            {displayUser.email}
          </div>
        </div>
      </div>

      {/* Admin content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
} 