export interface ArtistSocialIntegration {
  id: string
  user_id: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok'
  account_handle: string
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  is_connected: boolean
  last_sync: string | null
  analytics: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ConnectRequest {
  platform: ArtistSocialIntegration['platform']
  account_handle: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
}


