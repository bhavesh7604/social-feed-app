"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { username: normalizedUsername } },
    });

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("rate limit")) {
        setError(
          "Too many signup attempts. Please wait a few minutes and try again.",
        );
      } else if (error.message.toLowerCase().includes("password")) {
        setError("Please choose a stronger password and try again.");
      } else {
        setError(
          "We could not create your account. Please check your details and try again.",
        );
      }
      return;
    }

    if (data.user && data.user.identities?.length === 0) {
      setError("This email is already registered. Please sign in instead.");
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-4xl border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-900/10">
          <span className="inline-flex rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-600">
            Wire
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            Check your inbox
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            We sent a confirmation link to {email}. Confirm your email, then
            sign in.
          </p>
          <Link
            href="/login"
            className="inline-flex mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell py-12">
      <div className="w-full max-w-3xl rounded-[36px] border border-slate-200/80 bg-white/95 shadow-[0_40px_120px_-35px_rgba(15,23,42,0.2)] backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[36px] bg-linear-to-br from-indigo-700 via-violet-700 to-slate-900 p-10 text-white sm:p-14">
            <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -right-6 bottom-10 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-36 bg-linear-to-b from-white/10 to-transparent" />

            <span className="relative inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-sm">
              Welcome aboard
            </span>

            <h1 className="relative mt-8 text-4xl font-semibold tracking-tighter sm:text-5xl">
              Create your account
            </h1>

            <p className="relative mt-5 max-w-md text-sm leading-7 text-slate-200/90">
              Securely create your profile and start sharing moments with others
              in real time.
            </p>

            <div className="relative mt-10 space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
              <p className="text-base font-semibold tracking-[0.12em] text-white/90 uppercase">
                Why choose Wire?
              </p>
              <ul className="space-y-3 text-slate-200/85">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-300">
                    ✓
                  </span>
                  Real-time feed updates
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-300">
                    ✓
                  </span>
                  Clean mobile-ready design
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-300">
                    ✓
                  </span>
                  Easy signup and quick onboarding
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-[36px] bg-slate-50 p-8 sm:p-12">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-indigo-200 bg-linear-to-r from-indigo-100 via-white to-violet-100 px-4 py-2 text-xs font-black uppercase tracking-[0.38em] text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.12)]">
                Wire
              </span>
              <h2 className="mt-6 text-4xl font-semibold tracking-tighter text-slate-900">
                Join the feed
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Post, follow people, and watch it update live.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
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
                className="w-full rounded-3xl bg-linear-to-r from-fuchsia-500 via-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
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
