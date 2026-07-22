import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="font-display text-3xl mb-6">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Email" type="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Password" type="password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="text-clay text-sm">{error}</p>}
        <button className="w-full bg-ink text-paper rounded py-2" type="submit">Log in</button>
      </form>
      <p className="mt-4 text-sm">New here? <Link className="underline" to="/signup">Create an account</Link></p>
    </div>
  );
}
