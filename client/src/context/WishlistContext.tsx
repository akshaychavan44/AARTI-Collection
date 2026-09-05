"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

export interface WishlistItem {
  id: number;
  productId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string | null;
    gender: "BOYS" | "GIRLS";
    ageGroup: string;
    isFeatured: boolean;
    compareAtPrice: string | null;
    discountPercentage: number | null;
    image: string | null;
    category: {
      id: number;
      name: string;
      slug: string;
    } | null;
    priceRange: {
      min: number;
      max: number;
    };
    overallStockStatus: string;
    hasStock: boolean;
    firstAvailableVariantId: number | null;
  };
}

export interface Wishlist {
  id: number;
  userId: number;
  totalItems: number;
  items: WishlistItem[];
}

interface WishlistContextType {
  wishlist: Wishlist | null;
  items: WishlistItem[];
  loading: boolean;
  itemCount: number;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  moveToCart: (productId: number, variantId?: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get<Wishlist>("/wishlist");
      if (res.success && res.data) {
        setWishlist(res.data);
      }
    } catch {
      // Ignored if unauthenticated
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      setWishlist(null);
    }
  }, [isAuthenticated, refreshWishlist]);

  const isInWishlist = (productId: number): boolean => {
    return (wishlist?.items || []).some((item) => item.productId === productId);
  };

  const addToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      throw new Error("Please log in to save items to your wishlist");
    }
    const res = await api.post<Wishlist>("/wishlist", { productId });
    if (res.success && res.data) {
      setWishlist(res.data);
    } else {
      throw new Error(res.message || "Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const res = await api.delete<Wishlist>(`/wishlist/${productId}`);
    if (res.success && res.data) {
      setWishlist(res.data);
    } else {
      throw new Error(res.message || "Failed to remove from wishlist");
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const moveToCart = async (productId: number, variantId?: number) => {
    const res = await api.post<{ cart: any; wishlist: Wishlist }>(
      `/wishlist/${productId}/move-to-cart`,
      { variantId }
    );
    if (res.success && res.data) {
      setWishlist(res.data.wishlist);
      await refreshCart();
    } else {
      throw new Error(res.message || "Failed to move item to cart");
    }
  };

  const items = wishlist?.items || [];
  const itemCount = wishlist?.totalItems ?? 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        items,
        loading,
        itemCount,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
