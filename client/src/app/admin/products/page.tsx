"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

interface AdminProductItem {
  id: number;
  name: string;
  slug: string;
  category: { id: number; name: string } | null;
  gender: string;
  ageGroup: string;
  brand: string | null;
  isActive: boolean;
  isFeatured: boolean;
  compareAtPrice: string | null;
  totalStock: number;
  variantCount: number;
  primaryImage: string | null;
  priceRange: { min: number; max: number };
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<AdminProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = `?status=${statusFilter}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      const res = await api.get<AdminProductItem[]>(`/admin/products${query}`);
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleStatus = async (productId: number) => {
    try {
      const res = await api.patch<{ isActive: boolean }>(`/admin/products/${productId}/status`);
      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isActive: res.data!.isActive } : p))
        );
      }
    } catch (err: any) {
      alert(err.message || "Failed to update product status");
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      setDeleteMessage(null);
      const res = await api.delete<{ deleted: boolean; deactivated: boolean; message: string }>(
        `/admin/products/${productToDelete.id}`
      );
      if (res.success && res.data) {
        if (res.data.deactivated) {
          // Soft-deactivated
          setProducts((prev) =>
            prev.map((p) => (p.id === productToDelete.id ? { ...p, isActive: false } : p))
          );
          setDeleteMessage(res.data.message);
        } else {
          // Hard deleted
          setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
          setDeleteMessage("Product deleted safely.");
        }
        setTimeout(() => {
          setProductToDelete(null);
          setDeleteMessage(null);
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Products Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your kids collection, inventory quantities, and active showcase status.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Product
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, brand, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            type="button"
            onClick={fetchProducts}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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

      {/* Table of Products */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading && products.length === 0 ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-xs text-slate-400">Loading catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">No Products Found</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No clothing items matched your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Price Range</th>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => {
                  const isOutOfStock = p.totalStock <= 0;
                  const isLowStock = p.totalStock > 0 && p.totalStock <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                p.primaryImage ||
                                "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=200"
                              }
                              alt={p.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${p.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-rose-600 transition-colors inline-flex items-center gap-1"
                            >
                              <span className="truncate max-w-[220px]">{p.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-300 shrink-0" />
                            </Link>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{p.brand || "Kalyan Kids"}</span>
                              <span>•</span>
                              <span>{p.gender}</span>
                              <span>•</span>
                              <span>Age {p.ageGroup}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {p.category?.name || "Unassigned"}
                      </td>

                      {/* Price Range */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">
                          {p.priceRange.min === p.priceRange.max
                            ? `₹${p.priceRange.min}`
                            : `₹${p.priceRange.min} - ₹${p.priceRange.max}`}
                        </div>
                        {p.compareAtPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{p.compareAtPrice}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold ${
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {p.totalStock} units
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.variantCount} {p.variantCount === 1 ? "variant" : "variants"}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {p.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Delete &quot;{productToDelete.name}&quot;?
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              If this product has historical customer order records, it will be automatically
              deactivated (<span className="font-semibold text-slate-700">isActive = false</span>) to
              safeguard customer order receipts. Otherwise, it will be removed permanently.
            </p>

            {deleteMessage && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                {deleteMessage}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
