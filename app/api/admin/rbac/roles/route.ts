import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/api-auth'

export const dynamic = 'force-dynamic'

export const GET = withAuth(async (_request: NextRequest, { supabase }) => {
  try {
    const isEntityRbacEnabled = process.env.FEATURE_ENTITY_RBAC === '1'
    if (!isEntityRbacEnabled) return NextResponse.json({ roles: [] })

    const { data, error } = await supabase
      .from('rbac_roles')
      .select('id, name, display_name, scope_type, is_system, description')
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ roles: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load roles' }, { status: 500 })
  }
})


