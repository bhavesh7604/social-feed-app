"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
}: {
  targetUserId: string;
  currentUserId: string;
  initialFollowing: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  if (targetUserId === currentUserId) return null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);

    if (next) {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: targetUserId });
      if (error) setFollowing(false);
    } else {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId);
      if (error) setFollowing(true);
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className={`px-3 py-1.5 rounded-md text-xs font-mono-meta uppercase tracking-wide border transition ${
        following
          ? "border-[var(--border)] text-[var(--ink-soft)] hover:border-[var(--signal)] hover:text-[var(--signal)]"
          : "border-[var(--ink)] bg-[var(--ink)] text-white hover:opacity-90"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
