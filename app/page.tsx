// app/page.tsx
import { createClient } from "@/lib/supabase/server";
import RealtimeFeed from "@/components/RealtimeFeed";
import PostComposer from "@/components/PostComposer";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Check authenticated user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch profile of the logged-in user
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // 3. Fetch list of user IDs that the current user follows
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = follows ? follows.map((f) => f.following_id) : [];
  const feedUserIds = [...followingIds, user.id];

  // 4. Fetch initial batch (first 5 posts) for Server-Side Rendering
  const { data: initialPosts, error } = await supabase
    .from("posts")
    .select("*, profiles(*), likes(*), comments(*)")
    .in("user_id", feedUserIds)
    .order("created_at", { ascending: false })
    .range(0, 4);

  if (error) {
    console.error("Error loading initial feed:", error);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#f8f7ff_0%,#f5f7fb_42%,#eef2ff_100%)] text-slate-900">
      <Navbar profile={profile} />

      <main className="mx-auto w-full max-w-xl space-y-6 px-4 py-6 sm:px-6">
        <div className="rounded-[30px] border border-white/60 bg-white/60 p-2 shadow-[0_25px_60px_-25px_rgba(79,70,229,0.18)] backdrop-blur-xl">
          <PostComposer profile={profile} />
        </div>

        <div className="space-y-4">
          <RealtimeFeed
            initialPosts={initialPosts || []}
            currentUser={profile}
          />
        </div>
      </main>
    </div>
  );
}
