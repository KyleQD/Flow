"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  )
}

export const createClient = () => {
  try {
    return createClientComponentClient<Database>({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      },
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createClient>

// Export a function to get the instance
export function getSupabase() {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient()
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      throw error
    }
  }
  return supabaseInstance
}

// For backward compatibility
export const supabase = getSupabase()
