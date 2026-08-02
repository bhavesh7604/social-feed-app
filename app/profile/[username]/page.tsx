import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId, getProfileByUsername } from "@/lib/data";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import type { Post } from "@/lib/types";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const currentProfile = await getProfileByUserId(supabase, user.id);
  if (!currentProfile) redirect("/login");

  const viewedProfile = await getProfileByUsername(supabase, username);
  if (!viewedProfile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, author:profiles(*), likes(count), comments(count)")
    .eq("author_id", viewedProfile.id)
    .order("created_at", { ascending: false });

  const { data: myLikes } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", user.id);
  const likedSet = new Set((myLikes ?? []).map((l) => l.post_id));

  const enrichedPosts: Post[] = (posts ?? []).map((p) => ({
    ...p,
    like_count: p.likes?.[0]?.count ?? 0,
    comment_count: p.comments?.[0]?.count ?? 0,
    liked_by_me: likedSet.has(p.id),
  }));

  const [{ count: followerCount }, { count: followingCount }, { data: isFollowingRow }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", viewedProfile.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", viewedProfile.id),
      supabase
        .from("follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", viewedProfile.id)
        .maybeSingle(),
    ]);

  return (
    <div>
      <Navbar profile={currentProfile} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="w-14 h-14 rounded-full bg-[var(--wire-soft)] text-[var(--wire)] flex items-center justify-center text-xl font-medium">
              {viewedProfile.username[0]?.toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-2xl">{viewedProfile.username}</h1>
              {viewedProfile.bio && (
                <p className="text-sm text-[var(--ink-soft)] mt-0.5">{viewedProfile.bio}</p>
              )}
              <p className="font-mono-meta text-xs text-[var(--ink-soft)] mt-1">
                {followerCount ?? 0} followers · {followingCount ?? 0} following
              </p>
            </div>
          </div>
          <FollowButton
            targetUserId={viewedProfile.id}
            currentUserId={user.id}
            initialFollowing={!!isFollowingRow}
          />
        </div>

        <div className="mt-6 space-y-3">
          {enrichedPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentProfile} />
          ))}
          {enrichedPosts.length === 0 && (
            <p className="text-sm text-[var(--ink-soft)] font-mono-meta">No posts yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
