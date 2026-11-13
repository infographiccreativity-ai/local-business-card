
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
async function handleForgotPassword() {
  if (!email) {
    setMessage("Please enter your email address first.");
    return;
  }

  setLoading(true);
  setMessage("");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
  });

  setLoading(false);

  if (error) {
    setMessage(error.message);
  } else {
    setMessage("Password recovery email sent. Please check your inbox.");
  }
}

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/my-business";
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Business Owner Login
        </h1>

        <p className="mt-2 text-slate-600">
          Sign in to manage your business profile.
        </p>
<button
  type="button"
  onClick={handleForgotPassword}
  disabled={loading}
  className="mt-4 w-full text-sm font-medium text-blue-700 hover:underline"
>
  Forgot Password?
</button>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-3"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-3"
              placeholder="Enter your password"
            />
          </div>

          {message && (
            <p role="alert" className="text-sm text-red-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}