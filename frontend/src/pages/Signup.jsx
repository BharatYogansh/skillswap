import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api.js";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    skillsOffered: "",
    skillsWanted: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        skillsOffered: form.skillsOffered.split(",").map((s) => s.trim()).filter(Boolean),
        skillsWanted: form.skillsWanted.split(",").map((s) => s.trim()).filter(Boolean),
      });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="font-display text-3xl mb-6">Join SkillSwap</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Email" type="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Password" type="password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Skills you offer (comma separated)"
          value={form.skillsOffered} onChange={(e) => setForm({ ...form, skillsOffered: e.target.value })} />
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Skills you want (comma separated)"
          value={form.skillsWanted} onChange={(e) => setForm({ ...form, skillsWanted: e.target.value })} />
        {error && <p className="text-clay text-sm">{error}</p>}
        <button className="w-full bg-ink text-paper rounded py-2" type="submit">Create account</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link className="underline" to="/login">Log in</Link></p>
    </div>
  );
}
