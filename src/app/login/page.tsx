"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  KeyRound,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");

  const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isAdmin) {
        router.push(redirectParam || "/admin");
      } else {
        router.push(redirectParam || "/profile");
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, router, redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      setSuccessMsg("Signed in successfully! Redirecting...");

      setTimeout(() => {
        if (user.role === "ADMIN") {
          router.push(redirectParam || "/admin");
        } else {
          router.push(redirectParam || "/profile");
        }
      }, 600);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail("admin@aarticollection.com");
    setPassword("Admin@12345");
    setError(null);
  };

  const fillCustomerCredentials = () => {
    setEmail("customer@example.com");
    setPassword("Customer@12345");
    setError(null);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-200 p-8 sm:p-10">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-[#EFECE6] text-stone-800 text-xs font-semibold mb-3 border border-stone-200">
          Welcome Back
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Sign In to Aarti Collection
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          Access your account, orders, or store administrator console.
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-stone-900 hover:text-stone-700 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-sm shadow-card transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill */}
      <div className="mt-8 pt-6 border-t border-stone-200 text-xs text-stone-600 bg-[#FAF9F6] p-4 rounded-2xl space-y-3">
        <div className="font-semibold text-stone-800 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-stone-500" />
          <span>Quick 1-Click Demo Accounts:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-left transition-all cursor-pointer flex flex-col gap-0.5"
          >
            <span className="flex items-center gap-1 text-[11px] text-amber-700 font-extrabold uppercase">
              <Shield className="w-3 h-3" /> Admin Login
            </span>
            <span className="text-[10px] text-stone-500 font-normal truncate">admin@aarticollection.com</span>
          </button>

          <button
            type="button"
            onClick={fillCustomerCredentials}
            className="p-2 rounded-xl bg-white hover:bg-[#EFECE6] border border-stone-200 text-stone-800 font-semibold text-left transition-all cursor-pointer flex flex-col gap-0.5"
          >
            <span className="text-[11px] text-stone-700 font-bold uppercase">Customer Login</span>
            <span className="text-[10px] text-stone-500 font-normal truncate">customer@example.com</span>
          </button>
        </div>
      </div>

      {/* Dedicated Admin Portal Link */}
      <div className="mt-4 text-center">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:underline"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Switch to Dedicated Admin Portal</span>
        </Link>
      </div>

      {/* Switch to Register */}
      <div className="text-center mt-5 text-sm text-stone-600">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="font-semibold text-stone-900 hover:text-stone-700 hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
