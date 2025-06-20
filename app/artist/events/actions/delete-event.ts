"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function deleteEvent(userId: string, eventId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('created_by', userId)

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`)
  }

  revalidatePath('/artist/events')
} 