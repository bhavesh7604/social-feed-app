// components/FollowButton.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FollowButtonProps {
  targetUserId: string
  currentUserId: string
  initialIsFollowing: boolean
  onFollowToggle?: (isFollowing: boolean) => void
}

export default function FollowButton({
  targetUserId,
  currentUserId,
  initialIsFollowing,
  onFollowToggle,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Don't render button if viewing own profile
  if (targetUserId === currentUserId) return null

  const handleToggleFollow = async () => {
    if (loading) return
    setLoading(true)

    // Optimistic UI update
    const nextState = !isFollowing
    setIsFollowing(nextState)

    try {
      if (nextState) {
        // Follow target user
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: targetUserId })

        if (error) throw error
      } else {
        // Unfollow target user
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)

        if (error) throw error
      }

      if (onFollowToggle) onFollowToggle(nextState)
    } catch (err: any) {
      // Revert optimistic update on failure
      setIsFollowing(!nextState)
      console.error('Follow toggle error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`px-5 py-2 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 ${
        isFollowing
          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          : 'btn-gradient shadow-sm hover:shadow-md'
      }`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}