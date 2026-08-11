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
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <span className="font-mono-meta text-xs uppercase tracking-widest text-(--wire)">
            Wire
          </span>
          <h1 className="font-display text-2xl mt-2">Check your inbox</h1>
          <p className="text-sm text-(--ink-soft) mt-1 max-w-sm">
            We sent a confirmation link to {email}. Confirm your email, then
            sign in.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 text-sm text-(--wire) underline underline-offset-2"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg mx-auto rounded-4xl border border-slate-200/80 bg-white/90 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.65)] backdrop-blur-xl p-8 sm:p-10">
        <div className="mb-10 text-center">
          <span className="inline-flex rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600 shadow-sm">
            Wire
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Join the feed
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Post, follow people, and watch it update live — all in one place.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1fr_0.4fr] sm:items-center sm:gap-8">
          <div className="rounded-[28px] bg-slate-950/95 p-6 text-white shadow-xl shadow-slate-900/10 ring-1 ring-white/20 sm:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Welcome aboard
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">
              Create your account
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Securely create your profile and start sharing moments with others
              in real time.
            </p>
          </div>

          <div className="rounded-[28px] bg-slate-50 p-6 shadow-[0_20px_80px_-35px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
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
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  placeholder="jane_doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  placeholder="At least 6 characters"
                />
              </div>

              {error && (
                <p className="rounded-3xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-3xl bg-linear-to-r from-fuchsia-500 via-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-slate-900 underline decoration-indigo-400 underline-offset-4 transition hover:text-indigo-700"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 text-center text-xs text-slate-500">
              <p>
                Made with <span aria-label="heart">❤️</span> in India
              </p>
              <p className="mt-1 font-medium text-slate-700">Bhavesh Mali</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
