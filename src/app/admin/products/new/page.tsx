"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
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

interface VariantRow {
  size: string;
  color: string;
  price: number | string;
  sku: string;
  quantity: number | string;
  lowStockThreshold: number | string;
}

interface ImageRow {
  imageUrl: string;
  altText: string;
  sortOrder: number;
}

export default function AddProductPage() {
  const router = useRouter();

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

  // Images
  const [images, setImages] = useState<ImageRow[]>([
    {
      imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
      altText: "Front preview",
      sortOrder: 0,
    },
  ]);

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>([
    {
      size: "3-4Y",
      color: "Navy Blue",
      price: 499,
      sku: `KLY-${Date.now().toString().slice(-4)}-01`,
      quantity: 15,
      lowStockThreshold: 5,
    },
  ]);

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Submit states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await api.get<Category[]>("/admin/categories");
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      }
    } catch {
      // Ignore category load error
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: "4-5Y",
        color: "Navy Blue",
        price: prev[0]?.price || 499,
        sku: `KLY-${Date.now().toString().slice(-4)}-0${prev.length + 1}`,
        quantity: 10,
        lowStockThreshold: 5,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert("Product must have at least one variant.");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantRow, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddImage = () => {
    setImages((prev) => [
      ...prev,
      {
        imageUrl: "",
        altText: name || "Product image",
        sortOrder: prev.length,
      },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, field: keyof ImageRow, value: any) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setError(null);

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (variants.length === 0) {
      setError("Please specify at least one product variant.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        categoryId: Number(categoryId),
        gender,
        ageGroup,
        brand: brand.trim() || "Kalyan Kids",
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        isFeatured,
        isActive,
        images: images.filter((img) => img.imageUrl.trim() !== ""),
        variants: variants.map((v) => ({
          size: v.size.trim(),
          color: v.color.trim(),
          price: parseFloat(String(v.price)),
          sku: v.sku.trim(),
          quantity: parseInt(String(v.quantity), 10) || 0,
          lowStockThreshold: parseInt(String(v.lowStockThreshold), 10) || 5,
        })),
      };

      const res = await api.post("/admin/products", payload);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/products");
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create product. Please check form fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products List
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Add New Product
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create a premium catalog item with sizes, colors, inventory stock, and showcase images.
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
          <span>Product created successfully! Redirecting to catalog...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Boys Dinosaur Printed Cotton T-Shirt"
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
                placeholder="Describe fabric softness, cotton blend, wash care, etc."
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

        {/* Section 2: Product Images */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Product Images
              </h2>
              <p className="text-[11px] text-slate-400">Add Unsplash or high-res CDN photo URLs</p>
            </div>
            <button
              type="button"
              onClick={handleAddImage}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Photo
            </button>
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {img.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-300" />
                  )}
                </div>

                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={img.imageUrl}
                  onChange={(e) => handleImageChange(idx, "imageUrl", e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Product Variants & Inventory */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Sizes, Colors & Inventory
              </h2>
              <p className="text-[11px] text-slate-400">At least one variant is required</p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 items-center text-xs"
              >
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3-4Y"
                    value={v.size}
                    onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navy Blue"
                    value={v.color}
                    onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="499"
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="15"
                    value={v.quantity}
                    onChange={(e) => handleVariantChange(idx, "quantity", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SKU-01"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end pt-4 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Action Buttons */}
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
            className="py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Publish Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
