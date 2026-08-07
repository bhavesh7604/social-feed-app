// app/discover/page.tsx
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import FollowButton from '@/components/FollowButton'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export default async function DiscoverPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch all profiles except logged in user
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id)

  // Fetch who current user already follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingSet = new Set(follows?.map((f) => f.following_id) || [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar profile={profile} />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Discover People</h1>
          <p className="text-xs text-slate-500">
            Follow creators to personalize your live feed.
          </p>
        </div>

        <div className="space-y-3">
          {allProfiles?.map((p) => {
            const isFollowing = followingSet.has(p.id)

            return (
              <div
                key={p.id}
                className="glass-card p-4 rounded-2xl flex items-center justify-between"
              >
                <Link
                  href={`/profile/${p.username}`}
                  className="flex items-center gap-3 group"
                >
                  {p.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt={p.username}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                      {p.username?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h2 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {p.full_name || p.username}
                    </h2>
                    <p className="text-xs text-slate-400">@{p.username}</p>
                  </div>
                </Link>

                <FollowButton
                  targetUserId={p.id}
                  currentUserId={user.id}
                  initialIsFollowing={isFollowing}
                />
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}