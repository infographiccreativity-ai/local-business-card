
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully! You can now sign in.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Reset Your Password
        </h1>

        <p className="mt-2 text-slate-600">
          Choose a new password for your business owner account.
        </p>

        <form onSubmit={handleReset} className="mt-8 space-y-5">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-3"
            />
          </div>

          {message && (
            <p role="status" className="text-sm text-slate-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Updating password..." : "Save New Password"}
          </button>
        </form>
      </div>
    </main>
  );
}