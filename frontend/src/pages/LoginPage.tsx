import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1>Login</h1>
      <form className="form" onSubmit={submit}>
        <label>Email <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></label>
        <label>Password <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></label>
        {error && <div className="error">{error}</div>}
        <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </section>
  );
}
