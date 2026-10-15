import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function PrivateRoute() {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center">Loading...</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center">Loading...</div>;
  if (!user?.is_admin) return <Navigate to="/" replace />;
  return <Outlet />;
}
