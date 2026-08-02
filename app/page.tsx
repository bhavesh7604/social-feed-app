import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFeedPosts, getFollowingIds, getProfileByUserId } from "@/lib/data";
import Navbar from "@/components/Navbar";
import PostComposer from "@/components/PostComposer";
import RealtimeFeed from "@/components/RealtimeFeed";
import Link from "next/link";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfileByUserId(supabase, user.id);
  if (!profile) redirect("/login");

  const followingIds = await getFollowingIds(supabase, user.id);
  const feedAuthorIds = [user.id, ...followingIds];
  const posts = await getFeedPosts(supabase, user.id, feedAuthorIds);

  return (
    <div>
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <PostComposer profile={profile} />

        {followingIds.length === 0 && (
          <p className="text-sm text-[var(--ink-soft)] font-mono-meta">
            You&apos;re not following anyone yet.{" "}
            <Link href="/discover" className="text-[var(--wire)] underline underline-offset-2">
              Find people
            </Link>{" "}
            to build your feed.
          </p>
        )}

        <RealtimeFeed
          initialPosts={posts}
          currentUser={profile}
          followedAuthorIds={feedAuthorIds}
        />
      </main>
    </div>
  );
}
