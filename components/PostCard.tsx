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
    <div className="glass-card rounded-2xl border border-slate-200/80 mb-4 overflow-hidden">
      {/* Card Header */}
      <div className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/profile/${profile?.username}`}
          className="flex items-center gap-3 min-w-0 group"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
              {profile?.full_name || profile?.username}
            </h3>
            <p className="text-xs text-slate-400">@{profile?.username}</p>
          </div>
        </Link>
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm sm:text-base text-slate-800 leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Post Media */}
      {post.image_url && (
        <div className="w-full bg-slate-100 overflow-hidden border-y border-slate-100">
          <img
            src={post.image_url}
            alt="Post media"
            className="w-full h-auto max-h-125 object-cover"
          />
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100/60 bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-3">
          <LikeButton
            postId={post.id}
            userId={currentUser.id}
            initialLiked={isLikedByCurrentUser}
            initialCount={post.likes?.length || 0}
          />

          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            💬 <span>{post.comments?.length || 0}</span>
          </Link>
        </div>

        <span className="text-[10px] sm:text-xs font-medium text-slate-400">
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
