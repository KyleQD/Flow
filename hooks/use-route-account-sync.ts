import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useMultiAccount } from './use-multi-account'
import { useAuth } from '@/contexts/auth-context'

/**
 * Hook that automatically syncs the active account with the current route
 * Ensures the correct account type is shown in the account switcher based on the current page
 */
export function useRouteAccountSync() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { currentAccount, userAccounts, switchAccount } = useMultiAccount()

  useEffect(() => {
    if (!user || !userAccounts.length || !currentAccount) return

    // Determine the expected account type based on the current route
    let expectedAccountType: string | null = null
    
    if (pathname.startsWith('/artist')) {
      expectedAccountType = 'artist'
    } else if (pathname.startsWith('/venue')) {
      expectedAccountType = 'venue'
    } else if (pathname.startsWith('/admin')) {
      expectedAccountType = 'admin'
    } else {
      expectedAccountType = 'general'
    }

    // If we're on a specific account type route but not in that account mode
    if (expectedAccountType && currentAccount.account_type !== expectedAccountType) {
      // Find the account of the expected type
      const targetAccount = userAccounts.find(account => 
        account.account_type === expectedAccountType && account.is_active
      )

      if (targetAccount) {
        // Automatically switch to the appropriate account
        console.log(`Auto-switching to ${expectedAccountType} account for route ${pathname}`)
        switchAccount(targetAccount.profile_id, targetAccount.account_type)
      } else if (expectedAccountType !== 'general') {
        // If user doesn't have the required account type, redirect to create it
        console.log(`User doesn't have ${expectedAccountType} account, redirecting to create`)
        router.push(`/create?type=${expectedAccountType}&redirect=${encodeURIComponent(pathname)}`)
      }
    }
  }, [pathname, currentAccount, userAccounts, switchAccount, router, user])

  // Return current route context info
  return {
    isArtistRoute: pathname.startsWith('/artist'),
    isVenueRoute: pathname.startsWith('/venue'),
    isAdminRoute: pathname.startsWith('/admin'),
    expectedAccountType: pathname.startsWith('/artist') ? 'artist' 
                      : pathname.startsWith('/venue') ? 'venue'
                      : pathname.startsWith('/admin') ? 'admin'
                      : 'general',
    isCorrectAccount: currentAccount?.account_type === (
      pathname.startsWith('/artist') ? 'artist' 
      : pathname.startsWith('/venue') ? 'venue'
      : pathname.startsWith('/admin') ? 'admin'
      : 'general'
    )
  }
} 