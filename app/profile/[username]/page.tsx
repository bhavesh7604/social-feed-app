// app/profile/[username]/page.tsx
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import MessageButton from "@/components/MessageButton";
import { notFound, redirect } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Target Profile
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!targetProfile) notFound();

  // Fetch posts by profile
  const { data: userPosts } = await supabase
    .from("posts")
    .select("*, profiles(*), likes(*), comments(*)")
    .eq("user_id", targetProfile.id)
    .order("created_at", { ascending: false });

  // Check follow status
  const { data: followRecord } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id)
    .eq("following_id", targetProfile.id)
    .single();

  const isFollowing = !!followRecord;
  const isOwnProfile = user.id === targetProfile.id;

  // Server Action to initiate or navigate to DM conversation

  async function handleStartChat() {
    "use server";
    const supabaseServer = await createClient();
    const {
      data: { user: authUser },
    } = await supabaseServer.auth.getUser();

    if (!authUser) return;

    // Find existing conversation between the two users
    const { data: myParticipants } = await supabaseServer
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", authUser.id);

    const myConvoIds = myParticipants?.map((p) => p.conversation_id) || [];

    let existingConvoId: string | null = null;

    if (myConvoIds.length > 0) {
      const { data: sharedParticipant } = await supabaseServer
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", targetProfile.id)
        .in("conversation_id", myConvoIds)
        .maybeSingle();

      if (sharedParticipant) {
        existingConvoId = sharedParticipant.conversation_id;
      }
    }

    let targetConvoId = existingConvoId;

    // If no existing conversation, create a new one
    if (!targetConvoId) {
      const { data: newConvo, error: convoError } = await supabaseServer
        .from("conversations")
        .insert([{ created_at: new Date().toISOString() }])
        .select()
        .single();

      if (convoError || !newConvo) {
        console.error("Database Error when creating conversation:", convoError);
        throw new Error(
          `Failed to create conversation: ${convoError?.message || "Unknown error"}`,
        );
      }

      targetConvoId = newConvo.id;

      // Add both users to conversation_participants
      const { error: participantError } = await supabaseServer
        .from("conversation_participants")
        .insert([
          { conversation_id: targetConvoId, user_id: authUser.id },
          { conversation_id: targetConvoId, user_id: targetProfile.id },
        ]);

      if (participantError) {
        console.error("Participant Error:", participantError);
        throw new Error(
          `Failed to add participants: ${participantError.message}`,
        );
      }
    }

    redirect(`/messages?conversationId=${targetConvoId}&view=chat`);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.1),transparent_28%),linear-gradient(180deg,#f8f7ff_0%,#f5f7fb_35%,#eef2ff_100%)] text-slate-900">
      <Navbar profile={currentUserProfile} />

      <main className="mx-auto w-full max-w-xl space-y-6 px-4 py-8 sm:px-6">
        {/* Profile Header Card */}
        <div className="rounded-4xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_28px_60px_-35px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {targetProfile.avatar_url ? (
              <img
                src={targetProfile.avatar_url}
                alt={targetProfile.username}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-500/10 shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-tr from-pink-500 via-violet-500 to-indigo-500 text-2xl font-black text-white shadow-md">
                {targetProfile.username?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-lg font-extrabold tracking-[-0.04em] text-slate-900 sm:text-xl">
                {targetProfile.full_name || targetProfile.username}
              </h1>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                @{targetProfile.username}
              </p>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                <FollowButton
                  targetUserId={targetProfile.id}
                  currentUserId={user.id}
                  initialIsFollowing={isFollowing}
                />

                <MessageButton action={handleStartChat} />
              </div>
            )}
          </div>

          {targetProfile.bio && (
            <p className="border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {targetProfile.bio}
            </p>
          )}

          <div className="flex gap-6 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
            <div>
              <span className="mr-1 font-extrabold text-slate-900">
                {userPosts?.length || 0}
              </span>
              posts
            </div>
          </div>
        </div>

        {/* User's Posts Feed */}
        <div className="space-y-4">
          <h2 className="px-1 text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
            Posts
          </h2>

          {userPosts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUserProfile}
            />
          ))}

          {(!userPosts || userPosts.length === 0) && (
            <p className="py-10 text-center text-xs text-slate-400">
              No posts shared yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
