"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMultiAccount } from '@/hooks/use-multi-account'
import { Card } from '@/components/ui/card'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { EnhancedNotificationCenter } from '@/components/notifications/enhanced-notification-center'
import './globals.css'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { currentAccount, accounts, isLoading, error } = useMultiAccount()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted) {
      console.log('[Admin Layout] Access check - isAdmin:', isInAdminContext, 'hasAdminAccess:', hasAdminAccess, 'accounts:', accounts?.length)
      console.log('[Admin Layout] Available accounts:', accounts?.map(acc => `${acc.account_type} (${acc.profile_data?.display_name || acc.profile_data?.organization_name || 'No name'})`))
      console.log('[Admin Layout] Current account:', currentAccount?.account_type, 'loading:', isLoading)
    }
  }, [mounted, currentAccount, accounts, isLoading])

  const isInAdminContext = currentAccount?.account_type === 'admin'
  const hasAdminAccounts = accounts?.some(acc => acc.account_type === 'admin') || false
  const hasAdminAccess = isInAdminContext || hasAdminAccounts

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center">
        <Card className="admin-metric-card p-8 text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Event & Tour Management</h2>
          <p className="text-slate-400">Setting up your dashboard...</p>
        </Card>
      </div>
    )
  }

  if (error && !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center">
        <Card className="admin-metric-card border-red-700 text-center max-w-md">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button onClick={() => router.push('/login')} className="admin-btn-futuristic px-4 py-2">Sign In</button>
        </Card>
      </div>
    )
  }

  if (!hasAdminAccess && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center">
        <Card className="admin-metric-card border-amber-700 text-center max-w-md">
          <Shield className="h-8 w-8 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Admin Access Required</h2>
          <p className="text-slate-400 mb-4">You need an organizer account to access this area.</p>
          <button onClick={() => router.push('/create?type=admin')} className="admin-btn-futuristic px-4 py-2">Create Organizer Account</button>
        </Card>
      </div>
    )
  }

  console.log('[Admin Layout] Allowing access - Admin account found:', !!accounts?.find(acc => acc.account_type === 'admin'))

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">
      <main className="min-h-screen admin-content">
        {children}
      </main>
      <EnhancedNotificationCenter />
    </div>
  )
} 