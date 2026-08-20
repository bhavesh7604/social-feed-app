// app/messages/page.tsx
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import ChatThread from "@/components/ChatThread";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversationId?: string; view?: string }>;
}) {
  const { conversationId, view } = await searchParams;
  const directChat = view === "chat";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all conversations for current user
  const { data: userParticipants } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  const conversationIds = userParticipants?.map((p) => p.conversation_id) || [];

  // Fetch participants of those conversations (excluding current user)
  const { data: conversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id, profiles!user_id(*)")
    .in(
      "conversation_id",
      conversationIds.length
        ? conversationIds
        : ["00000000-0000-0000-0000-000000000000"],
    )
    .neq("user_id", user.id);

  const activeConversation = conversations?.find(
    (c) => c.conversation_id === conversationId,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar profile={profile} />

      <main
        className={`w-full mx-auto px-4 py-6 sm:px-6 ${
          directChat ? "max-w-3xl" : "max-w-3xl"
        }`}
      >
        {/* Conversations Sidebar */}
        {!directChat && (
          <div className="glass-card rounded-2xl border border-slate-200/80 p-4 space-y-3 min-h-[40vh] md:min-h-150 overflow-y-auto">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Messages
            </h2>

            <div className="space-y-1">
              {conversations?.map((item) => {
                const partner = item.profiles as unknown as Profile | null;
                const isActive = item.conversation_id === conversationId;

                return (
                  <Link
                    key={item.conversation_id}
                    href={`/messages?conversationId=${item.conversation_id}&view=chat`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition ${
                      isActive
                        ? "bg-indigo-50 border border-indigo-100"
                        : "hover:bg-slate-100/60"
                    }`}
                  >
                    {partner?.avatar_url ? (
                      <img
                        src={partner.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                        {partner?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {partner?.full_name || partner?.username}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        @{partner?.username}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {(!conversations || conversations.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-10">
                  No active conversations yet. Visit a user's profile to message
                  them!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chat Thread Area */}
        {directChat && conversationId && activeConversation && (
          <div>
            <Link
              href="/messages"
              className="mb-3 inline-flex text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
            >
              ← All messages
            </Link>
            <ChatThread
              conversationId={conversationId}
              currentUserId={user.id}
              recipientProfile={
                activeConversation.profiles as unknown as Profile
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
