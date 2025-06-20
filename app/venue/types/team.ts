export type TeamRole = 'owner' | 'admin' | 'manager' | 'staff' | 'artist'

export interface TeamMember {
  id: string
  userId: string
  eventId: string
  role: TeamRole
  status: 'active' | 'pending' | 'inactive'
  joinedAt: string
  user: {
    id: string
    fullName: string
    email: string
    avatar?: string
  }
}

export interface TeamInvite {
  id: string
  eventId: string
  email: string
  role: TeamRole
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  expiresAt: string
}

export const TEAM_ROLES: Record<TeamRole, { label: string; description: string }> = {
  owner: {
    label: 'Owner',
    description: 'Full access to all event features and settings'
  },
  admin: {
    label: 'Admin',
    description: 'Can manage team members and event settings'
  },
  manager: {
    label: 'Manager',
    description: 'Can manage event details and team members'
  },
  staff: {
    label: 'Staff',
    description: 'Can view and manage assigned tasks'
  },
  artist: {
    label: 'Artist',
    description: 'Can view event details and communicate with team'
  }
} 