"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already authenticated as an Admin, redirect straight to admin dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      router.push("/admin");
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your admin email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email.trim(), password);

      if (user.role !== "ADMIN") {
        setError("Access denied. This account does not have administrator privileges.");
        return;
      }

      setSuccessMsg("Signed in successfully. Opening admin panel...");
      setTimeout(() => {
        router.push("/admin");
      }, 400);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0b0f19] flex items-center justify-center p-4 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans overflow-hidden relative">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-amber-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* Main Login Card - Compact, strictly no scrolling */}
      <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-slate-800 to-rose-500/20 border border-amber-500/30 text-amber-400 shadow-inner">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Admin Sign In
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to access Kalyan Kids administration
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-slate-300"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kalyankids.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/80 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-300"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/80 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded-md transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back to store link */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
