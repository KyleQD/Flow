import { createServerClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create server client
    const supabase = createServerClient()
    
    // Get upcoming events that need reminders
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .lte('date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // Next 24 hours
    
    if (error) {
      console.error('Error fetching events for reminders:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
    
    console.log(`Found ${events?.length || 0} events needing reminders`)
    
    // Process reminders here (implement your reminder logic)
    // This could include sending emails, push notifications, etc.
    
    return NextResponse.json({ 
      success: true, 
      eventsProcessed: events?.length || 0 
    })
  } catch (error) {
    console.error('Event reminders cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 