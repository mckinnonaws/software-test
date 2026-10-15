import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { api, ApiError } from "@/api/client";
import type { Order } from "@/api/types";

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.listOrders(token)
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="center">Loading...</div>;

  return (
    <section>
      <h1>Orders</h1>
      {error && <div className="error">{error}</div>}
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <div className="cards">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <h3>Order #{o.id}</h3>
              <p>Status: {o.status}</p>
              <p className="price">Total: ${o.total.toFixed(2)}</p>
              <ul>
                {o.items.map((i) => (
                  <li key={i.id}>Product {i.product_id} x{i.quantity} @ ${i.unit_price.toFixed(2)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
