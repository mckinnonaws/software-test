"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function OrdersPage() {
  const { loading } = useRequireAuth();
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => api.listOrders() });

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Orders</h1>
      {isLoading && <p>Loading...</p>}
      {!isLoading && (!data || data.length === 0) && <p>No orders yet.</p>}
      <div className="space-y-3">
        {data?.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block rounded border border-gray-200 p-4 hover:shadow-sm"
          >
            <div className="flex justify-between">
              <span className="font-medium">Order #{order.id}</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600">
              {order.status} · {order.items.length} item(s)
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
