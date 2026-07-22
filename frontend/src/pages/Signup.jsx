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

  function field(label, key, extra = {}) {
    return (
      <div>
        <label className="eyebrow block mb-1.5">{label}</label>
        <input
          className="w-full border border-ink/20 rounded-sm px-3 py-2.5 font-body focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          {...extra}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="eyebrow mb-2">Skill barter, no cash</p>
          <h1 className="font-display text-4xl font-semibold text-ink">SkillSwap</h1>
        </div>
        <div className="bg-white border border-ink/10 rounded-sm p-8 shadow-[3px_3px_0_0_rgba(22,41,43,0.08)]">
          <h2 className="font-display text-xl font-medium mb-6">Join SkillSwap</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {field("Name", "name", { required: true })}
            {field("Email", "email", { type: "email", required: true })}
            {field("Password", "password", { type: "password", required: true })}
            {field("Skills you offer", "skillsOffered", { placeholder: "e.g. Guitar coaching, Baking" })}
            {field("Skills you want", "skillsWanted", { placeholder: "e.g. Python basics" })}
            {error && <p className="text-rust text-sm">{error}</p>}
            <button
              className="w-full bg-ink text-paper rounded-sm py-2.5 font-medium hover:bg-ink-soft transition-colors"
              type="submit"
            >
              Create account
            </button>
          </form>
        </div>
        <p className="mt-6 text-sm text-center text-ink-soft">
          Already have an account? <Link className="underline text-ink" to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
