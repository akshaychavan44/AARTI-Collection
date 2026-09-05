"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface OrderDetail {
  id: number;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentId: string | null;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  createdAt: string;
  items: {
    id: number;
    productId: number;
    productName: string;
    variantInfo: string;
    productImage: string | null;
    price: number;
    quantity: number;
    total: number;
  }[];
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.orderNumber;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const res = await api.get<OrderDetail>(`/orders/${orderNumber}`);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError(res.message || "Order not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order confirmation");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent mb-4" />
        <p className="text-slate-500 font-medium">Fetching order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Order Not Found</h1>
        <p className="text-slate-500 text-sm">{error || "Unable to display this order."}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Luxury Confirmation Banner */}
      <div className="bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 rounded-3xl p-8 text-white shadow-xl shadow-rose-500/10 text-center space-y-3 relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 uppercase tracking-widest">
          Payment Successful
        </span>
        <h1 className="text-3xl font-black tracking-tight">Order Confirmed!</h1>
        <p className="text-rose-100 text-sm max-w-md mx-auto">
          Thank you for shopping at Kalyan Kids. Your clothing items have been reserved and prepared for local pickup.
        </p>
      </div>

      {/* Order Summary Receipt */}
      <div className="mt-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 pb-6 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Order Number</span>
            <strong className="text-slate-900 font-bold text-sm block mt-0.5">
              #{order.orderNumber}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Order Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs mt-0.5">
              <PackageCheck className="w-3.5 h-3.5" /> {order.status}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Payment Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-xs mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> {order.paymentStatus}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Payment ID</span>
            <span className="font-mono text-slate-700 text-xs truncate block mt-0.5">
              {order.paymentId || "Razorpay Verified"}
            </span>
          </div>
        </div>

        {/* Purchased Products List */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Items Purchased ({order.items.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {item.productImage && (
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">
                      {item.productName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.variantInfo} • Qty: {item.quantity}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900 text-sm">
                    ₹{item.total}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ₹{item.price} ea
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount ({order.couponCode})</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Store Pickup</span>
            <span className="font-semibold text-emerald-600">FREE</span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-base font-bold text-slate-900">Total Paid</span>
            <span className="text-2xl font-black text-rose-600">₹{order.total}</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/account/orders/${order.orderNumber}`}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm text-center transition-colors flex items-center justify-center gap-2"
          >
            <span>View Full Order Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm text-center transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
