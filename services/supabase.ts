import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) 
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) 
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw new Error(`Failed to fetch profile: ${error.message}`)
  
  // Transform the data to make it easier to use in components
  // Extract metadata fields to top level for backwards compatibility
  return {
    ...data,
    full_name: data.metadata?.full_name || data.full_name || null,
    username: data.metadata?.username || data.username || null,
    title: data.title || data.metadata?.title || null,
    bio: data.metadata?.bio || null,
    location: data.metadata?.location || null,
    phone: data.metadata?.phone || null,
    website: data.metadata?.website || null,
    instagram: data.metadata?.instagram || null,
    twitter: data.metadata?.twitter || null,
    cover_image: data.metadata?.header_url || null,
  }
}

export async function getVenueProfile(userId: string) {
  const { data, error } = await supabase
    .from('venue_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw new Error(`Failed to fetch venue profile: ${error.message}`)
  return data
}

export async function getArtistProfile(userId: string) {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw new Error(`Failed to fetch artist profile: ${error.message}`)
  return data
} 