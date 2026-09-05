"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: number;
  productId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string | null;
    image: string | null;
  };
  variant: {
    id: number;
    size: string;
    color: string;
    sku: string;
    stock: number;
    inStock: boolean;
  };
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  hasOutOfStockItems: boolean;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addToCart: (productId: number, variantId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get<Cart>("/cart");
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch {
      // Ignored if user session is not ready
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, refreshCart]);

  const addToCart = async (productId: number, variantId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      throw new Error("Please log in to add items to your cart");
    }
    const res = await api.post<Cart>("/cart/items", { productId, variantId, quantity });
    if (res.success && res.data) {
      setCart(res.data);
    } else {
      throw new Error(res.message || "Failed to add item to cart");
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    const res = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
    if (res.success && res.data) {
      setCart(res.data);
    } else {
      throw new Error(res.message || "Failed to update quantity");
    }
  };

  const removeItem = async (itemId: number) => {
    const res = await api.delete<Cart>(`/cart/items/${itemId}`);
    if (res.success && res.data) {
      setCart(res.data);
    } else {
      throw new Error(res.message || "Failed to remove item");
    }
  };

  const clearCart = async () => {
    const res = await api.delete<Cart>("/cart");
    if (res.success && res.data) {
      setCart(res.data);
    } else {
      throw new Error(res.message || "Failed to clear cart");
    }
  };

  const itemCount = cart?.totalItems ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
