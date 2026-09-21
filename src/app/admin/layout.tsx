"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  PackageCheck,
  Users,
  Tag,
  Store,
  LogOut,
  Shield,
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Allow public access to the admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 1. Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <span className="text-sm font-medium">Verifying administrator access...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin Sign In Required</h1>
          <p className="text-xs text-slate-500">
            Please sign in with an authorized store administrator account to access this section.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Sign In to Admin Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated customer without ADMIN role
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-red-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your account ({user?.email}) does not have store administrator privileges. Admin pages are restricted to Aarti Collection managers.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors text-center"
            >
              Return to Store
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Links
  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Products", href: "/admin/products", icon: ShoppingBag },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders", href: "/admin/orders", icon: PackageCheck },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
  ];

  const isNavActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname ? pathname.startsWith(href) : false;
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs font-bold text-base">
              A
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                Aarti Collection
              </div>
              <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                Admin Console
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isNavActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-rose-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-400" />
              <span>Customer Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Admin User Info Pill */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-bold text-slate-900 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Aarti Collection Admin</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 sticky top-[57px] z-30 shadow-md">
          {navItems.map((item) => {
            const active = isNavActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Link
              href="/"
              prefetch={true}
              onClick={() => setMobileNavOpen(false)}
              className="flex-1 py-2 text-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Storefront
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                logout();
              }}
              className="py-2 px-4 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area with Top Navbar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Navbar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
              Aarti Collection Store Administration
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>View Storefront</span>
            </Link>

            {/* Admin Button with Dropdown Menu */}
            <div className="relative" ref={adminMenuRef}>
              <button
                type="button"
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                aria-expanded={adminMenuOpen}
                aria-label="Admin account menu"
              >
                <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-[10px] text-white font-bold">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <span>Admin</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    adminMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {adminMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                        Store Administrator
                      </p>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/"
                      onClick={() => setAdminMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>Customer Storefront</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Logout / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
