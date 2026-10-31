"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ArrowUpRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export interface StoreProduct {
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
  overallStockStatus: string;
}
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export function ProductCard({ product }: { product: StoreProduct }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const saved = isInWishlist(product.id);
  const href = `/products/${product.slug}`;
  async function save() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await toggleWishlist(product.id);
    } catch {
      setError("Couldn’t update your wishlist. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link href={href} aria-label={`View ${product.name}`}>
          {product.images[0] ? (
            <Image
              sizes="(max-width: 640px) 50vw, (max-width: 1150px) 33vw, 25vw"
              unoptimized={!product.images[0].imageUrl.startsWith("/")}
              src={product.images[0].imageUrl}
              alt={product.images[0].altText || product.name}
              loading="lazy"
              width="600"
              height="800"
            />
          ) : (
            <div className="photo-placeholder">Aarti Collection</div>
          )}
          {product.images[1] && (
            <Image
              sizes="(max-width: 640px) 50vw, (max-width: 1150px) 33vw, 25vw"
              unoptimized={!product.images[1].imageUrl.startsWith("/")}
              className="product-photo-alt"
              src={product.images[1].imageUrl}
              alt=""
              loading="lazy"
              width="600"
              height="800"
            />
          )}
        </Link>
        {(product.overallStockStatus === "OUT_OF_STOCK" ||
          product.discountPercentage ||
          product.isFeatured) && (
          <span className="product-badge">
            {product.overallStockStatus === "OUT_OF_STOCK"
              ? "Sold out"
              : product.discountPercentage
                ? `${product.discountPercentage}% off`
                : "The favourite edit"}
          </span>
        )}
        <button
          type="button"
          className={`save-product ${saved ? "is-saved" : ""}`}
          onClick={save}
          disabled={saving}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`}
          aria-pressed={saved}
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          )}
        </button>
        <Link href={href} className="quick-view">
          Choose your size <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="product-meta">
        <span>
          {product.gender === "BOYS" ? "Boys" : "Girls"} · {product.ageGroup}{" "}
          years
        </span>
        <span>{product.category?.name}</span>
      </div>
      <h3>
        <Link href={href}>{product.name}</Link>
      </h3>
      <p className="product-price">
        {money(product.priceRange.min)}
        {product.priceRange.max > product.priceRange.min && (
          <span className="price-from"> onwards</span>
        )}
        {product.compareAtPrice &&
          Number(product.compareAtPrice) > product.priceRange.min && (
            <del>{money(Number(product.compareAtPrice))}</del>
          )}
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </article>
  );
}
export function ProductSkeleton() {
  return (
    <div className="product-card skeleton" aria-hidden="true">
      <div className="product-photo" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
}
