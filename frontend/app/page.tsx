"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { api } from "@/lib/api";

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api.listProducts(undefined, 0, 8),
  });

  return (
    <div>
      <section className="mb-8 rounded-xl bg-gray-50 p-8">
        <h1 className="text-3xl font-bold">Welcome to AnyCompany</h1>
        <p className="mt-2 text-gray-600">Browse products, manage your cart, and checkout securely.</p>
        <Link href="/products" className="mt-4 inline-block rounded bg-black px-4 py-2 text-white">
          Shop now
        </Link>
      </section>
      <h2 className="mb-4 text-xl font-semibold">Featured products</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data?.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
