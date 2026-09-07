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
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Package,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  gender: string;
}

interface VariantRow {
  id?: number;
  size: string;
  color: string;
  price: number | string;
  sku: string;
  quantity: number | string;
  lowStockThreshold: number | string;
}

interface ImageRow {
  id?: number;
  imageUrl: string;
  altText: string;
  sortOrder: number;
}

const COMMON_SIZES = ["0-6M", "6-12M", "1-2Y", "3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y", "13-14Y", "15-16Y"];
const COMMON_COLORS = ["Navy Blue", "Sky Blue", "Rose Pink", "Crimson Red", "White", "Black", "Sunshine Yellow", "Olive Green"];

const SAMPLE_IMAGES = [
  { label: "Boy Cotton Tee", url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800" },
  { label: "Girl Summer Dress", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800" },
  { label: "Denim / Casual", url: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800" },
  { label: "Winter Jacket", url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800" },
  { label: "Baby Romper", url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800" },
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || "";

  // Base Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [gender, setGender] = useState<"BOYS" | "GIRLS">("BOYS");
  const [ageGroup, setAgeGroup] = useState<"0-2" | "3-5" | "6-9" | "10-13" | "14-16">("3-5");
  const [brand, setBrand] = useState("Kalyan Kids");
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Variants & Inventory
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // Images
  const [images, setImages] = useState<ImageRow[]>([]);

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

      // 2. Fetch full product
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

        // Load variants with live inventory quantity
        if (p.variants && p.variants.length > 0) {
          setVariants(
            p.variants.map((v: any) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              price: v.price,
              sku: v.sku,
              quantity: v.stock ?? 0,
              lowStockThreshold: v.lowStockThreshold ?? 5,
            }))
          );
        } else {
          setVariants([
            {
              size: "3-4Y",
              color: "Navy Blue",
              price: 499,
              sku: `KLY-${productId}-01`,
              quantity: 10,
              lowStockThreshold: 5,
            },
          ]);
        }

        // Load images
        if (p.images && p.images.length > 0) {
          setImages(
            p.images.map((img: any, idx: number) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              altText: img.altText || "",
              sortOrder: img.sortOrder ?? idx,
            }))
          );
        } else {
          setImages([]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  // Variant Helpers
  const handleAddVariant = () => {
    const lastVar = variants[variants.length - 1];
    setVariants((prev) => [
      ...prev,
      {
        size: "5-6Y",
        color: lastVar?.color || "Navy Blue",
        price: lastVar?.price || 499,
        sku: `KLY-${productId}-${Date.now().toString().slice(-4)}`,
        quantity: 15,
        lowStockThreshold: 5,
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof VariantRow, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert("Every product must have at least one variant (size/color).");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Image Helpers
  const handleAddImage = (url: string = "") => {
    setImages((prev) => [
      ...prev,
      {
        imageUrl: url,
        altText: name.trim() || "Product photo",
        sortOrder: prev.length,
      },
    ]);
  };

  const handleUpdateImage = (index: number, field: keyof ImageRow, value: any) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Product Title is required.");
      return;
    }

    if (variants.length === 0) {
      setError("Please add at least one variant.");
      return;
    }

    // Check variant prices & SKUs
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.size.trim() || !v.color.trim()) {
        setError(`Variant #${i + 1} must have a valid size and color.`);
        return;
      }
      if (!v.sku.trim()) {
        setError(`Variant #${i + 1} must have an SKU.`);
        return;
      }
      if (Number(v.price) <= 0 || isNaN(Number(v.price))) {
        setError(`Variant #${i + 1} must have a positive selling price.`);
        return;
      }
    }

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
        variants: variants.map((v) => ({
          id: v.id,
          size: v.size.trim(),
          color: v.color.trim(),
          price: parseFloat(String(v.price)),
          sku: v.sku.trim(),
          quantity: parseInt(String(v.quantity), 10) || 0,
          lowStockThreshold: parseInt(String(v.lowStockThreshold), 10) || 5,
        })),
        images: images
          .filter((img) => img.imageUrl.trim().length > 0)
          .map((img, idx) => ({
            id: img.id,
            imageUrl: img.imageUrl.trim(),
            altText: img.altText?.trim() || name.trim(),
            sortOrder: img.sortOrder ?? idx,
          })),
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
      <div className="py-24 text-center">
        <Loader2 className="w-9 h-9 animate-spin text-rose-500 mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading clothing item and variants...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Edit Clothing Item #{productId}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Update complete information: titles, categories, pricing, size/color variants, live inventory, and imagery.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Product updated successfully! Returning to catalog...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Base Product Details */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
            <Tag className="w-4 h-4 text-rose-500" />
            <span>1. Basic Clothing Information</span>
          </h2>

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
                placeholder="e.g. Boys Dinosaur Printed Cotton T-Shirt"
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
                placeholder="Fabric composition, fit, wash care instructions, etc."
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
                <option value="">Select a Category</option>
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
                Target Age Group *
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
              >
                <option value="0-2">0–2 Years (Infant & Toddler)</option>
                <option value="3-5">3–5 Years (Pre-School)</option>
                <option value="6-9">6–9 Years (Primary)</option>
                <option value="10-13">10–13 Years (Pre-Teen)</option>
                <option value="14-16">14–16 Years (Teens)</option>
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
                placeholder="e.g. Kalyan Kids"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Compare-at Price (MRP ₹ for discount tag)
              </label>
              <input
                type="number"
                placeholder="e.g. 799"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span>Active Showcase (Visible in Store)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span>Featured on Home Page</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 2: Variants & Stock Inventory */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span>2. Sizes, Colors, Pricing & Inventory Stock</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every size and color combination with its individual price and warehouse inventory quantity.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          {/* Quick Size Recommendations */}
          <div className="p-3 bg-slate-50 rounded-2xl flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold mr-1">Quick Sizes:</span>
            {COMMON_SIZES.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => {
                  const lastVar = variants[variants.length - 1];
                  setVariants((prev) => [
                    ...prev,
                    {
                      size: sz,
                      color: lastVar?.color || "Navy Blue",
                      price: lastVar?.price || 499,
                      sku: `KLY-${productId}-${sz.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString().slice(-3)}`,
                      quantity: 15,
                      lowStockThreshold: 5,
                    },
                  ]);
                }}
                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-rose-400 hover:text-rose-600 text-[10px] font-semibold transition-colors cursor-pointer"
              >
                + {sz}
              </button>
            ))}
          </div>

          {/* Variant Rows Table */}
          <div className="space-y-3">
            {variants.map((v, idx) => {
              const qty = Number(v.quantity) || 0;
              const thresh = Number(v.lowStockThreshold) || 5;
              const isOutOfStock = qty <= 0;
              const isLowStock = !isOutOfStock && qty <= thresh;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {v.size || "Size"} • {v.color || "Color"}
                      </span>
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          IN STOCK
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      disabled={variants.length <= 1}
                      title="Remove Variant"
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Size *
                      </label>
                      <input
                        type="text"
                        required
                        value={v.size}
                        onChange={(e) => handleUpdateVariant(idx, "size", e.target.value)}
                        placeholder="e.g. 3-4Y"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Color *
                      </label>
                      <input
                        type="text"
                        required
                        value={v.color}
                        onChange={(e) => handleUpdateVariant(idx, "color", e.target.value)}
                        placeholder="e.g. Red"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(idx, "price", e.target.value)}
                        placeholder="499"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Stock Qty *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={v.quantity}
                        onChange={(e) => handleUpdateVariant(idx, "quantity", e.target.value)}
                        placeholder="10"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:ring-1 focus:ring-rose-500 font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.lowStockThreshold}
                        onChange={(e) => handleUpdateVariant(idx, "lowStockThreshold", e.target.value)}
                        placeholder="5"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        SKU Identifier *
                      </label>
                      <input
                        type="text"
                        required
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                        placeholder="SKU-1234"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-mono focus:ring-1 focus:ring-rose-500 text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Product Image Gallery */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-rose-500" />
                <span>3. Product Image Gallery</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add, preview, reorder, or update image URLs for this cloth showcase.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAddImage("")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              <span>Add Image URL</span>
            </button>
          </div>

          {/* Sample Preset Images */}
          <div className="p-3 bg-slate-50 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Sample Presets:
            </span>
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleAddImage(sample.url)}
                className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-rose-400 hover:text-rose-600 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                + {sample.label}
              </button>
            ))}
          </div>

          {/* Image List */}
          {images.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No images added yet. Click &quot;Add Image URL&quot; or choose a preset above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center gap-4 shadow-2xs"
                >
                  {/* Thumbnail Preview */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                    {img.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img.imageUrl}
                        alt={img.altText || "Preview"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Image URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={img.imageUrl}
                        onChange={(e) => handleUpdateImage(idx, "imageUrl", e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-1 focus:ring-rose-500 font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Alt Caption
                      </label>
                      <input
                        type="text"
                        value={img.altText}
                        onChange={(e) => handleUpdateImage(idx, "altText", e.target.value)}
                        placeholder="Front view"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Delete Image"
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: Save Actions */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Ensure all size variants, prices, and stock inventory are accurate before saving.
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" /> Save All Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
