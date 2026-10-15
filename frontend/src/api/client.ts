import type {
  Cart,
  CartItemAdd,
  CartItemUpdate,
  Order,
  Product,
  ProductCreate,
  ProductUpdate,
  Token,
  User,
} from "@/api/types";
const rawBase = import.meta.env.VITE_API_URL ?? "";
const API_BASE = rawBase.replace(/\/$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(apiUrl(path), { ...options, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) message = String(body.detail);
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<User>("/api/v1/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    return request<Token>("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  },
  me: (token: string) => request<User>("/api/v1/auth/me", {}, token),
  listProducts: (q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    return request<Product[]>(`/api/v1/products${qs}`);
  },
  getProduct: (id: number) => request<Product>(`/api/v1/products/${id}`),
  createProduct: (token: string, payload: ProductCreate) =>
    request<Product>("/api/v1/products", { method: "POST", body: JSON.stringify(payload) }, token),
  updateProduct: (token: string, id: number, payload: ProductUpdate) =>
    request<Product>(`/api/v1/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteProduct: (token: string, id: number) =>
    request<void>(`/api/v1/products/${id}`, { method: "DELETE" }, token),
  getCart: (token: string) => request<Cart>("/api/v1/cart", {}, token),
  addToCart: (token: string, payload: CartItemAdd) =>
    request<Cart>("/api/v1/cart/items", { method: "POST", body: JSON.stringify(payload) }, token),
  updateCartItem: (token: string, itemId: number, payload: CartItemUpdate) =>
    request<Cart>(`/api/v1/cart/items/${itemId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  removeCartItem: (token: string, itemId: number) =>
    request<Cart>(`/api/v1/cart/items/${itemId}`, { method: "DELETE" }, token),
  checkout: (token: string) => request<Order>("/api/v1/orders", { method: "POST" }, token),
  listOrders: (token: string) => request<Order[]>("/api/v1/orders", {}, token),
};
