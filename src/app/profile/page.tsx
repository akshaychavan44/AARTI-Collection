"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Edit2,
  Save,
  Package,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    } else if (user) {
      setName(user.name);
    }
  }, [loading, isAuthenticated, user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      await updateProfile(name.trim());
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
          <span className="text-sm font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          My Account Profile
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Manage your personal details and account settings.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1">{message}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-stone-900 flex items-center justify-center text-white text-3xl font-bold shadow-card mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-stone-900">{user.name}</h2>
          <p className="text-xs text-stone-500 mb-6">{user.email}</p>

          <div className="w-full pt-4 border-t border-stone-100 text-left text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>Joined: {joinDate}</span>
            </div>
          </div>

          <div className="w-full mt-6 space-y-2">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Shield className="w-4 h-4" />
                Open Admin Console
              </Link>
            )}

            <Link
              href="/account/orders"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-card"
            >
              <Package className="w-4 h-4 text-stone-300" />
              View My Orders
            </Link>

            <button
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Details & Edit Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-stone-100 mb-6">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Account Information</h3>
              <p className="text-xs text-stone-500">View and update your personal details.</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-[#EFECE6] text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                Edit Name
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name);
                }}
                className="text-xs font-semibold text-stone-500 hover:text-stone-700 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Display Name
              </label>
              {isEditing ? (
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-sm text-stone-900 transition-all bg-[#FAF9F6]"
                  />
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#FAF9F6] text-stone-900 text-sm font-medium border border-stone-200">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Email Address (Primary)
              </label>
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] text-stone-600 text-sm font-medium border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span>{user.email}</span>
                </div>
                <span className="text-[11px] font-semibold text-stone-400">Verified</span>
              </div>
            </div>


            {isEditing && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-3 px-6 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-sm shadow-card transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
