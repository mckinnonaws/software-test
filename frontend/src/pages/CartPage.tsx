import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { api, ApiError } from "@/api/client";
import type { Cart } from "@/api/types";

export function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      setCart(await api.getCart(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const updateQty = async (itemId: number, quantity: number) => {
    if (!token) return;
    try { setCart(await api.updateCartItem(token, itemId, { quantity })); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Update failed"); }
  };

  const remove = async (itemId: number) => {
    if (!token) return;
    try { setCart(await api.removeCartItem(token, itemId)); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Remove failed"); }
  };

  const checkout = async () => {
    if (!token) return;
    setError("");
    try {
      const order = await api.checkout(token);
      navigate(`/orders`);
      alert(`Order #${order.id} placed`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Checkout failed");
    }
  };

  if (loading) return <div className="center">Loading...</div>;
  if (!cart) return <div className="center">Cart unavailable</div>;

  return (
    <section>
      <h1>Cart</h1>
      {error && <div className="error">{error}</div>}
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table className="table">
            <thead><tr><th>Item ID</th><th>Product</th><th>Qty</th><th>Actions</th></tr></thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.product_id}</td>
                  <td>
                    <input type="number" min={1} value={item.quantity} onChange={(e) => updateQty(item.id, Number(e.target.value))} style={{ width: 70 }} />
                  </td>
                  <td><button onClick={() => remove(item.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row" style={{ marginTop: 16 }}>
            <button onClick={checkout}>Checkout</button>
          </div>
        </>
      )}
    </section>
  );
}
