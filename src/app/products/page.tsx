"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  ProductCard,
  ProductSkeleton,
  type StoreProduct,
} from "@/components/ProductCard";

interface Category {
  id: number;
  name: string;
  slug: string;
  gender: string;
}
const ages = ["0-2", "3-5", "6-9", "10-13", "14-16"];
function CatalogContent({
  filterOpen,
  setFilterOpen,
}: {
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const queryString = params?.toString() || "";
  const gender = params?.get("gender") || "";
  const age = params?.get("ageGroup") || "";
  const category = params?.get("category") || "";
  const search = params?.get("search") || "";
  const sort = params?.get("sortBy") || "featured";
  const page = Math.max(1, Number(params?.get("page")) || 1);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [searchInput, setSearchInput] = useState(search);
  const [prices, setPrices] = useState({
    min: params?.get("minPrice") || "",
    max: params?.get("maxPrice") || "",
  });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  useEffect(() => {
    let active = true;
    api
      .getCached<Category[]>("/categories", 60000)
      .then(({ data }) => {
        if (active) setCategories(data.data || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(queryString);
    query.set("limit", "12");
    query.set("page", String(page));
    query.set("sortBy", sort);
    api
      .get<StoreProduct[]>(`/products?${query}`)
      .then((res) => {
        if (!res.success) throw new Error("Unavailable");
        if (active) {
          setProducts(res.data || []);
          setPagination(
            res.pagination || { total: res.data?.length || 0, totalPages: 1 },
          );
        }
      })
      .catch(() => {
        if (active)
          setError(
            "We couldn’t load the collection. Please try again in a moment.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [queryString, page, sort, retry]);
  function update(values: Record<string, string>) {
    const query = new URLSearchParams(queryString);
    query.delete("page");
    Object.entries(values).forEach(([key, value]) =>
      value ? query.set(key, value) : query.delete(key),
    );
    router.push(`/products${query.size ? `?${query}` : ""}`, { scroll: false });
  }
  const title = search
    ? `Results for “${search}”`
    : gender === "BOYS"
      ? "Made for little adventurers."
      : gender === "GIRLS"
        ? "A little twirl. A lot of joy."
        : age === "0-2"
          ? "Tiny clothes. Endless cuddles."
          : "Their next favourite starts here.";
  const active = [...new URLSearchParams(queryString).entries()].filter(
    ([key]) => !["sortBy", "page", "limit"].includes(key),
  );
  return (
    <div className="catalog-page">
      <section className="catalog-intro">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Collection</span>
          </div>
          <span className="eyebrow">AARTI COLLECTION · AGES 0–16</span>
          <h1>{title}</h1>
          <p>
            Playful everyday essentials. Special occasion favourites. A little
            something for every personality.
          </p>
          <div className="department-tabs">
            {[
              { name: "All styles", value: "" },
              { name: "Boys", value: "BOYS" },
              { name: "Girls", value: "GIRLS" },
            ].map((tab) => (
              <button
                key={tab.name}
                className={gender === tab.value ? "active" : ""}
                onClick={() => update({ gender: tab.value })}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="shell catalog-body">
        <div className="catalog-toolbar">
          <button
            className="filter-toggle"
            aria-expanded={filterOpen}
            aria-controls="catalog-filters"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <SlidersHorizontal size={17} />{" "}
            {filterOpen ? "Hide filters" : "Filters"}
            {active.length > 0 && <span>{active.length}</span>}
          </button>
          <span className="result-count" role="status">
            {loading
              ? "Finding their favourites…"
              : error
                ? "Collection unavailable"
                : `${pagination.total} ${pagination.total === 1 ? "style" : "styles"} to explore`}
          </span>
          <label className="sort-control">
            <span>Sort by</span>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => update({ sortBy: e.target.value })}
            >
              <option value="featured">Featured</option>
              <option value="newest">New arrivals</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </label>
        </div>
        {active.length > 0 && (
          <div className="active-filters">
            {active.map(([key, value]) => (
              <button
                key={key}
                onClick={() => update({ [key]: "" })}
                aria-label={`Remove ${key} filter: ${value}`}
              >
                {key === "ageGroup"
                  ? `${value} years`
                  : key === "minPrice"
                    ? `From ₹${value}`
                    : key === "maxPrice"
                      ? `Up to ₹${value}`
                      : value.replaceAll("_", " ").toLowerCase()}
                <X size={13} />
              </button>
            ))}
            <Link href="/products" className="text-link">
              Clear all
            </Link>
          </div>
        )}
        <div
          className={`catalog-layout ${filterOpen ? "filters-visible" : ""}`}
        >
          {filterOpen && (
            <aside id="catalog-filters" className="catalog-filters">
              <div className="filter-title">
                <h2>Find their fit</h2>
                <button
                  className="icon-button"
                  aria-label="Close filters"
                  onClick={() => setFilterOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  update({ search: searchInput.trim() });
                }}
              >
                <label htmlFor="catalog-search">Search</label>
                <div className="filter-search">
                  <input
                    id="catalog-search"
                    value={searchInput}
                    placeholder="Dresses, tees, rompers…"
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button aria-label="Search collection">
                    <Search size={17} />
                  </button>
                </div>
              </form>
              <fieldset>
                <legend>Shop by age</legend>
                <div className="filter-chips">
                  {ages.map((value) => (
                    <button
                      key={value}
                      aria-pressed={age === value}
                      className={age === value ? "selected" : ""}
                      onClick={() =>
                        update({ ageGroup: age === value ? "" : value })
                      }
                    >
                      {value.replace("-", "–")} years
                    </button>
                  ))}
                </div>
              </fieldset>
              {categories.length > 0 && (
                <div>
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => update({ category: e.target.value })}
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option value={c.slug} key={c.id}>
                        {c.name} · {c.gender === "BOYS" ? "Boys" : "Girls"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  update({ minPrice: prices.min, maxPrice: prices.max });
                }}
              >
                <fieldset>
                  <legend>Price range</legend>
                  <div className="price-inputs">
                    <input
                      aria-label="Minimum price in rupees"
                      type="number"
                      min="0"
                      placeholder="Min ₹"
                      value={prices.min}
                      onChange={(e) =>
                        setPrices({ ...prices, min: e.target.value })
                      }
                    />
                    <span>–</span>
                    <input
                      aria-label="Maximum price in rupees"
                      type="number"
                      min={prices.min || "0"}
                      placeholder="Max ₹"
                      value={prices.max}
                      onChange={(e) =>
                        setPrices({ ...prices, max: e.target.value })
                      }
                    />
                  </div>
                  <button className="text-link price-apply">
                    Apply price <ArrowRight size={14} />
                  </button>
                </fieldset>
              </form>
              <label className="stock-checkbox">
                <input
                  type="checkbox"
                  checked={params?.get("availability") === "in_stock"}
                  onChange={(e) =>
                    update({ availability: e.target.checked ? "in_stock" : "" })
                  }
                />{" "}
                In stock only
              </label>
              <Link href="/products" className="text-link">
                <RotateCcw size={14} /> Reset filters
              </Link>
            </aside>
          )}
          <div className="catalog-results" aria-busy={loading}>
            {error ? (
              <div className="empty-state" role="alert">
                <h2>A little pause in the play.</h2>
                <p>{error}</p>
                <button
                  className="button-primary"
                  onClick={() => {
                    setLoading(true);
                    setError("");
                    setRetry(retry + 1);
                  }}
                >
                  Try again <RotateCcw size={16} />
                </button>
              </div>
            ) : loading ? (
              <div className="product-grid">
                {Array.from({ length: 8 }, (_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length ? (
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard product={p} key={p.id} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={30} />
                <h2>No little favourites found… yet.</h2>
                <p>
                  Try a different search or clear a filter to find more styles.
                </p>
                <Link href="/products" className="button-primary">
                  Explore all styles <ArrowRight size={17} />
                </Link>
              </div>
            )}
            {!loading && !error && pagination.totalPages > 1 && (
              <nav className="catalog-pagination" aria-label="Product pages">
                <button
                  className="circle-button"
                  disabled={page <= 1}
                  aria-label="Previous page"
                  onClick={() => update({ page: String(page - 1) })}
                >
                  <ChevronLeft size={17} />
                </button>
                <span>
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  className="circle-button"
                  disabled={page >= pagination.totalPages}
                  aria-label="Next page"
                  onClick={() => update({ page: String(page + 1) })}
                >
                  <ChevronRight size={17} />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function Catalog() {
  const params = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <CatalogContent
      key={params?.toString() || "all"}
      filterOpen={filterOpen}
      setFilterOpen={setFilterOpen}
    />
  );
}
export default function ProductCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="shell section-space" role="status">
          Finding their favourites…
        </div>
      }
    >
      <Catalog />
    </Suspense>
  );
}
