// app/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="auth-shell py-10">
      <div className="w-full max-w-md rounded-[30px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_35px_80px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex rounded-full border border-indigo-200 bg-linear-to-r from-indigo-100 via-white to-violet-100 px-5 py-2.5 text-base font-black uppercase tracking-[0.38em] text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.12)] sm:text-lg">
            WIRE
          </span>
          <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900 sm:text-4xl">
            Welcome back
          </h1>
          <p className="text-sm leading-6 text-slate-500">
            Sign in to see what's happening on your feed.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-linear-to-r from-fuchsia-500 via-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Redirect */}
        <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-slate-900 underline decoration-indigo-400 underline-offset-4 transition hover:text-indigo-700"
          >
            Create an account
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
  );
}
