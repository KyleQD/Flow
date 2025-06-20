'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { EventFormData } from '../components/create-event-modal'

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
    // Validate the event data
    const validatedData = eventSchema.parse(eventData)

    // TODO: Replace with your actual database update logic
    // Example: await db.event.update({ where: { id: eventData.id }, data: validatedData })
    
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
    // TODO: Replace with your actual database delete logic
    // Example: await db.event.delete({ where: { id: eventId } })
    
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
    // TODO: Replace with your actual file upload logic
    // Example: await uploadToStorage(file)
    // Example: await db.eventDocument.create({ data: { eventId, fileUrl } })
    
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