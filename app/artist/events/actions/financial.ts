export interface Expense {
  id: string
  eventId: string
  description: string
  amount: number
  date: string
  category: string
}

export interface Budget {
  id: string
  eventId: string
  name: string
  amount: number
  spent: number
}

export async function addExpense({ eventId, description, amount, category }: { eventId: string; description: string; amount: number; category: string }): Promise<{ data: Expense | null; error?: string }> {
  if (!eventId || !description || !amount || !category) return { data: null, error: 'Missing required fields' }
  return {
    data: {
      id: Math.random().toString(36).slice(2),
      eventId,
      description,
      amount,
      date: new Date().toISOString(),
      category,
    },
  }
}

export async function getExpenses({ eventId }: { eventId: string }): Promise<{ data: Expense[]; error?: string }> {
  if (!eventId) return { data: [], error: 'No eventId provided' }
  return {
    data: [
      { id: '1', eventId, description: 'Venue Rental', amount: 2000, date: '2024-06-01', category: 'Venue' },
      { id: '2', eventId, description: 'Sound Equipment', amount: 800, date: '2024-06-02', category: 'Equipment' },
    ],
  }
}

export async function addBudget({ eventId, name, amount }: { eventId: string; name: string; amount: number }): Promise<{ data: Budget | null; error?: string }> {
  if (!eventId || !name || !amount) return { data: null, error: 'Missing required fields' }
  return {
    data: {
      id: Math.random().toString(36).slice(2),
      eventId,
      name,
      amount,
      spent: 0,
    },
  }
}

export async function getBudgets({ eventId }: { eventId: string }): Promise<{ data: Budget[]; error?: string }> {
  if (!eventId) return { data: [], error: 'No eventId provided' }
  return {
    data: [
      { id: '1', eventId, name: 'Production', amount: 5000, spent: 2800 },
      { id: '2', eventId, name: 'Marketing', amount: 2000, spent: 500 },
    ],
  }
} 