"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/reset-password", {
        token: token.trim(),
        newPassword,
      });

      setSuccessMsg(res.message || "Password has been successfully reset! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired or already been used.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-200 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#EFECE6] text-stone-800 flex items-center justify-center mx-auto mb-3 border border-stone-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Set New Password
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            Create a secure password for your Aarti Collection account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reset Token */}
          <div>
            <label htmlFor="token" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Reset Token
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your reset token here"
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-sm font-mono text-stone-900 placeholder:text-stone-400 transition-all bg-[#FAF9F6]"
            />
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              New Password (min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-sm text-stone-900 placeholder:text-stone-400 transition-all bg-[#FAF9F6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-sm text-stone-900 placeholder:text-stone-400 transition-all bg-[#FAF9F6]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-sm shadow-card transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm">
          <Link href="/login" className="font-semibold text-stone-900 hover:text-stone-700 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading reset form...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
