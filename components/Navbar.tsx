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
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
      <div className="max-w-xl mx-auto px-4 py-3 md:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition">
            W
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Wire
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            Feed
          </Link>
          <Link
            href="/discover"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            Discover
          </Link>

          {/* Live Notification Dropdown */}
          {profile?.id && <NotificationDropdown userId={profile.id} />}

          {/* User Profile Avatar Link */}
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition ml-1"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition ml-0 sm:ml-2 cursor-pointer"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
