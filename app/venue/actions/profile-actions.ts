'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.string().min(2, 'Type is required'),
  description: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  avatar: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
})

export async function updateVenueProfile(id: string, data: z.infer<typeof profileSchema>) {
  try {
    const validated = profileSchema.parse(data)
    // TODO: Replace with your actual DB update logic
    // await db.venue.update({ where: { id }, data: validated })
    revalidatePath('/venue')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.errors }
    }
    return { success: false, error: 'Failed to update profile' }
  }
} 