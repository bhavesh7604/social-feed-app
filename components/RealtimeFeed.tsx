"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PostCard from "@/components/PostCard";
import type { Post, Profile } from "@/lib/types";

export default function RealtimeFeed({
  initialPosts,
  currentUser,
  followedAuthorIds,
}: {
  initialPosts: Post[];
  currentUser: Profile;
  followedAuthorIds: string[];
}) {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [liveCount, setLiveCount] = useState(0);
  const followedSet = useRef(new Set(followedAuthorIds));

  useEffect(() => {
    followedSet.current = new Set(followedAuthorIds);
  }, [followedAuthorIds]);

  useEffect(() => {
    const channel = supabase
      .channel("feed:posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          const newPost = payload.new as Post;
          if (!followedSet.current.has(newPost.author_id)) return;

          const { data: author } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newPost.author_id)
            .single();

          setPosts((prev) => [
            {
              ...newPost,
              author,
              like_count: 0,
              comment_count: 0,
              liked_by_me: false,
            },
            ...prev,
          ]);
          setLiveCount((n) => n + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "likes" },
        (payload) => {
          const like = payload.new as { post_id: string; user_id: string };
          setPosts((prev) =>
            prev.map((p) =>
              p.id === like.post_id
                ? {
                    ...p,
                    like_count: (p.like_count ?? 0) + 1,
                    liked_by_me: like.user_id === currentUser.id ? true : p.liked_by_me,
                  }
                : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "likes" },
        (payload) => {
          const like = payload.old as { post_id: string; user_id: string };
          setPosts((prev) =>
            prev.map((p) =>
              p.id === like.post_id
                ? {
                    ...p,
                    like_count: Math.max(0, (p.like_count ?? 1) - 1),
                    liked_by_me: like.user_id === currentUser.id ? false : p.liked_by_me,
                  }
                : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const comment = payload.new as { post_id: string };
          setPosts((prev) =>
            prev.map((p) =>
              p.id === comment.post_id
                ? { ...p, comment_count: (p.comment_count ?? 0) + 1 }
                : p
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUser.id]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 font-mono-meta text-[11px] uppercase tracking-widest text-[var(--wire)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--wire)] live-dot" />
        Live feed{liveCount > 0 ? ` — ${liveCount} new since you arrived` : ""}
      </div>

      {posts.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
          <p className="font-display text-lg">Nothing on the wire yet</p>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Follow people or post something to get the feed moving.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} currentUser={currentUser} highlight={i === 0 && liveCount > 0} />
        ))}
      </div>
    </div>
  );
}
