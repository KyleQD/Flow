'use server'

import { revalidatePath } from 'next/cache'
import { EventFormData } from '../components/create-event-modal'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Create Supabase client per function to avoid top-level await issues

const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  ticketPrice: z.number().min(0, "Ticket price must be 0 or more"),
  isPublic: z.boolean(),
  status: z.string(),
  type: z.string(),
})

export async function updateEvent(eventData: EventFormData) {
  try {
    const supabase = await createClient()
    // Validate the event data
    const validatedData = eventSchema.parse(eventData)
    await supabase.from('events').update({
      title: validatedData.title,
      description: validatedData.description,
      date: validatedData.date.toISOString(),
      time: validatedData.startTime,
      capacity: validatedData.capacity,
      type: validatedData.type
    }).eq('id', validatedData.id)
    
    // Revalidate the venue page to show updated data
    revalidatePath('/venue')
    
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      }
    }
    return { 
      success: false, 
      error: 'Failed to update event' 
    }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const supabase = await createClient()
    await supabase.from('events').delete().eq('id', eventId)
    
    // Revalidate the venue page to show updated data
    revalidatePath('/venue')
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to delete event' 
    }
  }
}

export async function uploadEventDocument(eventId: string, file: File) {
  try {
    // Placeholder: hook to storage later
    
    // Revalidate the venue page to show updated data
    revalidatePath('/venue')
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to upload document' 
    }
  }
} 

// Approve booking request and optionally create event (for venue EDM nights etc.)
const approveSchema = z.object({
  requestId: z.string().uuid(),
  createEvent: z.boolean().default(true)
})

export async function approveBookingAndMaybeCreateEvent(input: { requestId: string; createEvent?: boolean }) {
  const supabase = await createClient()
  const { requestId, createEvent } = approveSchema.parse(input)
  // Use RPC to approve
  const { error: rpcError } = await supabase.rpc('respond_to_booking_request', { p_request_id: requestId, p_status: 'approved', p_response_message: null })
  if (rpcError) return { success: false, error: rpcError.message }

  // Fetch the request for details
  const { data: req, error: fetchErr } = await supabase.from('venue_booking_requests').select('*').eq('id', requestId).single()
  if (fetchErr || !req) return { success: false, error: fetchErr?.message || 'Request not found' }

  let createdEventId: string | null = null
  if (createEvent) {
    const { data: evt, error: evtErr } = await supabase.from('events').insert([{ 
      title: req.event_name,
      description: req.description,
      date: req.event_date,
      time: '19:00',
      location: 'Venue',
      type: req.event_type,
      capacity: req.expected_attendance || 0,
      user_id: req.requester_id,
      venue_id: req.venue_id,
      genre: req.genre
    }]).select('id').single()
    if (evtErr) return { success: false, error: evtErr.message }
    createdEventId = evt?.id ?? null
  }

  revalidatePath('/venue/bookings')
  revalidatePath('/venue')
  return { success: true, eventId: createdEventId }
}