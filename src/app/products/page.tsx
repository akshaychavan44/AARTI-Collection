"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clientCache } from "@/lib/cache";
import { useWishlist } from "@/context/WishlistContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  Filter,
  SlidersHorizontal,
  Search,
  Heart,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Check,
  Tag,
  PackageCheck,
  AlertCircle,
  X,
  Eye,
  MessageCircle,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  gender: string;
}

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  gender: "BOYS" | "GIRLS";
  ageGroup: string;
  brand: string | null;
  isFeatured: boolean;
  compareAtPrice: string | null;
  discountPercentage: number | null;
  category: { id: number; name: string; slug: string } | null;
  images: { id: number; imageUrl: string; altText: string | null }[];
  priceRange: { min: number; max: number };
  overallStockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

// In-memory category cache to prevent duplicate network calls across page navigations
let cachedCategories: Category[] | null = null;

function ProductCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter & Pagination derived directly from URL as single source of truth
  const search = searchParams?.get("search") || "";
  const gender = searchParams?.get("gender") || "";
  const category = searchParams?.get("category") || "";
  const ageGroup = searchParams?.get("ageGroup") || "";
  const minPrice = searchParams?.get("minPrice") || "";
  const maxPrice = searchParams?.get("maxPrice") || "";
  const availability = searchParams?.get("availability") || "all";
  const sortBy = searchParams?.get("sortBy") || "featured";
  const page = parseInt(searchParams?.get("page") || "1", 10);

  // Local input buffers so typing remains fluid without lagging
  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  // Centralized filter updater syncing to the browser URL
  const updateFilter = useCallback(
    (updates: Record<string, string | number | undefined | null>) => {
      const current = new URLSearchParams(searchParams ? searchParams.toString() : "");
      Object.entries(updates).forEach(([key, val]) => {
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          val === "all" ||
          (key === "page" && Number(val) === 1) ||
          (key === "sortBy" && val === "featured")
        ) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });
      const query = current.toString();
      router.replace(query ? `/products?${query}` : "/products", { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch categories once with SWR caching
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCached<Category[]>("/categories", 60000);
        if (res.data?.success && res.data.data) {
          cachedCategories = res.data.data;
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products cleanly whenever search parameters change with SWR instant render
  useEffect(() => {
    let isCancelled = false;
    async function loadProducts() {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (gender) query.set("gender", gender);
      if (category) query.set("category", category);
      if (ageGroup) query.set("ageGroup", ageGroup);
      if (minPrice) query.set("minPrice", minPrice);
      if (maxPrice) query.set("maxPrice", maxPrice);
      if (availability && availability !== "all") query.set("availability", availability);
      if (sortBy) query.set("sortBy", sortBy);
      query.set("page", page.toString());
      query.set("limit", "12");

      const endpoint = `/products?${query.toString()}`;
      const cached = clientCache.get<any>(endpoint);
      if (cached?.data && Array.isArray(cached.data)) {
        setProducts(cached.data);
        if (cached.pagination) {
          setPagination(cached.pagination);
        }
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const res = await api.getCached<ProductItem[]>(endpoint, 30000);
        if (!isCancelled && res.data?.success && res.data.data) {
          setProducts(res.data.data);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load products:", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      isCancelled = true;
    };
  }, [search, gender, category, ageGroup, minPrice, maxPrice, availability, sortBy, page]);

  const handleResetFilters = () => {
    router.replace("/products", { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ search: searchInput.trim(), page: 1 });
  };

  const hasActiveFilters = Boolean(
    search || gender || category || ageGroup || minPrice || maxPrice || availability !== "all"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Prototype Soft Cream Header Banner */}
      <div className="mb-10 bg-[#F5F4F0] rounded-3xl p-8 sm:p-10 text-stone-900 shadow-subtle relative overflow-hidden border border-stone-200">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider shadow-subtle">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Aarti Collection
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900">
            Kids Fashion Catalog
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Explore our collection of frocks, festive sets, casual shirts, and everyday essentials crafted for comfort and play.
          </p>

          {/* Quick Active Filter Badges */}
          {hasActiveFilters && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold">Active filters:</span>
              {gender && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-stone-900 text-white shadow-subtle">
                  {gender === "BOYS" ? "Boys" : "Girls"}
                  <button onClick={() => updateFilter({ gender: "", page: 1 })} className="hover:text-amber-300 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {ageGroup && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-stone-900 text-white shadow-subtle">
                  {ageGroup} Years
                  <button onClick={() => updateFilter({ ageGroup: "", page: 1 })} className="hover:text-amber-300 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-stone-900 text-white shadow-subtle">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => updateFilter({ search: "", page: 1 })} className="hover:text-amber-300 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-stone-800 hover:underline font-bold ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Products Grid */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-8 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 font-bold text-xs shadow-xs hover:bg-stone-50 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone-700" />
            {mobileFilterOpen ? "Hide Filter Options" : "Filter & Refine Collection"}
          </button>

          <span className="text-xs font-bold text-stone-500">
            {pagination.total} Products
          </span>
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden"
          } lg:block col-span-1 bg-white p-6 rounded-3xl border border-stone-200 shadow-subtle mb-8 lg:mb-0 space-y-6 sticky top-28`}
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-extrabold text-stone-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Filter className="w-4 h-4 text-stone-700" /> Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-stone-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-stone-500 mb-2 tracking-wider">
              Search Products
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search shirts, frocks, jeans..."
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-900 bg-[#FAF9F6]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </form>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-stone-500 mb-2 tracking-wider">
              Department
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "All", val: "" },
                { label: "Boys", val: "BOYS" },
                { label: "Girls", val: "GIRLS" },
              ].map((g) => (
                <button
                  key={g.label}
                  onClick={() => updateFilter({ gender: g.val, page: 1 })}
                  className={`py-2 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    gender === g.val
                      ? "bg-stone-900 text-white shadow-subtle"
                      : "bg-[#EFECE6] text-stone-800 hover:bg-stone-200"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-stone-500 mb-2 tracking-wider">
              Age Group (Years)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { val: "0-2", label: "0–2 Yrs" },
                { val: "3-5", label: "3–5 Yrs" },
                { val: "6-9", label: "6–9 Yrs" },
                { val: "10-13", label: "10–13 Yrs" },
                { val: "14-16", label: "14–16 Yrs" },
              ].map((age) => (
                <button
                  key={age.val}
                  onClick={() => updateFilter({ ageGroup: ageGroup === age.val ? "" : age.val, page: 1 })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    ageGroup === age.val
                      ? "bg-stone-900 border-stone-900 text-white shadow-subtle"
                      : "bg-white border-stone-200 text-stone-800 hover:bg-[#EFECE6]"
                  }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-extrabold uppercase text-stone-500 mb-2 tracking-wider">
                Garment Category
              </label>
              <select
                value={category}
                onChange={(e) => updateFilter({ category: e.target.value, page: 1 })}
                className="w-full text-xs rounded-xl border border-stone-200 px-3 py-2.5 bg-white text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-900 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} ({c.gender})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range Filter */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-stone-500 mb-2 tracking-wider">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onBlur={() => updateFilter({ minPrice: minPriceInput, page: 1 })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateFilter({ minPrice: minPriceInput, page: 1 });
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-900 bg-[#FAF9F6]"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onBlur={() => updateFilter({ maxPrice: maxPriceInput, page: 1 })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateFilter({ maxPrice: maxPriceInput, page: 1 });
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-900 bg-[#FAF9F6]"
              />
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-stone-500 mb-2 tracking-wider">
              Stock Availability
            </label>
            <div className="space-y-2 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "all"}
                  onChange={() => updateFilter({ availability: "all", page: 1 })}
                  className="text-stone-900 focus:ring-stone-800"
                />
                All Collection Items
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "in_stock"}
                  onChange={() => updateFilter({ availability: "in_stock", page: 1 })}
                  className="text-stone-900 focus:ring-stone-800"
                />
                In Stock Only
              </label>
            </div>
          </div>
        </aside>

        {/* Catalog Grid Area */}
        <section className="col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-stone-200 shadow-subtle">
            <div className="text-xs text-stone-600 font-semibold">
              Showing{" "}
              <span className="font-extrabold text-stone-900">
                {products.length}
              </span>{" "}
              of <span className="font-extrabold text-stone-900">{pagination.total}</span> products
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold uppercase text-stone-500 whitespace-nowrap">
                Sort By:
              </label>
              <select
                value={sortBy}
                onChange={(e) => updateFilter({ sortBy: e.target.value, page: 1 })}
                className="text-xs rounded-xl border border-stone-200 px-3 py-2 bg-white text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-900 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-stone-200 p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full h-64 bg-stone-200 rounded-2xl" />
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-14 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-stone-900">No Outfits Found</h3>
              <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto">
                We couldn&apos;t find any outfits matching your exact filter settings. Clear your filters or ask our stylist on WhatsApp!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const primaryImage = product.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=600";
                const isSaved = isInWishlist(product.id);
                const hasDiscount = !!product.discountPercentage && product.discountPercentage > 0;

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-3xl border border-stone-200 hover:border-stone-900 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden relative doodle-sticker"
                  >
                    {/* Image Area with Badges & Wishlist Button */}
                    <div className="relative aspect-4/5 bg-[#EFECE6] overflow-hidden">
                      <Link href={`/products/${product.slug}`} prefetch={true}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-subtle cursor-pointer ${
                          isSaved
                            ? "bg-stone-900 text-white"
                            : "bg-white/90 text-stone-900 hover:text-stone-700 hover:bg-white"
                        }`}
                        title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
                      </button>

                      {/* Badges: Featured & Discount */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        {product.isFeatured && (
                          <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-900 text-white shadow-subtle">
                            Featured
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-700 text-white shadow-subtle">
                            {product.discountPercentage}% OFF
                          </span>
                        )}
                      </div>

                      {/* Stock Status Badge */}
                      <div className="absolute bottom-3 left-3">
                        {product.overallStockStatus === "OUT_OF_STOCK" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-900/90 text-white backdrop-blur-md">
                            ● Out of Stock
                          </span>
                        ) : product.overallStockStatus === "LOW_STOCK" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600/90 text-white backdrop-blur-md shadow-xs">
                            ● Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-700/90 text-white backdrop-blur-md shadow-xs">
                            ● In Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Department & Age Metadata */}
                        <div className="flex items-center gap-2 text-xs font-bold mb-1.5">
                          <span className="text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded-full">
                            {product.gender === "BOYS" ? "Boys" : "Girls"}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-stone-600 bg-[#EFECE6] px-2.5 py-0.5 rounded-full">
                            {product.ageGroup} Yrs
                          </span>
                        </div>

                        {/* Product Title */}
                        <Link
                          href={`/products/${product.slug}`}
                          prefetch={true}
                          className="font-extrabold text-stone-900 hover:text-stone-600 transition-colors line-clamp-1 text-base tracking-tight"
                        >
                          {product.name}
                        </Link>

                        <p className="text-[11px] font-semibold text-stone-400 mt-0.5 uppercase tracking-wider">
                          {product.brand || "Aarti Collection"}
                        </p>
                      </div>

                      {/* Price & Action Section */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-stone-900">
                              ₹
                              {product.priceRange.min === product.priceRange.max
                                ? product.priceRange.min
                                : `${product.priceRange.min} - ₹${product.priceRange.max}`}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-xs text-stone-400 line-through">
                                ₹{product.compareAtPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dual Action Buttons: WhatsApp Concierge + Details */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <WhatsAppButton
                            variant="compact"
                            productName={product.name}
                            ageGroup={product.ageGroup}
                            price={product.priceRange.min}
                            productCode={product.slug}
                          />

                          <Link
                            href={`/products/${product.slug}`}
                            prefetch={true}
                            className="btn-bouncy px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-subtle"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 pb-4">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#EFECE6] transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-xs font-bold text-stone-800 px-4 py-2 rounded-xl bg-white border border-stone-200 shadow-2xs">
                Page <span className="text-stone-950 font-black">{page}</span> of {pagination.totalPages}
              </div>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => updateFilter({ page: page + 1 })}
                className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#EFECE6] transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ProductCatalogPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-stone-500 font-medium">Loading products...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
