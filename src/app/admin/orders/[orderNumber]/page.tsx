"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Tag,
  User,
  Mail,
  Loader2,
  AlertCircle,
  Calendar,
  Save,
  ShieldAlert,
} from "lucide-react";

interface OrderDetail {
  id: number;
  orderNumber: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
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
  items: Array<{
    id: number;
    productId: number;
    variantId: number;
    productName: string;
    variantInfo: string;
    productImage: string | null;
    price: number;
    quantity: number;
    total: number;
  }>;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderNumber = (params?.orderNumber as string) || "";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update states
  const [newOrderStatus, setNewOrderStatus] = useState<string>("");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderNumber]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<OrderDetail>(`/admin/orders/${orderNumber}`);
      if (res.success && res.data) {
        setOrder(res.data);
        setNewOrderStatus(res.data.status);
        setNewPaymentStatus(res.data.paymentStatus);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updating || !order) return;

    try {
      setUpdating(true);
      setUpdateSuccess(null);
      const res = await api.patch<OrderDetail>(`/admin/orders/${order.orderNumber}/status`, {
        status: newOrderStatus,
        paymentStatus: newPaymentStatus,
      });

      if (res.success && res.data) {
        setOrder(res.data);
        setUpdateSuccess("Order & payment statuses updated successfully. Inventory synchronized.");
        setTimeout(() => setUpdateSuccess(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderDetail["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Cancelled
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  const getPaymentBadge = (status: OrderDetail["paymentStatus"]) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            PAID
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            REFUNDED
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            FAILED
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            PENDING
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading order receipt details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
        <p className="text-sm font-bold text-red-800">{error || "Order not found"}</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders List
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Order Receipt
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
              {order.orderNumber}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            {getPaymentBadge(order.paymentStatus)}
          </div>
        </div>
      </div>

      {updateSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{updateSuccess}</span>
        </div>
      )}

      {/* Main Order Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Customer & Payment Info Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
          {/* Customer Details */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Customer Information
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="font-semibold text-slate-900">{order.customer.name}</div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.customer.email}</span>
              </div>
              <div className="text-[11px] text-slate-400">Customer ID: #{order.customer.id}</div>
            </div>
          </div>

          {/* Payment & Fulfillment Details */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Payment & Pickup
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold text-slate-900">Razorpay Online</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span>Payment ID:</span>
                  <span className="font-mono text-slate-900">{order.paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Placed At:</span>
                <span>{dateFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Products Table */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Ordered Line Items ({order.items.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center gap-4">
                <div className="w-14 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
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

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {item.productName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.variantInfo}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ₹{item.price} × {item.quantity} {item.quantity === 1 ? "unit" : "units"}
                  </div>
                </div>

                <div className="text-right font-extrabold text-slate-900 text-sm">
                  ₹{item.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">₹{order.subtotal}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Coupon ({order.couponCode})
                </span>
                <span>-₹{order.discount}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Kalyan Store Pickup</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Total Paid</span>
              <span className="text-xl font-black text-rose-600">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Status Lifecycle Management Panel */}
        <div className="pt-6 border-t border-slate-100 bg-slate-50/60 p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Update Order Status & Lifecycle
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Changing order status to <strong className="text-slate-800">CANCELLED</strong> will
              automatically restore purchased variant inventory.
            </p>
          </div>

          <form onSubmit={handleUpdateStatus} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="w-full sm:w-48">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Order Status
              </label>
              <select
                value={newOrderStatus}
                onChange={(e) => setNewOrderStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-semibold focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Payment Status
              </label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-semibold focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
