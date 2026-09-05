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
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          My Account Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details, role privileges, and Kalyan Kids account settings.
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-rose-500/20 mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
          <p className="text-xs text-slate-500 mb-4">{user.email}</p>

          <div className="w-full flex items-center justify-center gap-2 mb-6">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                user.role === "ADMIN"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {user.role} ACCOUNT
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Active
            </span>
          </div>

          <div className="w-full pt-6 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined: {joinDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>User ID: #{user.id}</span>
            </div>
          </div>

          <div className="w-full mt-6 space-y-2">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Shield className="w-4 h-4" />
                Open Admin Console
              </Link>
            )}

            <Link
              href="/account/orders"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4 text-rose-400" />
              View My Orders
            </Link>

            <button
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Details & Edit Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Account Information</h3>
              <p className="text-xs text-slate-500">View and update your personal details.</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                Edit Name
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Display Name
              </label>
              {isEditing ? (
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm text-slate-900 transition-all"
                  />
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium border border-slate-100">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email Address (Primary)
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 text-slate-500 text-sm font-medium border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Verified</span>
              </div>
            </div>

            {/* Role & Privileges */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Role & Access Privileges
              </label>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span>Role:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                    {user.role}
                  </span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  {user.role === "ADMIN"
                    ? "You have full administrator privileges to create, update, and delete categories and products, and manage inventory."
                    : "You are a customer. You can browse all kids categories, filter products, and manage your account details."}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-3 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium text-sm shadow-md shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
