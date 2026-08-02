"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LikeButton({
  postId,
  userId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  userId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const supabase = createClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    if (nextLiked) {
      const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId });
      if (error) {
        setLiked(false);
        setCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      if (error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 text-xs font-mono-meta transition ${
        liked ? "text-[var(--signal)]" : "text-[var(--ink-soft)] hover:text-[var(--signal)]"
      }`}
    >
      <Heart size={15} fill={liked ? "var(--signal)" : "none"} strokeWidth={1.75} />
      {count}
    </button>
  );
}
