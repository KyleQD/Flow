export interface Campaign {
  id: string
  eventId: string
  name: string
  status: 'draft' | 'active' | 'completed'
  createdAt: string
}

export interface PromoCode {
  id: string
  eventId: string
  code: string
  discount: number
  usageCount: number
}

export async function addCampaign({ eventId, name }: { eventId: string; name: string }): Promise<{ data: Campaign | null; error?: string }> {
  // TODO: Replace with real API call or Supabase integration
  if (!eventId || !name) return { data: null, error: 'Missing eventId or name' }
  return {
    data: {
      id: Math.random().toString(36).slice(2),
      eventId,
      name,
      status: 'draft',
      createdAt: new Date().toISOString(),
    },
  }
}

export async function getCampaigns({ eventId }: { eventId: string }): Promise<{ data: Campaign[]; error?: string }> {
  // TODO: Replace with real API call or Supabase integration
  if (!eventId) return { data: [], error: 'No eventId provided' }
  return {
    data: [
      { id: '1', eventId, name: 'Early Bird Promo', status: 'active', createdAt: '2024-06-01T10:00:00Z' },
      { id: '2', eventId, name: 'VIP Launch', status: 'draft', createdAt: '2024-06-05T12:00:00Z' },
    ],
  }
}

export async function addPromoCode({ eventId, code, discount }: { eventId: string; code: string; discount: number }): Promise<{ data: PromoCode | null; error?: string }> {
  // TODO: Replace with real API call or Supabase integration
  if (!eventId || !code || !discount) return { data: null, error: 'Missing required fields' }
  return {
    data: {
      id: Math.random().toString(36).slice(2),
      eventId,
      code,
      discount,
      usageCount: 0,
    },
  }
} 