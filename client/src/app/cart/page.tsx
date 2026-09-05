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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Cart is Waiting</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Please sign in to view your saved shopping cart or add clothes for your little ones.
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

  if (loading && !cart) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent mb-4" />
        <p className="text-slate-500 text-sm">Loading your cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Shopping Cart is Empty</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Looks like you haven&apos;t added any kids clothing yet. Explore our fresh arrivals for boys and girls!
        </p>
        <div className="pt-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/25 transition-all"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">
            You have <span className="font-bold text-slate-800">{cart?.totalItems}</span> item(s) in your basket
          </p>
        </div>

        <button
          onClick={() => clearCart()}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All Items
        </button>
      </div>

      {/* Main Cart Grid: Line Items + Order Summary */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Line Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const isBusy = updatingId === item.id;
            const primaryImg = item.product.image || "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=400";
            const isOutOfStock = !item.variant.inStock;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${
                  isOutOfStock ? "border-red-300 bg-red-50/30" : "border-slate-200/80 shadow-xs"
                } ${isBusy ? "opacity-60 pointer-events-none" : ""}`}
              >
                {/* Product Image */}
                <Link
                  href={`/products/${item.product.slug}`}
                  className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryImg}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-top"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    {item.product.brand || "Kalyan Kids"}
                  </div>
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-bold text-slate-900 hover:text-rose-600 transition-colors text-base block"
                  >
                    {item.product.name}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Size: {item.variant.size}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">Color: {item.variant.color}</span>
                    <span>•</span>
                    <span className="text-slate-400">SKU: {item.variant.sku}</span>
                  </div>

                  {isOutOfStock ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Out of Stock ({item.variant.stock} available)
                    </div>
                  ) : item.variant.stock <= 5 ? (
                    <div className="text-xs font-semibold text-amber-600 pt-1">
                      Only {item.variant.stock} left in stock
                    </div>
                  ) : null}
                </div>

                {/* Price & Quantity Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-slate-900">
                      ₹{item.totalPrice}
                    </div>
                    <div className="text-xs text-slate-400">
                      ₹{item.unitPrice} each
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleUpdate(item.id, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-50"
                        title={item.quantity === 1 ? "Remove" : "Decrease"}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.variant.stock}
                        onClick={() => handleUpdate(item.id, item.quantity + 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Item"
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
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{cart?.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Taxes</span>
                <span className="font-semibold text-slate-900">Included (GST)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Kalyan Store Pickup</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <div>
                <div className="text-base font-bold text-slate-900">Total Amount</div>
                <div className="text-xs text-slate-400">Authoritative server price</div>
              </div>
              <div className="text-2xl font-black text-rose-600">
                ₹{cart?.subtotal}
              </div>
            </div>

            {cart?.hasOutOfStockItems && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Please remove or adjust out-of-stock items before checkout.
              </div>
            )}

            {/* Checkout Action Button */}
            <div className="pt-2">
              {cart?.hasOutOfStockItems ? (
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-200 text-slate-400 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <p className="text-center text-[11px] text-slate-400">
              Safe & Secure Checkout • 100% Guaranteed Quality
            </p>
          </div>

          {/* Kalyan Store Benefits */}
          <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl p-5 border border-rose-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-2xs">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Same-Day Local Pickup</div>
                <div className="text-slate-600">Available at Shivaji Chowk, Kalyan</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Genuine Kids Brand Quality</div>
                <div className="text-slate-600">Direct from Kalyan cloth merchants</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
