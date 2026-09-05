"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  DollarSign,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Loader2,
  ChevronRight,
  Tag,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    createdAt: string;
    itemCount: number;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<DashboardStats>("/admin/stats");
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: "PENDING" | "CONFIRMED" | "CANCELLED") => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  const getPaymentBadge = (status: "PENDING" | "PAID" | "FAILED" | "REFUNDED") => {
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

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading store analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-red-700">{error || "Failed to load dashboard."}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sales, inventory telemetry, and customer operations in Kalyan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {stats.lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-bold">{stats.lowStockCount}</strong> product variant(s) have low stock (5 or fewer units remaining).
            </span>
          </div>
          <Link
            href="/admin/products"
            className="font-bold text-amber-700 hover:text-amber-800 underline shrink-0"
          >
            Review Inventory
          </Link>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{stats.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400">Confirmed & Paid Orders</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalOrders}</div>
          <div className="text-[11px] text-slate-400">All customer checkouts</div>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats.confirmedOrders}
          </div>
          <div className="text-[11px] text-slate-400">Paid & Stock Deducted</div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats.pendingOrders}
          </div>
          <div className="text-[11px] text-slate-400">Awaiting payment</div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Products</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalProducts}</div>
          <div className="text-[11px] text-slate-400">Live kids clothes</div>
        </div>

        {/* Total Categories */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalCategories}</div>
          <div className="text-[11px] text-slate-400">Boys & Girls lines</div>
        </div>

        {/* Total Customers */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalCustomers}</div>
          <div className="text-[11px] text-slate-400">Registered shoppers</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-400">Latest checkout transactions</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Order #</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Order Status</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3 font-semibold text-slate-600">
                      {ord.itemCount} item(s)
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      ₹{ord.total}
                    </td>
                    <td className="py-3">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-3">
                      {getPaymentBadge(ord.paymentStatus)}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders/${ord.orderNumber}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Details <ChevronRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fast Shortcuts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="p-5 bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Manage Catalog</div>
              <div className="text-[11px] text-slate-400">Variants, pricing & stock</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </Link>

        <Link
          href="/admin/categories"
          className="p-5 bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Categories</div>
              <div className="text-[11px] text-slate-400">Boys & girls collections</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </Link>

        <Link
          href="/admin/coupons"
          className="p-5 bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Promotions & Coupons</div>
              <div className="text-[11px] text-slate-400">Discounts & festival codes</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
