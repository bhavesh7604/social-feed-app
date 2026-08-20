// lib/types.ts

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  updated_at?: string
}
export type UserProfile = Profile

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
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

// Add these exports to lib/types.ts

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  profiles?: Profile
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  conversation_participants?: ConversationParticipant[]
  last_message?: Message
}