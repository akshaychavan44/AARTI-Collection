"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  ShoppingCart,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";

interface Variant {
  id: number;
  size: string;
  color: string;
  price: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

interface ProductDetails {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  gender: "BOYS" | "GIRLS";
  ageGroup: string;
  brand: string | null;
  isActive: boolean;
  isFeatured: boolean;
  compareAtPrice: string | null;
  discountPercentage: number | null;
  category: { id: number; name: string; slug: string } | null;
  images: { id: number; imageUrl: string; altText: string | null; sortOrder: number }[];
  variants: Variant[];
  priceRange: { min: number; max: number };
  overallStockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ProductDetails>(`/products/slug/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
          // Set initial size and color from first variant
          if (res.data.variants.length > 0) {
            setSelectedSize(res.data.variants[0].size);
            setSelectedColor(res.data.variants[0].color);
          }
        } else {
          setError(res.message || "Product not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent mb-4" />
        <p className="text-slate-600 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">{error || "The requested clothing item is no longer available."}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm shadow-md hover:bg-rose-700"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Find matching variant based on selected size and color
  const matchedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  ) || product.variants[0];

  // Derive unique sizes and colors
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const availableColors = Array.from(new Set(product.variants.map((v) => v.color)));

  const currentPrice = matchedVariant ? parseFloat(matchedVariant.price) : product.priceRange.min;
  const availableStock = matchedVariant ? matchedVariant.stock : 0;
  const isOutOfStock = availableStock <= 0;
  const isSavedInWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (!matchedVariant) return;
    if (!isAuthenticated) {
      setFeedback({
        type: "error",
        message: "Please sign in to add items to your cart.",
      });
      return;
    }

    try {
      setActionLoading(true);
      setFeedback(null);
      await addToCart(product.id, matchedVariant.id, quantity);
      setFeedback({
        type: "success",
        message: `Added ${quantity} item(s) to your cart!`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to add to cart",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const imagesList = product.images.length > 0
    ? product.images
    : [{ id: 0, imageUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=800", altText: product.name, sortOrder: 0 }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="hover:text-rose-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-rose-600 transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-rose-600 transition-colors">
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-4/5 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagesList[selectedImageIndex]?.imageUrl || imagesList[0].imageUrl}
              alt={imagesList[selectedImageIndex]?.altText || product.name}
              className="w-full h-full object-cover object-top"
            />
            {product.isFeatured && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                Featured
              </span>
            )}
            {product.discountPercentage && (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx ? "border-rose-600 shadow-sm scale-105" : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Selectors */}
        <div className="space-y-6">
          <div>
            {/* Meta Tags */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  product.gender === "BOYS" ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {product.gender}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Age {product.ageGroup} Years
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">{product.brand || "Kalyan Kids"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">₹{currentPrice}</span>
              {product.compareAtPrice && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.compareAtPrice}
                </span>
              )}
              {product.discountPercentage && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-700">
                  Save {product.discountPercentage}%
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-4">
              {product.description}
            </div>
          )}

          {/* Variant Selector: Size */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Size
              </label>
              <span className="text-xs text-slate-500">Kalyan Standard Fit</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      isSelected
                        ? "border-rose-600 bg-rose-600 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variant Selector: Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Color
            </label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Status Indicator */}
          <div className="pt-2">
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4" /> Out of Stock in this variant
              </div>
            ) : availableStock <= (matchedVariant?.lowStockThreshold || 5) ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                <Sparkles className="w-4 h-4" /> Only {availableStock} left in stock - order soon!
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <Check className="w-4 h-4" /> In Stock ({availableStock} units available)
              </div>
            )}
          </div>

          {/* Quantity & CTA Area */}
          <div className="space-y-4 pt-2">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Quantity:
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= availableStock || isOutOfStock}
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isOutOfStock || actionLoading}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all hover:shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                {actionLoading ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSavedInWishlist
                    ? "border-rose-600 bg-rose-50 text-rose-600"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 hover:text-rose-600 bg-white"
                }`}
                title={isSavedInWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isSavedInWishlist ? "fill-rose-600" : ""}`} />
              </button>
            </div>

            {/* Feedback Notice */}
            {feedback && (
              <div
                className={`p-3 rounded-xl text-sm font-medium flex items-center justify-between ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <span>{feedback.message}</span>
                {feedback.type === "success" && (
                  <Link href="/cart" className="underline font-bold text-emerald-900 ml-2">
                    View Cart
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Store Promises Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <ShieldCheck className="w-5 h-5 text-rose-500 mx-auto" />
              <div className="text-[11px] font-bold text-slate-800">100% Cotton</div>
              <div className="text-[10px] text-slate-500">Child-safe fabrics</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <Truck className="w-5 h-5 text-amber-500 mx-auto" />
              <div className="text-[11px] font-bold text-slate-800">Kalyan Pickup</div>
              <div className="text-[10px] text-slate-500">Quick local delivery</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <RotateCcw className="w-5 h-5 text-blue-500 mx-auto" />
              <div className="text-[11px] font-bold text-slate-800">7-Day Return</div>
              <div className="text-[10px] text-slate-500">Easy size exchange</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
