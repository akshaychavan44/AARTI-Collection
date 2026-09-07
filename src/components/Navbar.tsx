"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  X,
  Package,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
import { STORE_WHATSAPP_NUMBER } from "@/config/whatsapp";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const conciergeUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Kalyan Kids Atelier! I would like personal assistance selecting outfits for my child."
  )}`;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop All", href: "/products" },
    { name: "Boys Wear", href: "/products?gender=BOYS" },
    { name: "Girls Wear", href: "/products?gender=GIRLS" },
    { name: "Infants (0–2Y)", href: "/products?ageGroup=0-2" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 text-[10px] uppercase tracking-wider shrink-0">
              <Sparkles className="w-3 h-3" /> Kalyan Atelier
            </span>
            <span className="text-slate-300 text-xs hidden sm:inline">
              ✨ In-Store Boutique Pickup in Kalyan West | 100% Skin-Safe Organic Fabrics
            </span>
            <span className="text-slate-300 text-xs sm:hidden">
              ✨ Luxury Kids Boutique • Kalyan
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-xs">
            <a
              href={conciergeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Stylist:</span>
              <span className="font-semibold">+91 72088 30380</span>
            </a>
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30"
              >
                <Shield className="w-3 h-3" /> Admin Mode
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Navbar */}
      <header className="luxury-glass border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18 items-center">
            {/* Brand Crest & Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25 group-hover:scale-105 group-hover:shadow-rose-500/40 transition-all duration-300">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                    Kalyan Kids
                  </span>
                  <span className="font-serif italic text-base text-rose-500 font-normal">
                    Atelier
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-amber-600 transition-colors">
                  Couture for Ages 0–16
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-rose-600 bg-rose-50/80 shadow-2xs"
                        : "text-slate-700 hover:text-rose-600 hover:bg-slate-100/60"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions & WhatsApp CTA */}
            <div className="hidden md:flex items-center gap-3">
              {/* WhatsApp Quick Concierge Pill */}
              <a
                href={conciergeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat with Kalyan boutique stylist on WhatsApp"
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Stylist</span>
              </a>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50/80 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Link */}
              <Link
                href="/cart"
                className="relative p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50/80 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                title="Shopping Bag"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="h-5 w-px bg-slate-200 mx-1" />

              {/* Auth / Profile Area */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
                    title="My Orders"
                  >
                    <Package className="w-4 h-4 text-rose-500" />
                    <span>Orders</span>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs transition-all hover:shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-[11px] font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                      title="Open Admin Console"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-slate-700 hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-2 rounded-xl shadow-md shadow-rose-600/20 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    Join Atelier
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Header Icons: Wishlist, Cart & Menu */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/wishlist"
                className="relative p-2 text-slate-700"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative p-2 text-slate-700"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer ml-1"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4 shadow-xl">
            {/* Direct WhatsApp Callout in Mobile Menu */}
            <a
              href={conciergeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask Kalyan Stylist on WhatsApp (+91 72088 30380)</span>
            </a>

            <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-slate-100">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-rose-50 rounded-xl"
              >
                👗 All Collections
              </Link>
              <Link
                href="/products?gender=BOYS"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-xs font-bold text-blue-700 bg-blue-50/60 hover:bg-blue-100/60 rounded-xl"
              >
                👦 Boys Boutique
              </Link>
              <Link
                href="/products?gender=GIRLS"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-xs font-bold text-rose-700 bg-rose-50/60 hover:bg-rose-100/60 rounded-xl"
              >
                👧 Girls Frocks & Sets
              </Link>
              <Link
                href="/products?ageGroup=0-2"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-xs font-bold text-amber-700 bg-amber-50/60 hover:bg-amber-100/60 rounded-xl"
              >
                🍼 Infants (0–2 Yrs)
              </Link>
            </div>

            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]">{user.email}</div>
                    </div>
                  </div>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                      ADMIN
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-slate-900 font-bold py-2.5 px-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs"
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Open Admin Management Console</span>
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-slate-700 font-bold py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs"
                  >
                    <Package className="w-4 h-4 text-rose-500" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-slate-700 font-bold py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>Profile Settings</span>
                  </Link>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-rose-600 font-bold py-2.5 px-3 hover:bg-rose-50 rounded-xl text-xs flex items-center justify-center gap-2 border border-rose-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-600/20"
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
