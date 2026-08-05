// app/page.tsx
import { createClient } from '@/lib/supabase/server'
import RealtimeFeed from '@/components/RealtimeFeed'
import PostComposer from '@/components/PostComposer'
import Navbar from '@/components/Navbar'
import { redirect } from 'next/navigation'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Check authenticated user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch profile of the logged-in user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // 3. Fetch list of user IDs that the current user follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = follows ? follows.map((f) => f.following_id) : []
  const feedUserIds = [...followingIds, user.id]

  // 4. Fetch initial batch (first 5 posts) for Server-Side Rendering
  const { data: initialPosts, error } = await supabase
    .from('posts')
    .select('*, profiles(*), likes(*), comments(*)')
    .in('user_id', feedUserIds)
    .order('created_at', { ascending: false })
    .range(0, 4)

  if (error) {
    console.error('Error loading initial feed:', error)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar profile={profile} />
      
      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <PostComposer profile={profile} />

        <RealtimeFeed 
          initialPosts={initialPosts || []} 
          currentUser={profile} 
        />
      </main>
    </div>
  )
}