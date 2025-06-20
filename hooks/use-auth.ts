import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: "venue" | "artist" | "worker"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // In a real app, this would fetch the user from your auth provider
    // For now, we'll use a mock user
    const mockUser: User = {
      id: "1",
      email: "venue@example.com",
      name: "Venue Owner",
      role: "venue"
    }

    // Simulate loading
    setTimeout(() => {
      setUser(mockUser)
      setIsLoading(false)
    }, 1000)
  }, [])

  const signOut = async () => {
    // In a real app, this would call your auth provider's sign out method
    setUser(null)
    router.push("/login")
  }

  return {
    user,
    isLoading,
    signOut
  }
} 