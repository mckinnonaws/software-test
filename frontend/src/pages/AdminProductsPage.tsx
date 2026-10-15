import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { api, ApiError } from "@/api/client";
import type { Product, ProductCreate, ProductUpdate } from "@/api/types";

const emptyForm: ProductCreate = { name: "", description: "", price: 0, stock: 0, image_url: "" };

export function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductCreate>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      setProducts(await api.listProducts());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      if (editingId === null) {
        await api.createProduct(token, form);
      } else {
        const payload: ProductUpdate = { ...form };
        await api.updateProduct(token, editingId, payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, image_url: p.image_url });
  };

  const remove = async (id: number) => {
    if (!token) return;
    if (!confirm("Delete product?")) return;
    try {
      await api.deleteProduct(token, id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  };

  if (loading) return <div className="center">Loading...</div>;

  return (
    <section>
      <h1>Admin Products</h1>
      {error && <div className="error">{error}</div>}
      <form className="form" onSubmit={submit} style={{ marginBottom: 24 }}>
        <label>Name <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Description <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label>Price <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required /></label>
        <label>Stock <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></label>
        <label>Image URL <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></label>
        <div className="row">
          <button type="submit">{editingId === null ? "Create" : "Update"}</button>
          {editingId !== null && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>
      <table className="table">
        <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td className="row">
                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
