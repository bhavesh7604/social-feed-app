// lib/types.ts

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  updated_at?: string
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string | null
  image_url: string | null
  created_at: string
  profiles?: Profile
  likes?: Like[]
  comments?: Comment[]
}