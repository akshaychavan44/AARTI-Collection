"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Tag,
  ShieldCheck,
  ShoppingBag,
  Loader2,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface OrderItem {
  id: number;
  productId: number;
  variantId: number;
  productName: string;
  variantInfo: string;
  productImage: string | null;
  price: number;
  quantity: number;
  total: number;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  userId: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentId: string | null;
  razorpayOrderId: string | null;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal & action state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && orderNumber) {
      fetchOrderDetail();
    }
  }, [authLoading, isAuthenticated, orderNumber, router]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ order: OrderDetail }>(`/orders/${orderNumber}`);
      if (res.success && res.data) {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      setError(null);
      const res = await api.post<{ order: OrderDetail }>(`/orders/${order.orderNumber}/cancel`);
      if (res.success && res.data) {
        setOrder(res.data.order);
        setShowCancelModal(false);
        setCancelSuccessMsg("Your order has been successfully cancelled. Any reserved stock has been restored.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: OrderDetail["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Order Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Order Cancelled
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Payment Pending
          </span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus: OrderDetail["paymentStatus"]) => {
    switch (paymentStatus) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            PAID
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            REFUNDED
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            FAILED
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            PENDING
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Order Not Found</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          {error || "We couldn't locate this order under your account."}
        </p>
        <div className="pt-2">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Order History
        </Link>
      </div>

      {cancelSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{cancelSuccessMsg}</span>
        </div>
      )}

      {order.status === "CANCELLED" && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-sm flex items-center gap-3">
          <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
          <span>This order was cancelled. Any reserved items have been restored to catalog inventory.</span>
        </div>
      )}

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Order Receipt
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {order.orderNumber}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Placed on {formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {getStatusBadge(order.status)}
            {getPaymentBadge(order.paymentStatus)}
          </div>
        </div>

        {/* Itemized Products Table */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Ordered Items ({order.items.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      item.productImage ||
                      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=200"
                    }
                    alt={item.productName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {item.productName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.variantInfo}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    ₹{item.price} × {item.quantity} {item.quantity === 1 ? "unit" : "units"}
                  </div>
                </div>

                {/* Line Total */}
                <div className="text-right">
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                    ₹{item.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3 text-xs text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-500" /> Payment & Fulfillment
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-medium text-slate-900">Razorpay Secure Online</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span>Payment ID:</span>
                  <span className="font-mono text-slate-900">{order.paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Fulfillment:</span>
                <span className="font-medium text-slate-900">Kalyan Store Pickup (Free)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">₹{order.subtotal}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Coupon Discount ({order.couponCode})
                </span>
                <span>-₹{order.discount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Store Pickup / Delivery</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Grand Total</span>
              <span className="text-2xl font-black text-rose-600">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Kalyan Kids Store Guarantee • 100% Cotton & Safe Dyes</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {canCancel && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel Order
              </button>
            )}

            <Link
              href="/products"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-colors"
            >
              Order Again
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Cancel Order {order.orderNumber}?</h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to cancel this order? Any reserved inventory will be immediately restored to the Kalyan Kids catalog.
              {order.paymentStatus === "PAID" && " If you made an online payment, a refund request will be initiated."}
            </p>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
