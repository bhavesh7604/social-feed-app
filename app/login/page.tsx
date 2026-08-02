"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono-meta text-xs uppercase tracking-widest text-[var(--wire)]">
            Wire
          </span>
          <h1 className="font-display text-3xl mt-1">Welcome back</h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Sign in to see what&apos;s moving on the feed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--wire)]"
              placeholder="••••••••"
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center text-[var(--ink-soft)] mt-6">
          New here?{" "}
          <Link href="/signup" className="text-[var(--wire)] font-medium underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
