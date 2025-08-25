import type { User } from "./types"

export async function searchUsers(query: string): Promise<User[]> {
  // Mock implementation - in a real app, this would call an API
  const mockUsers: User[] = [
    {
      id: "1",
      username: "johndoe",
      fullName: "John Doe",
      avatar: "/avatars/john.jpg",
      bio: "Music producer and DJ",
      location: "Los Angeles, CA",
      isOnline: true,
      lastSeen: new Date().toISOString(),
    },
    {
      id: "2",
      username: "janedoe",
      fullName: "Jane Doe",
      avatar: "/avatars/jane.jpg",
      bio: "Singer and songwriter",
      location: "New York, NY",
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
    },
  ]

  // Filter users based on query
  return mockUsers.filter(user => 
    user.username.toLowerCase().includes(query.toLowerCase()) ||
    user.fullName.toLowerCase().includes(query.toLowerCase())
  )
}
