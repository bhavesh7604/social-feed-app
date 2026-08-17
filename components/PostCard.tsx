// components/PostCard.tsx
"use client";

import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import { Post, Profile } from "@/lib/types";

interface PostCardProps {
  post: Post;
  currentUser: Profile;
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const profile = post.profiles;

  // Check if current user has already liked this post
  const isLikedByCurrentUser =
    post.likes?.some((like) => like.user_id === currentUser.id) || false;

  return (
    <div className="glass-card mb-5 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_22px_45px_-26px_rgba(15,23,42,0.22)]">
      {/* Card Header */}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/profile/${profile?.username}`}
          className="group flex min-w-0 items-center gap-3"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/20 transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-100 bg-linear-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-700">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900 transition group-hover:text-indigo-600">
              {profile?.full_name || profile?.username}
            </h3>
            <p className="text-xs text-slate-400">@{profile?.username}</p>
          </div>
        </Link>
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          {post.content}
        </p>
      )}

      {/* Post Media */}
      {post.image_url && (
        <div className="w-full overflow-hidden border-y border-slate-100 bg-slate-100">
          <img
            src={post.image_url}
            alt="Post media"
            className="h-auto max-h-125 w-full object-cover"
          />
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 border-t border-slate-100/70 bg-linear-to-r from-slate-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <LikeButton
            postId={post.id}
            userId={currentUser.id}
            initialLiked={isLikedByCurrentUser}
            initialCount={post.likes?.length || 0}
          />

          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
          >
            💬 <span>{post.comments?.length || 0}</span>
          </Link>
        </div>

        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
          {new Date(post.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
