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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Saved Items</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Please sign in to view and manage your saved wishlist clothes.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md"
          >
            Sign In
          </Link>
          <Link
            href="/products"
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent mb-4" />
        <p className="text-slate-500 text-sm">Loading your saved items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Wishlist is Empty</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Bookmark outfits you love while browsing to purchase later or check back for deals!
        </p>
        <div className="pt-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/25 transition-all"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
        <p className="text-sm text-slate-500 mt-1">
          You have <span className="font-bold text-slate-800">{items.length}</span> saved outfit(s)
        </p>
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
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-rose-200 shadow-xs hover:shadow-lg transition-all flex flex-col overflow-hidden relative"
            >
              {/* Image & Remove */}
              <div className="relative aspect-4/5 bg-slate-50 overflow-hidden">
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
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-slate-400 hover:text-red-600 hover:bg-white shadow-xs transition-colors"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {hasDiscount && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                    {p.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Details & CTA */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                    {p.brand || "Kalyan Kids"}
                  </div>
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-bold text-slate-900 hover:text-rose-600 transition-colors line-clamp-1 text-sm block"
                  >
                    {p.name}
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <span className="capitalize">{p.gender.toLowerCase()}</span>
                    <span>•</span>
                    <span>Age {p.ageGroup} Yrs</span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-slate-900">
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
                <div className="pt-4">
                  <button
                    disabled={!p.hasStock || isMoving}
                    onClick={() => handleMove(p.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {isMoving
                      ? "Moving to Cart..."
                      : !p.hasStock
                      ? "Out of Stock"
                      : "Move to Cart"}
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
