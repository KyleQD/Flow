import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, supabase } = auth

  const [profileRes, portfolioRes, expRes, certRes, endorsementsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('portfolio_items').select('*').eq('user_id', user.id).order('order_index', { ascending: true }),
    supabase.from('profile_experiences').select('*').eq('user_id', user.id).order('order_index', { ascending: true }),
    supabase.from('profile_certifications').select('*').eq('user_id', user.id).order('issue_date', { ascending: false }),
    supabase.from('skill_endorsements').select('skill').eq('endorsed_id', user.id)
  ])

  const profile = (profileRes as any).data
  const items = (portfolioRes as any).data || []
  const experiences = (expRes as any).data || []
  const certifications = (certRes as any).data || []
  const endorsements = (endorsementsRes as any).data || []

  const countMap: Record<string, number> = {}
  endorsements.forEach((e: any) => { countMap[e.skill] = (countMap[e.skill] || 0) + 1 })

  return NextResponse.json({ profile, items, experiences, certifications, endorsementCounts: countMap })
}


