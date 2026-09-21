"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdate = async (itemId: number, newQty: number) => {
    try {
      setUpdatingId(itemId);
      await updateQuantity(itemId, newQty);
    } catch (err: any) {
      alert(err.message || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      setUpdatingId(itemId);
      await removeItem(itemId);
    } catch (err: any) {
      alert(err.message || "Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-[#EFECE6] text-stone-700 flex items-center justify-center mx-auto shadow-inner border border-stone-200">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-stone-900">Your Shopping Bag is Waiting</h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Please sign in to view your saved shopping bag or complete your order for your little ones.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-card transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/products"
            className="px-6 py-3.5 rounded-2xl border border-stone-300 text-stone-900 font-bold text-xs hover:bg-[#EFECE6] transition-all"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !cart) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-stone-900 border-t-transparent mb-4" />
        <p className="text-stone-600 font-bold text-xs tracking-wider uppercase">Loading your shopping bag...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-[#EFECE6] text-stone-500 flex items-center justify-center mx-auto shadow-inner border border-stone-200">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-stone-900">Your Shopping Bag is Empty</h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
          Looks like you haven&apos;t added any kids clothing yet. Explore our fresh arrivals for boys and girls!
        </p>
        <div className="pt-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs shadow-card transition-all hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Discover Outfits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Aarti Collection Bag
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Shopping Bag</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            You have <span className="font-extrabold text-stone-900">{cart?.totalItems}</span> garment(s) in your reserved bag
          </p>
        </div>

        <button
          onClick={() => clearCart()}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All Items
        </button>
      </div>

      {/* Main Cart Grid: Line Items + Order Summary */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
        {/* Line Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const isBusy = updatingId === item.id;
            const primaryImg = item.product.image || "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=400";
            const isOutOfStock = !item.variant.inStock;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-all ${
                  isOutOfStock ? "border-red-300 bg-red-50/30" : "border-stone-200 shadow-xs hover:shadow-md"
                } ${isBusy ? "opacity-60 pointer-events-none" : ""}`}
              >
                {/* Product Image */}
                <Link
                  href={`/products/${item.product.slug}`}
                  className="w-20 h-26 sm:w-24 sm:h-30 rounded-2xl overflow-hidden bg-[#EFECE6] shrink-0 border border-stone-200 shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryImg}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-top"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400">
                    {item.product.brand || "Aarti Collection"}
                  </div>
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-extrabold text-stone-900 hover:text-stone-700 transition-colors text-base block"
                  >
                    {item.product.name}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                    <span className="bg-[#FAF9F6] px-2 py-0.5 rounded-md font-semibold border border-stone-200">Size: {item.variant.size}</span>
                    <span>•</span>
                    <span className="bg-[#FAF9F6] px-2 py-0.5 rounded-md font-semibold border border-stone-200">Color: {item.variant.color}</span>
                    <span>•</span>
                    <span className="text-stone-400">SKU: {item.variant.sku}</span>
                  </div>

                  {isOutOfStock ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Out of Stock ({item.variant.stock} available in store)
                    </div>
                  ) : item.variant.stock <= 5 ? (
                    <div className="text-xs font-bold text-amber-600 pt-1">
                      Only {item.variant.stock} left in boutique stock
                    </div>
                  ) : null}
                </div>

                {/* Price & Quantity Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-right">
                    <div className="text-xl font-black text-stone-900">
                      ₹{item.totalPrice}
                    </div>
                    <div className="text-xs text-stone-400 font-medium">
                      ₹{item.unitPrice} each
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-[#FAF9F6] shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleUpdate(item.id, item.quantity - 1)}
                        className="p-2 text-stone-600 hover:bg-[#EFECE6] cursor-pointer"
                        title={item.quantity === 1 ? "Remove" : "Decrease"}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.variant.stock}
                        onClick={() => handleUpdate(item.id, item.quantity + 1)}
                        className="p-2 text-stone-600 hover:bg-[#EFECE6] disabled:opacity-30 cursor-pointer"
                        title="Increase"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-[#EFECE6] rounded-xl transition-colors cursor-pointer"
                      title="Remove Item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 mt-8 lg:mt-0 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs sm:text-sm font-semibold">
              <div className="flex justify-between text-stone-600">
                <span>Garments Subtotal</span>
                <span className="font-extrabold text-stone-900">₹{cart?.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Taxes (GST)</span>
                <span className="font-extrabold text-stone-900">Included</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Store Pickup</span>
                <span className="font-extrabold text-emerald-700">FREE</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-baseline">
              <div>
                <div className="text-base font-black text-stone-900">Total Payable</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Authoritative Price</div>
              </div>
              <div className="text-2xl font-black text-stone-900">
                ₹{cart?.subtotal}
              </div>
            </div>

            {cart?.hasOutOfStockItems && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Please remove or adjust out-of-stock garments before checkout.
              </div>
            )}

            {/* Checkout Action Button */}
            <div className="pt-2">
              {cart?.hasOutOfStockItems ? (
                <button
                  disabled
                  className="w-full py-4 px-4 rounded-2xl bg-stone-200 text-stone-400 font-extrabold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="w-full py-4 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs shadow-card transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <p className="text-center text-[10px] text-stone-400 font-semibold">
              🔒 Safe & Encrypted Checkout • Verified Aarti Collection Stock
            </p>
          </div>

          {/* Aarti Collection Perks Card */}
          <div className="bg-[#EFECE6] rounded-3xl p-6 border border-stone-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-stone-900 flex items-center justify-center shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-stone-900">Same-Day Store Pickup</div>
                <div className="text-stone-500">Available at Shivaji Chowk, Kalyan West</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-stone-900">Pure Organic Cottons</div>
                <div className="text-stone-500">100% breathable quality cotton fabrics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
