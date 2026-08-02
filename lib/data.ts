import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post, Profile } from "@/lib/types";

export async function getFollowingIds(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  return (data ?? []).map((row) => row.following_id as string);
}

export async function getFeedPosts(
  supabase: SupabaseClient,
  userId: string,
  authorIds: string[]
): Promise<Post[]> {
  if (authorIds.length === 0) return [];

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, author:profiles(*), likes(count), comments(count)")
    .in("author_id", authorIds)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !posts) return [];

  const postIds = posts.map((p) => p.id);
  const { data: myLikes } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);

  const likedSet = new Set((myLikes ?? []).map((l) => l.post_id));

  return posts.map((p) => ({
    ...p,
    like_count: p.likes?.[0]?.count ?? 0,
    comment_count: p.comments?.[0]?.count ?? 0,
    liked_by_me: likedSet.has(p.id),
  }));
}

export async function getProfileByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("username", username).single();
  return data;
}
