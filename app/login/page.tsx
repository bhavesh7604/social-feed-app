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
    <div className="auth-shell">
      <div className="w-full max-w-sm sm:max-w-md glass-card rounded-3xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="inline-block text-lg sm:text-xl font-black uppercase tracking-[0.32em] text-indigo-800 bg-gradient-to-r from-indigo-200 via-white to-violet-200 px-5 py-2.5 rounded-full border border-indigo-300 shadow-[0_10px_25px_rgba(79,70,229,0.15)] drop-shadow-[0_2px_0_rgba(255,255,255,0.8)] transform hover:scale-[1.02] transition-all duration-200">
            WIRE
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to see what's happening on your feed.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full glass-input px-4 py-3 rounded-xl text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-3.5 rounded-xl text-sm shadow-sm hover:shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Redirect */}
        <div className="pt-4 border-t border-slate-100 text-center text-sm text-slate-500">
          New here?{" "}
          <Link
            href="/signup"
            className="font-bold text-indigo-600 hover:text-indigo-500 transition"
          >
            Create an account
          </Link>
        </div>

        <div className="text-center text-xs text-slate-500">
          <p>
            Made with <span aria-label="heart">❤️</span> in India
          </p>
          <p className="mt-1 font-medium text-slate-700">Bhavesh Mali</p>
        </div>
      </div>
    </div>
  );
}
