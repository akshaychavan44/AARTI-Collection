"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
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
  MessageCircle,
  Clock,
  Sparkle,
  Home,
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
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent mb-4" />
        <p className="text-slate-600 font-bold text-sm tracking-wide">Retrieving atelier garment details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-950 mb-2">Garment Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">{error || "The requested clothing item is no longer available in our collection."}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-rose-600 transition-colors"
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
        message: `Added ${quantity} item(s) to your shopping bag!`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Luxury Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8 overflow-x-auto pb-1">
        <Link href="/" className="hover:text-rose-600 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <Link href="/products" className="hover:text-rose-600 transition-colors shrink-0">
          Atelier Collection
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        {product.category && (
          <>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-rose-600 transition-colors shrink-0"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          </>
        )}
        <span className="text-slate-900 font-bold truncate max-w-xs shrink-0">{product.name}</span>
      </nav>

      {/* Product View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image Gallery with 3D Depth Card (5 cols on lg) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/5 rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xl card-3d">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagesList[selectedImageIndex]?.imageUrl || imagesList[0].imageUrl}
              alt={imagesList[selectedImageIndex]?.altText || product.name}
              className="w-full h-full object-cover object-top"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFeatured && (
                <span className="px-3.5 py-1 rounded-full text-xs font-black shimmer-gold text-slate-950 shadow-md">
                  ✨ Featured Atelier
                </span>
              )}
              {product.discountPercentage && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* In-Stock Indicator Pill on Image */}
            <div className="absolute bottom-4 left-4">
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/90 text-white backdrop-blur-md">
                  ● Out of Stock in Selected Variant
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
                  ● In Stock in Kalyan Store ({availableStock} units)
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-rose-600 shadow-md scale-105"
                      : "border-slate-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Specs, Variant Selectors & Action Buttons (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  product.gender === "BOYS"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                    : "bg-rose-50 text-rose-700 border border-rose-200/60"
                }`}
              >
                {product.gender === "BOYS" ? "👦 Boys Wear" : "👧 Girls Wear"}
              </span>

              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                Age {product.ageGroup} Years
              </span>

              <span className="text-xs font-semibold text-slate-400">
                Brand: <strong className="text-slate-700">{product.brand || "Kalyan Kids Atelier"}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-950">₹{currentPrice}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-slate-400 line-through">
                  ₹{product.compareAtPrice}
                </span>
              )}
              {product.discountPercentage && (
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Select Child Size
              </label>
              <span className="text-xs text-slate-500 font-medium">Standard Indian Kid Fit</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variant Selector: Color */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Select Colorway
            </label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20 shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Stock Indicator Notice */}
          <div>
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Selected variant is currently out of stock. Contact us on WhatsApp for backorder.</span>
              </div>
            ) : availableStock <= (matchedVariant?.lowStockThreshold || 5) ? (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Only {availableStock} garments left in stock in Kalyan boutique — order soon!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Available for immediate dispatch / local store pickup</span>
              </div>
            )}
          </div>

          {/* Quantity & CTA Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Quantity:
              </label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= availableStock || isOutOfStock}
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart, Wishlist, WhatsApp */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock || actionLoading}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm shadow-lg shadow-rose-600/25 transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {actionLoading ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Shopping Bag"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSavedInWishlist
                      ? "border-rose-600 bg-rose-50 text-rose-600 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 hover:text-rose-600 bg-white"
                  }`}
                  title={isSavedInWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isSavedInWishlist ? "fill-rose-600" : ""}`} />
                </button>
              </div>

              {/* Direct WhatsApp Concierge Button */}
              <WhatsAppButton
                productName={product.name}
                ageGroup={product.ageGroup}
                price={currentPrice}
                productCode={matchedVariant?.sku || product.slug}
                color={selectedColor}
                size={selectedSize}
                className="w-full py-4 text-sm font-black rounded-2xl shadow-lg shadow-emerald-500/20"
              />
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                <span>{feedback.message}</span>
                {feedback.type === "success" && (
                  <Link href="/cart" className="underline font-black text-emerald-950 ml-2">
                    View Bag →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Luxury Store Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50/70 rounded-2xl space-y-1 border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-rose-600 mx-auto" />
              <div className="text-xs font-bold text-slate-900">100% Cotton</div>
              <div className="text-[10px] text-slate-500">Pure hypoallergenic</div>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-2xl space-y-1 border border-slate-100">
              <Truck className="w-5 h-5 text-amber-600 mx-auto" />
              <div className="text-xs font-bold text-slate-900">Kalyan Express</div>
              <div className="text-[10px] text-slate-500">Same-day pickup</div>
            </div>
            <div className="p-3 bg-slate-50/70 rounded-2xl space-y-1 border border-slate-100">
              <RotateCcw className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-900">7-Day Return</div>
              <div className="text-[10px] text-slate-500">Easy size swap</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
