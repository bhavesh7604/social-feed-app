// app/profile/[username]/page.tsx
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import FollowButton from '@/components/FollowButton'
import { notFound, redirect } from 'next/navigation'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Target Profile
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!targetProfile) notFound()

  // Fetch posts by profile
  const { data: userPosts } = await supabase
    .from('posts')
    .select('*, profiles(*), likes(*), comments(*)')
    .eq('user_id', targetProfile.id)
    .order('created_at', { ascending: false })

  // Check follow status
  const { data: followRecord } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', targetProfile.id)
    .single()

  const isFollowing = !!followRecord

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar profile={currentUserProfile} />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header Card */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-5">
            {targetProfile.avatar_url ? (
              <img
                src={targetProfile.avatar_url}
                alt={targetProfile.username}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/10 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center font-black text-2xl text-white shadow-md">
                {targetProfile.username?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="space-y-1 flex-1">
              <h1 className="text-xl font-extrabold text-slate-900">
                {targetProfile.full_name || targetProfile.username}
              </h1>
              <p className="text-xs font-semibold text-indigo-600">@{targetProfile.username}</p>
            </div>

            <FollowButton
              targetUserId={targetProfile.id}
              currentUserId={user.id}
              initialIsFollowing={isFollowing}
            />
          </div>

          {targetProfile.bio && (
            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              {targetProfile.bio}
            </p>
          )}

          <div className="flex gap-6 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <div>
              <span className="text-slate-900 font-extrabold mr-1">
                {userPosts?.length || 0}
              </span>
              posts
            </div>
          </div>
        </div>

        {/* User's Timeline */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            Posts
          </h2>

          {userPosts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUserProfile}
            />
          ))}

          {(!userPosts || userPosts.length === 0) && (
            <p className="text-center text-xs text-slate-400 py-10">
              No posts shared yet.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}