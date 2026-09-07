"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Tag,
  ShoppingBag,
} from "lucide-react";

export default function WishlistPage() {
  const { items, loading, removeFromWishlist, moveToCart } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [movingId, setMovingId] = useState<number | null>(null);

  const handleMove = async (productId: number) => {
    try {
      setMovingId(productId);
      await moveToCart(productId);
    } catch (err: any) {
      alert(err.message || "Failed to move item to cart");
    } finally {
      setMovingId(null);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
    } catch (err: any) {
      alert(err.message || "Failed to remove item");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner border border-rose-100">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-950">Your Saved Atelier Outfits</h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
          Please sign in to view your saved wishlist garments and move them directly to your shopping bag.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/20 transition-all hover:shadow-xl"
          >
            Sign In to Atelier
          </Link>
          <Link
            href="/products"
            className="px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent mb-4" />
        <p className="text-slate-600 font-bold text-xs tracking-wider uppercase">Loading saved outfits...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto shadow-inner border border-rose-100">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-950">Your Wishlist is Empty</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
          Bookmark outfits you love while browsing to purchase later, reserve for birthdays, or check back for deals!
        </p>
        <div className="pt-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-xl shadow-rose-600/20 transition-all hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore 2026 Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Curated By You
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Saved Wishlist</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            You have <span className="font-extrabold text-slate-900">{items.length}</span> luxury outfit(s) bookmarked
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const p = item.product;
          const isMoving = movingId === p.id;
          const primaryImg = p.image || "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=400";
          const hasDiscount = !!p.discountPercentage && p.discountPercentage > 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden relative card-3d"
            >
              {/* Image & Remove */}
              <div className="relative aspect-4/5 bg-slate-100 overflow-hidden">
                <Link href={`/products/${p.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryImg}
                    alt={p.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <button
                  onClick={() => handleRemove(p.id)}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 text-slate-400 hover:text-red-600 hover:bg-white shadow-md transition-all cursor-pointer"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {hasDiscount && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md">
                    {p.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Details & CTA */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                    {p.brand || "Kalyan Kids Atelier"}
                  </div>
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-extrabold text-slate-950 hover:text-rose-600 transition-colors line-clamp-1 text-sm block"
                  >
                    {p.name}
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-semibold">
                    <span className="capitalize">{p.gender.toLowerCase()}</span>
                    <span>•</span>
                    <span>Age {p.ageGroup} Yrs</span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-950">
                      ₹{p.priceRange.min}
                    </span>
                    {p.compareAtPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{p.compareAtPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Move to cart button */}
                <div className="pt-2">
                  <button
                    disabled={!p.hasStock || isMoving}
                    onClick={() => handleMove(p.id)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>
                      {isMoving
                        ? "Moving to Bag..."
                        : !p.hasStock
                        ? "Out of Stock"
                        : "Move to Shopping Bag"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
