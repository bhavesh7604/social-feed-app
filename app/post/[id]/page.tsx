import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/data";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";
import type { Comment, Post } from "@/lib/types";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const currentProfile = await getProfileByUserId(supabase, user.id);
  if (!currentProfile) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select("*, author:profiles(*), likes(count), comments(count)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: myLike } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("post_id", id)
    .maybeSingle();

  const enrichedPost: Post = {
    ...post,
    like_count: post.likes?.[0]?.count ?? 0,
    comment_count: post.comments?.[0]?.count ?? 0,
    liked_by_me: !!myLike,
  };

  const { data: comments } = await supabase
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <Navbar profile={currentProfile} />
      <main className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4 sm:px-6">
        <PostCard post={enrichedPost} currentUser={currentProfile} />
        <div className="rounded-lg border border-(--border) bg-(--surface) p-4">
          <h2 className="font-mono-meta text-xs uppercase tracking-widest text-(--wire) mb-1">
            Comments
          </h2>
          <CommentSection
            postId={id}
            currentUser={currentProfile}
            initialComments={(comments ?? []) as Comment[]}
          />
        </div>
      </main>
    </div>
  );
}
