"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  PackageCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface AdminOrderItem {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentId: string | null;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  createdAt: string;
  itemCount: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, [orderStatus, paymentStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (orderStatus !== "all") params.append("status", orderStatus);
      if (paymentStatus !== "all") params.append("paymentStatus", paymentStatus);

      const res = await api.get<AdminOrderItem[]>(`/admin/orders?${params.toString()}`);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load customer orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const getStatusBadge = (status: AdminOrderItem["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            Cancelled
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  const getPaymentBadge = (status: AdminOrderItem["paymentStatus"]) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            PAID
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            REFUNDED
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            FAILED
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Orders Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer purchases, inspect payment statuses, and update fulfillment lifecycle.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order # or coupon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Order Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Order:</span>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Payment:</span>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading && orders.length === 0 ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-xs text-slate-400">Loading order receipts...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">No Orders Found</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No orders matched your selected filters or search parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Order #</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Items</th>
                  <th className="py-3.5 px-4 font-semibold">Total</th>
                  <th className="py-3.5 px-4 font-semibold">Order Status</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((ord) => {
                  const dateFormatted = new Date(ord.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-400">{ord.customerEmail}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {ord.itemCount} {ord.itemCount === 1 ? "unit" : "units"}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">₹{ord.total}</div>
                        {ord.discount > 0 && (
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            Saved ₹{ord.discount}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(ord.status)}</td>

                      <td className="py-3.5 px-4">{getPaymentBadge(ord.paymentStatus)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${ord.orderNumber}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          View <ChevronRight className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
