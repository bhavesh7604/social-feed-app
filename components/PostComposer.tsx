// components/PostComposer.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

export default function PostComposer({ profile }: { profile: Profile }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setLoading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${profile.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.from("posts").insert({
        user_id: profile.id,
        content: content.trim() || null,
        image_url: imageUrl,
      });

      if (dbError) throw dbError;

      setContent("");
      setImageFile(null);
    } catch (err: any) {
      alert("Error creating post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-200/80">
      <form onSubmit={handlePost} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={2}
            className="w-full bg-transparent resize-none border-none focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {imageFile && (
          <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg text-xs text-slate-600">
            <span>📷 {imageFile.name}</span>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="text-slate-400 hover:text-rose-500 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer transition w-full sm:w-auto">
            <svg
              className="w-4 h-4"
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
            Add Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            type="submit"
            disabled={loading || (!content.trim() && !imageFile)}
            className="w-full sm:w-auto btn-gradient px-4 py-1.5 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
