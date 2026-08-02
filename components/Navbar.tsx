"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function Navbar({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--signal)] live-dot" />
          <span className="font-display text-lg tracking-tight">Wire</span>
        </Link>

        <nav className="flex items-center gap-4 font-mono-meta text-xs uppercase tracking-wide">
          <Link href="/" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition">
            Feed
          </Link>
          {profile && (
            <Link
              href={`/profile/${profile.username}`}
              className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
            >
              {profile.username}
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="text-[var(--ink-soft)] hover:text-[var(--signal)] transition"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
