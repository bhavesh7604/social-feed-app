"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { Comment, Profile } from "@/lib/types";

type ExtendedComment = Comment & { author?: Profile };

export default function CommentSection({
  postId,
  currentUser,
  initialComments,
}: {
  postId: string;
  currentUser: Profile;
  initialComments: ExtendedComment[];
}) {
  const supabase = createClient();
  const [comments, setComments] = useState<ExtendedComment[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const newComment = payload.new as Comment;
          // Skip our own optimistic insert duplicate
          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev;
            return [...prev, newComment];
          });

          // fetch author profile for display
          const { data: author } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newComment.user_id || (newComment as any).author_id)
            .single();

          if (author) {
            setComments((prev) =>
              prev.map((c) => (c.id === newComment.id ? { ...c, author } : c)),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: currentUser.id,
        content: text.trim(),
      })
      .select("*")
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, { ...data, author: currentUser }]);
      setText("");
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)]">
      <ul className="space-y-2.5">
        {comments.map((c) => (
          <li key={c.id} className="text-sm flex gap-2">
            <span className="font-medium">{c.author?.username ?? "…"}</span>
            <span className="text-[var(--ink-soft)]">{c.content}</span>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-[var(--ink-soft)] font-mono-meta">
            No comments yet — be first on the wire.
          </li>
        )}
      </ul>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--wire)]"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="text-xs font-mono-meta uppercase tracking-wide px-3 rounded-md bg-[var(--ink)] text-white disabled:opacity-40"
        >
          Post
        </button>
      </form>
    </div>
  );
}
