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
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="eyebrow mb-2">Skill barter, no cash</p>
          <h1 className="font-display text-4xl font-semibold text-ink">SkillSwap</h1>
        </div>
        <div className="bg-white border border-ink/10 rounded-sm p-8 shadow-[3px_3px_0_0_rgba(22,41,43,0.08)]">
          <h2 className="font-display text-xl font-medium mb-6">Log in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="eyebrow block mb-1.5">Email</label>
              <input
                className="w-full border border-ink/20 rounded-sm px-3 py-2.5 font-body focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="eyebrow block mb-1.5">Password</label>
              <input
                className="w-full border border-ink/20 rounded-sm px-3 py-2.5 font-body focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-rust text-sm">{error}</p>}
            <button
              className="w-full bg-ink text-paper rounded-sm py-2.5 font-medium hover:bg-ink-soft transition-colors"
              type="submit"
            >
              Log in
            </button>
          </form>
        </div>
        <p className="mt-6 text-sm text-center text-ink-soft">
          New here? <Link className="underline text-ink" to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
