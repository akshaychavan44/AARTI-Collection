"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ShoppingCart,
  Heart,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Package,
  ChevronDown,
  Shield,
} from "lucide-react";

function DesktopNavLinks({
  navLinks,
}: {
  navLinks: { name: string; href: string }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gender = searchParams?.get("gender");
  const ageGroup = searchParams?.get("ageGroup");

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/products") return pathname === "/products" && !gender && !ageGroup;
    if (href === "/products?gender=BOYS") return pathname === "/products" && gender === "BOYS";
    if (href === "/products?gender=GIRLS") return pathname === "/products" && gender === "GIRLS";
    if (href === "/products?ageGroup=0-2") return pathname === "/products" && ageGroup === "0-2";
    return pathname === href;
  };

  return (
    <nav className="hidden lg:flex items-center gap-1.5 ml-6">
      {navLinks.map((link) => {
        const isActive = isLinkActive(link.href);
        return (
          <Link
            key={link.name}
            href={link.href}
            prefetch={true}
            className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-[#1e1e24] text-white shadow-card font-bold"
                : "text-[#1e1e24]/75 hover:text-[#1e1e24] hover:bg-[#f6efe2]"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Do not render consumer storefront navbar on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop All", href: "/products" },
    { name: "Boys Wear", href: "/products?gender=BOYS" },
    { name: "Girls Wear", href: "/products?gender=GIRLS" },
    { name: "Infants (0–2Y)", href: "/products?ageGroup=0-2" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full bg-[#fffdfa] shadow-xs">
      {/* Main Solid Navbar - Pushed fully to Left */}
      <header className="doodle-nav bg-[#fffdfa] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between h-20 items-center">
            {/* Left Group: Company Logo & Nav Links firmly on the Left */}
            <div className="flex items-center">
              <Link href="/" prefetch={true} className="flex items-center shrink-0 group py-1">
                <img
                  src="/brand-logo.png"
                  alt="आरती Collection Kids Wear"
                  className="h-14 sm:h-16 md:h-16 w-auto max-w-[230px] sm:max-w-[290px] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Desktop Navigation Links next to Company Name */}
              <Suspense
                fallback={
                  <nav className="hidden lg:flex items-center gap-1.5 ml-6">
                    {navLinks.map((link) => (
                      <span
                        key={link.name}
                        className="px-4 py-2 text-sm font-semibold text-[#1e1e24]"
                      >
                        {link.name}
                      </span>
                    ))}
                  </nav>
                }
              >
                <DesktopNavLinks navLinks={navLinks} />
              </Suspense>
            </div>

            {/* Right Group: Wishlist, Cart & Clean Account */}
            <div className="hidden md:flex items-center gap-3">
              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                prefetch={true}
                className="relative p-2.5 text-[#1e1e24] hover:text-[#ff7849] hover:bg-[#f6efe2] rounded-full transition-all"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff7849] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-subtle">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Link */}
              <Link
                href="/cart"
                prefetch={true}
                className="relative p-2.5 text-[#1e1e24] hover:text-[#ff7849] hover:bg-[#f6efe2] rounded-full transition-all"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff7849] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-card animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="h-5 w-px bg-[#1e1e24]/15 mx-1" />

              {/* Auth / Profile Area */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account/orders"
                    prefetch={true}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-[#1e1e24] hover:text-[#ff7849] hover:bg-[#f6efe2] transition-colors"
                    title="My Orders"
                  >
                    <Package className="w-4 h-4 text-[#ff7849]" />
                    <span>Orders</span>
                  </Link>

                  {/* Circular User Avatar / Admin Dropdown Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white hover:bg-[#f6efe2] border border-[#1e1e24]/10 text-[#1e1e24] text-xs font-semibold shadow-subtle transition-all cursor-pointer group"
                      aria-expanded={userMenuOpen}
                      aria-label="User Account Menu"
                    >
                      {/* Circular logo/avatar of user */}
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff7849] via-[#f4a7b9] to-[#facc15] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[85px] truncate font-bold">
                        {user.role === "ADMIN" ? "Admin" : user.name.split(" ")[0]}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#1e1e24]/50 transition-transform duration-200 ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#1e1e24]/10 shadow-card py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {/* User Header Details */}
                        <div className="px-4 py-2.5 border-b border-[#1e1e24]/5">
                          <p className="text-xs font-bold text-[#1e1e24] truncate">{user.name}</p>
                          <p className="text-[11px] text-[#1e1e24]/60 truncate">{user.email}</p>
                          {user.role === "ADMIN" && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                              <Shield className="w-3 h-3 text-amber-600" />
                              Store Administrator
                            </span>
                          )}
                        </div>

                        {/* Navigation Links */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            prefetch={true}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#1e1e24] hover:bg-[#f6efe2] hover:text-[#ff7849] transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-[#ff7849]" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            href="/account/orders"
                            prefetch={true}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#1e1e24] hover:bg-[#f6efe2] hover:text-[#ff7849] transition-colors"
                          >
                            <Package className="w-4 h-4 text-[#ff7849]" />
                            <span>My Orders</span>
                          </Link>

                          {user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              prefetch={true}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#1e1e24] hover:bg-[#f6efe2] hover:text-[#ff7849] transition-colors"
                            >
                              <Shield className="w-4 h-4 text-rose-500" />
                              <span>Admin Console</span>
                            </Link>
                          )}
                        </div>

                        {/* Logout Option */}
                        <div className="pt-1 border-t border-[#1e1e24]/5">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    prefetch={true}
                    className="text-xs font-bold text-[#1e1e24] hover:text-[#ff7849] px-3 py-2 rounded-full hover:bg-[#f6efe2] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    prefetch={true}
                    className="text-xs font-bold text-[#1e1e24] hover:text-white hover:bg-[#1e1e24] border border-[#1e1e24]/20 px-4 py-2 rounded-full transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Header Icons: Wishlist, Cart & Menu */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/wishlist"
                className="relative p-2 text-[#1e1e24]"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#ff7849] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative p-2 text-[#1e1e24]"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#ff7849] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#1e1e24] hover:bg-[#f6efe2] rounded-full cursor-pointer ml-1"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1e1e24]/10 bg-[#fffdfa] px-4 pt-4 pb-6 space-y-4 shadow-xl">
            <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-[#1e1e24]/10">
              <Link
                href="/"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 text-xs font-bold text-[#1e1e24] bg-[#f6efe2] hover:bg-[#ff7849]/10 rounded-xl"
              >
                🏠 Home
              </Link>
              <Link
                href="/products"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 text-xs font-bold text-[#1e1e24] bg-[#f6efe2] hover:bg-[#ff7849]/10 rounded-xl"
              >
                👕 Shop All
              </Link>
              <Link
                href="/products?gender=BOYS"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 text-xs font-bold text-[#1e1e24] bg-[#a8d8ea]/30 hover:bg-[#a8d8ea]/50 rounded-xl text-center"
              >
                Boys
              </Link>
              <Link
                href="/products?gender=GIRLS"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 text-xs font-bold text-[#1e1e24] bg-[#f4a7b9]/30 hover:bg-[#f4a7b9]/50 rounded-xl text-center"
              >
                Girls
              </Link>
              <Link
                href="/products?ageGroup=0-2"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 px-3.5 py-3 text-xs font-bold text-[#1e1e24] bg-[#facc15]/30 hover:bg-[#facc15]/50 rounded-xl text-center"
              >
                Infants (0–2 Yrs)
              </Link>
            </div>

            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="p-3 bg-[#f6efe2] rounded-2xl flex items-center justify-between border border-[#1e1e24]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff7849] to-[#f4a7b9] text-white flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[#1e1e24] text-sm">{user.name}</div>
                      <div className="text-xs text-[#1e1e24]/60 truncate max-w-[180px]">{user.email}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/account/orders"
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-[#1e1e24] font-bold py-2.5 px-3 bg-[#f6efe2] hover:bg-white rounded-xl text-xs"
                  >
                    <Package className="w-4 h-4 text-[#ff7849]" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/profile"
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-[#1e1e24] font-bold py-2.5 px-3 bg-[#f6efe2] hover:bg-white rounded-xl text-xs"
                  >
                    <UserIcon className="w-4 h-4 text-[#1e1e24]/60" />
                    <span>Profile</span>
                  </Link>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-rose-600 font-bold py-2.5 px-3 hover:bg-rose-50 rounded-xl text-xs flex items-center justify-center gap-2 border border-rose-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl border border-[#1e1e24]/20 text-[#1e1e24] font-bold text-xs hover:bg-[#f6efe2]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl border border-[#1e1e24]/30 text-[#1e1e24] font-bold text-xs hover:bg-[#1e1e24] hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;
