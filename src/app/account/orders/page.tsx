"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  Calendar,
} from "lucide-react";

import { clientCache } from "@/lib/cache";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  variantInfo: string;
  productImage: string | null;
  price: number;
  quantity: number;
  total: number;
}

interface OrderSummary {
  id: number;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const initialCacheKey = "/orders";
  const cached = clientCache.get<any>(initialCacheKey);
  const initialOrders = cached?.data
    ? Array.isArray(cached.data)
      ? cached.data
      : cached.data.orders || []
    : [];
  const [orders, setOrders] = useState<OrderSummary[]>(Array.isArray(initialOrders) ? initialOrders : []);
  const [loading, setLoading] = useState(orders.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await api.getCached<OrderSummary[] | { orders: OrderSummary[] }>("/orders");
      if (res.data?.success && res.data.data) {
        const orderList = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray((res.data.data as any).orders)
          ? (res.data.data as any).orders
          : [];
        setOrders(orderList);
      } else if (!silent) {
        setOrders([]);
      }
    } catch (err: any) {
      if (orders.length === 0) {
        setError(err.message || "Failed to load orders");
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLoading(false);
      return;
    }

    if (isAuthenticated) {
      const hasData = orders.length > 0;
      fetchOrders(hasData);
    }
  }, [authLoading, isAuthenticated]);

  const getStatusBadge = (status: OrderSummary["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Cancelled
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus: OrderSummary["paymentStatus"]) => {
    switch (paymentStatus) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            PAID
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            REFUNDED
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
            FAILED
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            PAYMENT PENDING
          </span>
        );
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  if (authLoading || (loading && safeOrders.length === 0)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900 mx-auto mb-4" />
        <p className="text-stone-600 text-sm">Loading your orders...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#EFECE6] text-stone-800 flex items-center justify-center mx-auto border border-stone-200">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Sign in to View Your Orders</h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto">
          Please sign in to your Aarti Collection account to view past orders, item receipts, and track order statuses.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-card"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Manage your purchases, download receipts, and check order statuses.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-800 hover:bg-[#EFECE6] text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <ShoppingBag className="w-4 h-4 text-stone-700" /> Continue Shopping
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {safeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-[#EFECE6] text-stone-700 flex items-center justify-center mx-auto border border-stone-200">
            <Package className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">No Orders Found</h2>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            You haven&apos;t placed any orders yet. Discover our latest designer collections for boys and girls up to age 16!
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-card transition-all"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {safeOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm hover:border-stone-400 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                        Order #
                      </span>
                      <span className="font-bold text-stone-900 text-sm sm:text-base font-mono">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    {getPaymentBadge(order.paymentStatus)}
                  </div>
                </div>

                {/* Items Preview + Total */}
                <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Thumbnails of items */}
                  <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1">
                    {(order.items || []).slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="relative w-14 h-16 rounded-lg bg-[#EFECE6] border border-stone-200 overflow-hidden shrink-0"
                        title={`${item.productName} (${item.variantInfo})`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            item.productImage ||
                            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=200"
                          }
                          alt={item.productName}
                          className="w-full h-full object-cover object-top"
                        />
                        {item.quantity > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-stone-900/80 text-white text-[10px] font-bold px-1 rounded">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {(order.items || []).length > 4 && (
                      <div className="w-14 h-16 rounded-lg bg-[#FAF9F6] border border-dashed border-stone-300 flex items-center justify-center text-xs font-semibold text-stone-500 shrink-0">
                        +{order.items.length - 4} more
                      </div>
                    )}
                    <div className="pl-1">
                      <div className="text-xs font-semibold text-stone-900">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate max-w-[200px]">
                        {order.items.map((i) => i.productName).join(", ")}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-stone-400">Total Amount</div>
                      <div className="text-lg font-extrabold text-stone-900">
                        ₹{order.total}
                      </div>
                      {order.discount > 0 && (
                        <div className="text-[11px] text-emerald-600 font-semibold">
                          Saved ₹{order.discount}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/account/orders/${order.orderNumber}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shadow-card"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
