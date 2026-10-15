import type {
  Cart,
  Order,
  Product,
  ProductInput,
  ProductUpdateInput,
  Token,
  User,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  async register(email: string, password: string): Promise<User> {
    return request<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async login(email: string, password: string): Promise<Token> {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const data = await res.json();
        if (data?.detail) detail = data.detail;
      } catch {
        // ignore
      }
      throw new Error(detail);
    }
    return (await res.json()) as Token;
  },
  async me(): Promise<User> {
    return request<User>("/api/v1/auth/me");
  },
  async listProducts(q?: string, skip = 0, limit = 50): Promise<Product[]> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("skip", String(skip));
    params.set("limit", String(limit));
    return request<Product[]>(`/api/v1/products?${params.toString()}`);
  },
  async getProduct(id: number): Promise<Product> {
    return request<Product>(`/api/v1/products/${id}`);
  },
  async createProduct(input: ProductInput): Promise<Product> {
    return request<Product>("/api/v1/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async updateProduct(id: number, input: ProductUpdateInput): Promise<Product> {
    return request<Product>(`/api/v1/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
  async deleteProduct(id: number): Promise<void> {
    await request<void>(`/api/v1/products/${id}`, { method: "DELETE" });
  },
  async getCart(): Promise<Cart> {
    return request<Cart>("/api/v1/cart");
  },
  async addToCart(productId: number, quantity: number): Promise<Cart> {
    return request<Cart>("/api/v1/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },
  async updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    return request<Cart>(`/api/v1/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },
  async removeCartItem(itemId: number): Promise<Cart> {
    return request<Cart>(`/api/v1/cart/items/${itemId}`, { method: "DELETE" });
  },
  async checkout(): Promise<Order> {
    return request<Order>("/api/v1/orders", { method: "POST" });
  },
  async listOrders(): Promise<Order[]> {
    return request<Order[]>("/api/v1/orders");
  },
  async getOrder(id: number): Promise<Order> {
    return request<Order>(`/api/v1/orders/${id}`);
  },
};
