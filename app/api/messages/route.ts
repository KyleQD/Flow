import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for database operations
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for service role')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper function to parse auth from cookies (same as social follow)
function parseAuthFromCookies(request: NextRequest): any | null {
  try {
    const cookies = request.headers.get('cookie') || ''
    const cookieArray = cookies.split(';').map(c => c.trim())
    
    const authCookie = cookieArray.find(cookie => 
      cookie.startsWith('sb-tourify-auth-token=')
    )
    
    if (!authCookie) {
      return null
    }

    const token = authCookie.split('=')[1]
    if (!token) {
      return null
    }

    const sessionData = JSON.parse(decodeURIComponent(token))
    
    if (sessionData?.user) {
      return sessionData.user
    }
    
    return null
  } catch (error) {
    console.error('Error parsing auth cookie:', error)
    return null
  }
}

// GET - Fetch conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const user = parseAuthFromCookies(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      // Fetch messages for a specific conversation
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          sender:profiles!sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
      }

      return NextResponse.json({ messages })
    } else {
      // Fetch all conversations for the user
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          participant_1,
          participant_2,
          last_message_id,
          participant_1_profile:profiles!participant_1 (
            id,
            username,
            full_name,
            avatar_url
          ),
          participant_2_profile:profiles!participant_2 (
            id,
            username,
            full_name,
            avatar_url
          ),
          last_message:messages!last_message_id (
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
      }

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const user = parseAuthFromCookies(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    const { recipientId, content } = await request.json()

    if (!recipientId || !content?.trim()) {
      return NextResponse.json({ 
        error: 'Recipient ID and message content are required' 
      }, { status: 400 })
    }

    if (recipientId === user.id) {
      return NextResponse.json({ 
        error: 'Cannot send message to yourself' 
      }, { status: 400 })
    }

    // Find or create conversation
    let { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`)
      .single()

    if (conversationError && conversationError.code === 'PGRST116') {
      // Conversation doesn't exist, create it
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: recipientId
        })
        .select('id')
        .single()

      if (createError || !newConversation) {
        console.error('Error creating conversation:', createError)
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      conversation = newConversation
    } else if (conversationError) {
      console.error('Error finding conversation:', conversationError)
      return NextResponse.json({ error: 'Failed to find conversation' }, { status: 500 })
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Failed to find or create conversation' }, { status: 500 })
    }

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: content.trim()
      })
      .select(`
        id,
        content,
        sender_id,
        created_at,
        sender:profiles!sender_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (messageError) {
      console.error('Error sending message:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message_id: message.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id)

    return NextResponse.json({ 
      success: true, 
      message,
      conversationId: conversation.id 
    })
  } catch (error) {
    console.error('Send message API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 