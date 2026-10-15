"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function CartPage() {
  const { loading } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const cartQuery = useQuery({ queryKey: ["cart"], queryFn: () => api.getCart() });
  const productsQuery = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => api.listProducts(undefined, 0, 100),
  });

  const productMap = new Map<number, Product>((productsQuery.data ?? []).map((p) => [p.id, p]));

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      api.updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => api.removeCartItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => api.checkout(),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push(`/orders/${order.id}`);
    },
    onError: (err) => setError((err as Error).message),
  });

  if (loading) return <p>Loading...</p>;
  const cart = cartQuery.data;
  const total =
    cart?.items.reduce((sum, item) => {
      const product = productMap.get(item.product_id);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0) ?? 0;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Cart</h1>
      {cartQuery.isLoading && <p>Loading...</p>}
      {cart && cart.items.length === 0 && <p>Your cart is empty.</p>}
      <div className="space-y-4">
        {cart?.items.map((item) => {
          const product = productMap.get(item.product_id);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded border border-gray-200 p-4"
            >
              <div className="flex items-center gap-4">
                {product?.image_url ? (
                  <img src={product.image_url} alt={product?.name} className="h-16 w-16 rounded object-cover" />
                ) : null}
                <div>
                  <p className="font-medium">{product?.name ?? `Product ${item.product_id}`}</p>
                  <p className="text-sm text-gray-600">${product?.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-16 rounded border border-gray-300 px-2 py-1"
                />
                <button
                  onClick={() => removeMutation.mutate(item.id)}
                  className="rounded border px-3 py-1 hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {cart && cart.items.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xl font-semibold">Estimated total: ${total.toFixed(2)}</p>
          <button
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {checkoutMutation.isPending ? "Checking out..." : "Checkout"}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
