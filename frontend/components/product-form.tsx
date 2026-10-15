"use client";

import { useState } from "react";
import type { Product, ProductInput } from "@/lib/types";

type Props = {
  initial?: Product | null;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
};

export function ProductForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await onSubmit({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        image_url: imageUrl,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      <div className="flex gap-2">
        <input
          required
          type="number"
          min={0.01}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <input
          required
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Image URL"
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded border px-4 py-2">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
