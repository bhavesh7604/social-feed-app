// components/Navbar.tsx
"use client";

import Link from "next/link";
import { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import NotificationDropdown from "@/components/NotificationDropdown";

export default function Navbar({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/75 backdrop-blur-xl shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)]">
      <div className="mx-auto flex max-w-xl flex-col justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center md:h-16">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-tr from-pink-500 via-violet-500 to-indigo-600 text-sm font-black text-white shadow-[0_10px_20px_rgba(168,85,247,0.35)] transition group-hover:scale-105">
            W
          </div>
          <span className="bg-linear-to-r from-slate-900 via-slate-700 to-indigo-600 bg-clip-text text-xl font-black tracking-[-0.04em] text-transparent">
            Wire
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
          >
            Feed
          </Link>
          <Link
            href="/discover"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
          >
            Discover
          </Link>

          {/* Live Notification Dropdown */}
          {profile?.id && <NotificationDropdown userId={profile.id} />}

          {/* User Profile Avatar Link */}
          <Link
            href={`/profile/${profile.username}`}
            className="ml-1 flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-violet-100 text-xs font-bold text-indigo-700">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="ml-0 cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 sm:ml-2"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
