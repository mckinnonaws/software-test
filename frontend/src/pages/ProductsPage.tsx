import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import type { Product } from "@/api/types";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (query?: string) => {
    setLoading(true);
    setError("");
    try {
      setProducts(await api.listProducts(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    load(q);
  };

  return (
    <section>
      <h1>Products</h1>
      <form className="row" onSubmit={submit}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />
        <button type="submit">Search</button>
      </form>
      {loading && <div className="center">Loading...</div>}
      {error && <div className="error">{error}</div>}
      <div className="cards">
        {products.map((p) => (
          <div key={p.id} className="card">
            {p.image_url && <img src={p.image_url} alt={p.name} />}
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p className="price">${p.price.toFixed(2)}</p>
            <p className="muted">Stock: {p.stock}</p>
            <Link to={`/products/${p.id}`}>View</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
