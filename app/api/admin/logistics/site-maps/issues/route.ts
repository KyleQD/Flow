import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasEntityPermission } from '@/lib/services/rbac'
import type { CreateMapIssueRequest } from '@/types/site-map'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteMapId = searchParams.get('siteMapId')

    if (!siteMapId) {
      return NextResponse.json({ error: 'Site map ID is required' }, { status: 400 })
    }

    // Check permissions
    const hasPermission = await hasEntityPermission({
      userId: user.id,
      entityType: 'site_map',
      entityId: siteMapId,
      permission: 'read'
    })
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: issues, error } = await supabase
      .from('map_issues')
      .select(`
        *,
        assigned_to_user:profiles!assigned_to(full_name, username),
        reported_by_user:profiles!reported_by(full_name, username)
      `)
      .eq('site_map_id', siteMapId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching issues:', error)
      return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 })
    }

    return NextResponse.json(issues)
  } catch (error) {
    console.error('Error in issues GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateMapIssueRequest = await request.json()
    const { 
      siteMapId, 
      issueType, 
      severity, 
      title, 
      description, 
      x, 
      y, 
      assignedTo, 
      photos, 
      notes 
    } = body

    if (!siteMapId || !issueType || !severity || !title || x === undefined || y === undefined) {
      return NextResponse.json({ 
        error: 'Site map ID, issue type, severity, title, and coordinates are required' 
      }, { status: 400 })
    }

    // Check permissions
    const hasPermission = await hasEntityPermission({
      userId: user.id,
      entityType: 'site_map',
      entityId: siteMapId,
      permission: 'write'
    })
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: issue, error } = await supabase
      .from('map_issues')
      .insert({
        site_map_id: siteMapId,
        issue_type: issueType,
        severity,
        title,
        description,
        x,
        y,
        assigned_to: assignedTo,
        reported_by: user.id,
        photos,
        notes,
        status: 'open'
      })
      .select(`
        *,
        assigned_to_user:profiles!assigned_to(full_name, username),
        reported_by_user:profiles!reported_by(full_name, username)
      `)
      .single()

    if (error) {
      console.error('Error creating issue:', error)
      return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 })
    }

    return NextResponse.json(issue, { status: 201 })
  } catch (error) {
    console.error('Error in issues POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
