import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user, supabase } = auth

    const { data: items, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching portfolio items:', error)
      return NextResponse.json({ error: 'Failed to fetch portfolio items' }, { status: 500 })
    }

    return NextResponse.json({ items: items || [] })
  } catch (error) {
    console.error('Portfolio GET error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user, supabase } = auth

    const body = await request.json()
    const { type, title, description, media = [], links = [] } = body

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 })
    }

    const { data: item, error } = await supabase
      .from('portfolio_items')
      .insert({
        user_id: user.id,
        type,
        title,
        description,
        media,
        links,
        is_public: true, // Ensure portfolio items are public by default
        order_index: 0
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating portfolio item:', error)
      return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Portfolio POST error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user, supabase } = auth

    const body = await request.json()
    const { id, type, title, description, media, links } = body

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: existingItem } = await supabase
      .from('portfolio_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingItem) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (media !== undefined) updateData.media = media
    if (links !== undefined) updateData.links = links

    const { data: item, error } = await supabase
      .from('portfolio_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating portfolio item:', error)
      return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Portfolio PUT error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateApiRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { user, supabase } = auth

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: existingItem } = await supabase
      .from('portfolio_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingItem) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting portfolio item:', error)
      return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Portfolio DELETE error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}


