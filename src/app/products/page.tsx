"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
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

function ProductCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter & Pagination state derived from or synced to URL
  const [search, setSearch] = useState<string>(searchParams?.get("search") || "");
  const [gender, setGender] = useState<string>(searchParams?.get("gender") || "");
  const [category, setCategory] = useState<string>(searchParams?.get("category") || "");
  const [ageGroup, setAgeGroup] = useState<string>(searchParams?.get("ageGroup") || "");
  const [minPrice, setMinPrice] = useState<string>(searchParams?.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams?.get("maxPrice") || "");
  const [availability, setAvailability] = useState<string>(searchParams?.get("availability") || "all");
  const [sortBy, setSortBy] = useState<string>(searchParams?.get("sortBy") || "featured");
  const [page, setPage] = useState<number>(parseInt(searchParams?.get("page") || "1", 10));

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  // Fetch categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get<Category[]>("/categories");
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
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

      const res = await api.get<ProductItem[]>(`/products?${query.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [search, gender, category, ageGroup, minPrice, maxPrice, availability, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearch("");
    setGender("");
    setCategory("");
    setAgeGroup("");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("all");
    setSortBy("featured");
    setPage(1);
    router.push("/products");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const hasActiveFilters = Boolean(
    search || gender || category || ageGroup || minPrice || maxPrice || availability !== "all"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Luxury Editorial Header Banner */}
      <div className="mb-10 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Kalyan Kids Atelier • 2026 Collection
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Curated Kids Fashion Catalog
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Discover bespoke frocks, gentleman shirts, lehengas, and organic daily wear. All styles tailored with hypoallergenic fabrics and available for same-day boutique pickup in Kalyan.
          </p>

          {/* Quick Active Filter Badges */}
          {hasActiveFilters && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Active filters:</span>
              {gender && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-md">
                  {gender === "BOYS" ? "Boys Wear" : "Girls Wear"}
                  <button onClick={() => setGender("")} className="hover:text-rose-300 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {ageGroup && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-md">
                  Age {ageGroup} Yrs
                  <button onClick={() => setAgeGroup("")} className="hover:text-rose-300 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-md">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch("")} className="hover:text-rose-300 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-amber-300 hover:text-amber-200 underline underline-offset-2 ml-1 cursor-pointer"
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
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-xs hover:bg-slate-50 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-500" />
            {mobileFilterOpen ? "Hide Filter Options" : "Filter & Refine Collection"}
          </button>

          <span className="text-xs font-bold text-slate-500">
            {pagination.total} Garments Found
          </span>
        </div>

        {/* Sidebar Filters with Glassmorphic Card */}
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden"
          } lg:block col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm mb-8 lg:mb-0 space-y-6 sticky top-24`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Filter className="w-4 h-4 text-rose-600" /> Refine Wardrobe
            </h2>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2 tracking-wider">
              Search by Style
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Frock, shirt, lehenga..."
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-slate-50/50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2 tracking-wider">
              Child Department
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "All", val: "" },
                { label: "Boys", val: "BOYS" },
                { label: "Girls", val: "GIRLS" },
              ].map((g) => (
                <button
                  key={g.label}
                  onClick={() => {
                    setGender(g.val);
                    setPage(1);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    gender === g.val
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/70"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2 tracking-wider">
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
                  onClick={() => {
                    setAgeGroup(ageGroup === age.val ? "" : age.val);
                    setPage(1);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    ageGroup === age.val
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
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
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2 tracking-wider">
                Garment Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
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
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2 tracking-wider">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-slate-50/50"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2 tracking-wider">
              Stock Availability
            </label>
            <div className="space-y-2 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "all"}
                  onChange={() => {
                    setAvailability("all");
                    setPage(1);
                  }}
                  className="text-rose-600 focus:ring-rose-500"
                />
                All Collection Items
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "in_stock"}
                  onChange={() => {
                    setAvailability("in_stock");
                    setPage(1);
                  }}
                  className="text-rose-600 focus:ring-rose-500"
                />
                In Stock in Kalyan Only
              </label>
            </div>
          </div>
        </aside>

        {/* Catalog Grid Area */}
        <section className="col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs text-slate-600 font-semibold">
              Showing{" "}
              <span className="font-extrabold text-slate-900">
                {products.length}
              </span>{" "}
              of <span className="font-extrabold text-slate-900">{pagination.total}</span> handcrafted designs
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold uppercase text-slate-500 whitespace-nowrap">
                Sort Order:
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
              >
                <option value="featured">Featured Atelier First</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Alphabetical: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid with 3D Physics */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full h-64 bg-slate-200 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-14 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">No Outfits Found</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                We couldn&apos;t find any outfits matching your exact filter settings. Clear your filters or ask our Kalyan stylist for custom orders on WhatsApp!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
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
                    className="group bg-white rounded-3xl border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden relative card-3d"
                  >
                    {/* Image Area with Badges & Wishlist Button */}
                    <div className="relative aspect-4/5 bg-slate-100 overflow-hidden">
                      <Link href={`/products/${product.slug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                          isSaved
                            ? "bg-rose-600 text-white shadow-rose-600/30"
                            : "bg-white/85 text-slate-700 hover:text-rose-600 hover:bg-white"
                        }`}
                        title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
                      </button>

                      {/* Badges: Featured & Discount */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        {product.isFeatured && (
                          <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold shimmer-gold text-slate-950 shadow-md">
                            Featured
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md">
                            {product.discountPercentage}% OFF
                          </span>
                        )}
                      </div>

                      {/* Stock Status Badge */}
                      <div className="absolute bottom-3 left-3">
                        {product.overallStockStatus === "OUT_OF_STOCK" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900/90 text-white backdrop-blur-md">
                            ● Out of Stock
                          </span>
                        ) : product.overallStockStatus === "LOW_STOCK" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
                            ● Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
                            ● In Stock (Kalyan)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Department & Age Metadata */}
                        <div className="flex items-center gap-2 text-xs font-bold mb-1.5">
                          <span
                            className={
                              product.gender === "BOYS"
                                ? "text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md"
                                : "text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md"
                            }
                          >
                            {product.gender}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            Age {product.ageGroup} Yrs
                          </span>
                        </div>

                        {/* Product Title */}
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-extrabold text-slate-950 hover:text-rose-600 transition-colors line-clamp-1 text-base tracking-tight"
                        >
                          {product.name}
                        </Link>

                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                          {product.brand || "Kalyan Kids Atelier"}
                        </p>
                      </div>

                      {/* Price & Action Section */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-slate-950">
                              ₹
                              {product.priceRange.min === product.priceRange.max
                                ? product.priceRange.min
                                : `${product.priceRange.min} - ₹${product.priceRange.max}`}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-xs text-slate-400 line-through">
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
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-sm"
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
                onClick={() => setPage(page - 1)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-xs font-bold text-slate-700 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                Page <span className="text-rose-600">{page}</span> of {pagination.totalPages}
              </div>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
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
    <Suspense fallback={<div className="p-16 text-center text-slate-500 font-medium">Loading Atelier catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
