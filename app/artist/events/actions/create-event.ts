"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createEvent(userId: string, data: any) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('events')
    .insert({
      ...data,
      created_by: userId,
      tickets_sold: 0,
      revenue: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`)
  }

  revalidatePath('/artist/events')
} 