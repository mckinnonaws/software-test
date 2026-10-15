import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block overflow-hidden rounded-lg border border-gray-200 hover:shadow-sm"
    >
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="h-48 w-full object-cover" />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400">No image</div>
      )}
      <div className="p-4">
        <h3 className="font-medium">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          <span className={product.stock > 0 ? "text-sm text-green-600" : "text-sm text-red-600"}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
