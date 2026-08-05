// components/RealtimeFeed.tsx
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PostCard from "@/components/PostCard";
import PostSkeleton from "@/components/PostSkeleton";
import { Post, Profile } from '@/lib/types'

const PAGE_SIZE = 5;

interface RealtimeFeedProps {
  initialPosts?: Post[];
  currentUser: Profile;
}

export default function RealtimeFeed({
  initialPosts = [],
  currentUser,
}: RealtimeFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE)
  const [loading, setLoading] = useState(false)

  const observerRef = useRef<HTMLDivElement | null>(null)
  const supabase = createClient()

  // Fetch next batch of posts
  const fetchMorePosts = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = follows ? follows.map((f) => f.following_id) : []
    const feedUserIds = [...followingIds, user.id]

    const start = page * PAGE_SIZE
    const end = start + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(*), likes(*), comments(*)')
      .in('user_id', feedUserIds)
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) {
      console.error('Error fetching more posts:', error)
    } else if (data) {
      if (data.length < PAGE_SIZE) setHasMore(false)
      setPosts((prev) => [...prev, ...data])
      setPage((prev) => prev + 1)
    }

    setLoading(false)
  }, [page, loading, hasMore, supabase])

  // Setup Realtime WebSocket Listener
  useEffect(() => {
    const channel = supabase
      .channel('realtime_feed_posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          const { data } = await supabase
            .from('posts')
            .select('*, profiles(*), likes(*), comments(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setPosts((prev) => [data, ...prev.filter((p) => p.id !== data.id)])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Infinite Scroll Trigger
  useEffect(() => {
    const target = observerRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMorePosts()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchMorePosts, hasMore])

  return (
    <div className="w-full">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUser={currentUser} 
        />
      ))}

      {loading && (
        <div className="mt-4">
          <PostSkeleton />
        </div>
      )}

      <div ref={observerRef} className="h-12 w-full" />

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-xs text-neutral-500 py-6">
          You've reached the end of the wire.
        </p>
      )}
    </div>
  )
}