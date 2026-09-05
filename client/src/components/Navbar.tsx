"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ShoppingBag, ShoppingCart, Heart, User as UserIcon, LogOut, Shield, Menu, X, Package } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Kalyan Kids
              </span>
              <span className="block text-[10px] uppercase font-semibold text-rose-500 tracking-wider">
                E-Commerce
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-rose-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-rose-600 transition-colors">
              Shop All
            </Link>
            <Link href="/products?gender=BOYS" className="hover:text-rose-600 transition-colors">
              Boys
            </Link>
            <Link href="/products?gender=GIRLS" className="hover:text-rose-600 transition-colors">
              Girls
            </Link>
          </nav>

          {/* Desktop Actions (Wishlist, Cart, Auth) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            <span className="text-slate-200">|</span>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/account/orders"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  title="My Orders"
                >
                  <Package className="w-4 h-4 text-rose-500" />
                  <span>Orders</span>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name.split(" ")[0]}</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                    title="Open Admin Console"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-700 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg shadow-sm shadow-rose-600/25 transition-all hover:shadow-md"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Shop All
            </Link>
            <Link
              href="/products?gender=BOYS"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Boys Wear
            </Link>
            <Link
              href="/products?gender=GIRLS"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Girls Wear
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart {cartCount > 0 && `(${cartCount} items)`}
            </Link>
          </div>

          {isAuthenticated && user ? (
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    ADMIN
                  </span>
                )}
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-rose-600 font-bold py-2 px-3 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm"
                >
                  <Shield className="w-4 h-4 text-rose-600" />
                  <span>Admin Console</span>
                </Link>
              )}
              <Link
                href="/account/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-slate-700 font-medium py-2 px-3 hover:bg-slate-50 rounded-lg text-sm"
              >
                <Package className="w-4 h-4 text-rose-500" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 font-medium py-2 px-3 hover:bg-slate-50 rounded-lg text-sm"
              >
                My Account Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-rose-600 font-medium py-2 px-3 hover:bg-rose-50 rounded-lg text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 px-4 rounded-xl bg-rose-600 text-white font-medium text-sm hover:bg-rose-700 shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
