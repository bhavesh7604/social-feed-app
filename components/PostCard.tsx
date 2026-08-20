// components/PostCard.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2 } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { createClient } from "@/lib/supabase/client";
import { Post, Profile } from "@/lib/types";

interface PostCardProps {
  post: Post;
  currentUser: Profile;
  onDeleted?: (postId: string) => void;
}

export default function PostCard({
  post,
  currentUser,
  onDeleted,
}: PostCardProps) {
  const profile = post.profiles;
  const supabase = createClient();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const isOwner = post.user_id === currentUser.id;
  const isVideo = /\.(mp4|webm|ogg|mov)(?:\?|$)/i.test(post.image_url || "");

  // Check if current user has already liked this post
  const isLikedByCurrentUser =
    post.likes?.some((like) => like.user_id === currentUser.id) || false;

  return (
    <div className="glass-card mb-5 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_22px_45px_-26px_rgba(15,23,42,0.22)]">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 p-4">
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

        {isOwner && (
          <div className="relative shrink-0">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label="Post options"
              title="Post options"
              onClick={() => {
                setMenuOpen((open) => !open);
                setDeleteError(null);
              }}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <MoreVertical size={18} aria-hidden="true" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-10 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmingDelete(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmingDelete && (
        <div className="border-t border-rose-100 bg-rose-50/70 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">
            Delete this post?
          </p>
          <p className="mt-1 text-xs text-slate-500">
            This action cannot be undone.
          </p>
          {deleteError && (
            <p className="mt-2 text-xs font-medium text-rose-600">
              {deleteError}
            </p>
          )}
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirmingDelete(false)}
              className="cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                setDeleteError(null);

                const { error } = await supabase
                  .from("posts")
                  .delete()
                  .eq("id", post.id)
                  .eq("user_id", currentUser.id);

                if (error) {
                  setDeleteError(
                    "Could not delete the post. Please try again.",
                  );
                  setDeleting(false);
                  return;
                }

                if (onDeleted) {
                  onDeleted(post.id);
                } else {
                  router.refresh();
                }
                setConfirmingDelete(false);
              }}
              className="cursor-pointer rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Post Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
          {post.content}
        </p>
      )}

      {/* Post Media */}
      {post.image_url && (
        <div className="w-full overflow-hidden border-y border-slate-100 bg-slate-100">
          {isVideo ? (
            <>
              <video
                src={post.image_url}
                controls
                playsInline
                preload="metadata"
                className="aspect-video max-h-125 w-full bg-slate-950 object-contain"
                onError={() => setMediaError(true)}
              />
              {mediaError && (
                <p className="px-4 py-3 text-xs text-slate-500">
                  This video format is not supported by this browser. Upload an
                  MP4 or WebM version to play it on desktop.
                </p>
              )}
            </>
          ) : (
            <img
              src={post.image_url}
              alt="Post media"
              className="h-auto max-h-125 w-full object-cover"
            />
          )}
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
