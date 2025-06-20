export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          role: string
          display_name: string | null
          username: string | null
          email: string | null
          phone: string | null
          profile_picture_url: string | null
          cover_image_url: string | null
          location: string | null
          website_url: string | null
          bio: string | null
          genres: string[] | null
          tags: string[] | null
          availability: Record<string, unknown> | null
          links: Record<string, unknown> | null
          resume_url: string | null
          services_offered: string[] | null
          tech_rider_url: string | null
          hospitality_rider_url: string | null
          is_profile_public: boolean
          notifications_enabled: boolean
          dark_mode: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          full_name: string
          avatar_url: string | null
          website: string | null
          email: string
          is_artist: boolean
          is_venue: boolean
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
          media_urls: string[]
          likes_count: number
          comments_count: number
          shares_count: number
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'created_at' | 'likes_count' | 'comments_count' | 'shares_count'>
        Update: Partial<Database['public']['Tables']['posts']['Row']>
      }
      post_likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_likes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['post_likes']['Row']>
      }
      artist_profiles: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          artist_name: string
          bio: string | null
          genres: string[]
          social_links: {
            platform: string
            url: string
          }[]
          profile_image: string | null
          cover_image: string | null
          verified: boolean
        }
        Insert: Omit<Database['public']['Tables']['artist_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['artist_profiles']['Row']>
      }
      venue_profiles: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          venue_name: string
          description: string | null
          address: {
            street: string
            city: string
            state: string
            postal_code: string
            country: string
          }
          capacity: number
          amenities: string[]
          images: string[]
          contact_email: string
          contact_phone: string | null
          verified: boolean
        }
        Insert: Omit<Database['public']['Tables']['venue_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['venue_profiles']['Row']>
      }
      onboarding: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          completed: boolean
          current_step: number
          profile_type: 'artist' | 'venue'
        }
        Insert: Omit<Database['public']['Tables']['onboarding']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['onboarding']['Row']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 