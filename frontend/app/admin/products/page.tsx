"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAdmin } from "@/lib/auth";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/product-form";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const { loading, user } = useRequireAdmin();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => api.listProducts(undefined, 0, 100),
    enabled: !!user?.is_admin,
  });

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof api.createProduct>[0]) => api.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Parameters<typeof api.updateProduct>[1] }) =>
      api.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin products</h1>
        {!showCreate && !editing && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded bg-black px-4 py-2 text-white"
          >
            New product
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-6 rounded border border-gray-200 p-4">
          <h2 className="mb-2 text-lg font-medium">Create product</h2>
          <ProductForm
            submitLabel="Create"
            onSubmit={async (input) => {
              await createMutation.mutateAsync(input);
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-6 rounded border border-gray-200 p-4">
          <h2 className="mb-2 text-lg font-medium">Edit product</h2>
          <ProductForm
            initial={editing}
            submitLabel="Save"
            onSubmit={async (input) => {
              await updateMutation.mutateAsync({ id: editing.id, input });
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {isLoading && <p>Loading...</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2">ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Price</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">
                <td className="py-2">{product.id}</td>
                <td className="py-2">{product.name}</td>
                <td className="py-2">${product.price.toFixed(2)}</td>
                <td className="py-2">{product.stock}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(product)}
                      className="rounded border px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(product.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded border px-2 py-1 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
