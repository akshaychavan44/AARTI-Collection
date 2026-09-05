"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  ShoppingBag,
} from "lucide-react";

interface AdminCustomerItem {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  isActive: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<AdminCustomerItem[]>("/admin/customers");
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load customers directory");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (customerId: number) => {
    try {
      const res = await api.patch<{ isActive: boolean }>(`/admin/customers/${customerId}/status`);
      if (res.success && res.data) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerId ? { ...c, isActive: res.data!.isActive } : c))
        );
      }
    } catch (err: any) {
      alert(err.message || "Failed to update customer status");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Customers Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered Kalyan shoppers, order history telemetry, and account access status.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <button
          type="button"
          onClick={fetchCustomers}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading && customers.length === 0 ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-xs text-slate-400">Loading registered accounts...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">No Customers Found</h2>
            <p className="text-xs text-slate-400">No accounts matched your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                  <th className="py-3.5 px-4 font-semibold">Orders Placed</th>
                  <th className="py-3.5 px-4 font-semibold">Total Spent</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomers.map((cust) => {
                  const dateFormatted = new Date(cust.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                            <div className="text-[11px] text-slate-400">{cust.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <ShoppingBag className="w-3 h-3 text-slate-400" />
                          <span>{cust.orderCount} order(s)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ₹{cust.totalSpent.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {cust.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-500" /> Suspended
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cust.id)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer border ${
                            cust.isActive
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {cust.isActive ? "Suspend" : "Activate"}
                        </button>
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
