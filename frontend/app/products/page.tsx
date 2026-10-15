"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { api } from "@/lib/api";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [skip, setSkip] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", q, skip],
    queryFn: () => api.listProducts(q || undefined, skip, PAGE_SIZE),
  });

  const canPrev = skip > 0;
  const canNext = (data?.length ?? 0) === PAGE_SIZE;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Products</h1>
      <div className="mb-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSkip(0);
          }}
          placeholder="Search products"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-red-600">{(error as Error).message}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          disabled={!canPrev}
          onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={!canNext}
          onClick={() => setSkip((s) => s + PAGE_SIZE)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
