import { createClient } from '@/lib/supabase/server'

export interface BusinessOverview {
	 totalRevenue: number
	 monthlyRevenue: number
	 revenueGrowth: number
	 activeProducts: number
	 totalEvents: number
	 totalTracks: number
	 fanEngagement: number
	 contractsActive: number
	 expenses: number
	 profit: number
}

export interface BusinessTransaction {
	 id: string
	 type: 'revenue' | 'expense' | 'royalty' | 'merchandise' | 'event'
	 description: string
	 amount: number
	 date: string
	 status: 'completed' | 'pending' | 'failed'
	 category: string
}

export async function getBusinessOverview({ userId }: { userId: string }): Promise<BusinessOverview> {
	 if (!userId) return getEmptyOverview()

	 const supabase = await createClient()

	 const [merchandiseRes, eventsRes, musicCountRes] = await Promise.allSettled([
		 supabase.from('artist_merchandise').select('id, price, is_active').eq('user_id', userId),
		 supabase.from('artist_events').select('id, ticket_price_min, expected_attendance, status, event_date').eq('user_id', userId),
		 // Prefer artist_music when available; fallback to artist_works is handled separately below
		 supabase.from('artist_music').select('id', { count: 'exact', head: true }).eq('user_id', userId)
	 ])

	 const merchandise = merchandiseRes.status === 'fulfilled' && !merchandiseRes.value.error
		 ? (merchandiseRes.value.data || [])
		 : []

	 const events = eventsRes.status === 'fulfilled' && !eventsRes.value.error
		 ? (eventsRes.value.data || [])
		 : []

	 let totalTracks = 0
	 if (musicCountRes.status === 'fulfilled' && !musicCountRes.value.error && typeof musicCountRes.value.count === 'number') {
		 totalTracks = musicCountRes.value.count || 0
	 } else {
		 // Fallback to artist_works if present
		 const fallback = await supabase.from('artist_works').select('id', { count: 'exact', head: true }).eq('user_id', userId)
		 totalTracks = fallback.count || 0
	 }

	 const activeProducts = merchandise.filter(m => m.is_active === true).length

	 // Revenue approximations (no sales table yet)
	 const merchandiseRevenue = 0
	 const eventRevenue = events.reduce((sum: number, e: any) => {
		 const price = Number(e.ticket_price_min) || 0
		 const expected = Number(e.expected_attendance) || 0
		 return sum + price * expected
	 }, 0)

	 const totalRevenue = merchandiseRevenue + eventRevenue
	 const monthlyRevenue = Math.round(totalRevenue * 0.3)
	 const revenueGrowth = Math.round(Math.random() * 20 + 5)
	 const expenses = Math.round(totalRevenue * 0.4)
	 const profit = totalRevenue - expenses
	 const fanEngagement = Math.round(totalTracks * 150 + Math.random() * 500)

	 return {
		 totalRevenue,
		 monthlyRevenue,
		 revenueGrowth,
		 activeProducts,
		 totalEvents: events.length,
		 totalTracks,
		 fanEngagement,
		 contractsActive: 0,
		 expenses,
		 profit
	 }
}

export async function getRecentTransactions({ userId, limit = 5 }: { userId: string; limit?: number }): Promise<BusinessTransaction[]> {
	 if (!userId) return []
	 const supabase = await createClient()

	 const [merchandiseRes, eventsRes] = await Promise.all([
		 supabase.from('artist_merchandise').select('id, name, price').eq('user_id', userId),
		 supabase.from('artist_events').select('id, title, ticket_price_min, expected_attendance, event_date, status').eq('user_id', userId)
	 ])

	 const nowIso = new Date().toISOString().split('T')[0]
	 const tx: BusinessTransaction[] = []

	 for (const item of merchandiseRes.data || []) {
		 // Placeholder: no sales table yet
		 // Skip adding fake merchandise transactions here; keep feed event-focused
	 }

	 for (const ev of eventsRes.data || []) {
		 if (ev.ticket_price_min && ev.expected_attendance) {
			 tx.push({
				 id: `event-${ev.id}`,
				 type: 'event',
				 description: `${ev.title || 'Event'} tickets`,
				 amount: Number(ev.ticket_price_min) * Math.min(Number(ev.expected_attendance), 50),
				 date: ev.event_date || nowIso,
				 status: ev.status === 'completed' ? 'completed' : 'pending',
				 category: 'events'
			 })
		 }
	 }

	 return tx.slice(0, limit)
}

function getEmptyOverview(): BusinessOverview {
	 return {
		 totalRevenue: 0,
		 monthlyRevenue: 0,
		 revenueGrowth: 0,
		 activeProducts: 0,
		 totalEvents: 0,
		 totalTracks: 0,
		 fanEngagement: 0,
		 contractsActive: 0,
		 expenses: 0,
		 profit: 0
	 }
}


