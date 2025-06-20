export interface TeamMember {
  id: string
  eventId: string
  name: string
  email: string
  role: string
  status: 'active' | 'pending'
}

export interface Task {
  id: string
  eventId: string
  title: string
  description: string
  assignedTo: string
  status: 'todo' | 'in-progress' | 'completed'
  dueDate: string
}

export async function inviteTeamMember({ eventId, name, email, role }: { eventId: string; name: string; email: string; role: string }): Promise<{ data: TeamMember | null; error?: string }> {
  if (!eventId || !name || !email || !role) return { data: null, error: 'Missing required fields' }
  return {
    data: {
      id: Math.random().toString(36).slice(2),
      eventId,
      name,
      email,
      role,
      status: 'pending',
    },
  }
}

export async function getTeamMembers({ eventId }: { eventId: string }): Promise<{ data: TeamMember[]; error?: string }> {
  if (!eventId) return { data: [], error: 'No eventId provided' }
  return {
    data: [
      { id: '1', eventId, name: 'Alex Johnson', email: 'alex@example.com', role: 'Manager', status: 'active' },
      { id: '2', eventId, name: 'Jamie Lee', email: 'jamie@example.com', role: 'Sound Engineer', status: 'pending' },
    ],
  }
}

export async function addTask({ eventId, title, description, assignedTo, dueDate }: { eventId: string; title: string; description: string; assignedTo: string; dueDate: string }): Promise<{ data: Task | null; error?: string }> {
  if (!eventId || !title || !assignedTo || !dueDate) return { data: null, error: 'Missing required fields' }
  return {
    data: {
      id: Math.random().toString(36).slice(2),
      eventId,
      title,
      description,
      assignedTo,
      status: 'todo',
      dueDate,
    },
  }
}

export async function getTasks({ eventId }: { eventId: string }): Promise<{ data: Task[]; error?: string }> {
  if (!eventId) return { data: [], error: 'No eventId provided' }
  return {
    data: [
      { id: '1', eventId, title: 'Book Venue', description: 'Confirm venue booking', assignedTo: '1', status: 'completed', dueDate: '2024-06-10' },
      { id: '2', eventId, title: 'Sound Check', description: 'Schedule sound check', assignedTo: '2', status: 'todo', dueDate: '2024-06-12' },
    ],
  }
} 