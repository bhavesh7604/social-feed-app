"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { MessageCircle } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import type { Post, Profile } from "@/lib/types";

export default function PostCard({
  post,
  currentUser,
  highlight,
}: {
  post: Post;
  currentUser: Profile;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 ${
        highlight ? "post-enter flash-highlight" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <Link
          href={`/profile/${post.author?.username}`}
          className="flex items-center gap-2 group"
        >
          <span className="w-7 h-7 rounded-full bg-[var(--wire-soft)] text-[var(--wire)] flex items-center justify-center text-xs font-medium">
            {post.author?.username?.[0]?.toUpperCase() ?? "?"}
          </span>
          <span className="text-sm font-medium group-hover:underline">
            {post.author?.username ?? "unknown"}
          </span>
        </Link>
        <time className="font-mono-meta text-[11px] text-[var(--ink-soft)]">
          {formatDistanceToNowStrict(new Date(post.created_at))} ago
        </time>
      </div>

      <p className="mt-2.5 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt="Post attachment"
          className="mt-3 rounded-md max-h-96 w-full object-cover"
        />
      )}

      <div className="flex items-center gap-4 mt-3">
        <LikeButton
          postId={post.id}
          userId={currentUser.id}
          initialLiked={!!post.liked_by_me}
          initialCount={post.like_count ?? 0}
        />
        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-1.5 text-xs font-mono-meta text-[var(--ink-soft)] hover:text-[var(--wire)] transition"
        >
          <MessageCircle size={15} strokeWidth={1.75} />
          {post.comment_count ?? 0}
        </Link>
      </div>
    </article>
  );
}
