import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFollowingIds, getProfileByUserId } from "@/lib/data";
import Navbar from "@/components/Navbar";
import FollowButton from "@/components/FollowButton";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileByUserId(supabase, user.id);
  if (!profile) redirect("/login");

  const followingIds = await getFollowingIds(supabase, user.id);
  const followingSet = new Set(followingIds);

  const { data: people } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl mb-4">Find people</h1>
        <div className="space-y-2">
          {(people ?? []).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <Link href={`/profile/${p.username}`} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--wire-soft)] text-[var(--wire)] flex items-center justify-center text-xs font-medium">
                  {p.username[0]?.toUpperCase()}
                </span>
                <span className="text-sm font-medium">{p.username}</span>
              </Link>
              <FollowButton
                targetUserId={p.id}
                currentUserId={user.id}
                initialFollowing={followingSet.has(p.id)}
              />
            </div>
          ))}
          {(people ?? []).length === 0 && (
            <p className="text-sm text-[var(--ink-soft)]">No one else has joined yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
