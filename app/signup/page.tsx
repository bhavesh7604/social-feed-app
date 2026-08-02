"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <span className="font-mono-meta text-xs uppercase tracking-widest text-[var(--wire)]">
            Wire
          </span>
          <h1 className="font-display text-2xl mt-2">Check your inbox</h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-sm">
            We sent a confirmation link to {email}. Confirm your email, then sign in.
          </p>
          <Link href="/login" className="inline-block mt-4 text-sm text-[var(--wire)] underline underline-offset-2">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono-meta text-xs uppercase tracking-widest text-[var(--wire)]">
            Wire
          </span>
          <h1 className="font-display text-3xl mt-1">Join the feed</h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Post, follow people, watch it update live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono-meta text-xs uppercase tracking-wide text-[var(--ink-soft)]">
              Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              pattern="[a-zA-Z0-9_]+"
              title="Letters, numbers, and underscores only"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--wire)]"
              placeholder="jane_doe"
            />
          </div>
          <div>
            <label className="font-mono-meta text-xs uppercase tracking-wide text-[var(--ink-soft)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--wire)]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="font-mono-meta text-xs uppercase tracking-wide text-[var(--ink-soft)]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--wire)]"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--signal)] font-mono-meta">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--ink)] text-white py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-[var(--ink-soft)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--wire)] font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
