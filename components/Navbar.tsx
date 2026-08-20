// components/Navbar.tsx
"use client";

import Link from "next/link";
import { Bell, Compass, Home, LogOut, UserRound } from "lucide-react";
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
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-center px-4 sm:h-18">
          <Link
            href="/"
            className="group flex items-center gap-2"
            aria-label="Wire home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-tr from-pink-500 via-violet-500 to-indigo-600 text-sm font-black text-white shadow-[0_10px_20px_rgba(168,85,247,0.35)] transition group-hover:scale-105">
              W
            </div>
            <span className="text-xl font-black tracking-[-0.04em] text-slate-900">
              Wire
            </span>
          </Link>

          <div className="absolute right-4 flex items-center gap-1 sm:right-6">
            {profile?.id && <NotificationDropdown userId={profile.id} />}
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 shadow-[0_-12px_30px_-20px_rgba(15,23,42,0.3)] backdrop-blur-xl"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-18 max-w-2xl items-center justify-around px-5 pb-[env(safe-area-inset-bottom)] sm:h-20 sm:px-12">
          <Link href="/" className="bottom-nav-link">
            <Home size={21} strokeWidth={2.2} aria-hidden="true" />
            <span>Feed</span>
          </Link>
          <Link href="/discover" className="bottom-nav-link">
            <Compass size={22} strokeWidth={2.2} aria-hidden="true" />
            <span>Discover</span>
          </Link>
          <Link
            href={`/profile/${profile.username}`}
            className="bottom-nav-link"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-5.5 w-5.5 rounded-full object-cover"
              />
            ) : (
              <UserRound size={21} strokeWidth={2.2} aria-hidden="true" />
            )}
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
