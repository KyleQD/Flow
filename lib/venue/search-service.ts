// Enhanced search service with more realistic functionality
import type { User } from "@/lib/types"
import { mockUsers } from "@/lib/mock-users"

// Extended user data with additional fields for search
interface ExtendedUser extends User {
  skills: string[]
  experience: number // years
}

// Mock extended user data
const extendedUsers: ExtendedUser[] = mockUsers.map((user) => ({
  ...user,
  skills: getRandomSkills(),
  experience: Math.floor(Math.random() * 20) + 1, // 1-20 years
}))

// Get random skills for a user
function getRandomSkills(): string[] {
  const allSkills = [
    "Tour Management",
    "Sound Engineering",
    "Lighting Design",
    "Event Production",
    "Artist Relations",
    "Stage Management",
    "Booking",
    "Promotion",
    "Marketing",
    "Venue Management",
    "Contract Negotiation",
    "Budget Planning",
    "Logistics Coordination",
    "Technical Direction",
    "Audio Mixing",
    "Video Production",
    "Social Media Management",
    "Talent Scouting",
    "Tour Accounting",
    "Merchandise Management",
  ]

  const numSkills = Math.floor(Math.random() * 8) + 3 // 3-10 skills
  const skills: string[] = []

  while (skills.length < numSkills) {
    const skill = allSkills[Math.floor(Math.random() * allSkills.length)]
    if (!skills.includes(skill)) {
      skills.push(skill)
    }
  }

  return skills
}

// Search users with advanced filters
export function searchUsers(
  query = "",
  filters: {
    location?: string
    title?: string
    skills?: string[]
    experienceRange?: [number, number]
    onlineOnly?: boolean
    sortBy?: "relevance" | "name" | "recent"
  } = {},
): User[] {
  let results = [...extendedUsers]

  // Basic search by query
  if (query.trim()) {
    const normalizedQuery = query.toLowerCase().trim()
    results = results.filter(
      (user) =>
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        user.username.toLowerCase().includes(normalizedQuery) ||
        (user.location && user.location.toLowerCase().includes(normalizedQuery)) ||
        (user.bio && user.bio.toLowerCase().includes(normalizedQuery)),
    )
  }

  // Filter by location
  if (filters.location && filters.location !== "any") {
    results = results.filter((user) => user.location && user.location.toLowerCase().includes(filters.location!.toLowerCase()))
  }

  // Filter by title - removed since title doesn't exist in ExtendedUser
  // if (filters.title && filters.title !== "any") {
  //   results = results.filter((user) => user.title.toLowerCase().includes(filters.title!.toLowerCase()))
  // }

  // Filter by skills
  if (filters.skills && filters.skills.length > 0) {
    results = results.filter((user) => filters.skills!.some((skill) => user.skills.includes(skill)))
  }

  // Filter by experience range
  if (filters.experienceRange) {
    const [min, max] = filters.experienceRange
    results = results.filter((user) => user.experience >= min && user.experience <= max)
  }

  // Filter by online status
  if (filters.onlineOnly) {
    results = results.filter((user) => user.isOnline)
  }

  // Sort results
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "name":
        results.sort((a, b) => a.fullName.localeCompare(b.fullName))
        break
      case "recent":
        results.sort((a, b) => new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime())
        break
      // For 'relevance', we keep the original order from the basic search
    }
  }

  return results
}

// Get user skills
export function getUserSkills(userId: string): string[] {
  const user = extendedUsers.find((u) => u.id === userId)
  return user ? user.skills : []
}

// Get user experience
export function getUserExperience(userId: string): number {
  const user = extendedUsers.find((u) => u.id === userId)
  return user ? user.experience : 0
}

// Get all available skills
export function getAllSkills(): string[] {
  return [
    "Tour Management",
    "Sound Engineering",
    "Lighting Design",
    "Event Production",
    "Artist Relations",
    "Stage Management",
    "Booking",
    "Promotion",
    "Marketing",
    "Venue Management",
    "Contract Negotiation",
    "Budget Planning",
    "Logistics Coordination",
    "Technical Direction",
    "Audio Mixing",
    "Video Production",
    "Social Media Management",
    "Talent Scouting",
    "Tour Accounting",
    "Merchandise Management",
  ]
}

// Get all available locations
export function getAllLocations(): string[] {
  return [
    "Los Angeles, CA",
    "New York, NY",
    "Nashville, TN",
    "Austin, TX",
    "Miami, FL",
    "Chicago, IL",
    "Atlanta, GA",
    "Seattle, WA",
    "Portland, OR",
    "Denver, CO",
    "Las Vegas, NV",
    "New Orleans, LA",
    "Boston, MA",
    "Philadelphia, PA",
    "San Francisco, CA",
  ]
}

// Get all available titles
export function getAllTitles(): string[] {
  return [
    "Tour Manager",
    "Sound Engineer",
    "Lighting Designer",
    "Event Producer",
    "Artist Manager",
    "Stage Manager",
    "Booking Agent",
    "Promoter",
    "Marketing Manager",
    "Venue Manager",
    "Production Coordinator",
    "Technical Director",
    "Front of House Engineer",
    "Monitor Engineer",
    "Tour Accountant",
    "Merchandise Manager",
    "Social Media Manager",
    "Talent Scout",
    "A&R Representative",
    "Music Director",
  ]
}
