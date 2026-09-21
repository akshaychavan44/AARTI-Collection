import { clientCache } from "./cache";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: { field: string; message: string }[];
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Always include credentials so HttpOnly cookies (auth token) are included automatically
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const rawText = await response.text();
  let data: any;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = {
      success: false,
      message: `Server returned HTTP ${response.status} (${response.statusText}): ${rawText.slice(0, 150) || "No response body"}`,
    };
  }

  if (!response.ok) {
    throw new Error(data.message || `Server responded with status ${response.status}`);
  }

  return data;
}

function handleMutationInvalidation(endpoint: string) {
  if (endpoint.includes("product")) {
    clientCache.invalidate("product");
    clientCache.invalidate("admin/stats");
  } else if (endpoint.includes("category") || endpoint.includes("categories")) {
    clientCache.invalidate("categor");
    clientCache.invalidate("product");
    clientCache.invalidate("admin/stats");
  } else if (endpoint.includes("order")) {
    clientCache.invalidate("order");
    clientCache.invalidate("admin/stats");
  } else if (endpoint.includes("cart")) {
    clientCache.invalidate("cart");
  } else if (endpoint.includes("wishlist")) {
    clientCache.invalidate("wishlist");
  } else if (endpoint.includes("coupon")) {
    clientCache.invalidate("coupon");
  } else if (endpoint.includes("auth") || endpoint.includes("customer")) {
    clientCache.invalidate("auth");
    clientCache.invalidate("customer");
    clientCache.invalidate("admin/stats");
  } else {
    clientCache.invalidate();
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: "GET" }),

  /**
   * Get with stale-while-revalidate client-side caching.
   * Enables instant page transitions without loading spinners when data is in cache.
   */
  getCached: async <T = any>(
    endpoint: string,
    optionsOrTtl?: RequestInit | number,
    ttlMs?: number
  ) => {
    let options: RequestInit | undefined;
    let ttl = ttlMs;
    if (typeof optionsOrTtl === "number") {
      ttl = optionsOrTtl;
    } else {
      options = optionsOrTtl;
    }

    return clientCache.fetchWithSWR<ApiResponse<T>>(
      endpoint,
      () => fetchApi<T>(endpoint, { ...options, method: "GET" }),
      ttl
    );
  },

  post: async <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const res = await fetchApi<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    handleMutationInvalidation(endpoint);
    return res;
  },

  put: async <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const res = await fetchApi<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
    handleMutationInvalidation(endpoint);
    return res;
  },

  patch: async <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const res = await fetchApi<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
    handleMutationInvalidation(endpoint);
    return res;
  },

  delete: async <T = any>(endpoint: string, options?: RequestInit) => {
    const res = await fetchApi<T>(endpoint, { ...options, method: "DELETE" });
    handleMutationInvalidation(endpoint);
    return res;
  },

  invalidateCache: (prefix?: string) => clientCache.invalidate(prefix),
};
