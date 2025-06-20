export interface Media {
  type: "image" | "video"
  url: string
}

export interface Author {
  id: string
  display_name: string
  username: string
  profile_picture_url: string
}

export interface Post {
  id: string
  content: string
  author: Author
  created_at: string
  media_urls?: string[]
  likes_count: number
  comments_count: number
  is_liked_by_user: boolean
}

export interface PostFormData {
  content: string
  media_urls: string[]
  author_id: string
}

export type PostFilter = "all" | "trending" | "media" | "events" 