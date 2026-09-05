"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  gender: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [gender, setGender] = useState<"BOYS" | "GIRLS">("BOYS");
  const [ageGroup, setAgeGroup] = useState<"0-2" | "3-5" | "6-9" | "10-13" | "14-16">("3-5");
  const [brand, setBrand] = useState("Kalyan Kids");
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [productId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch categories
      const catRes = await api.get<Category[]>("/admin/categories");
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      // 2. Fetch product
      const prodRes = await api.get<any>(`/admin/products/${productId}`);
      if (prodRes.success && prodRes.data) {
        const p = prodRes.data;
        setName(p.name);
        setDescription(p.description || "");
        setCategoryId(p.category ? p.category.id : "");
        setGender(p.gender);
        setAgeGroup(p.ageGroup);
        setBrand(p.brand || "Kalyan Kids");
        setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
        setIsFeatured(p.isFeatured ?? false);
        setIsActive(p.isActive ?? true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setError(null);

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        categoryId: categoryId ? Number(categoryId) : undefined,
        gender,
        ageGroup,
        brand: brand.trim(),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        isFeatured,
        isActive,
      };

      const res = await api.put(`/admin/products/${productId}`, payload);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/products");
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading product for edit...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products List
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Product
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Modify title, categories, pricing, and active status.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Product updated successfully! Returning to catalog...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gender})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
              >
                <option value="BOYS">Boys</option>
                <option value="GIRLS">Girls</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Age Group *
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
              >
                <option value="0-2">0-2 Years (Infant)</option>
                <option value="3-5">3-5 Years (Toddler)</option>
                <option value="6-9">6-9 Years (Kids)</option>
                <option value="10-13">10-13 Years (Pre-teen)</option>
                <option value="14-16">14-16 Years (Teens)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Compare-at Price (MRP ₹ for discount display)
              </label>
              <input
                type="number"
                placeholder="e.g. 799"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-6 pt-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span>Active Showcase</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span>Featured on Home</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/products"
            className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
