import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { api, ApiError } from "@/api/client";
import type { Product } from "@/api/types";

export function ProductDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.getProduct(Number(id)).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  const addToCart = async () => {
    if (!token || !product) return;
    setMessage("");
    setError("");
    try {
      await api.addToCart(token, { product_id: product.id, quantity });
      setMessage("Added to cart");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add");
    }
  };

  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="center">Loading...</div>;

  return (
    <section>
      <h1>{product.name}</h1>
      {product.image_url && <img src={product.image_url} alt={product.name} style={{ maxWidth: 320 }} />}
      <p>{product.description}</p>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="muted">Stock: {product.stock}</p>
      {token && (
        <div className="row">
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={{ width: 80 }} />
          <button onClick={addToCart}>Add to cart</button>
        </div>
      )}
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
    </section>
  );
}
