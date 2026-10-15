import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="app">
      <header className="nav">
        <Link to="/" className="brand">AnyCompany</Link>
        <nav>
          <Link to="/products">Products</Link>
          {user && <Link to="/cart">Cart</Link>}
          {user && <Link to="/orders">Orders</Link>}
          {user?.is_admin && <Link to="/admin/products">Admin</Link>}
        </nav>
        <div className="auth-actions">
          {user ? (
            <>
              <span className="muted">{user.email}</span>
              <button onClick={() => { logout(); navigate("/"); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>
      <main className="content">{children ?? <Outlet />}</main>
    </div>
  );
}
