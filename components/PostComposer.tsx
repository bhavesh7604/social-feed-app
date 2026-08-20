// components/PostComposer.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

export default function PostComposer({ profile }: { profile: Profile }) {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    setLoading(true);

    try {
      let mediaUrl = null;

      if (mediaFile) {
        const fileExt = mediaFile.name.split(".").pop();
        const filePath = `${profile.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, mediaFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        mediaUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.from("posts").insert({
        user_id: profile.id,
        content: content.trim() || null,
        image_url: mediaUrl,
      });

      if (dbError) throw dbError;

      setContent("");
      setMediaFile(null);
    } catch (err: any) {
      alert("Error creating post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-linear-to-br from-white via-slate-50 to-violet-50 p-4 shadow-[0_20px_50px_-30px_rgba(79,70,229,0.25)]">
      <form onSubmit={handlePost} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-100 bg-linear-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-700">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={2}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white/80 px-3 py-3 text-sm text-slate-900 shadow-inner shadow-slate-100 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {mediaFile && (
          <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
            <span>
              {mediaFile.type.startsWith("video/") ? "Video" : "Image"}:{" "}
              {mediaFile.name}
            </span>
            <button
              type="button"
              onClick={() => setMediaFile(null)}
              className="font-bold text-slate-400 hover:text-rose-500"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600 sm:w-auto">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Add Image or Video
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            type="submit"
            disabled={loading || (!content.trim() && !mediaFile)}
            className="btn-gradient w-full cursor-pointer rounded-xl px-4 py-1.5 text-xs font-bold disabled:opacity-40 sm:w-auto"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
