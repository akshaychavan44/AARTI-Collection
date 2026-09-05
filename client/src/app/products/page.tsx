"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useWishlist } from "@/context/WishlistContext";
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
  const [search, setSearch] = useState<string>(searchParams.get("search") || "");
  const [gender, setGender] = useState<string>(searchParams.get("gender") || "");
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [ageGroup, setAgeGroup] = useState<string>(searchParams.get("ageGroup") || "");
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "");
  const [availability, setAvailability] = useState<string>(searchParams.get("availability") || "all");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sortBy") || "featured");
  const [page, setPage] = useState<number>(parseInt(searchParams.get("page") || "1", 10));

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-rose-500/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Kalyan Kids Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kids Fashion Catalog
          </h1>
          <p className="mt-2 text-rose-50 text-sm sm:text-base">
            Premium clothing for boys & girls up to age 16. Handpicked comfort, vibrant styles, and everyday durability right here in Kalyan.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Layout: Filters Sidebar + Products Grid */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-8 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm shadow-xs hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-500" />
            {mobileFilterOpen ? "Hide Filters" : "Filter & Refine"}
          </button>

          <span className="text-sm font-medium text-slate-500">
            {pagination.total} items
          </span>
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden"
          } lg:block col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs mb-6 lg:mb-0 space-y-6 sticky top-24`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-rose-500" /> Filters
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
              Search
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, keyword..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
              Gender
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
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                    gender === g.val
                      ? "bg-rose-600 text-white shadow-xs font-bold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
              Age Group (Years)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["0-2", "3-5", "6-9", "10-13", "14-16"].map((age) => (
                <button
                  key={age}
                  onClick={() => {
                    setAgeGroup(ageGroup === age ? "" : age);
                    setPage(1);
                  }}
                  className={`py-1 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
                    ageGroup === age
                      ? "bg-rose-50 border-rose-500 text-rose-700 font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {age} Yrs
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
              Stock Availability
            </label>
            <div className="space-y-1.5 text-sm">
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
                All Items
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
                In Stock Only
              </label>
            </div>
          </div>
        </aside>

        {/* Catalog Grid Area */}
        <section className="col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-sm text-slate-600 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {products.length}
              </span>{" "}
              of <span className="font-bold text-slate-900">{pagination.total}</span> products
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap">
                Sort By:
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="text-sm rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                <option value="featured">Featured First</option>
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
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full h-56 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                We could not find any kids clothing matching your exact filter criteria. Try adjusting your filters or search keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-xs"
              >
                <RotateCcw className="w-4 h-4" /> Reset Filters
              </button>
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
                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-rose-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                  >
                    {/* Image Area with Badges & Wishlist Button */}
                    <div className="relative aspect-4/5 bg-slate-50 overflow-hidden">
                      <Link href={`/products/${product.slug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                          isSaved
                            ? "bg-rose-600 text-white"
                            : "bg-white/80 text-slate-600 hover:text-rose-600 hover:bg-white"
                        }`}
                        title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
                      </button>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        {product.isFeatured && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                            Featured
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                            {product.discountPercentage}% OFF
                          </span>
                        )}
                      </div>

                      {/* Stock Status Badge */}
                      <div className="absolute bottom-3 left-3">
                        {product.overallStockStatus === "OUT_OF_STOCK" ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                            Out of Stock
                          </span>
                        ) : product.overallStockStatus === "LOW_STOCK" ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/90 text-white backdrop-blur-xs">
                            Low Stock
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Meta Tags */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                          <span
                            className={
                              product.gender === "BOYS"
                                ? "text-blue-600 bg-blue-50 px-2 py-0.5 rounded"
                                : "text-rose-600 bg-rose-50 px-2 py-0.5 rounded"
                            }
                          >
                            {product.gender}
                          </span>
                          <span>•</span>
                          <span>Age {product.ageGroup} Yrs</span>
                        </div>

                        {/* Product Title */}
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-bold text-slate-900 hover:text-rose-600 transition-colors line-clamp-1 text-base"
                        >
                          {product.name}
                        </Link>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {product.brand || "Kalyan Kids"}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-extrabold text-slate-900">
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

                        <Link
                          href={`/products/${product.slug}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 text-xs font-bold transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-sm font-semibold text-slate-700 px-4">
                Page {page} of {pagination.totalPages}
              </div>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
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
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
