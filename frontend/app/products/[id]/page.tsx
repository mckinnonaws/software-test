"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.getProduct(id),
    enabled: Number.isFinite(id),
  });

  const addMutation = useMutation({
    mutationFn: (qty: number) => api.addToCart(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push("/cart");
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError || !product) return <p className="text-red-600">{(error as Error)?.message || "Not found"}</p>;

  function handleAdd() {
    if (!user) {
      router.push("/login");
      return;
    }
    addMutation.mutate(quantity);
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full rounded-lg object-cover" />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
            No image
          </div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="mt-2 text-gray-600">{product.description}</p>
        <p className="mt-4 text-2xl font-bold">${product.price.toFixed(2)}</p>
        <p className={product.stock > 0 ? "mt-1 text-green-600" : "mt-1 text-red-600"}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={product.stock || 1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-20 rounded border border-gray-300 px-2 py-1"
            disabled={product.stock === 0}
          />
          <button
            onClick={handleAdd}
            disabled={product.stock === 0 || addMutation.isPending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-40"
          >
            {addMutation.isPending ? "Adding..." : "Add to cart"}
          </button>
        </div>
        {addMutation.isError && (
          <p className="mt-2 text-red-600">{(addMutation.error as Error).message}</p>
        )}
      </div>
    </div>
  );
}
