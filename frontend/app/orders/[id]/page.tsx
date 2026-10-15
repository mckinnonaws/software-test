"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useQuery as usePQ } from "@tanstack/react-query";

export default function OrderDetailPage() {
  const { loading } = useRequireAuth();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.getOrder(id),
    enabled: Number.isFinite(id),
  });

  const { data: products } = usePQ({
    queryKey: ["products", "all"],
    queryFn: () => api.listProducts(undefined, 0, 100),
  });
  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  if (loading) return <p>Loading...</p>;
  if (isLoading) return <p>Loading...</p>;
  if (isError || !order) return <p className="text-red-600">{(error as Error)?.message || "Not found"}</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Order #{order.id}</h1>
      <p className="mb-4 text-gray-600">
        Status: {order.status} · Total: ${order.total.toFixed(2)}
      </p>
      <div className="space-y-3">
        {order.items.map((item) => {
          const product = productMap.get(item.product_id);
          return (
            <div key={item.id} className="flex justify-between rounded border border-gray-200 p-4">
              <div>
                <p className="font-medium">{product?.name ?? `Product ${item.product_id}`}</p>
                <p className="text-sm text-gray-600">
                  Qty {item.quantity} × ${item.unit_price.toFixed(2)}
                </p>
              </div>
              <p>${(item.quantity * item.unit_price).toFixed(2)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
