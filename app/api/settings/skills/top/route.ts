import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function PUT(request: NextRequest) {
  const auth = await authenticateApiRequest(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, supabase } = auth

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.top_skills)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const topSkills: string[] = body.top_skills
  if (topSkills.length > 6) return NextResponse.json({ error: 'Max 6 top skills' }, { status: 400 })

  // Ensure top_skills are subset of user's skills if skills exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('skills')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.skills && Array.isArray(profile.skills)) {
    const skillSet = new Set<string>(profile.skills)
    const invalid = topSkills.filter(s => !skillSet.has(s))
    if (invalid.length) return NextResponse.json({ error: 'Top skills must be from your skills list' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ top_skills: topSkills, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}


