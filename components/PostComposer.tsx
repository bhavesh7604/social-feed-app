"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function PostComposer({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearImage() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    setError(null);

    let image_url: string | null = null;

    if (file) {
      const path = `${profile.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        setPosting(false);
        return;
      }
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      image_url = data.publicUrl;
    }

    const { error: insertError } = await supabase
      .from("posts")
      .insert({ author_id: profile.id, content: content.trim(), image_url });

    setPosting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setContent("");
    clearImage();
    // Realtime subscription on the feed picks up the new post automatically.
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's moving right now?"
        rows={3}
        maxLength={2000}
        className="w-full resize-none outline-none text-sm bg-transparent placeholder:text-[var(--ink-soft)]"
      />

      {preview && (
        <div className="relative mt-2 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected upload preview" className="max-h-56 rounded-md" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-[var(--ink)] text-white rounded-full p-1"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-[var(--signal)] font-mono-meta mt-2">{error}</p>}

      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[var(--ink-soft)] hover:text-[var(--wire)] transition"
          aria-label="Add image"
        >
          <ImagePlus size={18} strokeWidth={1.75} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="submit"
          disabled={!content.trim() || posting}
          className="text-xs font-mono-meta uppercase tracking-wide px-4 py-1.5 rounded-md bg-[var(--signal)] text-white disabled:opacity-40 hover:opacity-90 transition"
        >
          {posting ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
