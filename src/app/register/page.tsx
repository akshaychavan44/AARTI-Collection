"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect to profile
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      setSuccessMsg("Account created successfully! Taking you to your profile...");
      setTimeout(() => {
        router.push("/profile");
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-200 p-8 sm:p-10">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-[#EFECE6] text-stone-800 text-xs font-semibold mb-3 border border-stone-200">
            Join Aarti Collection
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Create Your Account
          </h1>
          <p className="text-sm text-stone-600 mt-2">
            Enjoy seamless shopping for boys & girls clothing up to age 16.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Patel"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-sm text-stone-900 placeholder:text-stone-400 transition-all bg-[#FAF9F6]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-sm text-stone-900 placeholder:text-stone-400 transition-all bg-[#FAF9F6]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Password (min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-sm text-stone-900 placeholder:text-stone-400 transition-all bg-[#FAF9F6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Confirm Password
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-sm shadow-card transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Switch to Login */}
        <div className="text-center mt-6 text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-stone-900 hover:text-stone-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
