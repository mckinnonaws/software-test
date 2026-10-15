"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export function Navbar() {
  const { user, logout } = useAuth();
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.getCart(),
    enabled: !!user,
  });
  const itemCount = cartQuery.data?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          AnyCompany
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/products">Products</Link>
          {user && <Link href="/cart">Cart ({itemCount})</Link>}
          {user && <Link href="/orders">Orders</Link>}
          {user?.is_admin && <Link href="/admin/products">Admin</Link>}
          {user ? (
            <>
              <span className="text-gray-600">{user.email}</span>
              <button onClick={logout} className="rounded border px-3 py-1 hover:bg-gray-50">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
